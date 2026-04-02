import { SiteSettings } from "@data/schema";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Loader2, Save } from "lucide-react";

interface RankUpgraderTabProps {
    formData: Partial<SiteSettings>;
    setFormData: (data: Partial<SiteSettings>) => void;
    onSave?: () => void;
    isSaving?: boolean;
}

export function RankUpgraderTab({ formData, setFormData, onSave, isSaving }: RankUpgraderTabProps) {
    return (
        <div className="space-y-6 animate-fade-in max-w-5xl mx-auto">
            <div>
                <h2 className="text-2xl font-bold tracking-tight">Rank Upgrader</h2>
                <p className="text-muted-foreground">Configure automatic rank upgrade path</p>
            </div>
            <Separator />

            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                <div>
                    <Label className="text-base font-medium">Enabled</Label>
                    <p className="text-sm text-muted-foreground">Allow users to upgrade their ranks paying only the difference</p>
                </div>
                <Switch
                    checked={formData.rankUpgraderEnabled || false}
                    onCheckedChange={(checked) => setFormData({ ...formData, rankUpgraderEnabled: checked })}
                    data-testid="switch-rank-upgrader"
                />
            </div>

            {formData.rankUpgraderEnabled && (
                <div className="space-y-4 animate-fade-in p-6 border rounded-lg border-border">
                    <div className="space-y-2">
                        <Label>Rank Order (Package IDs, lowest to highest)</Label>
                        <Input
                            value={(formData.rankOrder || []).join(", ")}
                            onChange={(e) => setFormData({
                                ...formData,
                                rankOrder: e.target.value.split(",").map(s => s.trim()).filter(Boolean)
                            })}
                            placeholder="1001, 1002, 1003, 1004"
                            data-testid="input-rank-order"
                        />
                        <p className="text-xs text-muted-foreground">
                            Enter package IDs in order from lowest rank to highest rank. The system will calculate upgrade costs automatically.
                        </p>
                    </div>
                </div>
            )}

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
                            Save Rank Upgrader
                        </>
                    )}
                </Button>
            </div>
        </div>
    );
}
