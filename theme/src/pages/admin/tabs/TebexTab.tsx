import { SiteSettings } from "@data/schema";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Save, ShoppingBag, Check, X } from "lucide-react";

interface TebexTabProps {
    formData: Partial<SiteSettings>;
    setFormData: (data: Partial<SiteSettings>) => void;
    onSave?: () => void;
    isSaving?: boolean;
}

export function TebexTab({ formData, setFormData, onSave, isSaving }: TebexTabProps) {
    return (
        <div className="space-y-6 animate-fade-in max-w-5xl mx-auto">
            <div>
                <h2 className="text-2xl font-bold tracking-tight">Tebex Integration</h2>
                <p className="text-muted-foreground">Configure your Tebex store connection</p>
            </div>
            <Separator />

            <Card className="p-4 bg-blue-500/10 border-blue-500/20">
                <div className="flex items-start gap-3">
                    <ShoppingBag className="h-5 w-5 text-blue-500 mt-0.5" />
                    <div>
                        <p className="font-medium text-blue-500">Tebex API</p>
                        <p className="text-sm text-muted-foreground">
                            Connect your Tebex store to display products and handle purchases. Get your API keys from your Tebex dashboard.
                        </p>
                    </div>
                </div>
            </Card>

            <div className="grid grid-cols-1 gap-6">
                <div className="space-y-2">
                    <Label>Public Token</Label>
                    <Input
                        value={formData.tebexPublicToken || ""}
                        onChange={(e) => setFormData({ ...formData, tebexPublicToken: e.target.value })}
                        placeholder="Enter your Tebex public token"
                        data-testid="input-tebex-public"
                    />
                    <p className="text-xs text-muted-foreground">Found in Tebex Dashboard under Integrations &gt; API Keys</p>
                </div>
                <div className="space-y-2">
                    <Label>Private Key</Label>
                    <Input
                        type="password"
                        value={formData.tebexPrivateKey || ""}
                        onChange={(e) => setFormData({ ...formData, tebexPrivateKey: e.target.value })}
                        placeholder="Enter your Tebex private key"
                        data-testid="input-tebex-private"
                    />
                    <p className="text-xs text-muted-foreground">Keep this secret - used for coupons, gift cards, and other server-side API calls</p>
                </div>
                <div className="space-y-2">
                    <Label>Plugin API Key</Label>
                    <Input
                        type="password"
                        value={formData.tebexPluginApiKey || ""}
                        onChange={(e) => setFormData({ ...formData, tebexPluginApiKey: e.target.value })}
                        placeholder="Enter your Tebex plugin API key"
                        data-testid="input-tebex-plugin-goal"
                    />
                    <p className="text-xs text-muted-foreground">Stored in .env and used to fetch community goals</p>
                </div>
            </div>

            <Separator />

            <div>
                <h3 className="text-lg font-semibold mb-4">Connection Status</h3>
                <div className="p-4 rounded-lg bg-muted/30 border border-border">
                    {formData.tebexPublicToken ? (
                        <div className="flex items-center gap-2 text-green-500 font-medium">
                            <Check className="h-4 w-4" />
                            <span>Tebex API configured (Public Token present)</span>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 text-amber-500 font-medium">
                            <X className="h-4 w-4" />
                            <span>Tebex API not configured</span>
                        </div>
                    )}
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
                            Save Tebex Settings
                        </>
                    )}
                </Button>
            </div>
        </div>
    );
}
