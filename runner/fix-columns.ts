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

  const columns = [
    { name: "active_theme", type: "VARCHAR(255)", default: "'default'" },
    { name: "deco_asset_1", type: "VARCHAR(255)", default: "'/vines.png'" },
    { name: "deco_asset_2", type: "VARCHAR(255)", default: "'/vines.png'" },
    { name: "deco_asset_3", type: "VARCHAR(255)", default: "''" },
    { name: "show_navbar_box", type: "BOOLEAN", default: "TRUE" },
  ];

  for (const col of columns) {
    try {
      await client.query(`ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS "${col.name}" ${col.type} DEFAULT ${col.default};`);
      console.log(`✅ Column "${col.name}" ensured.`);
    } catch (err: any) {
      if (err.code === '42701') {
        console.log(`⏭️  Column "${col.name}" already exists.`);
      } else {
        console.error(`❌ Error adding "${col.name}":`, err.message);
      }
    }
  }

  await client.end();
  console.log("\nDone! Columns are ready.");
}

run();
