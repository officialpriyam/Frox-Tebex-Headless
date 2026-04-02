
import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Save, FileText } from "lucide-react";
import { FaDiscord } from "react-icons/fa";
import { useAdminAuth } from "./AdminLogin";
import { toast } from "@/hooks/use-toast";
import { SiteSettings, Rank, VoteSite, SocialLink, PageSetting, Blog, Rule, VanityLink, Page } from "@data/schema";

import { vanityLinks, users } from "@data/schema";
import { AdminSidebar } from "./components/AdminSidebar";
import { AdminHeader } from "./components/AdminHeader";

// Import Tab Components
import { GeneralTab } from "./tabs/GeneralTab";
import { ServerTab } from "./tabs/ServerTab";
import { SocialTab } from "./tabs/SocialTab";
import { StoreTab } from "./tabs/StoreTab";
import { TebexTab } from "./tabs/TebexTab";
import { RankUpgraderTab } from "./tabs/RankUpgraderTab";
import { RanksTab } from "./tabs/RanksTab";
import { BlogTab } from "./tabs/BlogTab";
import { SalesTab } from "./tabs/SalesTab";
import { ThemeTab } from "./tabs/ThemeTab";
import { RulesTab } from "./tabs/RulesTab";
import { VoteTab } from "./tabs/VoteTab";
import { TranslationsTab } from "./tabs/TranslationsTab";
import { VanityTab } from "./tabs/VanityTab";
import { PagesTab } from "./tabs/PagesTab";
import { SeasonalTab } from "./tabs/SeasonalTab";

// CMS Tabs
import { GameModesTab } from "./tabs/GameModesTab";
import { FeaturesTab } from "./tabs/FeaturesTab";
import { UsersTab } from "./tabs/UsersTab";
import { RolesTab } from "./tabs/RolesTab";
import { PunishmentsTab } from "./tabs/PunishmentsTab";
import { StaffTab } from "./tabs/StaffTab";
import { FaqItemsTab } from "./tabs/FaqItemsTab";
import { FaqCategoriesTab } from "./tabs/FaqCategoriesTab";
import { EmailTemplatesTab } from "./tabs/EmailTemplatesTab";
import { SmtpSettingsTab } from "./tabs/SmtpSettingsTab";

