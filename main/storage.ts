import {
  users,
  siteSettings,
  socialLinks,
  pageSettings,
  rules,
  voteSites,
  vanityLinks,
  seasonalThemes,
  blogs,
  ranks,
  announcements,
  pages,
  emailTemplates,
  adminRoles,
  staffMembers,
  faqCategories,
  faqItems,
  gamemodes,
  features,
  type User,
  type UpsertUser,
  type SiteSettings,
  type InsertSiteSettings,
  type SocialLink,
  type InsertSocialLink,
  type PageSetting,
  type InsertPageSetting,
  type Rule,
  type InsertRule,
  type VoteSite,
  type InsertVoteSite,
  type VanityLink,
  type InsertVanityLink,
  type SeasonalTheme,
  type InsertSeasonalTheme,
  type Blog,
  type InsertBlog,
  type Rank,
  type InsertRank,
  type Page,
  type InsertPage,
  type EmailTemplate,
  type InsertEmailTemplate,
  type AdminRole,
  type InsertAdminRole,
  type StaffMember,
  type InsertStaffMember,
  type FaqCategory,
  type InsertFaqCategory,
  type FaqItem,
  type InsertFaqItem,
  type Gamemode,
  type InsertGamemode,
  type Feature,
  type InsertFeature
} from "@data/schema";
import { db } from "./db";
import { eq, desc, sql } from "drizzle-orm";
import { saveConfig } from "./config";
import { upsertEnvValue } from "./env";

// Announcement types
export type Announcement = typeof announcements.$inferSelect;
export type InsertAnnouncement = typeof announcements.$inferInsert;

export interface IStorage {
  // Installation
  isInstalled(): Promise<boolean>;
  getSettingsRaw(): Promise<SiteSettings | undefined>;

  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByMinecraftUsername(username: string): Promise<User | undefined>;
  getUsers(): Promise<User[]>;
  upsertUser(user: UpsertUser): Promise<User>;

  // Site Settings
  getSettings(): Promise<SiteSettings | undefined>;
  updateSettings(data: Partial<InsertSiteSettings>): Promise<SiteSettings>;

  // Social Links
  getSocialLinks(): Promise<SocialLink[]>;
  createSocialLink(link: InsertSocialLink): Promise<SocialLink>;
  updateSocialLink(id: string, data: Partial<InsertSocialLink>): Promise<SocialLink | undefined>;
  deleteSocialLink(id: string): Promise<void>;

  // Page Settings
  getPageSettings(): Promise<PageSetting[]>;
  updatePageSetting(id: string, data: Partial<InsertPageSetting>): Promise<PageSetting | undefined>;

  // Rules
  getRules(): Promise<Rule[]>;
  createRule(rule: InsertRule): Promise<Rule>;
  updateRule(id: string, data: Partial<InsertRule>): Promise<Rule | undefined>;
  deleteRule(id: string): Promise<void>;

  // Vote Sites
  getVoteSites(): Promise<VoteSite[]>;
  createVoteSite(site: InsertVoteSite): Promise<VoteSite>;
  updateVoteSite(id: string, data: Partial<InsertVoteSite>): Promise<VoteSite | undefined>;
  deleteVoteSite(id: string): Promise<void>;

  // Vanity Links
  getVanityLinks(): Promise<VanityLink[]>;
  getVanityLinkByPath(path: string): Promise<VanityLink | undefined>;
  createVanityLink(link: InsertVanityLink): Promise<VanityLink>;
  updateVanityLink(id: string, data: Partial<InsertVanityLink>): Promise<VanityLink | undefined>;
  deleteVanityLink(id: string): Promise<void>;

  // Seasonal Themes
  getSeasonalThemes(): Promise<SeasonalTheme[]>;
  updateSeasonalTheme(id: string, data: Partial<InsertSeasonalTheme>): Promise<SeasonalTheme | undefined>;

  // Blogs
  getBlogs(): Promise<Blog[]>;
  getPublishedBlogs(): Promise<Blog[]>;
  getFeaturedBlogs(): Promise<Blog[]>;
  getBlogBySlug(slug: string): Promise<Blog | undefined>;
  createBlog(blog: InsertBlog): Promise<Blog>;
  updateBlog(id: string, data: Partial<InsertBlog>): Promise<Blog | undefined>;
  deleteBlog(id: string): Promise<void>;

