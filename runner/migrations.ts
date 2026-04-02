import pg from 'pg';
import { loadConfig } from "../main/config";

const { Client } = pg;
const config = loadConfig();

if (!config.database_url) {
  console.error("No database_url in config.yml");
  process.exit(1);
}

async function run() {
  const client = new Client({ connectionString: config.database_url });
  await client.connect();

  console.log("Starting database migrations for expanded modules...");

  // 1. Alter site_settings
  const siteSettingsColumns = [
    { name: "smtp_host", type: "VARCHAR(255)", default: "''" },
    { name: "smtp_port", type: "INTEGER", default: "587" },
    { name: "smtp_user", type: "VARCHAR(255)", default: "''" },
    { name: "smtp_pass", type: "VARCHAR(255)", default: "''" },
    { name: "email_provider", type: "VARCHAR(50)", default: "'custom'" },
  ];
  for (const col of siteSettingsColumns) {
    try {
      await client.query(`ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS "${col.name}" ${col.type} DEFAULT ${col.default};`);
      console.log(`✅ Added ${col.name} to site_settings`);
    } catch (e: any) {
      if (e.code === '42701') console.log(`⏭️  ${col.name} already exists in site_settings`);
      else console.error(`❌ Failed to add ${col.name}:`, e.message);
    }
  }

  // 2. Alter users
  const userColumns = [
    { name: "password_hash", type: "VARCHAR(255)" },
    { name: "role_id", type: "VARCHAR(50)", default: "'user'" },
  ];
  for (const col of userColumns) {
    try {
      const defaultStr = col.default ? ` DEFAULT ${col.default}` : '';
      await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS "${col.name}" ${col.type}${defaultStr};`);
      console.log(`✅ Added ${col.name} to users`);
    } catch (e: any) {
      if (e.code === '42701') console.log(`⏭️  ${col.name} already exists in users`);
      else console.error(`❌ Failed to add ${col.name}:`, e.message);
    }
  }

  // 3. Create admin_roles
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS admin_roles (
        id VARCHAR(50) PRIMARY KEY,
        display_name VARCHAR(100) NOT NULL,
        color VARCHAR(20) DEFAULT '#ffffff',
        sort_order INTEGER DEFAULT 0,
        has_admin_access BOOLEAN DEFAULT FALSE,
        show_on_staff_page BOOLEAN DEFAULT FALSE,
        permissions JSONB DEFAULT '{}'::jsonb,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log("✅ Created admin_roles table");

    // Insert default owner role if not exists
    await client.query(`
      INSERT INTO admin_roles (id, display_name, color, has_admin_access) 
      VALUES ('owner', 'Owner', '#ef4444', TRUE)
      ON CONFLICT (id) DO NOTHING;
    `);
    
    // Set first user to owner if any users exist
    await client.query(`
      UPDATE users SET role_id = 'owner' WHERE id IN (SELECT id FROM users ORDER BY created_at ASC LIMIT 1);
    `);
  } catch (e: any) {
    console.error("❌ Failed to create admin_roles:", e.message);
  }

  // 4. Create staff_members
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS staff_members (
        id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid(),
        minecraft_username VARCHAR(255) NOT NULL,
        role VARCHAR(100) NOT NULL,
        role_color VARCHAR(20) DEFAULT '#ffffff',
        active BOOLEAN DEFAULT TRUE,
        sort_order INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log("✅ Created staff_members table");
  } catch (e: any) {
    console.error("❌ Failed to create staff_members:", e.message);
  }

  // 5. Create faq_categories
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS faq_categories (
        id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) NOT NULL UNIQUE,
        active BOOLEAN DEFAULT TRUE,
        sort_order INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log("✅ Created faq_categories table");
  } catch (e: any) {
    console.error("❌ Failed to create faq_categories:", e.message);
  }

  // 6. Create faq_items
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS faq_items (
        id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid(),
        category_id VARCHAR(255) NOT NULL,
        question VARCHAR(255) NOT NULL,
        answer TEXT NOT NULL,
        active BOOLEAN DEFAULT TRUE,
        sort_order INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log("✅ Created faq_items table");
  } catch (e: any) {
    console.error("❌ Failed to create faq_items:", e.message);
  }

  // 7. Create email_templates
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS email_templates (
        id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid(),
        type VARCHAR(100) NOT NULL UNIQUE,
        subject VARCHAR(255) NOT NULL,
        body_html TEXT NOT NULL,
        active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
    
    // Seed default template for testing
    await client.query(`
      INSERT INTO email_templates (type, subject, body_html) 
      VALUES ('purchase', 'Purchase Confirmation - {{serverName}}', '<h1 style="color: #4ade80;">Purchase Confirmation</h1><p>Thank you for purchasing {{itemNames}}!</p>')
      ON CONFLICT (type) DO NOTHING;
    `);
    console.log("✅ Created email_templates table");
  } catch (e: any) {
    console.error("❌ Failed to create email_templates:", e.message);
  }

  await client.end();
  console.log("Finished executing database migrations.");
}

run();
