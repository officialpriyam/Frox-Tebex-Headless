import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@data/schema";
import { loadConfig } from "./config";

const { Pool } = pg;

function getDatabaseUrl(): string {
  const config = loadConfig();
  if (config.database_url) {
    return config.database_url;
  }
  if (process.env.DATABASE_URL) {
    return process.env.DATABASE_URL;
  }
  throw new Error(
    "DATABASE_URL must be set in config.yml or environment variables.",
  );
}

// Modify the pool initialization to include search path in connection options
function getConnectionConfig() {
  let connectionString = getDatabaseUrl();
  try {
    const urlObj = new URL(connectionString);
    if (urlObj.username) {
      // Force search path to be "username, public" for every connection
      // This is crucial for shared hosting where the default schema matches the username
      const searchPath = `${urlObj.username},public`;

      // Append options to connection string
      const shim = connectionString.includes("?") ? "&" : "?";
      if (!connectionString.includes("options=")) {
        connectionString += `${shim}options=-c%20search_path%3D${searchPath}`;
      }
    }
  } catch (e) { /* ignore parse error */ }

  return {
    connectionString,
    ssl: connectionString.includes("sslmode=require") ? { rejectUnauthorized: false } : false
  };
}

export const pool = new Pool({ ...getConnectionConfig(), max: 2 });

