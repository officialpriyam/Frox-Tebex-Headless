
import { SiteSettings } from "@data/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Save, Loader2 } from "lucide-react";

interface StoreTabProps {
    formData: Partial<SiteSettings>;
    setFormData: (data: Partial<SiteSettings>) => void;
    onSave?: () => void;
    isSaving?: boolean;
}

export function StoreTab({ formData, setFormData, onSave, isSaving }: StoreTabProps) {
    return (
        <div className="space-y-6 animate-fade-in max-w-5xl mx-auto">
            <div>
                <h2 className="text-2xl font-bold tracking-tight">Store Settings</h2>
                <p className="text-muted-foreground">Configure store display and behavior</p>
            </div>
            <Separator />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label>Package Listing Columns</Label>
                    <Input
                        type="number"
                        min={2}
                        max={6}
                        value={formData.packageListingColumns || 4}
                        onChange={(e) => setFormData({ ...formData, packageListingColumns: parseInt(e.target.value) })}
                        data-testid="input-columns"
                    />
                    <p className="text-xs text-muted-foreground">Default: 4</p>
                </div>
                <div className="space-y-2">
                    <Label>Featured Package IDs</Label>
                    <Input
                        value={(formData.featuredPackageIds || []).join(", ")}
                        onChange={(e) => setFormData({
                            ...formData,
                            featuredPackageIds: e.target.value.split(",").map(s => s.trim()).filter(Boolean)
                        })}
                        placeholder="12345, 67890"
                        data-testid="input-featured-ids"
                    />
                </div>
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                <div>
                    <Label className="text-base font-medium">Shorter Cards</Label>
                    <p className="text-sm text-muted-foreground">Use compact card layout</p>
                </div>
                <Switch
                    checked={formData.shorterCards || false}
                    onCheckedChange={(checked) => setFormData({ ...formData, shorterCards: checked })}
                    data-testid="switch-shorter-cards"
                />
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                <div>
                    <Label className="text-base font-medium">Goal Tracker</Label>
                    <p className="text-sm text-muted-foreground">Show fundraising goal on homepage</p>
                </div>
                <Switch
                    checked={formData.goalEnabled || false}
                    onCheckedChange={(checked) => setFormData({ ...formData, goalEnabled: checked })}
                    data-testid="switch-goal"
                />
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                <div>
                    <Label className="text-base font-medium">Package Click Animations</Label>
                    <p className="text-sm text-muted-foreground">Enable scale animation when clicking packages</p>
                </div>
                <Switch
                    checked={formData.packageClickAnimation ?? true}
                    onCheckedChange={(checked) => setFormData({ ...formData, packageClickAnimation: checked })}
                    data-testid="switch-package-animation"
                />
            </div>

            {formData.goalEnabled && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in p-4 border rounded-lg border-primary/20 bg-primary/5">
                    <div className="space-y-2">
                        <Label>Goal Title</Label>
                        <Input
                            value={formData.goalTitle || ""}
                            onChange={(e) => setFormData({ ...formData, goalTitle: e.target.value })}
                            placeholder="Server Goal"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Goal Target</Label>
                        <Input
                            type="number"
                            value={formData.goalTarget || 0}
                            onChange={(e) => setFormData({ ...formData, goalTarget: parseInt(e.target.value) })}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Current Progress</Label>
                        <Input
                            type="number"
                            value={formData.goalCurrent || 0}
                            onChange={(e) => setFormData({ ...formData, goalCurrent: parseInt(e.target.value) })}
                        />
                    </div>
                    <div className="space-y-2 md:col-span-3">
                        <Label>Goal Description</Label>
                        <Textarea
                            value={formData.goalDescription || ""}
                            onChange={(e) => setFormData({ ...formData, goalDescription: e.target.value })}
                            placeholder="Tell players what this goal will unlock."
                            className="min-h-[120px]"
                        />
                    </div>
                </div>
            )}

            <Separator />

            <div>
                <h3 className="font-semibold text-lg mb-4">Category Logos</h3>
                <p className="text-sm text-muted-foreground mb-4">Add image URLs for category logos (displayed in order on homepage)</p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2, 3, 4, 5, 6].map((index) => (
                        <div key={index} className="space-y-2">
                            <Label>Category {index} Logo URL</Label>
                            <div className="flex gap-2">
                                <Input
                                    value={(formData.categoryLogos as Record<string, string>)?.[index.toString()] || ""}
                                    onChange={(e) => {
                                        const logos = { ...(formData.categoryLogos as Record<string, string> || {}) };
                                        if (e.target.value) {
                                            logos[index.toString()] = e.target.value;
                                        } else {
                                            delete logos[index.toString()];
                                        }
                                        setFormData({ ...formData, categoryLogos: logos });
                                    }}
                                    placeholder="https://example.com/logo.png"
                                    data-testid={`input-category-logo-${index}`}
                                />
                                {(formData.categoryLogos as Record<string, string>)?.[index.toString()] && (
                                    <div className="w-10 h-10 rounded bg-muted/30 flex-shrink-0 flex items-center justify-center overflow-hidden border border-border">
                                        <img
                                            src={(formData.categoryLogos as Record<string, string>)[index.toString()]}
                                            alt={`Category ${index}`}
                                            className="w-8 h-8 object-contain"
                                            onError={(e) => (e.currentTarget.style.display = 'none')}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
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
                            Save Store Settings
                        </>
                    )}
                </Button>
            </div>
        </div>
    );
}
