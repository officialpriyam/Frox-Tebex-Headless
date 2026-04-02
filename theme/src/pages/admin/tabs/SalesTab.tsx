
import { SiteSettings } from "@data/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Save, Loader2 } from "lucide-react";

interface SalesTabProps {
    formData: Partial<SiteSettings>;
    setFormData: (data: Partial<SiteSettings>) => void;
    onSave?: () => void;
    isSaving?: boolean;
}

export function SalesTab({ formData, setFormData, onSave, isSaving }: SalesTabProps) {
    return (
        <div className="space-y-6 animate-fade-in max-w-5xl mx-auto">
            <div>
                <h2 className="text-2xl font-bold tracking-tight">Sales & Promotions</h2>
                <p className="text-muted-foreground">Manage global sales banner and alerts</p>
            </div>
            <Separator />

            <div className="grid gap-6">
                <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                    <div>
                        <Label className="text-base font-medium">Show Sale Banner</Label>
                        <p className="text-sm text-muted-foreground">Display a prominent sale banner at the top of the site</p>
                    </div>
                    <Switch
                        checked={formData.showSaleBanner || false}
                        onCheckedChange={(checked) => setFormData({ ...formData, showSaleBanner: checked })}
                        data-testid="switch-sale-banner"
                    />
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                    <div>
                        <Label className="text-base font-medium">Show Illustration</Label>
                        <p className="text-sm text-muted-foreground">Display decorative illustration next to the banner text</p>
                    </div>
                    <Switch
                        checked={formData.showSaleBannerIllustration || false}
                        onCheckedChange={(checked) => setFormData({ ...formData, showSaleBannerIllustration: checked })}
                        data-testid="switch-sale-illustration"
                    />
                </div>

                <div className="space-y-2">
                    <Label>Banner Text</Label>
                    <Input
                        value={formData.saleBannerText || ""}
                        onChange={(e) => setFormData({ ...formData, saleBannerText: e.target.value })}
                        placeholder="🔥 WINTER SALE! Get 50% OFF everything this week only!"
                        className="md:text-lg"
                        data-testid="input-sale-banner-text"
                    />
                    <p className="text-xs text-muted-foreground">
                        Supports simple text. Make it catchy!
                    </p>
                </div>
            </div>

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
                            Save Sales Settings
                        </>
                    )}
                </Button>
            </div>
        </div>
    );
}
