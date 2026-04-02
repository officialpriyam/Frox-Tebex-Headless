# 💎 SnapTebe Guide

 This guide will walk you through the steps to install and run your server store on a VPS or via Docker.

---

## 🚀 Before You Start (Critical)

Before starting the server for the first time, you **must** configure your database connection string.

1.  Open `config.yml` in the root directory.
2.  Locate the `database_url` field.
3.  Add your PostgreSQL connection URI.
    *   Example: `database_url: "postgresql://user:password@host:5432/database?sslmode=require"`

> [!IMPORTANT]
> **Do not touch any other settings** in `config.yml`. All other configurations (Site Name, Tebex Tokens, Server IPs, etc.) will be handled automatically during the web installation process.

---

## 🐳 Running with Docker (Recommended)

Docker is the easiest way to deploy CryonTebex.

1.  **Build the image:**
    ```bash
    docker build -t cryontebex .
    ```

2.  **Run the container:**
    ```bash
    docker run -d -p 5000:5000 --name cryontebex cryontebex
    ```

---

## 💻 Running on a VPS (Manual)

If you prefer to run directly on your VPS:

1.  **Install Node.js 20+**
2.  **Clone your project files** to the server.
3.  **Install dependencies:**
    ```bash
    npm install
    ```
4.  **Build the project:**
    ```bash
    npm run build
    ```
5.  **Start the server:**
    ```bash
    npm start
    ```

---

## 🛠️ Completing the Installation

Once your server is running:

1.  Open your browser and navigate to: `http://your-vps-ip:5000/install`
2.  Follow the 3-step setup wizard to configure:
    *   Site Branding & Admin Password
    *   Minecraft Server IPs (Java/Bedrock)
    *   Tebex Tokens & Discord Integration
3.  After completion, your store will be live at: `http://your-vps-ip:5000/`

---

## 🆘 Support

If you need assistance, join our Discord: [https://discord.gg/5b99XppGDV](https://discord.gg/5b99XppGDV)