  // Ranks
  getRanks(): Promise<Rank[]>;
  createRank(rank: InsertRank): Promise<Rank>;
  updateRank(id: string, data: Partial<InsertRank>): Promise<Rank | undefined>;
  deleteRank(id: string): Promise<void>;

  // Announcements
  getAnnouncements(): Promise<Announcement[]>;
  getPublishedAnnouncements(): Promise<Announcement[]>;
  getFeaturedAnnouncements(): Promise<Announcement[]>;
  createAnnouncement(announcement: InsertAnnouncement): Promise<Announcement>;
  updateAnnouncement(id: string, data: Partial<InsertAnnouncement>): Promise<Announcement | undefined>;
  deleteAnnouncement(id: string): Promise<void>;

  // Custom Pages
  getPages(): Promise<Page[]>;
  getPublishedPages(): Promise<Page[]>;
  getPageBySlug(slug: string): Promise<Page | undefined>;
  createPage(page: InsertPage): Promise<Page>;
  updatePage(id: string, data: Partial<InsertPage>): Promise<Page | undefined>;
  deletePage(id: string): Promise<void>;

  // Admin Roles
  getAdminRoles(): Promise<AdminRole[]>;
  createAdminRole(data: InsertAdminRole): Promise<AdminRole>;
  updateAdminRole(id: string, data: Partial<InsertAdminRole>): Promise<AdminRole | undefined>;
  deleteAdminRole(id: string): Promise<void>;

  // Staff Members
  getStaffMembers(): Promise<StaffMember[]>;
  createStaffMember(data: InsertStaffMember): Promise<StaffMember>;
  updateStaffMember(id: string, data: Partial<InsertStaffMember>): Promise<StaffMember | undefined>;
  deleteStaffMember(id: string): Promise<void>;

  // FAQ Categories
  getFaqCategories(): Promise<FaqCategory[]>;
  createFaqCategory(data: InsertFaqCategory): Promise<FaqCategory>;
  updateFaqCategory(id: string, data: Partial<InsertFaqCategory>): Promise<FaqCategory | undefined>;
  deleteFaqCategory(id: string): Promise<void>;

  // FAQ Items
  getFaqItems(): Promise<FaqItem[]>;
  createFaqItem(data: InsertFaqItem): Promise<FaqItem>;
  updateFaqItem(id: string, data: Partial<InsertFaqItem>): Promise<FaqItem | undefined>;
  deleteFaqItem(id: string): Promise<void>;

  // Email Templates
  getEmailTemplates(): Promise<EmailTemplate[]>;
  getEmailTemplateByType(type: string): Promise<EmailTemplate | undefined>;
  updateEmailTemplate(id: string, data: Partial<InsertEmailTemplate>): Promise<EmailTemplate | undefined>;
  createEmailTemplate(data: InsertEmailTemplate): Promise<EmailTemplate>;
  deleteEmailTemplate(id: string): Promise<void>;

  // Gamemodes
  getGamemodes(): Promise<Gamemode[]>;
  createGamemode(data: InsertGamemode): Promise<Gamemode>;
  updateGamemode(id: string, data: Partial<InsertGamemode>): Promise<Gamemode | undefined>;
  deleteGamemode(id: string): Promise<void>;

  // Features
  getFeatures(): Promise<Feature[]>;
  createFeature(data: InsertFeature): Promise<Feature>;
  updateFeature(id: string, data: Partial<InsertFeature>): Promise<Feature | undefined>;
  deleteFeature(id: string): Promise<void>;

  // Initialize default data
  initializeDefaults(): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // Installation
  async isInstalled(): Promise<boolean> {
    try {
      const settings = await this.getSettingsRaw();
      return settings?.isInstalled === true;
    } catch {
      return false;
    }
  }

  async getSettingsRaw(): Promise<SiteSettings | undefined> {
    const [settings] = await db.select().from(siteSettings).where(eq(siteSettings.id, 1));
    return settings;
  }

