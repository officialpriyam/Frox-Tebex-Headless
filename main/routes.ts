import type { Express, Request, Response, NextFunction } from "express";
import fs from "fs";
import path from "path";
import { createServer, type Server } from "http";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { storage } from "./storage";
import { tebexClient } from "./tebex";
import { insertUserSchema, insertGamemodeSchema, insertFeatureSchema } from "@data/schema";
import { z } from "zod";
import { sendTemplatedEmail } from "./email";
import { saveConfig, loadConfig, getSessionSecret, isInstalled as checkConfigInstalled, generateSessionSecret } from "./config";

const JWT_SECRET = getSessionSecret();

// Installation schema - core required fields must be entered during install
const installSchema = z.object({
  siteName: z.string().min(2, "Site name must be at least 2 characters"),
  adminPassword: z.string().min(6, "Password must be at least 6 characters"),
  databaseUrl: z.string().min(1, "PostgreSQL database URL is required"),
  tebexPublicToken: z.string().optional(),
  tebexPrivateKey: z.string().optional(),
  discordInviteUrl: z.string().optional(),
  javaServerIp: z.string().min(1, "Java server IP is required"),
  bedrockServerIp: z.string().optional(),
  bedrockPort: z.number().optional(),
});

interface JwtPayload {
  admin: boolean;
  iat: number;
  exp: number;
}

function verifyAdminToken(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const token = authHeader.substring(7);
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    if (!decoded.admin) {
      return res.status(403).json({ message: "Forbidden" });
    }
    next();
  } catch {
    return res.status(401).json({ message: "Invalid token" });
  }
}

type TebexLookupRecord = Record<string, unknown>;

function normalizeLookupCode(value: unknown): string {
  return String(value ?? "").replace(/\s+/g, "").toLowerCase();
}

function asString(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  const stringValue = String(value).trim();
  return stringValue.length > 0 ? stringValue : null;
}

function asNumber(value: unknown): number | null {
  if (typeof value === "number" && !Number.isNaN(value)) return value;
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return null;
    const parsed = Number(trimmed);
    return Number.isNaN(parsed) ? null : parsed;
  }
  return null;
}

function stripHtml(value: string | null): string | null {
  if (!value) return null;
  const cleaned = value.replace(/<[^>]*>/g, "").trim();
  return cleaned.length > 0 ? cleaned : null;
}

function extractGiftCardCode(card: TebexLookupRecord): string {
  return normalizeLookupCode(
    card.code ?? card.card_code ?? card.gift_card_code ?? card.identifier ?? card.id
  );
}

function extractCouponCode(coupon: TebexLookupRecord): string {
  return normalizeLookupCode(
    coupon.code ?? coupon.coupon_code ?? coupon.identifier ?? coupon.id
  );
}

function normalizeCurrency(value: unknown): string | null {
  if (typeof value === "string") {
    return value.trim() || null;
  }
  if (value && typeof value === "object" && "code" in value) {
    const code = (value as { code?: unknown }).code;
    return typeof code === "string" && code.trim() ? code.trim() : null;
  }
  return null;
}

function normalizeGiftCard(card: TebexLookupRecord) {
  const statusValue = asString(card.status);
  const activeValue = typeof card.active === "boolean" ? (card.active ? "active" : "inactive") : null;

  return {
    code: asString(card.code ?? card.card_code ?? card.gift_card_code ?? card.identifier ?? card.id),
    balance: asNumber(card.balance ?? card.remaining_balance ?? card.remaining ?? card.value ?? card.amount),
    initialBalance: asNumber(card.initial_balance ?? card.starting_balance ?? card.initial),
    currency: normalizeCurrency(card.currency ?? card.currency_code),
    expiresAt: asString(card.expires_at ?? card.expiry ?? card.expires),
    status: statusValue ?? activeValue,
  };
}

