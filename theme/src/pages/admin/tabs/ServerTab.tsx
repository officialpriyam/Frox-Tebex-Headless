
import { SiteSettings } from "@data/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Card } from "@/components/ui/card";
import { Save, Loader2 } from "lucide-react";

interface ServerTabProps {
    formData: Partial<SiteSettings>;
    setFormData: (data: Partial<SiteSettings>) => void;
    onSave?: () => void;
    isSaving?: boolean;
}

export function ServerTab({ formData, setFormData, onSave, isSaving }: ServerTabProps) {
    return (
        <div className="space-y-6 animate-fade-in max-w-5xl mx-auto">
            <div>
                <h2 className="text-2xl font-bold tracking-tight">Server Configuration</h2>
                <p className="text-muted-foreground">Manage Minecraft server connection details</p>
            </div>
            <Separator />

            <Card className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="space-y-2">
                        <Label>Server Name</Label>
                        <Input
                            value={formData.serverName || ""}
                            onChange={(e) => setFormData({ ...formData, serverName: e.target.value })}
                            placeholder="FunBlocks"
                            data-testid="input-server-name"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Java Server IP</Label>
                        <Input
                            value={formData.javaServerIp || ""}
                            onChange={(e) => setFormData({ ...formData, javaServerIp: e.target.value })}
                            placeholder="play.example.com"
                            data-testid="input-java-ip"
                        />
                    </div>
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30 mb-6">
                    <div>
                        <Label className="text-base font-medium">Bedrock Support</Label>
                        <p className="text-sm text-muted-foreground">Enable Bedrock edition support</p>
                    </div>
                    <Switch
                        checked={formData.bedrockSupport || false}
                        onCheckedChange={(checked) => setFormData({ ...formData, bedrockSupport: checked })}
                        data-testid="switch-bedrock"
                    />
                </div>

                {formData.bedrockSupport && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
                        <div className="space-y-2">
                            <Label>Bedrock Server IP</Label>
                            <Input
                                value={formData.bedrockServerIp || ""}
                                onChange={(e) => setFormData({ ...formData, bedrockServerIp: e.target.value })}
                                placeholder="bedrock.example.com"
                                data-testid="input-bedrock-ip"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Bedrock Port</Label>
                            <Input
                                type="number"
                                value={formData.bedrockPort || 19132}
                                onChange={(e) => setFormData({ ...formData, bedrockPort: parseInt(e.target.value) })}
                                placeholder="19132"
                                data-testid="input-bedrock-port"
                            />
                        </div>
                    </div>
                )}
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
                            Save Server Settings
                        </>
                    )}
                </Button>
            </div>
        </div>
    );
}
