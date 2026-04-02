
import { loadConfig } from "../main/config";
import { execSync } from "child_process";
import pg from 'pg';

const { Client } = pg;

// Load config from config.yml
const config = loadConfig();

if (!config.database_url) {
    console.error("Error: database_url is missing in config.yml");
    process.exit(1);
}

const dbUrl = config.database_url;
let username = "";
let searchPath = "public";

try {
    const urlObj = new URL(dbUrl);
    if (urlObj.username) {
        username = urlObj.username;
        // Set search path to username first, then public as fallback
        searchPath = `"${username}",public`;
    }
} catch (e) {
    console.warn("Could not parse DATABASE_URL");
}

async function run() {
    console.log(`Preparing database for user: ${username || 'default'}...`);

    // Ensure schema exists using a direct connection
    if (username) {
        const client = new Client({ connectionString: dbUrl });
        try {
            await client.connect();
            // Create the schema for the user so they have a place to put tables
            // This fixes the "no schema has been selected to create in" error on new DBs
            await client.query(`CREATE SCHEMA IF NOT EXISTS "${username}";`);
            console.log(`Ensured schema "${username}" exists.`);
        } catch (err) {
            console.error("Failed to ensure schema exists:", err.message);
            // We continue anyway, as it might already exist or permissions might vary
        } finally {
            await client.end();
        }
    }

    console.log("Running Drizzle Kit Push...");
    console.log(`Target Database: ${new URL(dbUrl).hostname}`);
    console.log(`Using Schema/Search Path: ${searchPath}`);

    // Execute drizzle-kit push with the env var set
    try {
        execSync("npx drizzle-kit push", {
            stdio: "inherit",
            env: {
                ...process.env,
                DATABASE_URL: dbUrl,
                // Explicitly valid search path helps Drizzle/PG find the right place
                PGOPTIONS: `-c search_path=${searchPath}`,
            },
        });
        console.log("Database schema updated successfully!");
    } catch (error) {
        console.error("Failed to update database schema.");
        process.exit(1);
    }
}

run();
