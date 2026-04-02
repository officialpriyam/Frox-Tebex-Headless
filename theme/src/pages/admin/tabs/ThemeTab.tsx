import { SiteSettings } from "@data/schema";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Loader2, Save, Upload, Image as ImageIcon } from "lucide-react";
import { useAdminAuth } from "../AdminLogin";
import { useQuery } from "@tanstack/react-query";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

interface ThemeTabProps {
    formData: Partial<SiteSettings>;
    setFormData: (data: Partial<SiteSettings>) => void;
    onSave?: () => void;
    isSaving?: boolean;
}

interface ThemeMeta {
    name: string;
    displayName: string;
    description: string;
    author: string;
    version: string;
}

export function ThemeTab({ formData, setFormData, onSave, isSaving }: ThemeTabProps) {
    const { token } = useAdminAuth() as { token: string };

    const { data: themes } = useQuery<ThemeMeta[]>({
        queryKey: ["/api/admin/themes"],
        queryFn: async () => {
            const res = await fetch("/api/admin/themes", {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) throw new Error("Failed to fetch themes");
            return res.json();
        },
        enabled: !!token,
    });

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: keyof SiteSettings) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = async () => {
            try {
                const res = await fetch("/api/admin/upload-asset", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        name: field,
                        data: reader.result,
                    }),
                });

                if (!res.ok) throw new Error("Upload failed");
                const data = await res.json();
                setFormData({ ...formData, [field]: data.url });
            } catch (err) {
                console.error("Upload error:", err);
            }
        };
        reader.readAsDataURL(file);
    };

    return (
        <div className="space-y-6 animate-fade-in max-w-5xl mx-auto">
            <div>
                <h2 className="text-2xl font-bold tracking-tight">Theme Customization</h2>
                <p className="text-muted-foreground">Customize colors, radii, and visual density</p>
            </div>
            <Separator />

            <div className="grid gap-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label>Global Border Radius</Label>
                        <Input
                            type="number"
                            placeholder="0.5"
                            value={formData.borderRadius || 0.5}
                            onChange={(e) => setFormData({ ...formData, borderRadius: e.target.value })}
                            step="0.1"
                            data-testid="input-border-radius"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Site Container Width (px)</Label>
                        <Input
                            type="number"
                            placeholder="1200"
                            value={1200}
                            disabled
                            className="opacity-50"
                        />
                        <p className="text-xs text-muted-foreground">Currently fixed by template</p>
                    </div>
                </div>

                <div className="space-y-4">
                    <h3 className="text-lg font-medium mt-4">Active Theme</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                        Choose the overall visual style of your store. Create new themes with <code className="px-1.5 py-0.5 bg-muted rounded text-xs">npm run snap:theme:create &lt;name&gt;</code>
                    </p>
                    <Select 
                        value={formData.activeTheme || "default"} 
                        onValueChange={(val) => setFormData({ ...formData, activeTheme: val })}
                    >
                        <SelectTrigger className="w-full md:w-[300px]">
                            <SelectValue placeholder="Select Theme" />
                        </SelectTrigger>
                        <SelectContent>
                            {themes && themes.length > 0 ? (
                                themes.map((t) => (
                                    <SelectItem key={t.name} value={t.name}>
                                        {t.displayName}
                                        {t.author !== "SnapTebex" && <span className="ml-2 text-xs text-muted-foreground">by {t.author}</span>}
                                    </SelectItem>
                                ))
                            ) : (
                                <SelectItem value="default">Default Modern</SelectItem>
                            )}
                        </SelectContent>
                    </Select>
                </div>

                <Separator className="my-2" />

                <div className="space-y-4">
                    <h3 className="text-lg font-medium">Navbar Appearance</h3>
                    <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
                        <div className="space-y-0.5">
                            <Label className="text-base font-medium">Show Navbar Box</Label>
                            <p className="text-sm text-muted-foreground">Display a translucent background box behind the navigation items</p>
                        </div>
                        <Switch
                            checked={formData.showNavbarBox ?? true}
                            onCheckedChange={(checked) => setFormData({ ...formData, showNavbarBox: checked })}
                            data-testid="switch-navbar-box"
                        />
                    </div>
                </div>

                <Separator className="my-2" />

                <div className="space-y-6">
                    <h3 className="text-lg font-medium mt-4">Decorative Assets</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                        Upload images to decorate your site (e.g., vines, plants, or custom icons).
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[
                            { label: "Deco Asset 1 (Navbar)", field: "decoAsset1" },
                            { label: "Deco Asset 2 (Footer)", field: "decoAsset2" },
                            { label: "Deco Asset 3 (Custom)", field: "decoAsset3" },
                        ].map((asset) => (
                            <div key={asset.field} className="space-y-3">
                                <Label className="text-sm font-semibold">{asset.label}</Label>
                                <div className="space-y-2">
                                    <div className="flex gap-2">
                                        <Input
                                            value={(formData as any)[asset.field] || ""}
                                            onChange={(e) => setFormData({ ...formData, [asset.field]: e.target.value })}
                                            placeholder="/vines.png"
                                            className="bg-background/50 text-xs"
                                        />
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            className="shrink-0"
                                            onClick={() => document.getElementById(`upload-${asset.field}`)?.click()}
                                        >
                                            <Upload className="h-4 w-4" />
                                        </Button>
                                        <input
                                            id={`upload-${asset.field}`}
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={(e) => handleUpload(e, asset.field as keyof SiteSettings)}
                                        />
                                    </div>
                                    <div className="aspect-[4/3] rounded-xl border border-border bg-muted/30 flex items-center justify-center overflow-hidden group relative">
                                        {(formData as any)[asset.field] ? (
                                            <img src={(formData as any)[asset.field]} alt="Preview" className="max-w-full max-h-full object-contain" />
                                        ) : (
                                            <ImageIcon className="h-8 w-8 text-muted-foreground/30" />
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="space-y-4">
                    <h3 className="text-lg font-medium mt-4">Brand Colors</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                        Customizing these colors will update the visual identity across the entire platform.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="space-y-2">
                            <Label>Primary Color</Label>
                            <div className="flex gap-2">
                                <input
                                    type="color"
                                    value={formData.primaryColor || "#3b82f6"}
                                    onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                                    className="w-10 h-10 rounded-lg cursor-pointer border border-border bg-background"
                                />
                                <Input
                                    value={formData.primaryColor || "#3b82f6"}
                                    onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                                    className="flex-1 font-mono"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Accent Color</Label>
                            <div className="flex gap-2">
                                <input
                                    type="color"
                                    value={formData.accentColor || "#3b82f6"}
                                    onChange={(e) => setFormData({ ...formData, accentColor: e.target.value })}
                                    className="w-10 h-10 rounded-lg cursor-pointer border border-border bg-background"
                                />
                                <Input
                                    value={formData.accentColor || "#3b82f6"}
                                    onChange={(e) => setFormData({ ...formData, accentColor: e.target.value })}
                                    className="flex-1 font-mono"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Secondary Color</Label>
                            <div className="flex gap-2">
                                <input
                                    type="color"
                                    value={formData.secondaryColor || "#e2e8f0"}
                                    onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })}
                                    className="w-10 h-10 rounded-lg cursor-pointer border border-border bg-background"
                                />
                                <Input
                                    value={formData.secondaryColor || "#e2e8f0"}
                                    onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })}
                                    className="flex-1 font-mono"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Muted Color</Label>
                            <div className="flex gap-2">
                                <input
                                    type="color"
                                    value={formData.mutedColor || "#f1f5f9"}
                                    onChange={(e) => setFormData({ ...formData, mutedColor: e.target.value })}
                                    className="w-10 h-10 rounded-lg cursor-pointer border border-border bg-background"
                                />
                                <Input
                                    value={formData.mutedColor || "#f1f5f9"}
                                    onChange={(e) => setFormData({ ...formData, mutedColor: e.target.value })}
                                    className="flex-1 font-mono"
                                />
                            </div>
                        </div>
                    </div>
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
                            Save Theme Settings
                        </>
                    )}
                </Button>
            </div>
        </div>
    );
}
