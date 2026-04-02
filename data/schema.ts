import { sql } from "drizzle-orm";
import { pgTable, text, varchar, boolean, integer, jsonb, timestamp, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// Users table for Minecraft/Discord authentication
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  minecraftUsername: varchar("minecraft_username").notNull().unique(),
  discordUsername: varchar("discord_username"),
  email: varchar("email"),
  passwordHash: varchar("password_hash"),
  roleId: varchar("role_id").default("user"),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Site settings table
export const siteSettings = pgTable("site_settings", {
  id: integer("id").primaryKey().default(1),
  // Installation
  isInstalled: boolean("is_installed").default(false),
  adminPasswordHash: varchar("admin_password_hash"),
  tebexPublicToken: varchar("tebex_public_token"),
  tebexPrivateKey: varchar("tebex_private_key"),
  tebexPluginApiKey: varchar("tebex_plugin_api_key"),
  discordInviteUrl: varchar("discord_invite_url"),
  // General
  appName: varchar("app_name").default("FunBlocks"),
  borderRadius: varchar("border_radius").default("0.5"),
  logoUrl: varchar("logo_url").default("/logo.png"),
  heroImageUrl: varchar("hero_image_url").default(""),
  siteBackgroundImageUrl: varchar("site_background_image_url").default(""),
  maintenanceMode: boolean("maintenance_mode").default(false),
  homeAboutEnabled: boolean("home_about_enabled").default(false),
  homeAboutTitle: varchar("home_about_title").default(""),
  homeAboutContent: text("home_about_content").default(""),
  // Server
  serverName: varchar("server_name").default("FunBlocks"),
  javaServerIp: varchar("java_server_ip").default("play.example.com"),
  bedrockServerIp: varchar("bedrock_server_ip").default("bedrock.example.com"),
  bedrockPort: integer("bedrock_port").default(19132),
  bedrockSupport: boolean("bedrock_support").default(true),
  // Store
  packageListingColumns: integer("package_listing_columns").default(4),
  shorterCards: boolean("shorter_cards").default(false),
  categoryColors: jsonb("category_colors").$type<Record<string, string>>().default({}),
  categoryLogos: jsonb("category_logos").$type<Record<string, string>>().default({}),
  featuredPackageIds: jsonb("featured_package_ids").$type<string[]>().default([]),
  packageVariations: jsonb("package_variations").$type<string[]>().default([]),
  quantitySelectionIds: jsonb("quantity_selection_ids").$type<string[]>().default([]),
  packageClickAnimation: boolean("package_click_animation").default(true),
  // Rank Upgrader
  rankUpgraderEnabled: boolean("rank_upgrader_enabled").default(false),
  rankOrder: jsonb("rank_order").$type<string[]>().default([]),
  // Legal
  privacyPolicyUrl: varchar("privacy_policy_url").default("/privacy-policy"),
  termsOfServiceUrl: varchar("terms_of_service_url").default("/terms-of-service"),
  privacyPolicyContent: text("privacy_policy_content").default(""),
  termsOfServiceContent: text("terms_of_service_content").default(""),
  // Currency
  currencySymbol: varchar("currency_symbol").default("$"),
  // Goal Tracker
  goalEnabled: boolean("goal_enabled").default(false),
  goalTitle: varchar("goal_title").default("Server Goal"),
  goalDescription: varchar("goal_description").default("Help us reach our goal!"),
  goalTarget: integer("goal_target").default(1000),
  goalCurrent: integer("goal_current").default(0),
  // Seasonal Theme
  activeSeasonalTheme: varchar("active_seasonal_theme").default("none"),
  // Sales Banner
  showSaleBanner: boolean("show_sale_banner").default(false),
  showSaleBannerIllustration: boolean("show_sale_banner_illustration").default(false),
  saleBannerText: varchar("sale_banner_text").default(""),
  // Patrons
  patronsEnabled: boolean("patrons_enabled").default(false),
  patreonUrl: varchar("patreon_url").default(""),
  // Theme Colors
  primaryColor: varchar("primary_color").default("#3b82f6"),
  accentColor: varchar("accent_color").default("#3b82f6"),
  secondaryColor: varchar("secondary_color").default("#e2e8f0"),
  mutedColor: varchar("muted_color").default("#f1f5f9"),
  // Themes & Assets
  activeTheme: varchar("active_theme").default("default"),
  decoAsset1: varchar("deco_asset_1").default("/vines.png"),
  decoAsset2: varchar("deco_asset_2").default("/vines.png"),
  decoAsset3: varchar("deco_asset_3").default(""),
  showNavbarBox: boolean("show_navbar_box").default(true),
  // Email & SMTP
  smtpHost: varchar("smtp_host").default(""),
  smtpPort: integer("smtp_port").default(587),
  smtpUser: varchar("smtp_user").default(""),
  smtpPass: varchar("smtp_pass").default(""),
  smtpFrom: varchar("smtp_from").default(""),
  smtpSecure: boolean("smtp_secure").default(true),
  emailProvider: varchar("email_provider").default("custom"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Announcements table
export const announcements = pgTable("announcements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title").notNull(),
  content: text("content").notNull(),
  excerpt: varchar("excerpt"),
  imageUrl: varchar("image_url"),
  published: boolean("published").default(false),
  featured: boolean("featured").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Social links table
export const socialLinks = pgTable("social_links", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  platform: varchar("platform").notNull(),
  url: varchar("url").notNull(),
  icon: varchar("icon").notNull(),
  showInNav: boolean("show_in_nav").default(true),
  sortOrder: integer("sort_order").default(0),
});

// Page visibility settings
export const pageSettings = pgTable("page_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  pageName: varchar("page_name").notNull().unique(),
  enabled: boolean("enabled").default(true),
  sortOrder: integer("sort_order").default(0),
});

// Rules table
export const rules = pgTable("rules", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title").notNull(),
  content: text("content").notNull(),
  category: varchar("category").default("General"),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Voting sites table
export const voteSites = pgTable("vote_sites", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  url: varchar("url").notNull(),
  imageUrl: varchar("image_url"),
  rewardDescription: varchar("reward_description"),
  cooldownHours: integer("cooldown_hours").default(24),
  sortOrder: integer("sort_order").default(0),
  enabled: boolean("enabled").default(true),
});

// Vanity links table
export const vanityLinks = pgTable("vanity_links", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  path: varchar("path").notNull().unique(),
  targetUrl: varchar("target_url").notNull(),
  enabled: boolean("enabled").default(true),
});

// Custom Dynamic Pages
export const pages = pgTable("pages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title").notNull(),
  slug: varchar("slug").notNull().unique(),
  content: text("content").notNull(),
  published: boolean("published").default(true),
  showInNav: boolean("show_in_nav").default(false),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Seasonal themes configuration
export const seasonalThemes = pgTable("seasonal_themes", {
  id: varchar("id").primaryKey(),
  name: varchar("name").notNull(),
  enabled: boolean("enabled").default(false),
  settings: jsonb("settings").$type<{
    snowEnabled?: boolean;
    snowIntensity?: number;
    decorationsEnabled?: boolean;
    customAccentColor?: string;
  }>().default({}),
});

// Blog posts table
export const blogs = pgTable("blogs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title").notNull(),
  slug: varchar("slug").notNull().unique(),
  content: text("content").notNull(),
  excerpt: varchar("excerpt"),
  imageUrl: varchar("image_url"),
  published: boolean("published").default(false),
  featured: boolean("featured").default(false),
  author: varchar("author").default("Admin"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Ranks table
export const ranks = pgTable("ranks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  packageId: varchar("package_id"),
  price: varchar("price").default("0"),
  color: varchar("color").default("#ffffff"),
  permissions: jsonb("permissions").$type<string[]>().default([]),
  sortOrder: integer("sort_order").default(0),
  enabled: boolean("enabled").default(true),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true, updatedAt: true });
export const insertSiteSettingsSchema = createInsertSchema(siteSettings).omit({ id: true, updatedAt: true });
export const insertSocialLinkSchema = createInsertSchema(socialLinks).omit({ id: true });
export const insertPageSettingSchema = createInsertSchema(pageSettings).omit({ id: true });
export const insertRuleSchema = createInsertSchema(rules).omit({ id: true, createdAt: true, updatedAt: true });
export const insertVoteSiteSchema = createInsertSchema(voteSites).omit({ id: true });
export const insertVanityLinkSchema = createInsertSchema(vanityLinks).omit({ id: true });
export const insertSeasonalThemeSchema = createInsertSchema(seasonalThemes);
export const insertBlogSchema = createInsertSchema(blogs).omit({ id: true, createdAt: true, updatedAt: true });
export const insertRankSchema = createInsertSchema(ranks).omit({ id: true });
export const insertAnnouncementSchema = createInsertSchema(announcements).omit({ id: true, createdAt: true, updatedAt: true });
export const insertPageSchema = createInsertSchema(pages).omit({ id: true, createdAt: true, updatedAt: true });

// Email Templates
export const emailTemplates = pgTable("email_templates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  type: varchar("type").notNull().unique(), // e.g. "delivery", "purchase", "status", "vote"
  subject: varchar("subject").notNull(),
  bodyHtml: text("body_html").notNull(),
  active: boolean("active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Admin Roles
export const adminRoles = pgTable("admin_roles", {
  id: varchar("id").primaryKey(), // e.g. "helper", "admin", "owner"
  displayName: varchar("display_name").notNull(),
  color: varchar("color").default("#ffffff"),
  sortOrder: integer("sort_order").default(0),
  hasAdminAccess: boolean("has_admin_access").default(false),
  showOnStaffPage: boolean("show_on_staff_page").default(false),
  permissions: jsonb("permissions").$type<Record<string, { view: boolean; manage?: boolean; command?: boolean }>>().default({}),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Staff Members
export const staffMembers = pgTable("staff_members", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  minecraftUsername: varchar("minecraft_username").notNull(),
  role: varchar("role").notNull(), // text representation matching screenshot
  roleColor: varchar("role_color").default("#ffffff"),
  active: boolean("active").default(true),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// FAQ Categories
export const faqCategories = pgTable("faq_categories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  slug: varchar("slug").notNull().unique(),
  icon: varchar("icon").default("LayoutGrid"),
  active: boolean("active").default(true),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// FAQ Items
export const faqItems = pgTable("faq_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  categoryId: varchar("category_id").notNull(),
  question: varchar("question").notNull(),
  answer: text("answer").notNull(),
  active: boolean("active").default(true),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Gamemodes
export const gamemodes = pgTable("gamemodes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  icon: varchar("icon").default("Gamepad2"),
  status: varchar("status").default("ONLINE"), // ONLINE, SOON, OFFLINE
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Features
export const features = pgTable("features", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  description: text("description").notNull(),
  icon: varchar("icon").default("Sparkles"),
  active: boolean("active").default(true),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertEmailTemplateSchema = createInsertSchema(emailTemplates).omit({ id: true, createdAt: true, updatedAt: true });
export const insertAdminRoleSchema = createInsertSchema(adminRoles).omit({ createdAt: true, updatedAt: true });
export const insertStaffMemberSchema = createInsertSchema(staffMembers).omit({ id: true, createdAt: true, updatedAt: true });
export const insertFaqCategorySchema = createInsertSchema(faqCategories).omit({ id: true, createdAt: true, updatedAt: true });
export const insertFaqItemSchema = createInsertSchema(faqItems).omit({ id: true, createdAt: true, updatedAt: true });
export const insertGamemodeSchema = createInsertSchema(gamemodes).omit({ id: true, createdAt: true, updatedAt: true });
export const insertFeatureSchema = createInsertSchema(features).omit({ id: true, createdAt: true, updatedAt: true });

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type UpsertUser = typeof users.$inferInsert;

export type SiteSettings = typeof siteSettings.$inferSelect;
export type InsertSiteSettings = z.infer<typeof insertSiteSettingsSchema>;

export type SocialLink = typeof socialLinks.$inferSelect;
export type InsertSocialLink = z.infer<typeof insertSocialLinkSchema>;

export type PageSetting = typeof pageSettings.$inferSelect;
export type InsertPageSetting = z.infer<typeof insertPageSettingSchema>;

export type Rule = typeof rules.$inferSelect;
export type InsertRule = z.infer<typeof insertRuleSchema>;

export type VoteSite = typeof voteSites.$inferSelect;
export type InsertVoteSite = z.infer<typeof insertVoteSiteSchema>;

export type VanityLink = typeof vanityLinks.$inferSelect;
export type InsertVanityLink = z.infer<typeof insertVanityLinkSchema>;

export type SeasonalTheme = typeof seasonalThemes.$inferSelect;
export type InsertSeasonalTheme = z.infer<typeof insertSeasonalThemeSchema>;

export type Blog = typeof blogs.$inferSelect;
export type InsertBlog = z.infer<typeof insertBlogSchema>;

export type Rank = typeof ranks.$inferSelect;
export type InsertRank = z.infer<typeof insertRankSchema>;

export type Announcement = typeof announcements.$inferSelect;
export type InsertAnnouncement = z.infer<typeof insertAnnouncementSchema>;

export type Page = typeof pages.$inferSelect;
export type InsertPage = z.infer<typeof insertPageSchema>;

export type EmailTemplate = typeof emailTemplates.$inferSelect;
export type InsertEmailTemplate = z.infer<typeof insertEmailTemplateSchema>;

export type AdminRole = typeof adminRoles.$inferSelect;
export type InsertAdminRole = z.infer<typeof insertAdminRoleSchema>;

export type StaffMember = typeof staffMembers.$inferSelect;
export type InsertStaffMember = z.infer<typeof insertStaffMemberSchema>;

export type FaqCategory = typeof faqCategories.$inferSelect;
export type InsertFaqCategory = z.infer<typeof insertFaqCategorySchema>;

export type FaqItem = typeof faqItems.$inferSelect;
export type InsertFaqItem = z.infer<typeof insertFaqItemSchema>;

export type Gamemode = typeof gamemodes.$inferSelect;
export type InsertGamemode = z.infer<typeof insertGamemodeSchema>;

export type Feature = typeof features.$inferSelect;
export type InsertFeature = z.infer<typeof insertFeatureSchema>;

// Tebex API types
export interface TebexCategory {
  id: number;
  name: string;
  description: string;
  packages?: TebexPackage[];
  order: number;
}

export interface TebexPackage {
  id: number;
  name: string;
  description: string;
  price: number;
  base_price?: number;
  total_price?: number;
  discount?: number;
  sale?: {
    active: boolean;
    discount: number;
  };
  image?: string;
  category?: {
    id: number;
    name: string;
  };
  type: string;
}

export interface TebexBasket {
  ident: string;
  complete: boolean;
  email?: string;
  username?: string;
  base_price: number;
  sales_tax: number;
  total_price: number;
  currency: string;
  packages: Array<{
    id: number;
    name: string;
    quantity: number;
    price: number;
  }>;
  links: {
    checkout: string;
    payment: string;
  };
}