// Force search path on every new connection
pool.on('connect', (client) => {
  const config = loadConfig();
  const dbUrl = config.database_url || process.env.DATABASE_URL || "";
  try {
    const urlObj = new URL(dbUrl);
    if (urlObj.username) {
      const searchPath = `"${urlObj.username}", public`;
      client.query(`SET search_path TO ${searchPath}`);
    }
  } catch (e) {
    // Ignore URL parse errors
  }
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

export const db = drizzle(pool, { schema });

// Auto-create tables if they don't exist
export async function initializeTables(): Promise<void> {
  const client = await pool.connect();
  try {
    console.log("Initializing database tables...");
    // Search path is now handled by the connection string!
    console.log("Database tables initialized successfully");

    // EXTRACT USERNAME FROM DB URL TO CREATE SCHEMA
    const config = loadConfig();
    const dbUrl = config.database_url || process.env.DATABASE_URL || "";
    let schemaName = "public";
    try {
      const urlObj = new URL(dbUrl);
      if (urlObj.username) {
        schemaName = urlObj.username;
        // Create the schema if it doesn't exist (crucial for shared hosting)
        await client.query(`CREATE SCHEMA IF NOT EXISTS "${schemaName}";`);
        // Force search path for this session just to be sure
        await client.query(`SET search_path TO "${schemaName}", public;`);
      }
    } catch (e) {
      console.warn("Could not determine schema from DB URL, using default.");
    }

    await client.query(`
      CREATE TABLE IF NOT EXISTS sessions (
        sid VARCHAR PRIMARY KEY,
        sess JSONB NOT NULL,
        expire TIMESTAMP NOT NULL
      );
      CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON sessions (expire);

      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
        minecraft_username VARCHAR NOT NULL UNIQUE,
        discord_username VARCHAR,
        email VARCHAR,
        password_hash VARCHAR,
        role_id VARCHAR,
        first_name VARCHAR,
        last_name VARCHAR,
        profile_image_url VARCHAR,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS site_settings (
        id INTEGER PRIMARY KEY DEFAULT 1,
        is_installed BOOLEAN DEFAULT FALSE,
        admin_password_hash VARCHAR,
        tebex_public_token VARCHAR,
        tebex_private_key VARCHAR,
        tebex_plugin_api_key VARCHAR,
        discord_invite_url VARCHAR,
        app_name VARCHAR DEFAULT 'FunBlocks',
        logo_url VARCHAR DEFAULT '/logo.png',
        hero_image_url VARCHAR DEFAULT '',
        site_background_image_url VARCHAR DEFAULT '',
        maintenance_mode BOOLEAN DEFAULT FALSE,
        home_about_enabled BOOLEAN DEFAULT FALSE,
        home_about_title VARCHAR DEFAULT '',
        home_about_content TEXT DEFAULT '',
        server_name VARCHAR DEFAULT 'FunBlocks',
        java_server_ip VARCHAR DEFAULT 'play.example.com',
        bedrock_server_ip VARCHAR DEFAULT 'bedrock.example.com',
        bedrock_port INTEGER DEFAULT 19132,
        bedrock_support BOOLEAN DEFAULT TRUE,
        package_listing_columns INTEGER DEFAULT 4,
        shorter_cards BOOLEAN DEFAULT FALSE,
        category_colors JSONB DEFAULT '{}',
        category_logos JSONB DEFAULT '{}',
        featured_package_ids JSONB DEFAULT '[]',
        package_variations JSONB DEFAULT '[]',
        quantity_selection_ids JSONB DEFAULT '[]',
        rank_upgrader_enabled BOOLEAN DEFAULT FALSE,
        rank_order JSONB DEFAULT '[]',
        privacy_policy_url VARCHAR DEFAULT '/privacy-policy',
        terms_of_service_url VARCHAR DEFAULT '/terms',
        currency_symbol VARCHAR DEFAULT '$',
        goal_enabled BOOLEAN DEFAULT FALSE,
        goal_title VARCHAR DEFAULT 'Server Goal',
        goal_description VARCHAR DEFAULT 'Help us reach our goal!',
        goal_target INTEGER DEFAULT 1000,
        goal_current INTEGER DEFAULT 0,
        active_seasonal_theme VARCHAR DEFAULT 'none',
        show_sale_banner BOOLEAN DEFAULT FALSE,
        show_sale_banner_illustration BOOLEAN DEFAULT FALSE,
        sale_banner_text VARCHAR DEFAULT '',
        patrons_enabled BOOLEAN DEFAULT FALSE,
        patreon_url VARCHAR DEFAULT '',
        primary_color VARCHAR DEFAULT '#3b82f6',
        accent_color VARCHAR DEFAULT '#3b82f6',
        secondary_color VARCHAR DEFAULT '#e2e8f0',
        muted_color VARCHAR DEFAULT '#f1f5f9',
        privacy_policy_content TEXT DEFAULT '',
        terms_of_service_content TEXT DEFAULT '',
        package_click_animation BOOLEAN DEFAULT TRUE,
        active_theme VARCHAR DEFAULT 'default',
        deco_asset_1 VARCHAR DEFAULT '/vines.png',
        deco_asset_2 VARCHAR DEFAULT '/vines.png',
        deco_asset_3 VARCHAR DEFAULT '',
        show_navbar_box BOOLEAN DEFAULT TRUE,
        smtp_host VARCHAR DEFAULT '',
        smtp_port INTEGER DEFAULT 587,
        smtp_user VARCHAR DEFAULT '',
        smtp_pass VARCHAR DEFAULT '',
        smtp_from VARCHAR DEFAULT '',
        smtp_secure BOOLEAN DEFAULT TRUE,
        email_provider VARCHAR DEFAULT 'custom',
        updated_at TIMESTAMP DEFAULT NOW()
      );
      
      -- Add missing columns to existing tables
      ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS category_logos JSONB DEFAULT '{}';
      ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS show_sale_banner BOOLEAN DEFAULT FALSE;
      ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS show_sale_banner_illustration BOOLEAN DEFAULT FALSE;
      ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS sale_banner_text VARCHAR DEFAULT '';
      ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS patrons_enabled BOOLEAN DEFAULT FALSE;
      ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS patreon_url VARCHAR DEFAULT '';
      ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS primary_color VARCHAR DEFAULT '#3b82f6';
      ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS accent_color VARCHAR DEFAULT '#3b82f6';
      ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS secondary_color VARCHAR DEFAULT '#e2e8f0';
      ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS muted_color VARCHAR DEFAULT '#f1f5f9';
      ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS tebex_plugin_api_key VARCHAR;
      ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS privacy_policy_content TEXT DEFAULT '';
      ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS terms_of_service_content TEXT DEFAULT '';
      ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS border_radius VARCHAR DEFAULT '0.5';
      ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS package_click_animation BOOLEAN DEFAULT TRUE;
      ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS home_about_enabled BOOLEAN DEFAULT FALSE;
      ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS home_about_title VARCHAR DEFAULT '';
      ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS home_about_content TEXT DEFAULT '';
      ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS active_theme VARCHAR DEFAULT 'default';
      ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS deco_asset_1 VARCHAR DEFAULT '/vines.png';
      ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS deco_asset_2 VARCHAR DEFAULT '/vines.png';
      ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS deco_asset_3 VARCHAR DEFAULT '';
      ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS show_navbar_box BOOLEAN DEFAULT TRUE;
      ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS smtp_host VARCHAR DEFAULT '';
      ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS smtp_port INTEGER DEFAULT 587;
      ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS smtp_user VARCHAR DEFAULT '';
      ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS smtp_pass VARCHAR DEFAULT '';
      ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS smtp_from VARCHAR DEFAULT '';
      ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS smtp_secure BOOLEAN DEFAULT TRUE;
      ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS email_provider VARCHAR DEFAULT 'custom';

      -- Add missing columns to users
      ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash VARCHAR;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS role_id VARCHAR;

      CREATE TABLE IF NOT EXISTS admin_roles (
        id VARCHAR PRIMARY KEY,
        display_name VARCHAR NOT NULL,
        color VARCHAR DEFAULT '#ffffff',
        sort_order INTEGER DEFAULT 0,
        has_admin_access BOOLEAN DEFAULT false,
        show_on_staff_page BOOLEAN DEFAULT false,
        permissions JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS staff_members (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
        minecraft_username VARCHAR NOT NULL,
        role VARCHAR NOT NULL,
        role_color VARCHAR DEFAULT '#ffffff',
        active BOOLEAN DEFAULT true,
        sort_order INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS faq_categories (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
        name VARCHAR NOT NULL,
        slug VARCHAR NOT NULL UNIQUE,
        icon VARCHAR DEFAULT 'LayoutGrid',
        active BOOLEAN DEFAULT true,
        sort_order INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
      ALTER TABLE faq_categories ADD COLUMN IF NOT EXISTS icon VARCHAR DEFAULT 'LayoutGrid';

      CREATE TABLE IF NOT EXISTS faq_items (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
        category_id VARCHAR NOT NULL,
        question VARCHAR NOT NULL,
        answer TEXT NOT NULL,
        active BOOLEAN DEFAULT true,
        sort_order INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS gamemodes (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
        name VARCHAR NOT NULL,
        icon VARCHAR DEFAULT 'Gamepad2',
        status VARCHAR DEFAULT 'ONLINE',
        sort_order INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS features (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
        name VARCHAR NOT NULL,
        description TEXT NOT NULL,
        icon VARCHAR DEFAULT 'Sparkles',
        active BOOLEAN DEFAULT true,
        sort_order INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS email_templates (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
        type VARCHAR NOT NULL UNIQUE,
        subject VARCHAR NOT NULL,
        body_html TEXT NOT NULL,
        active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS social_links (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
        platform VARCHAR NOT NULL,
        url VARCHAR NOT NULL,
        icon VARCHAR NOT NULL,
        show_in_nav BOOLEAN DEFAULT TRUE,
        sort_order INTEGER DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS page_settings (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
        page_name VARCHAR NOT NULL UNIQUE,
        enabled BOOLEAN DEFAULT TRUE,
        sort_order INTEGER DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS rules (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
        title VARCHAR NOT NULL,
        content TEXT NOT NULL,
        category VARCHAR DEFAULT 'General',
        sort_order INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS vote_sites (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
        name VARCHAR NOT NULL,
        url VARCHAR NOT NULL,
        image_url VARCHAR,
        reward_description VARCHAR,
        cooldown_hours INTEGER DEFAULT 24,
        sort_order INTEGER DEFAULT 0,
        enabled BOOLEAN DEFAULT TRUE
      );

      CREATE TABLE IF NOT EXISTS vanity_links (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
        path VARCHAR NOT NULL UNIQUE,
        target_url VARCHAR NOT NULL,
        enabled BOOLEAN DEFAULT TRUE
      );

      CREATE TABLE IF NOT EXISTS seasonal_themes (
        id VARCHAR PRIMARY KEY,
        name VARCHAR NOT NULL,
        enabled BOOLEAN DEFAULT FALSE,
        settings JSONB DEFAULT '{}'
      );

      CREATE TABLE IF NOT EXISTS blogs (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
        title VARCHAR NOT NULL,
        slug VARCHAR NOT NULL UNIQUE,
        content TEXT NOT NULL,
        excerpt VARCHAR,
        image_url VARCHAR,
        published BOOLEAN DEFAULT FALSE,
        featured BOOLEAN DEFAULT FALSE,
        author VARCHAR DEFAULT 'Admin',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS ranks (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
        name VARCHAR NOT NULL,
        package_id VARCHAR,
        price VARCHAR DEFAULT '0',
        color VARCHAR DEFAULT '#ffffff',
        permissions JSONB DEFAULT '[]',
        sort_order INTEGER DEFAULT 0,
        enabled BOOLEAN DEFAULT TRUE
      );

      CREATE TABLE IF NOT EXISTS pages (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
        title VARCHAR NOT NULL,
        slug VARCHAR NOT NULL UNIQUE,
        content TEXT NOT NULL,
        published BOOLEAN DEFAULT TRUE,
        show_in_nav BOOLEAN DEFAULT FALSE,
        sort_order INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log("Database tables initialized successfully");
  } catch (error) {
    console.error("Error initializing database tables:", error);
  } finally {
    client.release();
  }
}
