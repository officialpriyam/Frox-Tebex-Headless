import fs from "fs";
import path from "path";

const ENV_PATH = path.join(process.cwd(), ".env");
let envLoaded = false;

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function formatEnvValue(value: string) {
  if (!value) return "";
  if (/[\\s#"]/g.test(value)) {
    return `"${value.replace(/"/g, '\\"')}"`;
  }
  return value;
}

export function ensureEnvLoaded() {
  if (envLoaded) return;
  envLoaded = true;

  if (!fs.existsSync(ENV_PATH)) return;

  const content = fs.readFileSync(ENV_PATH, "utf8");
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const separatorIndex = trimmed.indexOf("=");
    if (separatorIndex < 0) continue;
    const key = trimmed.slice(0, separatorIndex).trim();
    let value = trimmed.slice(separatorIndex + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }
}

export function getEnvValue(key: string) {
  ensureEnvLoaded();
  return process.env[key];
}

export function upsertEnvValue(key: string, value?: string) {
  ensureEnvLoaded();
  const nextValue = value ?? "";
  process.env[key] = nextValue;

  const formattedValue = formatEnvValue(nextValue);
  const matcher = new RegExp(`^\\s*${escapeRegExp(key)}\\s*=`);
  const existing = fs.existsSync(ENV_PATH)
    ? fs.readFileSync(ENV_PATH, "utf8").split(/\r?\n/)
    : [];

  let found = false;
  const updatedLines = existing.map((line) => {
    if (line.trim().startsWith("#") || !matcher.test(line)) {
      return line;
    }
    found = true;
    return `${key}=${formattedValue}`;
  });

  if (!found) {
    updatedLines.push(`${key}=${formattedValue}`);
  }

  const output = updatedLines.join("\n").replace(/\n+$/, "\n");
  
  // Skip writing to .env on Vercel as the filesystem is read-only
  if (process.env.VERCEL || process.env.VERCEL_ENV) {
    console.log(`[Vercel] Skipping .env update for ${key}`);
    return;
  }

  fs.writeFileSync(ENV_PATH, output, "utf8");
}