  // Users
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByMinecraftUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.minecraftUsername, username));
    return user;
  }

  async getUsers(): Promise<User[]> {
    return db.select().from(users);
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Site Settings
  async getSettings(): Promise<SiteSettings | undefined> {
    const [settings] = await db.select().from(siteSettings).where(eq(siteSettings.id, 1));
    return settings;
  }

  async updateSettings(data: Partial<InsertSiteSettings>): Promise<SiteSettings> {
    const existing = await this.getSettings();

    // Sync to config.yml for relevant fields
    const configToSync: any = {};
    if (data.appName !== undefined) configToSync.site_name = data.appName;
    if (data.tebexPublicToken !== undefined) configToSync.tebex_public_token = data.tebexPublicToken;
    if (data.tebexPrivateKey !== undefined) configToSync.tebex_private_key = data.tebexPrivateKey;
    if (data.javaServerIp !== undefined) configToSync.java_server_ip = data.javaServerIp;
    if (data.bedrockServerIp !== undefined) configToSync.bedrock_server_ip = data.bedrockServerIp;
    if (data.bedrockPort !== undefined) configToSync.bedrock_port = data.bedrockPort;
    if (data.discordInviteUrl !== undefined) configToSync.discord_invite_url = data.discordInviteUrl;
    if (data.activeTheme !== undefined) configToSync.active_theme = data.activeTheme;
    if (data.decoAsset1 !== undefined) configToSync.deco_asset_1 = data.decoAsset1;
    if (data.decoAsset2 !== undefined) configToSync.deco_asset_2 = data.decoAsset2;
    if (data.decoAsset3 !== undefined) configToSync.deco_asset_3 = data.decoAsset3;
    if (data.showNavbarBox !== undefined) configToSync.show_navbar_box = data.showNavbarBox;

    if (Object.keys(configToSync).length > 0) {
      saveConfig(configToSync);
    }

    if (data.tebexPluginApiKey !== undefined) {
      try {
        upsertEnvValue("TEBEX_PLUGIN_API_KEY", data.tebexPluginApiKey || "");
      } catch (error) {
        console.error("Failed to update .env for Tebex plugin key:", error);
      }
    }

    if (!existing) {
      const [settings] = await db.insert(siteSettings).values({ id: 1, ...data } as any).returning();
      return settings;
    }
    try {
      const [settings] = await db
        .update(siteSettings)
        .set({ ...data, updatedAt: new Date() } as any)
        .where(eq(siteSettings.id, 1))
        .returning();
      return settings;
    } catch (error) {
      if (error instanceof Error && /tebex_plugin_api_key/i.test(error.message)) {
        const { tebexPluginApiKey, ...rest } = data as any;
        const [settings] = await db
          .update(siteSettings)
          .set({ ...rest, updatedAt: new Date() } as any)
          .where(eq(siteSettings.id, 1))
          .returning();
        return settings;
      }
      throw error;
    }
  }

  // Social Links
  async getSocialLinks(): Promise<SocialLink[]> {
    return db.select().from(socialLinks).orderBy(socialLinks.sortOrder);
  }

  async createSocialLink(link: InsertSocialLink): Promise<SocialLink> {
    const [created] = await db.insert(socialLinks).values(link).returning();
    return created;
  }

  async updateSocialLink(id: string, data: Partial<InsertSocialLink>): Promise<SocialLink | undefined> {
    const [updated] = await db.update(socialLinks).set(data).where(eq(socialLinks.id, id)).returning();
    return updated;
  }

  async deleteSocialLink(id: string): Promise<void> {
    await db.delete(socialLinks).where(eq(socialLinks.id, id));
  }

  // Page Settings
  async getPageSettings(): Promise<PageSetting[]> {
    return db.select().from(pageSettings).orderBy(pageSettings.sortOrder);
  }

  async updatePageSetting(id: string, data: Partial<InsertPageSetting>): Promise<PageSetting | undefined> {
    const [updated] = await db.update(pageSettings).set(data).where(eq(pageSettings.id, id)).returning();
    return updated;
  }

  // Rules
  async getRules(): Promise<Rule[]> {
    return db.select().from(rules).orderBy(rules.sortOrder);
  }

  async createRule(rule: InsertRule): Promise<Rule> {
    const [created] = await db.insert(rules).values(rule).returning();
    return created;
  }

  async updateRule(id: string, data: Partial<InsertRule>): Promise<Rule | undefined> {
    const [updated] = await db.update(rules).set({ ...data, updatedAt: new Date() }).where(eq(rules.id, id)).returning();
    return updated;
  }

  async deleteRule(id: string): Promise<void> {
    await db.delete(rules).where(eq(rules.id, id));
  }

  // Vote Sites
  async getVoteSites(): Promise<VoteSite[]> {
    return db.select().from(voteSites).orderBy(voteSites.sortOrder);
  }

  async createVoteSite(site: InsertVoteSite): Promise<VoteSite> {
    const [created] = await db.insert(voteSites).values(site).returning();
    return created;
  }

  async updateVoteSite(id: string, data: Partial<InsertVoteSite>): Promise<VoteSite | undefined> {
    const [updated] = await db.update(voteSites).set(data).where(eq(voteSites.id, id)).returning();
    return updated;
  }

  async deleteVoteSite(id: string): Promise<void> {
    await db.delete(voteSites).where(eq(voteSites.id, id));
  }

  // Vanity Links
  async getVanityLinks(): Promise<VanityLink[]> {
    return db.select().from(vanityLinks);
  }

  async getVanityLinkByPath(path: string): Promise<VanityLink | undefined> {
    const [link] = await db.select().from(vanityLinks).where(eq(vanityLinks.path, path));
    return link;
  }

  async createVanityLink(link: InsertVanityLink): Promise<VanityLink> {
    const [created] = await db.insert(vanityLinks).values(link).returning();
    return created;
  }

  async updateVanityLink(id: string, data: Partial<InsertVanityLink>): Promise<VanityLink | undefined> {
    const [updated] = await db.update(vanityLinks).set(data).where(eq(vanityLinks.id, id)).returning();
    return updated;
  }

  async deleteVanityLink(id: string): Promise<void> {
    await db.delete(vanityLinks).where(eq(vanityLinks.id, id));
  }

  // Seasonal Themes
  async getSeasonalThemes(): Promise<SeasonalTheme[]> {
    return db.select().from(seasonalThemes);
  }

  async updateSeasonalTheme(id: string, data: Partial<InsertSeasonalTheme>): Promise<SeasonalTheme | undefined> {
    const { settings, ...rest } = data;
    const updateData = { ...rest, ...(settings ? { settings: settings as any } : {}) };
    const [updated] = await db.update(seasonalThemes).set(updateData).where(eq(seasonalThemes.id, id)).returning();
    return updated;
  }

  // Blogs
  async getBlogs(): Promise<Blog[]> {
    return db.select().from(blogs).orderBy(desc(blogs.createdAt));
  }

  async getPublishedBlogs(): Promise<Blog[]> {
    return db.select().from(blogs).where(eq(blogs.published, true)).orderBy(desc(blogs.createdAt));
  }

  async getFeaturedBlogs(): Promise<Blog[]> {
    return db.select().from(blogs).where(eq(blogs.featured, true)).orderBy(desc(blogs.createdAt));
  }

  async getBlogBySlug(slug: string): Promise<Blog | undefined> {
    const [blog] = await db.select().from(blogs).where(eq(blogs.slug, slug));
    return blog;
  }

  async createBlog(blog: InsertBlog): Promise<Blog> {
    const [created] = await db.insert(blogs).values(blog).returning();
    return created;
  }

  async updateBlog(id: string, data: Partial<InsertBlog>): Promise<Blog | undefined> {
    const [updated] = await db.update(blogs).set({ ...data, updatedAt: new Date() }).where(eq(blogs.id, id)).returning();
    return updated;
  }

  async deleteBlog(id: string): Promise<void> {
    await db.delete(blogs).where(eq(blogs.id, id));
  }

  // Ranks
  async getRanks(): Promise<Rank[]> {
    return db.select().from(ranks).orderBy(ranks.sortOrder);
  }

  async createRank(rank: InsertRank): Promise<Rank> {
    const { permissions, ...rest } = rank;
    const [created] = await db.insert(ranks).values({ ...rest, permissions: (permissions as string[]) ?? [] }).returning();
    return created;
  }

  async updateRank(id: string, data: Partial<InsertRank>): Promise<Rank | undefined> {
    const { permissions, ...rest } = data;
    const updateData = { ...rest, ...(permissions ? { permissions: permissions as string[] } : {}) };
    const [updated] = await db.update(ranks).set(updateData).where(eq(ranks.id, id)).returning();
    return updated;
  }

  async deleteRank(id: string): Promise<void> {
    await db.delete(ranks).where(eq(ranks.id, id));
  }

  // Announcements
  async getAnnouncements(): Promise<Announcement[]> {
    return db.select().from(announcements).orderBy(desc(announcements.createdAt));
  }

  async getPublishedAnnouncements(): Promise<Announcement[]> {
    return db.select().from(announcements).where(eq(announcements.published, true)).orderBy(desc(announcements.createdAt));
  }

  async getFeaturedAnnouncements(): Promise<Announcement[]> {
    return db.select().from(announcements).where(eq(announcements.featured, true)).orderBy(desc(announcements.createdAt));
  }

  async createAnnouncement(announcement: InsertAnnouncement): Promise<Announcement> {
    const [created] = await db.insert(announcements).values(announcement).returning();
    return created;
  }

  async updateAnnouncement(id: string, data: Partial<InsertAnnouncement>): Promise<Announcement | undefined> {
    const [updated] = await db.update(announcements).set({ ...data, updatedAt: new Date() }).where(eq(announcements.id, id)).returning();
    return updated;
  }

  async deleteAnnouncement(id: string): Promise<void> {
    await db.delete(announcements).where(eq(announcements.id, id));
  }

  // Custom Pages
  async getPages(): Promise<Page[]> {
    return db.select().from(pages).orderBy(pages.sortOrder);
  }

  async getPublishedPages(): Promise<Page[]> {
    return db.select().from(pages).where(eq(pages.published, true)).orderBy(pages.sortOrder);
  }

  async getPageBySlug(slug: string): Promise<Page | undefined> {
    const [page] = await db.select().from(pages).where(eq(pages.slug, slug));
    return page;
  }

  async createPage(pageData: InsertPage): Promise<Page> {
    const [created] = await db.insert(pages).values(pageData).returning();
    return created;
  }

  async updatePage(id: string, data: Partial<InsertPage>): Promise<Page | undefined> {
    const [updated] = await db.update(pages).set({ ...data, updatedAt: new Date() }).where(eq(pages.id, id)).returning();
    return updated;
  }

  async deletePage(id: string): Promise<void> {
    await db.delete(pages).where(eq(pages.id, id));
  }

  // Admin Roles
  async getAdminRoles(): Promise<AdminRole[]> {
    return db.select().from(adminRoles).orderBy(adminRoles.sortOrder);
  }

  async createAdminRole(roleData: InsertAdminRole): Promise<AdminRole> {
    const [created] = await db.insert(adminRoles).values(roleData as any).returning();
    return created;
  }

  async updateAdminRole(id: string, data: Partial<InsertAdminRole>): Promise<AdminRole | undefined> {
    const [updated] = await db.update(adminRoles).set({ ...data, updatedAt: new Date() } as any).where(eq(adminRoles.id, id)).returning();
    return updated;
  }

  async deleteAdminRole(id: string): Promise<void> {
    await db.delete(adminRoles).where(eq(adminRoles.id, id));
  }

  // Staff Members
  async getStaffMembers(): Promise<StaffMember[]> {
    return db.select().from(staffMembers).orderBy(staffMembers.sortOrder);
  }

  async createStaffMember(staffData: InsertStaffMember): Promise<StaffMember> {
    const [created] = await db.insert(staffMembers).values(staffData).returning();
    return created;
  }

  async updateStaffMember(id: string, data: Partial<InsertStaffMember>): Promise<StaffMember | undefined> {
    const [updated] = await db.update(staffMembers).set({ ...data, updatedAt: new Date() }).where(eq(staffMembers.id, id)).returning();
    return updated;
  }

  async deleteStaffMember(id: string): Promise<void> {
    await db.delete(staffMembers).where(eq(staffMembers.id, id));
  }

  // FAQ Categories
  async getFaqCategories(): Promise<FaqCategory[]> {
    return db.select().from(faqCategories).orderBy(faqCategories.sortOrder);
  }

  async createFaqCategory(catData: InsertFaqCategory): Promise<FaqCategory> {
    const [created] = await db.insert(faqCategories).values(catData).returning();
    return created;
  }

  async updateFaqCategory(id: string, data: Partial<InsertFaqCategory>): Promise<FaqCategory | undefined> {
    const [updated] = await db.update(faqCategories).set({ ...data, updatedAt: new Date() }).where(eq(faqCategories.id, id)).returning();
    return updated;
  }

  async deleteFaqCategory(id: string): Promise<void> {
    await db.delete(faqCategories).where(eq(faqCategories.id, id));
  }

  // FAQ Items
  async getFaqItems(): Promise<FaqItem[]> {
    return db.select().from(faqItems).orderBy(faqItems.sortOrder);
  }

  async createFaqItem(itemData: InsertFaqItem): Promise<FaqItem> {
    const [created] = await db.insert(faqItems).values(itemData).returning();
    return created;
  }

  async updateFaqItem(id: string, data: Partial<InsertFaqItem>): Promise<FaqItem | undefined> {
    const [updated] = await db.update(faqItems).set({ ...data, updatedAt: new Date() }).where(eq(faqItems.id, id)).returning();
    return updated;
  }

  async deleteFaqItem(id: string): Promise<void> {
    await db.delete(faqItems).where(eq(faqItems.id, id));
  }

  // Email Templates
  async getEmailTemplates(): Promise<EmailTemplate[]> {
    return db.select().from(emailTemplates).orderBy(emailTemplates.createdAt);
  }

  async getEmailTemplateByType(type: string): Promise<EmailTemplate | undefined> {
    const [template] = await db.select().from(emailTemplates).where(eq(emailTemplates.type, type));
    return template;
  }

  async updateEmailTemplate(id: string, data: Partial<InsertEmailTemplate>): Promise<EmailTemplate | undefined> {
    const [updated] = await db.update(emailTemplates).set({ ...data, updatedAt: new Date() }).where(eq(emailTemplates.id, id)).returning();
    return updated;
  }

  async createEmailTemplate(data: InsertEmailTemplate): Promise<EmailTemplate> {
    const [created] = await db.insert(emailTemplates).values(data).returning();
    return created;
  }

  async deleteEmailTemplate(id: string): Promise<void> {
    await db.delete(emailTemplates).where(eq(emailTemplates.id, id));
  }

  // Gamemodes
  async getGamemodes(): Promise<Gamemode[]> {
    return db.select().from(gamemodes).orderBy(gamemodes.sortOrder);
  }

  async createGamemode(data: InsertGamemode): Promise<Gamemode> {
    const [created] = await db.insert(gamemodes).values(data).returning();
    return created;
  }

  async updateGamemode(id: string, data: Partial<InsertGamemode>): Promise<Gamemode | undefined> {
    const [updated] = await db.update(gamemodes).set({ ...data, updatedAt: new Date() }).where(eq(gamemodes.id, id)).returning();
    return updated;
  }

  async deleteGamemode(id: string): Promise<void> {
    await db.delete(gamemodes).where(eq(gamemodes.id, id));
  }

  // Features
  async getFeatures(): Promise<Feature[]> {
    return db.select().from(features).orderBy(features.sortOrder);
  }

  async createFeature(data: InsertFeature): Promise<Feature> {
    const [created] = await db.insert(features).values(data).returning();
    return created;
  }

  async updateFeature(id: string, data: Partial<InsertFeature>): Promise<Feature | undefined> {
    const [updated] = await db.update(features).set({ ...data, updatedAt: new Date() }).where(eq(features.id, id)).returning();
    return updated;
  }

  async deleteFeature(id: string): Promise<void> {
    await db.delete(features).where(eq(features.id, id));
  }

  // Initialize default data
  async initializeDefaults(): Promise<void> {
    // Initialize site settings
    const existingSettings = await this.getSettings();
    if (!existingSettings) {
      await db.insert(siteSettings).values({ 
        id: 1,
        activeTheme: "default",
        decoAsset1: "/vines.png",
        decoAsset2: "/vines.png"
      });
    }

    // Initialize default roles
    const existingRolesCount = (await db.select({ count: sql<number>`count(*)` }).from(adminRoles))[0].count;
    if (existingRolesCount === 0) {
      const allPerms = { view: true, manage: true };
      const noPerms = { view: false, manage: false };
      const defaultRolesData = [
        { id: "owner", displayName: "Owner", color: "#ef4444", sortOrder: 0, hasAdminAccess: true, showOnStaffPage: true, permissions: {
          dashboard: allPerms, orders: allPerms, store: allPerms, gamemodes: allPerms, features: allPerms, staff: allPerms, 
          announcements: allPerms, faq: allPerms, vote_sites: allPerms, coupons: allPerms, emails: allPerms, 
          console: { view: true, command: true }, settings: allPerms, users: allPerms, roles: allPerms, punishments: allPerms
        }},
        { id: "admin", displayName: "Admin", color: "#f59e0b", sortOrder: 1, hasAdminAccess: true, showOnStaffPage: true, permissions: {
          dashboard: allPerms, orders: allPerms, store: allPerms, gamemodes: allPerms, features: allPerms, staff: allPerms, 
          announcements: allPerms, faq: allPerms, vote_sites: allPerms, coupons: allPerms, emails: allPerms, 
          console: { view: true, command: true }, settings: allPerms, users: allPerms, roles: allPerms, punishments: allPerms
        }},
        { id: "moderator", displayName: "Moderator", color: "#22c55e", sortOrder: 2, hasAdminAccess: true, showOnStaffPage: true, permissions: {
          dashboard: { view: true, manage: false },
          orders: noPerms,
          store: noPerms,
          gamemodes: noPerms,
          features: noPerms,
          staff: { view: true, manage: false },
          announcements: { view: true, manage: true },
          faq: { view: true, manage: true },
          vote_sites: noPerms,
          coupons: noPerms,
          emails: noPerms,
          console: { view: false, command: false },
          settings: noPerms,
          users: { view: true, manage: false },
          roles: noPerms,
          punishments: { view: true, manage: true }
        }},
        { id: "vip", displayName: "VIP", color: "#a855f7", sortOrder: 3, hasAdminAccess: false, showOnStaffPage: false, permissions: {
          dashboard: noPerms, orders: noPerms, store: noPerms, gamemodes: noPerms, features: noPerms, staff: noPerms, 
          announcements: noPerms, faq: noPerms, vote_sites: noPerms, coupons: noPerms, emails: noPerms, 
          console: { view: false, command: false }, settings: noPerms, users: noPerms, roles: noPerms, punishments: noPerms
        }},
        { id: "user", displayName: "User", color: "#3b82f6", sortOrder: 4, hasAdminAccess: false, showOnStaffPage: false, permissions: {
          dashboard: noPerms, orders: noPerms, store: noPerms, gamemodes: noPerms, features: noPerms, staff: noPerms, 
          announcements: noPerms, faq: noPerms, vote_sites: noPerms, coupons: noPerms, emails: noPerms, 
          console: { view: false, command: false }, settings: noPerms, users: noPerms, roles: noPerms, punishments: noPerms
        }},
      ];
      for (const role of (defaultRolesData as any[])) {
        await db.insert(adminRoles).values(role);
      }
    }

    // Initialize page settings
    const existingPages = await this.getPageSettings();
    if (existingPages.length === 0) {
      const defaultPages = ["Home", "Store", "Vote", "Rules"];
      for (let i = 0; i < defaultPages.length; i++) {
        await db.insert(pageSettings).values({
          pageName: defaultPages[i],
          enabled: true,
          sortOrder: i,
        });
      }
    }

    // Initialize seasonal themes
    const existingThemes = await this.getSeasonalThemes();
    if (existingThemes.length === 0) {
      const themes = [
        { id: "christmas", name: "Christmas", enabled: false, settings: { snowEnabled: true, snowIntensity: 50, decorationsEnabled: true } },
        { id: "winter", name: "Winter", enabled: false, settings: { snowEnabled: true, snowIntensity: 30 } },
        { id: "halloween", name: "Halloween", enabled: false, settings: {} },
        { id: "autumn", name: "Autumn", enabled: false, settings: {} },
        { id: "summer", name: "Summer", enabled: false, settings: {} },
        { id: "diwali", name: "Diwali", enabled: false, settings: {} },
      ];
      for (const theme of themes) {
        await db.insert(seasonalThemes).values(theme);
      }
    }

    // Initialize some default social links
    const existingSocial = await this.getSocialLinks();
    if (existingSocial.length === 0) {
      const defaultSocial = [
        { platform: "Discord", url: "https://discord.gg/", icon: "discord", showInNav: true, sortOrder: 0 },
        { platform: "Twitter", url: "https://twitter.com/", icon: "twitter", showInNav: true, sortOrder: 1 },
        { platform: "YouTube", url: "https://youtube.com/", icon: "youtube", showInNav: true, sortOrder: 2 },
      ];
      for (const social of defaultSocial) {
        await db.insert(socialLinks).values(social);
      }
    }

    // Initialize default email templates
    const existingTemplates = await this.getEmailTemplates();
    if (existingTemplates.length === 0) {
      const defaultTemplates = [
        {
          type: "purchase",
          subject: "Thank you for your purchase on {{site_name}}!",
          bodyHtml: `
            <div style="background-color: #1a1a1a; color: #e2e8f0; padding: 40px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
              <div style="max-width: 600px; margin: 0 auto; background-color: #2d2d2d; border: 1px solid #d4af37; border-radius: 8px; overflow: hidden;">
                <div style="background-color: #d4af37; padding: 20px; text-align: center;">
                  <h1 style="color: #1a1a1a; margin: 0; text-transform: uppercase; letter-spacing: 2px;">Order Confirmed</h1>
                </div>
                <div style="padding: 30px;">
                  <p style="font-size: 18px;">Hail, <strong>{{username}}</strong>!</p>
                  <p>Your tribute has been received by the kingdom. We are preparing your treasures for delivery as we speak.</p>
                  <div style="background-color: #1a1a1a; padding: 20px; border-radius: 4px; border-left: 4px solid #d4af37; margin: 20px 0;">
                    <p style="margin: 0; color: #d4af37; font-weight: bold;">Order ID: #{{order_id}}</p>
                  </div>
                  <p>You will receive another raven once your items have been dispatched to your coordinates.</p>
                  <p style="margin-top: 30px;">Safe travels,<br>The {{site_name}} Team</p>
                </div>
              </div>
            </div>
          `,
          active: true,
        },
        {
          type: "delivery",
          subject: "Your items have been delivered - {{site_name}}",
          bodyHtml: `
            <div style="background-color: #1a1a1a; color: #e2e8f0; padding: 40px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
              <div style="max-width: 600px; margin: 0 auto; background-color: #2d2d2d; border: 1px solid #4ade80; border-radius: 8px; overflow: hidden;">
                <div style="background-color: #4ade80; padding: 20px; text-align: center;">
                  <h1 style="color: #1a1a1a; margin: 0; text-transform: uppercase; letter-spacing: 2px;">Items Delivered</h1>
                </div>
                <div style="padding: 30px;">
                  <p style="font-size: 18px;">Greetings, <strong>{{username}}</strong>!</p>
                  <p>The royal couriers have successfully delivered your items to the realm.</p>
                  <p>Log in now to claim your spoils. If you encounter any issues, please contact our scribes via Discord.</p>
                  <p style="margin-top: 30px;">Enjoy your new power,<br>The {{site_name}} Team</p>
                </div>
              </div>
            </div>
          `,
          active: true,
        }
      ];
      for (const template of defaultTemplates) {
        await db.insert(emailTemplates).values(template);
      }
    }

    // Initialize default gamemodes
    const existingGamemodesCount = (await db.select({ count: sql<number>`count(*)` }).from(gamemodes))[0].count;
    if (existingGamemodesCount === 0) {
      const defaultGamemodes = [
        { name: "LifeSteal SMP", icon: "Heart", status: "ONLINE", sortOrder: 0 },
        { name: "BedWars", icon: "Swords", status: "ONLINE", sortOrder: 1 },
        { name: "KitPvP", icon: "Swords", status: "ONLINE", sortOrder: 2 },
        { name: "Skyblock", icon: "Palmtree", status: "SOON", sortOrder: 3 },
      ];
      for (const gm of defaultGamemodes) {
        await db.insert(gamemodes).values(gm);
      }
    }
  }
}

export const storage = new DatabaseStorage();
