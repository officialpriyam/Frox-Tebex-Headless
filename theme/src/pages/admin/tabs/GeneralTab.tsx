
import { SiteSettings } from "@data/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Save, Loader2 } from "lucide-react";

interface GeneralTabProps {
    formData: Partial<SiteSettings>;
    setFormData: (data: Partial<SiteSettings>) => void;
    onSave?: () => void;
    isSaving?: boolean;
}

export function GeneralTab({ formData, setFormData, onSave, isSaving }: GeneralTabProps) {
    return (
        <div className="space-y-6 animate-fade-in max-w-5xl mx-auto">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">General Settings</h2>
                    <p className="text-muted-foreground">Manage core application configuration</p>
                </div>
            </div>
            <Separator />

            <div className="space-y-6">
                <Card className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <Label className="text-base font-medium">Maintenance Mode</Label>
                            <p className="text-sm text-muted-foreground">Disable site access for visitors</p>
                        </div>
                        <Switch
                            checked={formData.maintenanceMode || false}
                            onCheckedChange={(checked) => setFormData({ ...formData, maintenanceMode: checked })}
                            data-testid="switch-maintenance"
                        />
                    </div>

                    <div className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label className="text-sm font-semibold text-foreground/70">App Display Name</Label>
                                    <Input
                                        value={formData.appName || ""}
                                        onChange={(e) => setFormData({ ...formData, appName: e.target.value })}
                                        placeholder="FunBlocks"
                                        className="bg-background/50"
                                        data-testid="input-app-name"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-sm font-semibold text-foreground/70">Currency Symbol</Label>
                                    <Input
                                        value={formData.currencySymbol || "$"}
                                        onChange={(e) => setFormData({ ...formData, currencySymbol: e.target.value })}
                                        className="w-24 bg-background/50"
                                        data-testid="input-currency"
                                    />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label className="text-sm font-semibold text-foreground/70">Navbar Logo</Label>
                                    <div className="flex gap-4 items-start">
                                        <div className="flex-1">
                                            <Input
                                                value={formData.logoUrl || ""}
                                                onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                                                placeholder="/logo.png"
                                                className="bg-background/50 mb-2"
                                                data-testid="input-logo-url"
                                            />
                                            <p className="text-[10px] text-muted-foreground">URL to your server logo (PNG/SVG recommended)</p>
                                        </div>
                                        <div className="w-16 h-16 rounded-xl border border-border bg-muted/30 flex items-center justify-center overflow-hidden shrink-0 group relative">
                                            {formData.logoUrl ? (
                                                <img src={formData.logoUrl} alt="Logo Preview" className="max-w-full max-h-full object-contain" />
                                            ) : (
                                                <div className="text-[10px] text-muted-foreground/50 text-center font-bold uppercase tracking-tighter">No Logo</div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <Separator className="opacity-50" />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <Label className="text-sm font-semibold text-foreground/70">Hero Background</Label>
                                <div className="space-y-3">
                                    <Input
                                        value={formData.heroImageUrl || ""}
                                        onChange={(e) => setFormData({ ...formData, heroImageUrl: e.target.value })}
                                        placeholder="https://example.com/hero.jpg"
                                        className="bg-background/50"
                                        data-testid="input-hero-image"
                                    />
                                    <div className="aspect-video w-full rounded-2xl border border-border bg-muted/30 flex items-center justify-center overflow-hidden group relative">
                                        {formData.heroImageUrl ? (
                                            <>
                                                <img src={formData.heroImageUrl} alt="Hero Preview" className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-500" />
                                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <span className="text-white text-[10px] font-black uppercase tracking-widest">Hero Preview</span>
                                                </div>
                                            </>
                                        ) : (
                                            <div className="text-xs text-muted-foreground/50 font-bold uppercase tracking-widest italic">Background Preview</div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <Label className="text-sm font-semibold text-foreground/70">Site-wide Background</Label>
                                <div className="space-y-3">
                                    <Input
                                        value={formData.siteBackgroundImageUrl || ""}
                                        onChange={(e) => setFormData({ ...formData, siteBackgroundImageUrl: e.target.value })}
                                        placeholder="https://example.com/background.jpg"
                                        className="bg-background/50"
                                        data-testid="input-site-background"
                                    />
                                    <div className="aspect-video w-full rounded-2xl border border-border bg-muted/30 flex items-center justify-center overflow-hidden group relative">
                                        {formData.siteBackgroundImageUrl ? (
                                            <>
                                                <img src={formData.siteBackgroundImageUrl} alt="Background Preview" className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-500" />
                                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <span className="text-white text-[10px] font-black uppercase tracking-widest">Site Background</span>
                                                </div>
                                            </>
                                        ) : (
                                            <div className="text-xs text-muted-foreground/50 font-bold uppercase tracking-widest italic">Global Preview</div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <Separator className="opacity-50" />

                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <Label className="text-base font-medium">Homepage About Section</Label>
                                    <p className="text-sm text-muted-foreground">Display an about block above Exclusive Packages</p>
                                </div>
                                <Switch
                                    checked={formData.homeAboutEnabled || false}
                                    onCheckedChange={(checked) => setFormData({ ...formData, homeAboutEnabled: checked })}
                                    data-testid="switch-home-about"
                                />
                            </div>

                            {formData.homeAboutEnabled && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label className="text-sm font-semibold text-foreground/70">About Title</Label>
                                        <Input
                                            value={formData.homeAboutTitle || ""}
                                            onChange={(e) => setFormData({ ...formData, homeAboutTitle: e.target.value })}
                                            placeholder="About the Server"
                                            className="bg-background/50"
                                            data-testid="input-home-about-title"
                                        />
                                    </div>
                                    <div className="space-y-2 md:col-span-2">
                                        <Label className="text-sm font-semibold text-foreground/70">About Content</Label>
                                        <Textarea
                                            value={formData.homeAboutContent || ""}
                                            onChange={(e) => setFormData({ ...formData, homeAboutContent: e.target.value })}
                                            placeholder="Share what makes your server special."
                                            className="bg-background/50 min-h-[140px]"
                                            data-testid="input-home-about-content"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </Card>

                <div className="flex justify-end pt-4">
                    <Button
                        onClick={onSave}
                        disabled={isSaving}
                        className="gap-2 bg-orange-500 hover:bg-orange-600 text-white shadow-lg shadow-orange-500/20"
                    >
                        {isSaving ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save className="h-4 w-4" />
                                Save General Settings
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
}