function normalizeCoupon(coupon: TebexLookupRecord) {
  const rawType = asString(coupon.discount_type ?? coupon.type)?.toLowerCase();
  const discountType =
    rawType?.includes("percent") ? "percent" : rawType?.includes("amount") ? "amount" : null;
  const statusValue = asString(coupon.status);
  const activeValue = typeof coupon.active === "boolean" ? (coupon.active ? "active" : "inactive") : null;

  return {
    code: asString(coupon.code ?? coupon.coupon_code ?? coupon.identifier ?? coupon.id),
    discount: asNumber(coupon.discount ?? coupon.amount ?? coupon.value),
    discountType,
    minimumSpend: asNumber(coupon.minimum ?? coupon.min_amount),
    expiresAt: asString(coupon.expires_at ?? coupon.expiry ?? coupon.expires),
    status: statusValue ?? activeValue,
  };
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // ==================== INSTALLATION ROUTES ====================

  // Check installation status - read from config.yml
  app.get("/api/install/status", async (req, res) => {
    try {
      const installed = checkConfigInstalled();
      res.json({ installed });
    } catch (error) {
      console.error("Error checking installation status:", error);
      res.status(500).json({ error: "Failed to check installation status" });
    }
  });

  // Perform installation - save everything to config.yml
  app.post("/api/install", async (req, res) => {
    try {
      const installed = checkConfigInstalled();
      if (installed) {
        return res.status(400).json({ message: "Site is already installed" });
      }

      const parsed = installSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: parsed.error.errors[0].message });
      }

      const data = parsed.data;
      const tebexPublicToken = data.tebexPublicToken?.trim() || "";
      const tebexPrivateKey = data.tebexPrivateKey?.trim() || "";
      const hashedPassword = await bcrypt.hash(data.adminPassword, 10);

      // Save ALL settings to config.yml
      saveConfig({
        database_url: data.databaseUrl,
        session_secret: generateSessionSecret(),
        admin_password_hash: hashedPassword,
        tebex_public_token: tebexPublicToken,
        tebex_private_key: tebexPrivateKey,
        site_name: data.siteName,
        discord_invite_url: data.discordInviteUrl || "",
        java_server_ip: data.javaServerIp,
        bedrock_server_ip: data.bedrockServerIp || "",
        bedrock_port: data.bedrockPort || 19132,
        is_installed: true,
      });

      // Also save to database for site settings that can be changed later
      await storage.updateSettings({
        isInstalled: true,
        adminPasswordHash: hashedPassword,
        serverName: data.siteName,
        appName: data.siteName,
        tebexPublicToken: tebexPublicToken,
        tebexPrivateKey: tebexPrivateKey,
        discordInviteUrl: data.discordInviteUrl || null,
        javaServerIp: data.javaServerIp,
        bedrockServerIp: data.bedrockServerIp || null,
        bedrockPort: data.bedrockPort || 19132,
      });

      // Initialize defaults after installation
      await storage.initializeDefaults();

      // Update Discord social link if provided
      if (data.discordInviteUrl) {
        const links = await storage.getSocialLinks();
        const discordLink = links.find(l => l.platform.toLowerCase() === "discord");
        if (discordLink) {
          await storage.updateSocialLink(discordLink.id, { url: data.discordInviteUrl });
        }
      }

      const token = jwt.sign({ admin: true }, JWT_SECRET, { expiresIn: "24h" });
      res.json({ success: true, token });
    } catch (error) {
      console.error("Installation error:", error);
      res.status(500).json({ message: "Installation failed" });
    }
  });

  // Initialize default data only if installed (check from config.yml)
  const configInstalled = checkConfigInstalled();
  if (configInstalled) {
    try {
      await storage.initializeDefaults();
    } catch (error) {
      console.error("Error initializing defaults:", error);
    }
  }

  // ==================== PUBLIC ROUTES ====================

  // Get site settings
  app.get("/api/settings", async (req, res) => {
    try {
      const settings = await storage.getSettings();
      if (!settings) {
        return res.json({});
      }
      const { adminPasswordHash, tebexPrivateKey, tebexPluginApiKey, ...publicSettings } = settings as any;
      res.json(publicSettings);
    } catch (error) {
      console.error("Error fetching settings:", error);
      res.status(500).json({ message: "Failed to fetch settings" });
    }
  });

  // Get social links
  app.get("/api/social-links", async (req, res) => {
    try {
      const links = await storage.getSocialLinks();
      res.json(links);
    } catch (error) {
      console.error("Error fetching social links:", error);
      res.status(500).json({ message: "Failed to fetch social links" });
    }
  });

  // Get page settings
  app.get("/api/page-settings", async (req, res) => {
    try {
      const pages = await storage.getPageSettings();
      res.json(pages);
    } catch (error) {
      console.error("Error fetching page settings:", error);
      res.status(500).json({ message: "Failed to fetch page settings" });
    }
  });

  // Get rules
  app.get("/api/rules", async (req, res) => {
    try {
      const rulesList = await storage.getRules();
      res.json(rulesList);
    } catch (error) {
      console.error("Error fetching rules:", error);
      res.status(500).json({ message: "Failed to fetch rules" });
    }
  });

  // Get vote sites
  app.get("/api/vote-sites", async (req, res) => {
    try {
      const sites = await storage.getVoteSites();
      res.json(sites);
    } catch (error) {
      console.error("Error fetching vote sites:", error);
      res.status(500).json({ message: "Failed to fetch vote sites" });
    }
  });

  // Get seasonal themes
  app.get("/api/seasonal-themes", async (req, res) => {
    try {
      const themes = await storage.getSeasonalThemes();
      res.json(themes);
    } catch (error) {
      console.error("Error fetching seasonal themes:", error);
      res.status(500).json({ message: "Failed to fetch seasonal themes" });
    }
  });

  // Get custom pages
  app.get("/api/pages", async (req, res) => {
    try {
      const pagesList = await storage.getPublishedPages();
      res.json(pagesList);
    } catch (error) {
      console.error("Error fetching pages:", error);
      res.status(500).json({ message: "Failed to fetch pages" });
    }
  });

  // Get custom page by slug
  app.get("/api/pages/:slug", async (req, res) => {
    try {
      const page = await storage.getPageBySlug(req.params.slug);
      if (!page || (!page.published && !req.query.preview)) {
        return res.status(404).json({ message: "Page not found" });
      }
      res.json(page);
    } catch (error) {
      console.error("Error fetching page:", error);
      res.status(500).json({ message: "Failed to fetch page" });
    }
  });

  // Get staff roster
  app.get("/api/staff", async (req, res) => {
    try {
      const staff = await storage.getStaffMembers();
      res.json(staff.filter(s => s.active).sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)));
    } catch (error) {
      console.error("Error fetching staff:", error);
      res.status(500).json({ message: "Failed to fetch staff" });
    }
  });

  // Get FAQ categories
  app.get("/api/faq-categories", async (req, res) => {
    try {
      const cats = await storage.getFaqCategories();
      res.json(cats.filter(c => c.active).sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)));
    } catch (error) {
      console.error("Error fetching FAQ categories:", error);
      res.status(500).json({ message: "Failed to fetch FAQ categories" });
    }
  });

  // Get FAQ items
  app.get("/api/faq-items", async (req, res) => {
    try {
      const items = await storage.getFaqItems();
      res.json(items.filter(i => i.active).sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)));
    } catch (error) {
      console.error("Error fetching FAQ items:", error);
      res.status(500).json({ message: "Failed to fetch FAQ items" });
    }
  });

  // ==================== TEBEX STORE ROUTES ====================

  // Get categories
  app.get("/api/store/categories", async (req, res) => {
    try {
      const includePackages = req.query.includePackages === "true" || req.query.includePackages === "1";
      const categories = await tebexClient.getCategories(includePackages);
      res.json(categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  // Get all packages
  app.get("/api/store/packages", async (req, res) => {
    try {
      const packages = await tebexClient.getPackages();
      res.json(packages);
    } catch (error) {
      console.error("Error fetching packages:", error);
      res.status(500).json({ message: "Failed to fetch packages" });
    }
  });

  // Get single package
  app.get("/api/store/packages/:id", async (req, res) => {
    try {
      const packageId = parseInt(req.params.id);
      const pkg = await tebexClient.getPackage(packageId);
      if (!pkg) {
        return res.status(404).json({ message: "Package not found" });
      }
      res.json(pkg);
    } catch (error) {
      console.error("Error fetching package:", error);
      res.status(500).json({ message: "Failed to fetch package" });
    }
  });

  // Get featured packages
  app.get("/api/store/featured", async (req, res) => {
    try {
      const settings = await storage.getSettings();
      const featuredIds = settings?.featuredPackageIds || [];
      const packages = await tebexClient.getFeaturedPackages(featuredIds as string[]);
      res.json(packages);
    } catch (error) {
      console.error("Error fetching featured packages:", error);
      res.status(500).json({ message: "Failed to fetch featured packages" });
    }
  });

  // ==================== CHECKOUT ROUTES ====================
  app.post("/api/webhooks/tebex", async (req, res) => {
    try {
      const { type: eventType, data } = req.body;
      console.log(`[Tebex Webhook] Received event: ${eventType}`);

      if (eventType === "validation.webhook") {
        return res.json({ status: "ok" });
      }

      if (eventType === "payment.completed" || eventType === "payment.delivered") {
        const username = data.customer?.username || data.username;
        const email = data.customer?.email || data.email;
        const orderId = data.transaction_id || data.id;

        if (email && username) {
          const templateType = eventType === "payment.completed" ? "purchase" : "delivery";
          await sendTemplatedEmail(email, templateType, {
            username,
            order_id: orderId,
          });
        }
      }

      res.json({ success: true });
    } catch (error) {
      console.error("[Tebex Webhook] Error:", error);
      res.status(500).json({ message: "Webhook handler failed" });
    }
  });

  // Create checkout session
  app.post("/api/checkout", async (req, res) => {
    try {
      const { packageId, username, quantity = 1 } = req.body;

      if (!packageId || !username) {
        console.error("[Checkout] Missing required fields:", { packageId, username, quantity });
        return res.status(400).json({ message: "Package ID and username are required" });
      }
      console.log(`[Checkout] Request contents: packageId=${packageId}, username=${username}, quantity=${quantity}`);

      const protocol = req.headers["x-forwarded-proto"] || req.protocol;
      const host = req.headers.host;
      const baseUrl = `${protocol}://${host}`;

      const basket = await tebexClient.createBasket(
        username,
        `${baseUrl}/checkout/success`,
        `${baseUrl}/store`
      );

      if (!basket) {
        return res.status(500).json({ message: "Failed to create basket" });
      }

      const updatedBasket = await tebexClient.addPackageToBasket(
        basket.ident,
        packageId,
        quantity
      );

      if (!updatedBasket) {
        return res.status(500).json({ message: "Failed to add package to basket" });
      }

      res.json({
        basketIdent: updatedBasket.ident,
        checkoutUrl: updatedBasket.links?.checkout,
      });
    } catch (error) {
      console.error("Error creating checkout:", error);
      res.status(500).json({ message: "Failed to create checkout session" });
    }
  });

  // ==================== USER AUTH ROUTES ====================
  
  // Register new user
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { email, password, minecraftUsername } = req.body;

      if (!email || !password || !minecraftUsername) {
        return res.status(400).json({ message: "All fields are required" });
      }

      // Check if user already exists
      const existingUser = await storage.getUserByMinecraftUsername(minecraftUsername);
      if (existingUser) {
        return res.status(400).json({ message: "Minecraft username already registered" });
      }

      const passwordHash = await bcrypt.hash(password, 10);
      const user = await storage.upsertUser({
        minecraftUsername,
        email,
        passwordHash,
        roleId: "user",
      });

      const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "7d" });
      res.json({ user, token });
    } catch (error) {
      console.error("Error during registration:", error);
      res.status(500).json({ message: "Registration failed" });
    }
  });

  // Login with Email or Minecraft username
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { login, password, minecraftUsername } = req.body;
      const identifier = login || minecraftUsername;

      if (!identifier) {
        return res.status(400).json({ message: "Login identifier required" });
      }

      let user: any = null;
      
      // Try finding by minecraft username first
      user = await storage.getUserByMinecraftUsername(identifier);
      
      // If not found, try finding by email
      if (!user) {
        const allUsers = (storage as any).getUsers ? await (storage as any).getUsers() : [];
        user = allUsers.find((u: any) => u.email === identifier);
      }

      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }

      // If password provided, verify it
      if (password && user.passwordHash) {
        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) {
          return res.status(401).json({ message: "Invalid password" });
        }
      } else if (password && !user.passwordHash) {
        return res.status(400).json({ message: "Please use Discord login or set a password" });
      } else if (!password && user.passwordHash) {
         // Minecraft only login is allowed if NO password is set for that account
         // If a password IS set, we require it for security.
         return res.status(401).json({ message: "Password required for this account" });
      }

      const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "7d" });
      res.json({ user, token });
    } catch (error) {
      console.error("Error during login:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  // Get current user
  app.get("/api/auth/user", async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader?.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const token = authHeader.substring(7);
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
      const user = await storage.getUser(decoded.userId);

      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }

      res.json(user);
    } catch {
      return res.status(401).json({ message: "Invalid token" });
    }
  });

  // ==================== ADMIN ROUTES ====================

  // Admin login - read password hash from config.yml
  app.post("/api/admin/login", async (req, res) => {
    try {
      const { password } = req.body;
      const config = loadConfig();
      const settings = await storage.getSettings();
      const passwordHash = config.admin_password_hash || settings?.adminPasswordHash;

      if (!passwordHash) {
        return res.status(401).json({ message: "Admin not configured" });
      }

      const valid = await bcrypt.compare(password, passwordHash);
      if (!valid) {
        return res.status(401).json({ message: "Invalid password" });
      }

      const token = jwt.sign({ admin: true }, JWT_SECRET, { expiresIn: "24h" });
      res.json({ token });
    } catch (error) {
      console.error("Error during admin login:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  // Get admin settings
  app.get("/api/admin/settings", verifyAdminToken, async (req, res) => {
    try {
      const settings = await storage.getSettings();
      res.json(settings || {});
    } catch (error) {
      console.error("Error fetching admin settings:", error);
      res.status(500).json({ message: "Failed to fetch settings" });
    }
  });

  // Admin Custom Pages CRUD
  app.get("/api/admin/pages", verifyAdminToken, async (req, res) => {
    try {
      const pagesList = await storage.getPages();
      res.json(pagesList);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch pages" });
    }
  });

  app.post("/api/admin/pages", verifyAdminToken, async (req, res) => {
    try {
      const page = await storage.createPage(req.body);
      res.status(201).json(page);
    } catch (error) {
      res.status(500).json({ message: "Failed to create page" });
    }
  });

  app.patch("/api/admin/pages/:id", verifyAdminToken, async (req, res) => {
    try {
      const page = await storage.updatePage(req.params.id, req.body);
      if (!page) return res.status(404).json({ message: "Page not found" });
      res.json(page);
    } catch (error) {
      res.status(500).json({ message: "Failed to update page" });
    }
  });

  app.delete("/api/admin/pages/:id", verifyAdminToken, async (req, res) => {
    try {
      await storage.deletePage(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete page" });
    }
  });

  // Update settings
  app.patch("/api/admin/settings", verifyAdminToken, async (req, res) => {
    try {
      const settings = await storage.updateSettings(req.body);
      res.json(settings);
    } catch (error) {
      console.error("Error updating settings:", error);
      res.status(500).json({
        message: error instanceof Error ? error.message : "Failed to update settings",
      });
    }
  });

  // Upload asset
  app.post("/api/admin/upload-asset", verifyAdminToken, async (req, res) => {
    try {
      const { name, data } = req.body;
      if (!name || !data) {
        return res.status(400).json({ message: "Name and data are required" });
      }

      // data is expected to be a data URL like "data:image/png;base64,..."
      const parts = data.split(";base64,");
      if (parts.length !== 2) {
        return res.status(400).json({ message: "Invalid data format" });
      }
      const header = parts[0];
      const content = parts[1];
      const extMatch = header.match(/\/([a-zA-Z0-9]+)$/);
      const ext = extMatch ? extMatch[1] : "png";
      const buffer = Buffer.from(content, "base64");
      
      const fileName = `${name.replace(/[^a-z0-9]/gi, "_")}_${Date.now()}.${ext}`;
      const uploadDir = path.resolve(process.cwd(), "theme", "public");
      
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const filePath = path.join(uploadDir, fileName);
      
      // Skip writing to disk on Vercel as the filesystem is read-only
      if (process.env.VERCEL || process.env.VERCEL_ENV) {
        console.warn(`[Vercel] Asset upload not supported on serverless: ${fileName}`);
        return res.json({ url: `/${fileName}`, warning: "Upload skipped on serverless environment" });
      }

      fs.writeFileSync(filePath, buffer);

      res.json({ url: `/${fileName}` });
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({ message: "Upload failed" });
    }
  });

  // Theme discovery - scans templates/ folder for available themes
  app.get("/api/admin/themes", verifyAdminToken, async (req, res) => {
    try {
      const templatesDir = path.resolve(process.cwd(), "templates");
      if (!fs.existsSync(templatesDir)) {
        return res.json([]);
      }

      const entries = fs.readdirSync(templatesDir, { withFileTypes: true });
      const themes: any[] = [];

      for (const entry of entries) {
        if (!entry.isDirectory() || entry.name.startsWith("_")) continue;
        const themeJsonPath = path.join(templatesDir, entry.name, "theme.json");
        if (fs.existsSync(themeJsonPath)) {
          try {
            const meta = JSON.parse(fs.readFileSync(themeJsonPath, "utf-8"));
            themes.push({
              name: meta.name || entry.name,
              displayName: meta.displayName || entry.name,
              description: meta.description || "",
              author: meta.author || "Unknown",
              version: meta.version || "1.0.0",
            });
          } catch {
            themes.push({ name: entry.name, displayName: entry.name, description: "", author: "Unknown", version: "1.0.0" });
          }
        }
      }

      res.json(themes);
    } catch (error) {
      console.error("Theme discovery error:", error);
      res.status(500).json({ message: "Failed to discover themes" });
    }
  });

  // Serve theme CSS
  app.get("/api/themes/:name/css", async (req, res) => {
    try {
      const themeName = req.params.name;
      if (!themeName || !/^[a-zA-Z0-9_-]+$/.test(themeName)) {
        return res.status(400).json({ message: "Invalid theme name" });
      }

      const cssPath = path.resolve(process.cwd(), "templates", themeName, "theme.css");
      if (!fs.existsSync(cssPath)) {
        return res.status(404).json({ message: "Theme CSS not found" });
      }

      res.setHeader("Content-Type", "text/css");
      res.send(fs.readFileSync(cssPath, "utf-8"));
    } catch (error) {
      console.error("Theme CSS error:", error);
      res.status(500).json({ message: "Failed to load theme CSS" });
    }
  });

  // Admin social links
  app.get("/api/admin/social-links", verifyAdminToken, async (req, res) => {
    try {
      const links = await storage.getSocialLinks();
      res.json(links);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch social links" });
    }
  });

  app.post("/api/admin/social-links", verifyAdminToken, async (req, res) => {
    try {
      const link = await storage.createSocialLink(req.body);
      res.json(link);
    } catch (error) {
      res.status(500).json({ message: "Failed to create social link" });
    }
  });

  app.patch("/api/admin/social-links/:id", verifyAdminToken, async (req, res) => {
    try {
      const link = await storage.updateSocialLink(req.params.id, req.body);
      res.json(link);
    } catch (error) {
      res.status(500).json({ message: "Failed to update social link" });
    }
  });

  app.delete("/api/admin/social-links/:id", verifyAdminToken, async (req, res) => {
    try {
      await storage.deleteSocialLink(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete social link" });
    }
  });

  // Admin page settings
  app.get("/api/admin/page-settings", verifyAdminToken, async (req, res) => {
    try {
      const pages = await storage.getPageSettings();
      res.json(pages);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch page settings" });
    }
  });

  app.patch("/api/admin/page-settings/:id", verifyAdminToken, async (req, res) => {
    try {
      const page = await storage.updatePageSetting(req.params.id, req.body);
      res.json(page);
    } catch (error) {
      res.status(500).json({ message: "Failed to update page setting" });
    }
  });

  // Admin rules
  app.get("/api/admin/rules", verifyAdminToken, async (req, res) => {
    try {
      const rulesList = await storage.getRules();
      res.json(rulesList);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch rules" });
    }
  });

  app.post("/api/admin/rules", verifyAdminToken, async (req, res) => {
    try {
      const rule = await storage.createRule(req.body);
      res.json(rule);
    } catch (error) {
      res.status(500).json({ message: "Failed to create rule" });
    }
  });

  app.patch("/api/admin/rules/:id", verifyAdminToken, async (req, res) => {
    try {
      const rule = await storage.updateRule(req.params.id, req.body);
      res.json(rule);
    } catch (error) {
      res.status(500).json({ message: "Failed to update rule" });
    }
  });

  app.delete("/api/admin/rules/:id", verifyAdminToken, async (req, res) => {
    try {
      await storage.deleteRule(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete rule" });
    }
  });

  // Admin vote sites
  app.get("/api/admin/vote-sites", verifyAdminToken, async (req, res) => {
    try {
      const sites = await storage.getVoteSites();
      res.json(sites);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch vote sites" });
    }
  });

  app.post("/api/admin/vote-sites", verifyAdminToken, async (req, res) => {
    try {
      const site = await storage.createVoteSite(req.body);
      res.json(site);
    } catch (error) {
      res.status(500).json({ message: "Failed to create vote site" });
    }
  });

  app.patch("/api/admin/vote-sites/:id", verifyAdminToken, async (req, res) => {
    try {
      const site = await storage.updateVoteSite(req.params.id, req.body);
      res.json(site);
    } catch (error) {
      res.status(500).json({ message: "Failed to update vote site" });
    }
  });

  app.delete("/api/admin/vote-sites/:id", verifyAdminToken, async (req, res) => {
    try {
      await storage.deleteVoteSite(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete vote site" });
    }
  });

  // Admin vanity links
  app.get("/api/admin/vanity-links", verifyAdminToken, async (req, res) => {
    try {
      const links = await storage.getVanityLinks();
      res.json(links);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch vanity links" });
    }
  });

  app.post("/api/admin/vanity-links", verifyAdminToken, async (req, res) => {
    try {
      const link = await storage.createVanityLink(req.body);
      res.json(link);
    } catch (error) {
      res.status(500).json({ message: "Failed to create vanity link" });
    }
  });

  app.patch("/api/admin/vanity-links/:id", verifyAdminToken, async (req, res) => {
    try {
      const link = await storage.updateVanityLink(req.params.id, req.body);
      res.json(link);
    } catch (error) {
      res.status(500).json({ message: "Failed to update vanity link" });
    }
  });

  app.delete("/api/admin/vanity-links/:id", verifyAdminToken, async (req, res) => {
    try {
      await storage.deleteVanityLink(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete vanity link" });
    }
  });

  // Admin seasonal themes
  app.get("/api/admin/seasonal-themes", verifyAdminToken, async (req, res) => {
    try {
      const themes = await storage.getSeasonalThemes();
      res.json(themes);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch seasonal themes" });
    }
  });

  app.patch("/api/admin/seasonal-themes/:id", verifyAdminToken, async (req, res) => {
    try {
      const theme = await storage.updateSeasonalTheme(req.params.id, req.body);
      res.json(theme);
    } catch (error) {
      res.status(500).json({ message: "Failed to update seasonal theme" });
    }
  });

  // ==================== COMMUNITY CMS ADMIN ROUTES ====================

  // Admin Users
  app.get("/api/admin/users", verifyAdminToken, async (req, res) => {
    try {
      const users = await storage.getUsers();
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.patch("/api/admin/users/:id", verifyAdminToken, async (req, res) => {
    try {
      const user = await storage.upsertUser({ id: req.params.id, ...req.body });
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Failed to update user" });
    }
  });

  // Admin Roles
  app.get("/api/admin/roles", verifyAdminToken, async (req, res) => {
    try {
      const roles = await storage.getAdminRoles();
      res.json(roles);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch roles" });
    }
  });

  app.post("/api/admin/roles", verifyAdminToken, async (req, res) => {
    try {
      const role = await storage.createAdminRole(req.body);
      res.json(role);
    } catch (error) {
      res.status(500).json({ message: "Failed to create role" });
    }
  });

  app.patch("/api/admin/roles/:id", verifyAdminToken, async (req, res) => {
    try {
      const role = await storage.updateAdminRole(req.params.id, req.body);
      res.json(role);
    } catch (error) {
      res.status(500).json({ message: "Failed to update role" });
    }
  });

  app.delete("/api/admin/roles/:id", verifyAdminToken, async (req, res) => {
    try {
      await storage.deleteAdminRole(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete role" });
    }
  });

  // Admin Staff
  app.get("/api/admin/staff", verifyAdminToken, async (req, res) => {
    try {
      const staff = await storage.getStaffMembers();
      res.json(staff);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch staff members" });
    }
  });

  app.post("/api/admin/staff", verifyAdminToken, async (req, res) => {
    try {
      const member = await storage.createStaffMember(req.body);
      res.json(member);
    } catch (error) {
      res.status(500).json({ message: "Failed to add staff member" });
    }
  });

  app.patch("/api/admin/staff/:id", verifyAdminToken, async (req, res) => {
    try {
      const member = await storage.updateStaffMember(req.params.id, req.body);
      res.json(member);
    } catch (error) {
      res.status(500).json({ message: "Failed to update staff member" });
    }
  });

  app.delete("/api/admin/staff/:id", verifyAdminToken, async (req, res) => {
    try {
      await storage.deleteStaffMember(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete staff member" });
    }
  });

  // FAQ Categories
  app.get("/api/admin/faq-categories", verifyAdminToken, async (req, res) => {
    try {
      const cats = await storage.getFaqCategories();
      res.json(cats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch FAQ categories" });
    }
  });

  app.post("/api/admin/faq-categories", verifyAdminToken, async (req, res) => {
    try {
      const cat = await storage.createFaqCategory(req.body);
      res.json(cat);
    } catch (error) {
      res.status(500).json({ message: "Failed to create FAQ category" });
    }
  });

  app.patch("/api/admin/faq-categories/:id", verifyAdminToken, async (req, res) => {
    try {
      const cat = await storage.updateFaqCategory(req.params.id, req.body);
      res.json(cat);
    } catch (error) {
      res.status(500).json({ message: "Failed to update FAQ category" });
    }
  });

  app.delete("/api/admin/faq-categories/:id", verifyAdminToken, async (req, res) => {
    try {
      await storage.deleteFaqCategory(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete FAQ category" });
    }
  });

  // FAQ Items
  app.get("/api/admin/faq-items", verifyAdminToken, async (req, res) => {
    try {
      const items = await storage.getFaqItems();
      res.json(items);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch FAQ items" });
    }
  });

  app.post("/api/admin/faq-items", verifyAdminToken, async (req, res) => {
    try {
      const item = await storage.createFaqItem(req.body);
      res.json(item);
    } catch (error) {
      res.status(500).json({ message: "Failed to create FAQ item" });
    }
  });

  app.patch("/api/admin/faq-items/:id", verifyAdminToken, async (req, res) => {
    try {
      const item = await storage.updateFaqItem(req.params.id, req.body);
      res.json(item);
    } catch (error) {
      res.status(500).json({ message: "Failed to update FAQ item" });
    }
  });

  app.delete("/api/admin/faq-items/:id", verifyAdminToken, async (req, res) => {
    try {
      await storage.deleteFaqItem(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete FAQ item" });
    }
  });

  // Email Templates
  app.get("/api/admin/email-templates", verifyAdminToken, async (req, res) => {
    try {
      const templates = await storage.getEmailTemplates();
      res.json(templates);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch email templates" });
    }
  });

  app.post("/api/admin/email-templates", verifyAdminToken, async (req, res) => {
    try {
      const template = await storage.createEmailTemplate(req.body);
      res.json(template);
    } catch (error) {
      res.status(500).json({ message: "Failed to create email template" });
    }
  });

  app.patch("/api/admin/email-templates/:id", verifyAdminToken, async (req, res) => {
    try {
      const template = await storage.updateEmailTemplate(req.params.id, req.body);
      res.json(template);
    } catch (error) {
      res.status(500).json({ message: "Failed to update email template" });
    }
  });

  app.delete("/api/admin/email-templates/:id", verifyAdminToken, async (req, res) => {
    try {
      await storage.deleteEmailTemplate(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete email template" });
    }
  });

  // ==================== BLOG ROUTES ====================

  // Public blog routes
  app.get("/api/blogs", async (req, res) => {
    try {
      const blogsList = await storage.getPublishedBlogs();
      res.json(blogsList);
    } catch (error) {
      console.error("Error fetching blogs:", error);
      res.status(500).json({ message: "Failed to fetch blogs" });
    }
  });

  app.get("/api/blogs/featured", async (req, res) => {
    try {
      const blogsList = await storage.getFeaturedBlogs();
      res.json(blogsList);
    } catch (error) {
      console.error("Error fetching featured blogs:", error);
      res.status(500).json({ message: "Failed to fetch featured blogs" });
    }
  });

  app.get("/api/blogs/:slug", async (req, res) => {
    try {
      const blog = await storage.getBlogBySlug(req.params.slug);
      if (!blog) {
        return res.status(404).json({ message: "Blog not found" });
      }
      res.json(blog);
    } catch (error) {
      console.error("Error fetching blog:", error);
      res.status(500).json({ message: "Failed to fetch blog" });
    }
  });

  // Admin blog routes
  app.get("/api/admin/blogs", verifyAdminToken, async (req, res) => {
    try {
      const blogsList = await storage.getBlogs();
      res.json(blogsList);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch blogs" });
    }
  });

  app.post("/api/admin/blogs", verifyAdminToken, async (req, res) => {
    try {
      const blog = await storage.createBlog(req.body);
      res.json(blog);
    } catch (error) {
      res.status(500).json({ message: "Failed to create blog" });
    }
  });

  app.patch("/api/admin/blogs/:id", verifyAdminToken, async (req, res) => {
    try {
      const blog = await storage.updateBlog(req.params.id, req.body);
      res.json(blog);
    } catch (error) {
      res.status(500).json({ message: "Failed to update blog" });
    }
  });

  app.delete("/api/admin/blogs/:id", verifyAdminToken, async (req, res) => {
    try {
      await storage.deleteBlog(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete blog" });
    }
  });

  // ==================== RANK ROUTES ====================

  // Public ranks
  app.get("/api/ranks", async (req, res) => {
    try {
      const ranksList = await storage.getRanks();
      res.json(ranksList.filter(r => r.enabled));
    } catch (error) {
      console.error("Error fetching ranks:", error);
      res.status(500).json({ message: "Failed to fetch ranks" });
    }
  });

  // Admin rank routes
  app.get("/api/admin/ranks", verifyAdminToken, async (req, res) => {
    try {
      const ranksList = await storage.getRanks();
      res.json(ranksList);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch ranks" });
    }
  });

  app.post("/api/admin/ranks", verifyAdminToken, async (req, res) => {
    try {
      const rank = await storage.createRank(req.body);
      res.json(rank);
    } catch (error) {
      res.status(500).json({ message: "Failed to create rank" });
    }
  });

  app.patch("/api/admin/ranks/:id", verifyAdminToken, async (req, res) => {
    try {
      const rank = await storage.updateRank(req.params.id, req.body);
      res.json(rank);
    } catch (error) {
      res.status(500).json({ message: "Failed to update rank" });
    }
  });

  app.delete("/api/admin/ranks/:id", verifyAdminToken, async (req, res) => {
    try {
      await storage.deleteRank(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete rank" });
    }
  });

  // ==================== SAVE CONFIG ROUTE ====================

  app.post("/api/admin/save-config", verifyAdminToken, async (req, res) => {
    try {
      const { tebexPublicToken, tebexPrivateKey, javaServerIp, bedrockServerIp, bedrockPort, discordInviteUrl } = req.body;

      const configUpdates: any = {};
      // Save values even if empty strings - only skip if truly undefined
      if (tebexPublicToken !== undefined) configUpdates.tebex_public_token = tebexPublicToken;
      if (tebexPrivateKey !== undefined) configUpdates.tebex_private_key = tebexPrivateKey;
      if (javaServerIp !== undefined) configUpdates.java_server_ip = javaServerIp;
      if (bedrockServerIp !== undefined) configUpdates.bedrock_server_ip = bedrockServerIp;
      if (bedrockPort !== undefined) configUpdates.bedrock_port = bedrockPort;
      if (discordInviteUrl !== undefined) configUpdates.discord_invite_url = discordInviteUrl;

      console.log("Saving config with updates:", configUpdates);
      const success = saveConfig(configUpdates);
      if (success) {
        res.json({ success: true, message: "Configuration saved to config.yml" });
      } else {
        res.status(500).json({ message: "Failed to save configuration" });
      }
    } catch (error) {
      console.error("Error saving config:", error);
      res.status(500).json({ message: "Failed to save configuration" });
    }
  });

  // ==================== GOAL ROUTE (Admin-managed) ====================

  app.get("/api/store/goal", async (req, res) => {
    try {
      const goals = await tebexClient.getCommunityGoals();
      const activeGoal =
        goals.find((goal) => asString(goal.status)?.toLowerCase() === "active") || goals[0];
      if (activeGoal) {
        const name = asString(activeGoal.name) || "Community Goal";
        const description = stripHtml(asString(activeGoal.description));
        const target = asNumber(activeGoal.target) ?? 0;
        const current = asNumber(activeGoal.current) ?? 0;
        const enabled = asString(activeGoal.status)?.toLowerCase() === "active";
        return res.json({
          enabled,
          name,
          description,
          target,
          current,
        });
      }

      const settings = await storage.getSettings();
      res.json({
        enabled: settings?.goalEnabled || false,
        name: settings?.goalTitle || "Server Goal",
        description: settings?.goalDescription || "Help us reach our goal!",
        target: settings?.goalTarget || 0,
        current: settings?.goalCurrent || 0,
      });
    } catch (error) {
      console.error("Error fetching goal:", error);
      res.json({ current: 0, target: 0, enabled: false });
    }
  });

  // ==================== TEBEX COUPONS/SALES/GIFTCARDS ROUTES ====================

  app.get("/api/store/coupons", async (req, res) => {
    try {
      const coupons = await tebexClient.getCoupons();
      res.json(coupons);
    } catch (error) {
      console.error("Error fetching coupons:", error);
      res.json([]);
    }
  });

  app.get("/api/store/coupons/check", async (req, res) => {
    try {
      const codeParam = typeof req.query.code === "string" ? req.query.code : "";
      const code = normalizeLookupCode(codeParam);
      if (!code) {
        return res.status(400).json({ message: "Coupon code is required" });
      }

      const config = loadConfig();
      if (!config.tebex_private_key) {
        return res.status(400).json({ message: "Tebex private key not configured" });
      }

      const coupons = await tebexClient.getCoupons();
      const match = coupons.find((coupon) => extractCouponCode(coupon as TebexLookupRecord) === code);
      if (!match) {
        return res.status(404).json({ message: "Coupon not found" });
      }

      res.json({ coupon: normalizeCoupon(match as TebexLookupRecord) });
    } catch (error) {
      console.error("Error checking coupon:", error);
      res.status(500).json({ message: "Failed to check coupon" });
    }
  });

  app.get("/api/store/sales", async (req, res) => {
    try {
      const sales = await tebexClient.getSales();
      res.json(sales);
    } catch (error) {
      console.error("Error fetching sales:", error);
      res.json([]);
    }
  });

  app.get("/api/store/giftcards", async (req, res) => {
    try {
      const giftcards = await tebexClient.getGiftCards();
      res.json(giftcards);
    } catch (error) {
      console.error("Error fetching gift cards:", error);
      res.json([]);
    }
  });

  app.get("/api/store/giftcards/check", async (req, res) => {
    try {
      const codeParam = typeof req.query.code === "string" ? req.query.code : "";
      const code = normalizeLookupCode(codeParam);
      if (!code) {
        return res.status(400).json({ message: "Gift card code is required" });
      }

      const config = loadConfig();
      if (!config.tebex_private_key) {
        return res.status(400).json({ message: "Tebex private key not configured" });
      }

      const giftcards = await tebexClient.getGiftCards();
      const match = giftcards.find((card) => extractGiftCardCode(card as TebexLookupRecord) === code);
      if (!match) {
        return res.status(404).json({ message: "Gift card not found" });
      }

      res.json({ giftcard: normalizeGiftCard(match as TebexLookupRecord) });
    } catch (error) {
      console.error("Error checking gift card:", error);
      res.status(500).json({ message: "Failed to check gift card" });
    }
  });

  // Admin routes for coupons/sales/giftcards
  app.get("/api/admin/coupons", verifyAdminToken, async (req, res) => {
    try {
      const coupons = await tebexClient.getCoupons();
      res.json(coupons);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch coupons" });
    }
  });

  app.get("/api/admin/sales", verifyAdminToken, async (req, res) => {
    try {
      const sales = await tebexClient.getSales();
      res.json(sales);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch sales" });
    }
  });

  app.get("/api/admin/giftcards", verifyAdminToken, async (req, res) => {
    try {
      const giftcards = await tebexClient.getGiftCards();
      res.json(giftcards);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch gift cards" });
    }
  });

  // ==================== SERVER STATUS ====================

  // Get Minecraft server status
  app.get("/api/server-status", async (req, res) => {
    try {
      const settings = await storage.getSettings();
      const serverIp = settings?.javaServerIp || "play.example.com";

      // Use mcsrvstat.us API to get server status
      const response = await fetch(`https://api.mcsrvstat.us/3/${serverIp}`);
      const data = await response.json();

      res.json({
        online: data.online === true,
        players: {
          online: data.players?.online || 0,
          max: data.players?.max || 0,
        },
        version: data.version || null,
        motd: data.motd?.clean?.[0] || null,
        icon: data.icon || null,
      });
    } catch (error) {
      console.error("Error fetching server status:", error);
      res.json({
        online: false,
        players: { online: 0, max: 0 },
        version: null,
        motd: null,
        icon: null,
      });
    }
  });

  // ==================== ANNOUNCEMENTS ROUTES ====================

  // ==================== GAMEMODES ====================
  app.get("/api/gamemodes", async (_req, res) => {
    const data = await storage.getGamemodes();
    res.json(data);
  });

  app.get("/api/admin/gamemodes", verifyAdminToken, async (_req, res) => {
    const data = await storage.getGamemodes();
    res.json(data);
  });

  app.post("/api/admin/gamemodes", verifyAdminToken, async (req, res) => {
    try {
      const validated = insertGamemodeSchema.parse(req.body);
      const created = await storage.createGamemode(validated);
      res.json(created);
    } catch (e: any) {
      res.status(400).json({ message: e.message });
    }
  });

  app.patch("/api/admin/gamemodes/:id", verifyAdminToken, async (req, res) => {
    const updated = await storage.updateGamemode(req.params.id, req.body);
    res.json(updated);
  });

  app.delete("/api/admin/gamemodes/:id", verifyAdminToken, async (req, res) => {
    await storage.deleteGamemode(req.params.id);
    res.json({ success: true });
  });

  // ==================== FEATURES ====================
  app.get("/api/features", async (_req, res) => {
    const data = await storage.getFeatures();
    res.json(data);
  });

  app.get("/api/admin/features", verifyAdminToken, async (_req, res) => {
    const data = await storage.getFeatures();
    res.json(data);
  });

  app.post("/api/admin/features", verifyAdminToken, async (req, res) => {
    try {
      const validated = insertFeatureSchema.parse(req.body);
      const created = await storage.createFeature(validated);
      res.json(created);
    } catch (e: any) {
      res.status(400).json({ message: e.message });
    }
  });

  app.patch("/api/admin/features/:id", verifyAdminToken, async (req, res) => {
    const updated = await storage.updateFeature(req.params.id, req.body);
    res.json(updated);
  });

  app.delete("/api/admin/features/:id", verifyAdminToken, async (req, res) => {
    await storage.deleteFeature(req.params.id);
    res.json({ success: true });
  });

  // Public: Get published announcements
  app.get("/api/announcements", async (req, res) => {
    try {
      const announcementsList = await storage.getPublishedAnnouncements();
      res.json(announcementsList);
    } catch (error) {
      console.error("Error fetching announcements:", error);
      res.status(500).json({ message: "Failed to fetch announcements" });
    }
  });

  // Public: Get featured announcements
  app.get("/api/announcements/featured", async (req, res) => {
    try {
      const announcementsList = await storage.getFeaturedAnnouncements();
      res.json(announcementsList);
    } catch (error) {
      console.error("Error fetching featured announcements:", error);
      res.status(500).json({ message: "Failed to fetch featured announcements" });
    }
  });

  // Admin: Get all announcements
  app.get("/api/admin/announcements", verifyAdminToken, async (req, res) => {
    try {
      const announcementsList = await storage.getAnnouncements();
      res.json(announcementsList);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch announcements" });
    }
  });

  // Admin: Create announcement
  app.post("/api/admin/announcements", verifyAdminToken, async (req, res) => {
    try {
      const announcement = await storage.createAnnouncement(req.body);
      res.json(announcement);
    } catch (error) {
      res.status(500).json({ message: "Failed to create announcement" });
    }
  });

  // Admin: Update announcement
  app.patch("/api/admin/announcements/:id", verifyAdminToken, async (req, res) => {
    try {
      const announcement = await storage.updateAnnouncement(req.params.id, req.body);
      res.json(announcement);
    } catch (error) {
      res.status(500).json({ message: "Failed to update announcement" });
    }
  });

  // Admin: Delete announcement
  app.delete("/api/admin/announcements/:id", verifyAdminToken, async (req, res) => {
    try {
      await storage.deleteAnnouncement(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete announcement" });
    }
  });

  // ==================== STAFF ROUTES ====================

  app.get("/api/staff", async (req, res) => {
    try {
      const staff = await storage.getStaffMembers();
      res.json(staff.filter(s => s.active));
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch staff" });
    }
  });

  app.get("/api/admin/staff", verifyAdminToken, async (req, res) => {
    try {
      const staff = await storage.getStaffMembers();
      res.json(staff);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch staff" });
    }
  });

  app.post("/api/admin/staff", verifyAdminToken, async (req, res) => {
    try {
      const staff = await storage.createStaffMember(req.body);
      res.json(staff);
    } catch (error) {
      res.status(500).json({ message: "Failed to create staff member" });
    }
  });

  app.patch("/api/admin/staff/:id", verifyAdminToken, async (req, res) => {
    try {
      const staff = await storage.updateStaffMember(req.params.id, req.body);
      res.json(staff);
    } catch (error) {
      res.status(500).json({ message: "Failed to update staff member" });
    }
  });

  app.delete("/api/admin/staff/:id", verifyAdminToken, async (req, res) => {
    try {
      await storage.deleteStaffMember(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete staff member" });
    }
  });

  // ==================== FAQ ROUTES ====================

  app.get("/api/faq-categories", async (req, res) => {
    try {
      const categories = await storage.getFaqCategories();
      res.json(categories.filter(c => c.active));
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch FAQ categories" });
    }
  });

  app.get("/api/faq-items", async (req, res) => {
    try {
      const items = await storage.getFaqItems();
      res.json(items.filter(i => i.active));
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch FAQ items" });
    }
  });

  app.get("/api/admin/faq-categories", verifyAdminToken, async (req, res) => {
    try {
      const categories = await storage.getFaqCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch FAQ categories" });
    }
  });

  app.post("/api/admin/faq-categories", verifyAdminToken, async (req, res) => {
    try {
      const category = await storage.createFaqCategory(req.body);
      res.json(category);
    } catch (error) {
      res.status(500).json({ message: "Failed to create FAQ category" });
    }
  });

  app.patch("/api/admin/faq-categories/:id", verifyAdminToken, async (req, res) => {
    try {
      const category = await storage.updateFaqCategory(req.params.id, req.body);
      res.json(category);
    } catch (error) {
      res.status(500).json({ message: "Failed to update FAQ category" });
    }
  });

  app.delete("/api/admin/faq-categories/:id", verifyAdminToken, async (req, res) => {
    try {
      await storage.deleteFaqCategory(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete FAQ category" });
    }
  });

  app.get("/api/admin/faq-items", verifyAdminToken, async (req, res) => {
    try {
      const items = await storage.getFaqItems();
      res.json(items);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch FAQ items" });
    }
  });

  app.post("/api/admin/faq-items", verifyAdminToken, async (req, res) => {
    try {
      const item = await storage.createFaqItem(req.body);
      res.json(item);
    } catch (error) {
      res.status(500).json({ message: "Failed to create FAQ item" });
    }
  });

  app.patch("/api/admin/faq-items/:id", verifyAdminToken, async (req, res) => {
    try {
      const item = await storage.updateFaqItem(req.params.id, req.body);
      res.json(item);
    } catch (error) {
      res.status(500).json({ message: "Failed to update FAQ item" });
    }
  });

  app.delete("/api/admin/faq-items/:id", verifyAdminToken, async (req, res) => {
    try {
      await storage.deleteFaqItem(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete FAQ item" });
    }
  });

  // ==================== EMAIL TEMPLATE ROUTES ====================

  app.get("/api/admin/email-templates", verifyAdminToken, async (req, res) => {
    try {
      const templates = await storage.getEmailTemplates();
      res.json(templates);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch email templates" });
    }
  });

  app.patch("/api/admin/email-templates/:id", verifyAdminToken, async (req, res) => {
    try {
      const template = await storage.updateEmailTemplate(req.params.id, req.body);
      res.json(template);
    } catch (error) {
      res.status(500).json({ message: "Failed to update email template" });
    }
  });

  // ==================== ADMIN ROLE ROUTES ====================

  app.get("/api/admin/roles", verifyAdminToken, async (req, res) => {
    try {
      const roles = await storage.getAdminRoles();
      res.json(roles);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch admin roles" });
    }
  });

  app.post("/api/admin/roles", verifyAdminToken, async (req, res) => {
    try {
      const role = await storage.createAdminRole(req.body);
      res.json(role);
    } catch (error) {
      res.status(500).json({ message: "Failed to create admin role" });
    }
  });

  app.patch("/api/admin/roles/:id", verifyAdminToken, async (req, res) => {
    try {
      const role = await storage.updateAdminRole(req.params.id, req.body);
      res.json(role);
    } catch (error) {
      res.status(500).json({ message: "Failed to update admin role" });
    }
  });

  app.delete("/api/admin/roles/:id", verifyAdminToken, async (req, res) => {
    try {
      await storage.deleteAdminRole(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete admin role" });
    }
  });

  // ==================== SMTP TEST ROUTE ====================

  app.post("/api/admin/test-email", verifyAdminToken, async (req, res) => {
    try {
      const { to } = req.body;
      if (!to) return res.status(400).json({ message: "Recipient email is required" });

      const settings = await storage.getSettings();
      if (!settings || !settings.smtpHost) {
        return res.status(400).json({ message: "SMTP is not configured" });
      }

      const nodemailer = await import("nodemailer");
      const transporter = nodemailer.default.createTransport({
        host: settings.smtpHost,
        port: settings.smtpPort || 587,
        secure: settings.smtpSecure ?? (settings.smtpPort === 465),
        auth: {
          user: settings.smtpUser || "",
          pass: settings.smtpPass || "",
        },
      });

      const fromEmail = settings.smtpFrom || settings.smtpUser || "noreply@example.com";
      const fromName = settings.serverName || settings.appName || "SnapTebex";

      await transporter.sendMail({
        from: `"${fromName}" <${fromEmail}>`,
        to,
        subject: "SnapTebex SMTP Test",
        text: "Your SMTP configuration is working correctly! Realm of SnapTebex awaits.",
        html: `
          <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
            <h2 style="color: #orange-500;">SMTP Test Successful!</h2>
            <p>Your SMTP configuration is working correctly. Realm of <strong>SnapTebex</strong> awaits.</p>
            <p style="font-size: 12px; color: #666;">This is a test email sent from your admin dashboard.</p>
          </div>
        `,
      });

      res.json({ success: true, message: "Test email sent successfully" });
    } catch (error: any) {
      console.error("SMTP Test Error:", error);
      res.status(500).json({ message: error.message || "Failed to send test email" });
    }
  });


  // ==================== VANITY REDIRECTS ====================
  // This must be last to not interfere with other routes
  app.get("/:path", async (req, res, next) => {
    try {
      const vanityLink = await storage.getVanityLinkByPath(req.params.path);
      if (vanityLink && vanityLink.enabled) {
        return res.redirect(vanityLink.targetUrl);
      }
      next();
    } catch (error) {
      next();
    }
  });

  return httpServer;
}
