
import { Page, PageSetting, SiteSettings } from "@data/schema";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { FileText, Plus, Edit, Trash2, Eye, EyeOff } from "lucide-react";

interface PagesTabProps {
    pageSettings: PageSetting[];
    updatePageEnabled: (id: string, enabled: boolean) => void;
    formData: Partial<SiteSettings>;
    setFormData: (data: Partial<SiteSettings>) => void;
    customPages: Page[];
    editingPage: Partial<Page> | null;
    setEditingPage: (page: Partial<Page> | null) => void;
    showPageEditor: boolean;
    setShowPageEditor: (show: boolean) => void;
    savePage: () => void;
    deletePage: (id: string) => void;
}

export function PagesTab({
    pageSettings,
    updatePageEnabled,
    formData,
    setFormData,
    customPages,
    editingPage,
    setEditingPage,
    showPageEditor,
    setShowPageEditor,
    savePage,
    deletePage
}: PagesTabProps) {
    return (
        <div className="space-y-10 animate-fade-in max-w-5xl mx-auto pb-20">
            {/* System Pages Section */}
            <section className="space-y-6">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">System Navigation</h2>
                    <p className="text-muted-foreground">Control which core pages are active and visible</p>
                </div>
                <Separator />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {pageSettings?.map((page) => (
                        <Card key={page.id} className="p-4 flex items-center justify-between hover:border-primary/30 transition-all bg-card/40 backdrop-blur-sm">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                                    <FileText className="h-4 w-4" />
                                </div>
                                <span className="font-medium text-sm">{page.pageName}</span>
                            </div>
                            <Switch
                                checked={page.enabled ?? false}
                                onCheckedChange={(checked) => updatePageEnabled(page.id, checked)}
                                data-testid={`switch-page-${page.id}`}
                            />
                        </Card>
                    ))}
                </div>
            </section>

            {/* Custom Dynamic Pages Section */}
            <section className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">Custom Dynamic Pages</h2>
                        <p className="text-muted-foreground">Create unlimited custom content pages and landing destinations</p>
                    </div>
                    <Button
                        onClick={() => {
                            setEditingPage({ title: "", slug: "", content: "", published: true, showInNav: true });
                            setShowPageEditor(true);
                        }}
                        className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 rounded-xl"
                    >
                        <Plus className="h-4 w-4" />
                        Create Page
                    </Button>
                </div>
                <Separator />

                <div className="grid gap-4">
                    {customPages?.map((page) => (
                        <Card key={page.id} className="p-5 flex items-center justify-between hover:border-primary/30 transition-all bg-card/40 backdrop-blur-sm group">
                            <div className="flex items-center gap-4">
                                <div className="p-3 rounded-xl bg-orange-500/10 text-orange-500">
                                    <FileText className="h-6 w-6" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-lg">{page.title}</h4>
                                    <p className="text-sm text-muted-foreground font-mono">/{page.slug}</p>
                                </div>
                                <div className="flex gap-2 ml-4">
                                    {!page.published && (
                                        <div className="px-2 py-1 rounded text-[10px] uppercase font-bold bg-muted text-muted-foreground">Draft</div>
                                    )}
                                    {page.showInNav && (
                                        <div className="px-2 py-1 rounded text-[10px] uppercase font-bold bg-primary/10 text-primary">In Nav</div>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="rounded-lg hover:bg-primary/10 hover:text-primary"
                                    onClick={() => {
                                        setEditingPage(page);
                                        setShowPageEditor(true);
                                    }}
                                >
                                    <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="rounded-lg hover:bg-destructive/10 hover:text-destructive"
                                    onClick={() => deletePage(page.id)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </Card>
                    ))}

                    {(!customPages || customPages.length === 0) && (
                        <div className="text-center py-16 text-muted-foreground border-2 border-dashed border-border/50 rounded-3xl bg-card/20 backdrop-blur-sm">
                            <FileText className="h-16 w-16 mx-auto mb-4 opacity-10" />
                            <h3 className="text-xl font-bold mb-1">No custom pages yet</h3>
                            <p className="text-sm mb-6">Create unique content for your community</p>
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setEditingPage({ title: "", slug: "", content: "", published: true, showInNav: true });
                                    setShowPageEditor(true);
                                }}
                                className="rounded-xl border-primary/20 hover:bg-primary/5 font-bold"
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Get Started
                            </Button>
                        </div>
                    )}
                </div>
            </section>

            {/* Legal Links Section */}
            <section className="space-y-6">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Legal Foundations</h2>
                    <p className="text-muted-foreground">Manage your community's legal framework and compliance documents</p>
                </div>
                <Separator />

                <div className="grid grid-cols-1 gap-8">
                    {/* External Link Configuration */}
                    <Card className="p-6 bg-card/40 backdrop-blur-sm">
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-orange-500" />
                            External Permalinks
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-3">
                                <Label className="font-bold text-sm uppercase tracking-wider text-muted-foreground">Privacy Policy URL</Label>
                                <Input
                                    value={formData.privacyPolicyUrl || ""}
                                    onChange={(e) => setFormData({ ...formData, privacyPolicyUrl: e.target.value })}
                                    placeholder="/privacy-policy"
                                    className="bg-background/50 border-border/40 focus:border-primary/50 rounded-xl"
                                />
                            </div>
                            <div className="space-y-3">
                                <Label className="font-bold text-sm uppercase tracking-wider text-muted-foreground">Terms of Service URL</Label>
                                <Input
                                    value={formData.termsOfServiceUrl || ""}
                                    onChange={(e) => setFormData({ ...formData, termsOfServiceUrl: e.target.value })}
                                    placeholder="/terms"
                                    className="bg-background/50 border-border/40 focus:border-primary/50 rounded-xl"
                                />
                            </div>
                        </div>
                    </Card>

                    {/* Direct Content Editors */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card className="p-6 bg-card/40 backdrop-blur-sm flex flex-col gap-4">
                            <div>
                                <h3 className="text-lg font-bold">Privacy Policy Manifest</h3>
                                <p className="text-xs text-muted-foreground uppercase font-black tracking-widest">Local Content (HTML Supported)</p>
                            </div>
                            <Textarea
                                value={formData.privacyPolicyContent || ""}
                                onChange={(e) => setFormData({ ...formData, privacyPolicyContent: e.target.value })}
                                placeholder="Enter your privacy policy narrative..."
                                className="min-h-[400px] flex-1 bg-background/50 border-border/40 focus:border-primary/50 rounded-2xl p-4 font-mono text-sm resize-none"
                            />
                        </Card>

                        <Card className="p-6 bg-card/40 backdrop-blur-sm flex flex-col gap-4">
                            <div>
                                <h3 className="text-lg font-bold">Terms of Service Manifest</h3>
                                <p className="text-xs text-muted-foreground uppercase font-black tracking-widest">Local Content (HTML Supported)</p>
                            </div>
                            <Textarea
                                value={formData.termsOfServiceContent || ""}
                                onChange={(e) => setFormData({ ...formData, termsOfServiceContent: e.target.value })}
                                placeholder="Enter your terms of service narrative..."
                                className="min-h-[400px] flex-1 bg-background/50 border-border/40 focus:border-primary/50 rounded-2xl p-4 font-mono text-sm resize-none"
                            />
                        </Card>
                    </div>
                </div>
            </section>

            {/* Page Editor Dialog */}
            <Dialog open={showPageEditor} onOpenChange={setShowPageEditor}>
                <DialogContent className="max-w-4xl p-0 overflow-hidden bg-card/95 backdrop-blur-2xl border-white/10 rounded-3xl">
                    <DialogHeader className="p-8 pb-0">
                        <DialogTitle className="text-3xl font-display font-black tracking-tight underline decoration-primary/30 decoration-4 underline-offset-8">
                            {editingPage?.id ? "Edit Manifest" : "New Manifest"}
                        </DialogTitle>
                    </DialogHeader>

                    <div className="p-8 pt-6 space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-3">
                                <Label className="font-bold text-sm uppercase tracking-wider text-muted-foreground">Page Title</Label>
                                <Input
                                    placeholder="The Grand Archive"
                                    value={editingPage?.title || ""}
                                    onChange={(e) => {
                                        const title = e.target.value;
                                        const slug = editingPage?.id ? editingPage.slug : title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
                                        setEditingPage({ ...editingPage!, title, slug });
                                    }}
                                    className="bg-background/50 border-border/40 focus:border-primary/50 rounded-xl h-12 text-lg font-bold"
                                />
                            </div>
                            <div className="space-y-3">
                                <Label className="font-bold text-sm uppercase tracking-wider text-muted-foreground">Slug Prefix</Label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-muted-foreground font-mono">/</div>
                                    <Input
                                        placeholder="grand-archive"
                                        value={editingPage?.slug || ""}
                                        onChange={(e) => setEditingPage({ ...editingPage!, slug: e.target.value })}
                                        className="bg-background/50 border-border/40 focus:border-primary/50 rounded-xl h-12 pl-8 font-mono"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <Label className="font-bold text-sm uppercase tracking-wider text-muted-foreground">Manifest Content (HTML Supported)</Label>
                            <Textarea
                                placeholder="Enter the narrative content for this manifest..."
                                value={editingPage?.content || ""}
                                onChange={(e) => setEditingPage({ ...editingPage!, content: e.target.value })}
                                className="min-h-[300px] bg-background/50 border-border/40 focus:border-primary/50 rounded-3xl p-6 text-base leading-relaxed resize-none"
                            />
                        </div>

                        <div className="flex flex-wrap items-center gap-10 bg-black/20 p-6 rounded-3xl border border-white/5">
                            <div className="flex items-center gap-4">
                                <div className="space-y-1">
                                    <Label className="font-bold cursor-pointer">Published Status</Label>
                                    <p className="text-[10px] text-muted-foreground uppercase font-black">Visibility to the masses</p>
                                </div>
                                <Switch
                                    checked={editingPage?.published ?? true}
                                    onCheckedChange={(checked) => setEditingPage({ ...editingPage!, published: checked })}
                                />
                            </div>
                            <div className="flex items-center gap-4 border-l border-white/10 pl-10">
                                <div className="space-y-1">
                                    <Label className="font-bold cursor-pointer">Navigation Display</Label>
                                    <p className="text-[10px] text-muted-foreground uppercase font-black">Link in primary header</p>
                                </div>
                                <Switch
                                    checked={editingPage?.showInNav ?? false}
                                    onCheckedChange={(checked) => setEditingPage({ ...editingPage!, showInNav: checked })}
                                />
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="p-8 bg-black/40 backdrop-blur-xl border-t border-white/5">
                        <Button
                            variant="ghost"
                            onClick={() => setShowPageEditor(false)}
                            className="rounded-xl font-bold h-12 px-6"
                        >
                            Abort
                        </Button>
                        <Button
                            onClick={savePage}
                            className="btn-glow-primary rounded-xl font-bold h-12 px-10 gap-3"
                        >
                            Authorize Manifest
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
