
import pg from 'pg';
import { loadConfig } from '../main/config';

const config = loadConfig();
const { Pool } = pg;

const pool = new Pool({
    connectionString: config.database_url,
});

async function run() {
    const client = await pool.connect();
    try {
        console.log("Connected to DB.");

        // Check search_path
        const spResult = await client.query("SHOW search_path;");
        console.log("Current search_path:", spResult.rows[0].search_path);

        // List schemas
        const schemaResult = await client.query("SELECT nspname FROM pg_catalog.pg_namespace;");
        console.log("Available schemas:", schemaResult.rows.map(r => r.nspname).join(", "));

        // Try to create a table in current path
        try {
            await client.query("CREATE TABLE IF NOT EXISTS debug_test_table (id serial primary key);");
            console.log("Successfully created debug_test_table in default schema.");
            await client.query("DROP TABLE debug_test_table;");
        } catch (e) {
            console.error("Failed to create table in default schema:", e.message);
        }

    } catch (err) {
        console.error("Error:", err);
    } finally {
        client.release();
        pool.end();
    }
}

run();
