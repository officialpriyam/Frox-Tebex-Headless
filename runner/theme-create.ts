import fs from "fs";
import path from "path";

const themeName = process.argv[2];

if (!themeName) {
  console.error("❌ Usage: npm run snap:theme:create <theme-name>");
  console.error("   Example: npm run snap:theme:create my-awesome-theme");
  process.exit(1);
}

// Validate name
if (!/^[a-zA-Z0-9_-]+$/.test(themeName)) {
  console.error("❌ Theme name can only contain letters, numbers, hyphens, and underscores.");
  process.exit(1);
}

if (themeName.startsWith("_")) {
  console.error("❌ Theme name cannot start with an underscore (reserved for internal templates).");
  process.exit(1);
}

const templatesDir = path.resolve(process.cwd(), "templates");
const baseDir = path.join(templatesDir, "_base");
const targetDir = path.join(templatesDir, themeName);

if (!fs.existsSync(baseDir)) {
  console.error("❌ Base template not found at templates/_base/. Please ensure it exists.");
  process.exit(1);
}

if (fs.existsSync(targetDir)) {
  console.error(`❌ Theme "${themeName}" already exists at templates/${themeName}/`);
  process.exit(1);
}

// Copy _base to target
function copyDirSync(src: string, dest: string) {
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirSync(srcPath, destPath);
    } else {
      let content = fs.readFileSync(srcPath, "utf-8");
      // Replace placeholder with actual theme name
      content = content.replace(/YOUR_THEME_NAME/g, themeName);
      content = content.replace(/"_base"/g, `"${themeName}"`);
      content = content.replace(/"Base Theme \(Template\)"/g, `"${themeName}"`);
      fs.writeFileSync(destPath, content);
    }
  }
}

copyDirSync(baseDir, targetDir);

// Update the theme.json with the correct name
const themeJsonPath = path.join(targetDir, "theme.json");
if (fs.existsSync(themeJsonPath)) {
  const themeJson = JSON.parse(fs.readFileSync(themeJsonPath, "utf-8"));
  themeJson.name = themeName;
  themeJson.displayName = themeName;
  themeJson.description = `Custom theme: ${themeName}`;
  themeJson.author = "Custom";
  fs.writeFileSync(themeJsonPath, JSON.stringify(themeJson, null, 2));
}

console.log(`\n✅ Theme "${themeName}" created successfully!`);
console.log(`📂 Location: templates/${themeName}/`);
console.log(`\n📋 Next steps:`);
console.log(`   1. Edit templates/${themeName}/theme.css to customize your theme`);
console.log(`   2. Edit templates/${themeName}/theme.json to set display name & description`);
console.log(`   3. Restart the server — your theme will appear in the Admin panel`);
console.log(`   4. Select it from Theme → Active Theme in the Admin dashboard\n`);
