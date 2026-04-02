import { SiteSettings } from "@data/schema";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Save } from "lucide-react";

interface PatronsTabProps {
    formData: Partial<SiteSettings>;
    setFormData: (data: Partial<SiteSettings>) => void;
    onSave?: () => void;
    isSaving?: boolean;
}

export function PatronsTab({ formData, setFormData, onSave, isSaving }: PatronsTabProps) {
    return (
        <div className="space-y-6 animate-fade-in max-w-5xl mx-auto">
            <div>
                <h2 className="text-2xl font-bold tracking-tight">Patrons Configuration</h2>
                <p className="text-muted-foreground">Manage Patreon integration and display</p>
            </div>
            <Separator />

            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                <div>
                    <Label className="text-base font-medium">Show Patrons Section</Label>
                    <p className="text-sm text-muted-foreground">Display patrons section on the site homepage</p>
                </div>
                <Switch
                    checked={formData.patronsEnabled || false}
                    onCheckedChange={(checked) => setFormData({ ...formData, patronsEnabled: checked })}
                    data-testid="switch-patrons-shown"
                />
            </div>

            <div className="space-y-2 p-4 border rounded-lg border-border">
                <Label>Patreon URL</Label>
                <Input
                    value={formData.patreonUrl || ""}
                    onChange={(e) => setFormData({ ...formData, patreonUrl: e.target.value })}
                    placeholder="https://patreon.com/yourpage"
                    data-testid="input-patreon-url"
                />
                <p className="text-xs text-muted-foreground">
                    Link to your Patreon page for supporters
                </p>
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
                            Save Patrons Settings
                        </>
                    )}
                </Button>
            </div>
        </div>
    );
}
