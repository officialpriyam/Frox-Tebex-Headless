import fs from "fs";
import path from "path";
import yaml from "js-yaml";
import crypto from "crypto";

const CONFIG_PATH = path.join(process.cwd(), "config.yml");

export interface AppConfig {
  database_url?: string;
  session_secret?: string;
  admin_password_hash?: string;
  tebex_public_token?: string;
  tebex_private_key?: string;
  site_name?: string;
  discord_invite_url?: string;
  java_server_ip?: string;
  bedrock_server_ip?: string;
  bedrock_port?: number;
  is_installed?: boolean;
  active_theme?: string;
  deco_asset_1?: string;
  deco_asset_2?: string;
  deco_asset_3?: string;
  show_navbar_box?: boolean;
}

function applyEnvOverrides(config: AppConfig): AppConfig {
  const overrides: AppConfig = {};
  const env = process.env;

  if (env.DATABASE_URL) overrides.database_url = env.DATABASE_URL;
  if (env.SESSION_SECRET) overrides.session_secret = env.SESSION_SECRET;
  if (env.JWT_SECRET) overrides.session_secret = env.JWT_SECRET;
  if (env.ADMIN_PASSWORD_HASH) overrides.admin_password_hash = env.ADMIN_PASSWORD_HASH;
  if (env.TEBEX_PUBLIC_TOKEN) overrides.tebex_public_token = env.TEBEX_PUBLIC_TOKEN;
  if (env.TEBEX_PRIVATE_KEY) overrides.tebex_private_key = env.TEBEX_PRIVATE_KEY;
  if (env.SITE_NAME) overrides.site_name = env.SITE_NAME;
  if (env.DISCORD_INVITE_URL) overrides.discord_invite_url = env.DISCORD_INVITE_URL;
  if (env.JAVA_SERVER_IP) overrides.java_server_ip = env.JAVA_SERVER_IP;
  if (env.BEDROCK_SERVER_IP) overrides.bedrock_server_ip = env.BEDROCK_SERVER_IP;
  if (env.BEDROCK_PORT) {
    const parsed = parseInt(env.BEDROCK_PORT, 10);
    if (!Number.isNaN(parsed)) overrides.bedrock_port = parsed;
  }
  if (env.IS_INSTALLED) overrides.is_installed = env.IS_INSTALLED === "true";
  if (env.ACTIVE_THEME) overrides.active_theme = env.ACTIVE_THEME;
  if (env.DECO_ASSET_1) overrides.deco_asset_1 = env.DECO_ASSET_1;
  if (env.DECO_ASSET_2) overrides.deco_asset_2 = env.DECO_ASSET_2;
  if (env.DECO_ASSET_3) overrides.deco_asset_3 = env.DECO_ASSET_3;
  if (env.SHOW_NAVBAR_BOX !== undefined) overrides.show_navbar_box = env.SHOW_NAVBAR_BOX === "true";

  return { ...config, ...overrides };
}

export function loadConfig(): AppConfig {
  try {
    if (fs.existsSync(CONFIG_PATH)) {
      const fileContent = fs.readFileSync(CONFIG_PATH, "utf8");
      const config = yaml.load(fileContent) as AppConfig;
      return applyEnvOverrides(config || {});
    }
  } catch (error) {
    console.error("Error loading config.yml:", error);
  }
  return applyEnvOverrides({});
}

export function saveConfig(config: Partial<AppConfig>): boolean {
  try {
    if (process.env.VERCEL || process.env.VERCEL_ENV) {
      return true;
    }
    const existingConfig = loadConfig();
    const mergedConfig = { ...existingConfig, ...config };
    const yamlContent = yaml.dump(mergedConfig, { indent: 2 });
    fs.writeFileSync(CONFIG_PATH, yamlContent, "utf8");
    return true;
  } catch (error) {
    console.error("Error saving config.yml:", error);
    return false;
  }
}

export function getConfigValue<K extends keyof AppConfig>(key: K): AppConfig[K] | undefined {
  const config = loadConfig();
  return config[key];
}

export function isInstalled(): boolean {
  const config = loadConfig();
  return config.is_installed === true;
}

export function generateSessionSecret(): string {
  return crypto.randomBytes(48).toString("base64");
}

export function getSessionSecret(): string {
  if (process.env.SESSION_SECRET) {
    return process.env.SESSION_SECRET;
  }
  if (process.env.JWT_SECRET) {
    return process.env.JWT_SECRET;
  }
  const config = loadConfig();
  if (config.session_secret) {
    return config.session_secret;
  }
  const newSecret = generateSessionSecret();
  saveConfig({ session_secret: newSecret });
  return newSecret;
}
