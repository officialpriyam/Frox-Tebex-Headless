
import { loadConfig } from "../main/config";
import pg from 'pg';

const { Client } = pg;
const config = loadConfig();

if (!config.database_url) {
    console.error("Error: database_url is missing");
    process.exit(1);
}

async function run() {
    const client = new Client({ connectionString: config.database_url });
    try {
        await client.connect();
        console.log("Connected to DB.");

        // Check schemas
        const schemas = await client.query("SELECT schema_name FROM information_schema.schemata;");
        console.log("Schemas found:", schemas.rows.map(r => r.schema_name));

        // Check tables in FFFF_halfwayson
        const urlObj = new URL(config.database_url!);
        const username = urlObj.username;

        console.log(`Checking tables in schema '${username}'...`);
        const tables = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = $1;
        `, [username]);

        console.log("Tables found in user schema:", tables.rows.map(r => r.table_name));

        // Check tables in public
        console.log("Checking tables in schema 'public'...");
        const publicTables = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public';
        `);
        console.log("Tables found in public schema:", publicTables.rows.map(r => r.table_name));

        // Check search_path
        const sp = await client.query("SHOW search_path;");
        console.log("Current search_path:", sp.rows[0]);

    } catch (err) {
        console.error("Error:", err);
    } finally {
        await client.end();
    }
}

run();