export default function AdminDashboard() {
  const { token, logout } = useAdminAuth();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState("general");
  const [formData, setFormData] = useState<Partial<SiteSettings>>({});

  // -- State for Editors --
  const [editingRank, setEditingRank] = useState<Partial<Rank> | null>(null);
  const [showRankEditor, setShowRankEditor] = useState(false);

  const [editingVote, setEditingVote] = useState<Partial<VoteSite> | null>(null);
  const [showVoteEditor, setShowVoteEditor] = useState(false);

  const [editingSocial, setEditingSocial] = useState<Partial<SocialLink> | null>(null);
  const [showSocialEditor, setShowSocialEditor] = useState(false);

  const [editingBlog, setEditingBlog] = useState<Partial<Blog> | null>(null);
  const [showBlogEditor, setShowBlogEditor] = useState(false);

  const [editingRule, setEditingRule] = useState<Partial<Rule> | null>(null);
  const [showRuleEditor, setShowRuleEditor] = useState(false);

  const [editingVanity, setEditingVanity] = useState<Partial<VanityLink> | null>(null);
  const [showVanityEditor, setShowVanityEditor] = useState(false);

  const [editingPage, setEditingPage] = useState<Partial<Page> | null>(null);
  const [showPageEditor, setShowPageEditor] = useState(false);

  // -- Queries --
  const handleUnauthorized = () => {
    logout();
    toast({
      title: "Session expired",
      description: "Please log in again.",
      variant: "destructive",
    });
  };

  const { data: settings, isLoading: settingsLoading } = useQuery<SiteSettings>({
    queryKey: ["/api/admin/settings"],
    enabled: !!token,
    queryFn: async () => {
      const res = await fetch("/api/admin/settings", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401) {
        handleUnauthorized();
        throw new Error("Session expired. Please log in again.");
      }
      if (!res.ok) {
        throw new Error("Failed to fetch admin settings");
      }
      return res.json();
    },
  });

  const { data: ranks } = useQuery<Rank[]>({
    queryKey: ["/api/admin/ranks"],
    enabled: !!token,
  });

  const { data: voteSites } = useQuery<VoteSite[]>({
    queryKey: ["/api/vote-sites"],
    enabled: !!token,
  });

  const { data: socialLinks } = useQuery<SocialLink[]>({
    queryKey: ["/api/social-links"],
    enabled: !!token,
  });

  const { data: pageSettings } = useQuery<PageSetting[]>({
    queryKey: ["/api/page-settings"],
    enabled: !!token,
  });

  const { data: blogs } = useQuery<Blog[]>({
    queryKey: ["/api/blogs"], // Public endpoint is fine, but admin editing needs auth (handled in component)
    enabled: !!token,
  });

  const { data: rules } = useQuery<Rule[]>({
    queryKey: ["/api/rules"],
    enabled: !!token,
  });

  const { data: vanityLinks } = useQuery<VanityLink[]>({
    queryKey: ["/api/vanity-links"],
    enabled: !!token,
  });

  const { data: customPages } = useQuery<Page[]>({
    queryKey: ["/api/admin/pages"],
    enabled: !!token,
  });

  // -- Sync formData with Settings --
  useEffect(() => {
    if (settings) {
      setFormData(settings);
    }
  }, [settings]);

  useEffect(() => {
    if (!token) {
      setLocation("/admin/login");
    }
  }, [token, setLocation]);

  // -- Mutations --
  const updateSettingsMutation = useMutation({
    mutationFn: async (data: Partial<SiteSettings>) => {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      if (res.status === 401) {
        handleUnauthorized();
        throw new Error("Session expired. Please log in again.");
      }
      if (!res.ok) {
        let message = "Failed to update settings";
        try {
          const payload = await res.json();
          if (payload?.message) message = payload.message;
        } catch {
          try {
            const text = await res.text();
            if (text) message = text;
          } catch {
            // ignore
          }
        }
        throw new Error(message);
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/settings"] });
      toast({ title: "Settings updated successfully" });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update settings",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSaveSettings = () => {
    updateSettingsMutation.mutate(formData);
  };

  // -- Helper Functions for Tab Components --

  // Social
  const saveSocial = async () => {
    if (!editingSocial?.platform || !editingSocial?.url || !editingSocial?.icon) {
      toast({ title: "All fields are required", variant: "destructive" });
      return;
    }
    try {
      const url = editingSocial.id ? `/api/admin/social-links/${editingSocial.id}` : "/api/admin/social-links";
      const method = editingSocial.id ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(editingSocial),
      });
      if (!res.ok) throw new Error("Failed to save");
      toast({ title: editingSocial.id ? "Social link updated" : "Social link added" });
      setShowSocialEditor(false);
      setEditingSocial(null);
      queryClient.invalidateQueries({ queryKey: ["/api/social-links"] });
    } catch { toast({ title: "Failed to save social link", variant: "destructive" }); }
  };

  const deleteSocial = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/social-links/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to delete");
      toast({ title: "Social link deleted" });
      queryClient.invalidateQueries({ queryKey: ["/api/social-links"] });
    } catch { toast({ title: "Failed to delete social link", variant: "destructive" }); }
  };

  const updateSocialVisibility = async (id: string, showInNav: boolean) => {
    try {
      const res = await fetch(`/api/admin/social-links/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ showInNav }),
      });
      if (!res.ok) throw new Error("Failed to update");
      queryClient.invalidateQueries({ queryKey: ["/api/social-links"] });
    } catch { toast({ title: "Failed to update visibility", variant: "destructive" }); }
  };

  // Ranks
  const saveRank = async () => {
    if (!editingRank?.name) {
      toast({ title: "Rank name required", variant: "destructive" });
      return;
    }
    try {
      const url = editingRank.id ? `/api/admin/ranks/${editingRank.id}` : "/api/admin/ranks";
      const method = editingRank.id ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(editingRank),
      });
      if (!res.ok) throw new Error("Failed");
      toast({ title: "Rank saved successfully" });
      setShowRankEditor(false);
      setEditingRank(null);
      queryClient.invalidateQueries({ queryKey: ["/api/admin/ranks"] });
    } catch {
      toast({ title: "Failed to save rank", variant: "destructive" });
    }
  };

  // Custom Pages
  const savePage = async () => {
    if (!editingPage?.title || !editingPage?.slug || !editingPage?.content) {
      toast({ title: "Title, slug, and content are required", variant: "destructive" });
      return;
    }
    try {
      const url = editingPage.id ? `/api/admin/pages/${editingPage.id}` : "/api/admin/pages";
      const method = editingPage.id ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(editingPage),
      });
      if (!res.ok) throw new Error("Failed to save");
      toast({ title: editingPage.id ? "Page updated" : "Page created" });
      setShowPageEditor(false);
      setEditingPage(null);
      queryClient.invalidateQueries({ queryKey: ["/api/admin/pages"] });
      queryClient.invalidateQueries({ queryKey: ["/api/pages"] });
    } catch {
      toast({ title: "Failed to save page", variant: "destructive" });
    }
  };

  const deletePage = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/pages/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to delete");
      toast({ title: "Page deleted" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/pages"] });
      queryClient.invalidateQueries({ queryKey: ["/api/pages"] });
    } catch {
      toast({ title: "Failed to delete page", variant: "destructive" });
    }
  };

  const deleteRank = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/ranks/${id}`, {
        method: "DELETE", headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed");
      toast({ title: "Rank deleted" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/ranks"] });
    } catch { toast({ title: "Failed to delete rank", variant: "destructive" }); }
  };

  // Blog
  const saveBlog = async () => {
    if (!editingBlog?.title || !editingBlog?.content) {
      toast({ title: "Title and content required", variant: "destructive" }); return;
    }
    const slug = editingBlog.slug || editingBlog.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    try {
      const url = editingBlog.id ? `/api/admin/blogs/${editingBlog.id}` : "/api/admin/blogs";
      const method = editingBlog.id ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...editingBlog, slug }),
      });
      if (!res.ok) throw new Error("Failed");
      toast({ title: "Blog saved successfully" });
      setShowBlogEditor(false); setEditingBlog(null);
      queryClient.invalidateQueries({ queryKey: ["/api/blogs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/blogs"] });
    } catch { toast({ title: "Failed to save blog", variant: "destructive" }); }
  };

  const deleteBlog = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/blogs/${id}`, {
        method: "DELETE", headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed");
      toast({ title: "Blog deleted" });
      queryClient.invalidateQueries({ queryKey: ["/api/blogs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/blogs"] });
    } catch { toast({ title: "Failed to delete blog", variant: "destructive" }); }
  };

  // Rules
  const saveRule = async () => {
    if (!editingRule?.title || !editingRule?.content) {
      toast({ title: "Title and content required", variant: "destructive" }); return;
    }
    try {
      const url = editingRule.id ? `/api/admin/rules/${editingRule.id}` : "/api/admin/rules";
      const method = editingRule.id ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(editingRule),
      });
      if (!res.ok) throw new Error("Failed");
      toast({ title: "Rule saved" });
      setShowRuleEditor(false); setEditingRule(null);
      queryClient.invalidateQueries({ queryKey: ["/api/rules"] });
    } catch { toast({ title: "Failed to save rule", variant: "destructive" }); }
  };

  const deleteRule = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/rules/${id}`, {
        method: "DELETE", headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed");
      toast({ title: "Rule deleted" });
      queryClient.invalidateQueries({ queryKey: ["/api/rules"] });
    } catch { toast({ title: "Failed to delete rule", variant: "destructive" }); }
  };

  // Vote Sites
  const saveVoteSite = async () => {
    if (!editingVote?.name || !editingVote?.url) {
      toast({ title: "Name and URL required", variant: "destructive" }); return;
    }
    try {
      const url = editingVote.id ? `/api/admin/vote-sites/${editingVote.id}` : "/api/admin/vote-sites";
      const method = editingVote.id ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(editingVote),
      });
      if (!res.ok) throw new Error("Failed");
      toast({ title: "Vote site saved" });
      setShowVoteEditor(false); setEditingVote(null);
      queryClient.invalidateQueries({ queryKey: ["/api/vote-sites"] });
    } catch { toast({ title: "Failed to save vote site", variant: "destructive" }); }
  };

  const deleteVoteSite = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/vote-sites/${id}`, {
        method: "DELETE", headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed");
      toast({ title: "Vote site deleted" });
      queryClient.invalidateQueries({ queryKey: ["/api/vote-sites"] });
    } catch { toast({ title: "Failed to delete vote site", variant: "destructive" }); }
  };

  // Vanity Links
  const saveVanityLink = async () => {
    if (!editingVanity?.path || !editingVanity?.targetUrl) {
      toast({ title: "Path and Target URL required", variant: "destructive" }); return;
    }
    try {
      const url = editingVanity.id ? `/api/admin/vanity-links/${editingVanity.id}` : "/api/admin/vanity-links";
      const method = editingVanity.id ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(editingVanity),
      });
      if (!res.ok) throw new Error("Failed");
      toast({ title: "Vanity link saved" });
      setShowVanityEditor(false); setEditingVanity(null);
      queryClient.invalidateQueries({ queryKey: ["/api/vanity-links"] });
    } catch { toast({ title: "Failed to save vanity link", variant: "destructive" }); }
  };

  const deleteVanityLink = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/vanity-links/${id}`, {
        method: "DELETE", headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed");
      toast({ title: "Vanity link deleted" });
      queryClient.invalidateQueries({ queryKey: ["/api/vanity-links"] });
    } catch { toast({ title: "Failed to delete vanity link", variant: "destructive" }); }
  };

  const updateVanityEnabled = async (id: string, enabled: boolean) => {
    try {
      const res = await fetch(`/api/admin/vanity-links/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ enabled }),
      });
      if (!res.ok) throw new Error("Failed");
      queryClient.invalidateQueries({ queryKey: ["/api/vanity-links"] });
    } catch { toast({ title: "Failed to update", variant: "destructive" }); }
  };

  // Pages
  const updatePageEnabled = async (id: string, enabled: boolean) => {
    try {
      const res = await fetch(`/api/admin/page-settings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ enabled }),
      });
      if (!res.ok) throw new Error("Failed to update page setting");
      queryClient.invalidateQueries({ queryKey: ["/api/page-settings"] });
    } catch { toast({ title: "Failed to update page", variant: "destructive" }); }
  };


  const renderContent = () => {
    switch (activeTab) {
      case "general": {
        return <GeneralTab formData={formData} setFormData={setFormData} onSave={handleSaveSettings} isSaving={updateSettingsMutation.isPending} />;
      }
      case "server": {
        return <ServerTab formData={formData} setFormData={setFormData} onSave={handleSaveSettings} isSaving={updateSettingsMutation.isPending} />;
      }
      case "store": {
        return <StoreTab formData={formData} setFormData={setFormData} onSave={handleSaveSettings} isSaving={updateSettingsMutation.isPending} />;
      }
      case "vote": {
        return <VoteTab
          voteSites={voteSites || []}
          editingVote={editingVote}
          setEditingVote={setEditingVote}
          showVoteEditor={showVoteEditor}
          setShowVoteEditor={setShowVoteEditor}
          saveVoteSite={saveVoteSite}
          deleteVoteSite={deleteVoteSite}
        />;
      }
      case "social": {
        return <SocialTab
          socialLinks={socialLinks || []}
          editingSocial={editingSocial}
          setEditingSocial={setEditingSocial}
          showSocialEditor={showSocialEditor}
          setShowSocialEditor={setShowSocialEditor}
          saveSocial={saveSocial}
          deleteSocial={deleteSocial}
          updateSocialVisibility={updateSocialVisibility}
        />;
      }
      case "gamemodes":
        return <GameModesTab />;
      case "features":
        return <FeaturesTab />;
      case "blog": {
        return <BlogTab
          blogs={blogs || []}
          editingBlog={editingBlog}
          setEditingBlog={setEditingBlog}
          showBlogEditor={showBlogEditor}
          setShowBlogEditor={setShowBlogEditor}
          saveBlog={saveBlog}
          deleteBlog={deleteBlog}
        />;
      }
      case "coupons": {
        return <SalesTab formData={formData} setFormData={setFormData} onSave={handleSaveSettings} isSaving={updateSettingsMutation.isPending} />;
      }
      case "users":
        return <UsersTab />;
      case "roles":
        return <RolesTab />;
      case "punishments":
        return <PunishmentsTab />;
      case "staff":
        return <StaffTab />;
      case "faq-items":
        return <FaqItemsTab />;
      case "faq-categories":
        return <FaqCategoriesTab />;
      case "email-templates":
        return <EmailTemplatesTab />;
      case "theme-settings":
        return <ThemeTab formData={formData} setFormData={setFormData} onSave={handleSaveSettings} isSaving={updateSettingsMutation.isPending} />;
      case "smtp-settings":
        return <SmtpSettingsTab formData={formData} setFormData={setFormData} onSave={handleSaveSettings} isSaving={updateSettingsMutation.isPending} />;
      case "tebex":
        return <TebexTab formData={formData} setFormData={setFormData} onSave={handleSaveSettings} isSaving={updateSettingsMutation.isPending} />;
      case "rank-upgrader":
        return <RankUpgraderTab formData={formData} setFormData={setFormData} onSave={handleSaveSettings} isSaving={updateSettingsMutation.isPending} />;
      case "seasonal":
        return <SeasonalTab formData={formData} setFormData={setFormData} onSave={handleSaveSettings} isSaving={updateSettingsMutation.isPending} />;
      default: {
        return null;
      }
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} onLogout={logout} />

      <div className="flex-1 flex flex-col min-h-screen relative overflow-hidden pl-64">
        <AdminHeader />

        <main className="flex-1 p-8 overflow-y-auto relative z-10">
          {/* Background Effects */}
          <div className="fixed inset-0 pointer-events-none z-0">
            <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-orange-500/5 rounded-full blur-3xl opacity-50" />
            <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-amber-500/5 rounded-full blur-3xl opacity-50" />
          </div>

          <div className="relative z-10">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                  {activeTab.charAt(0).toUpperCase() + activeTab.slice(1).replace("-", " ")}
                </h1>
              </div>

              <Button
                onClick={handleSaveSettings}
                disabled={updateSettingsMutation.isPending}
                className="gap-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-lg shadow-orange-500/30"
              >
                {updateSettingsMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>

            <div className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-2xl p-6 min-h-[600px] shadow-sm">
              {settingsLoading ? (
                <div className="flex items-center justify-center h-96">
                  <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                    <p className="text-muted-foreground">Loading settings...</p>
                  </div>
                </div>
              ) : (
                renderContent()
              )}
            </div>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="p-6 flex items-center justify-between hover:shadow-xl transition-all bg-card/60 backdrop-blur-md border-border/40 group">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-[#5865F2]/10 text-[#5865F2] group-hover:bg-[#5865F2] group-hover:text-white transition-all duration-300 group-hover:scale-110 group-hover:rotate-6 shadow-sm">
                    <FaDiscord className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="font-display font-bold text-lg">Need Support?</h4>
                    <p className="text-sm text-muted-foreground/80 font-medium">Join our global community</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="rounded-xl font-bold border-primary/20 hover:bg-primary/5" asChild>
                  <a href="https://discord.gg/5b99XppGDV" target="_blank" rel="noopener noreferrer">Join</a>
                </Button>
              </Card>
              <Card className="p-6 flex items-center justify-between hover:shadow-xl transition-all bg-card/60 backdrop-blur-md border-border/40 group">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300 group-hover:scale-110 group-hover:-rotate-6 shadow-sm">
                    <FileText className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="font-display font-bold text-lg">Documentation</h4>
                    <p className="text-sm text-muted-foreground/80 font-medium">Master the platform</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="rounded-xl font-bold border-primary/20 hover:bg-primary/5" asChild>
                  <a href="https://docs.priyxstudio.in" target="_blank" rel="noopener noreferrer">View Docs</a>
                </Button>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
