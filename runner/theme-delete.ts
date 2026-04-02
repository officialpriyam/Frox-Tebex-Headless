import fs from "fs";
import path from "path";

const themeName = process.argv[2];

if (!themeName) {
  console.error("❌ Usage: npm run snap:theme:delete <theme-name>");
  console.error("   Example: npm run snap:theme:delete my-awesome-theme");
  process.exit(1);
}

// Protected themes
const protectedThemes = ["default", "rpg", "_base"];
if (protectedThemes.includes(themeName)) {
  console.error(`❌ Cannot delete built-in theme "${themeName}".`);
  process.exit(1);
}

const templatesDir = path.resolve(process.cwd(), "templates");
const targetDir = path.join(templatesDir, themeName);

if (!fs.existsSync(targetDir)) {
  console.error(`❌ Theme "${themeName}" not found at templates/${themeName}/`);
  process.exit(1);
}

// Delete recursively
fs.rmSync(targetDir, { recursive: true, force: true });

console.log(`\n✅ Theme "${themeName}" deleted successfully!`);
console.log(`   Restart the server to apply changes.\n`);
