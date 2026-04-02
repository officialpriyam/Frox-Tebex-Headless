# SnapTebex Custom Theme Guide

SnapTebex has a powerful template-based theme system. Each theme lives in its own folder under `templates/` and is automatically discovered by the admin panel.

## Quick Start

### Create a New Theme
```bash
npm run snap:theme:create my-epic-theme
```

This copies the base template to `templates/my-epic-theme/` with two files:
- **`theme.json`** — Name, description, author metadata
- **`theme.css`** — CSS variable overrides

### Delete a Theme
```bash
npm run snap:theme:delete my-epic-theme
```
> Built-in themes (`default`, `rpg`) are protected and cannot be deleted.

## Theme Structure

```
templates/
├── _base/          ← Starter template (copied by snap:theme:create)
│   ├── theme.json
│   └── theme.css
├── default/        ← Built-in modern theme
│   ├── theme.json
│   └── theme.css
├── rpg/            ← Built-in medieval RPG theme
│   ├── theme.json
│   └── theme.css
└── my-theme/       ← Your custom theme
    ├── theme.json
    └── theme.css
```

## Customizing Your Theme

### 1. Edit `theme.json`
```json
{
  "name": "my-theme",
  "displayName": "My Awesome Theme",
  "description": "A custom theme with neon vibes",
  "author": "YourName",
  "version": "1.0.0"
}
```

### 2. Edit `theme.css`
Override CSS variables using the `[data-theme="my-theme"]` selector:

```css
[data-theme="my-theme"] {
  --background: 240 10% 5%;
  --foreground: 0 0% 95%;
  --primary: 280 100% 65%;
  --primary-foreground: 0 0% 100%;
  /* ... more variables ... */
}
```

You can also override component styles:
```css
[data-theme="my-theme"] .glass-card {
  border: 1px solid rgba(180, 0, 255, 0.2);
  box-shadow: 0 0 20px rgba(180, 0, 255, 0.1);
}
```

### 3. Activate
1. Restart the dev server
2. Go to **Admin → Theme → Active Theme**
3. Select your theme from the dropdown

## Tips
- Use **HSL values** for variables (Tailwind compatibility)
- Import custom fonts via `@import url(...)` at the top of your CSS
- Test in both dark and light modes
- Use `hidden lg:block` for large decorative elements to keep mobile clean
