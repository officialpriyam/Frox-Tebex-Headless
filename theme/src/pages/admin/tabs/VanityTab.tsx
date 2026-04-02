
import { VanityLink } from "@data/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Card } from "@/components/ui/card";
import { LinkIcon, Plus, X, Save, Edit, Trash2 } from "lucide-react";

interface VanityTabProps {
    vanityLinks: VanityLink[];
    editingVanity: Partial<VanityLink> | null;
    setEditingVanity: (link: Partial<VanityLink> | null) => void;
    showVanityEditor: boolean;
    setShowVanityEditor: (show: boolean) => void;
    saveVanityLink: () => void;
    deleteVanityLink: (id: string) => void;
    updateVanityEnabled: (id: string, enabled: boolean) => void;
}

export function VanityTab({
    vanityLinks,
    editingVanity,
    setEditingVanity,
    showVanityEditor,
    setShowVanityEditor,
    saveVanityLink,
    deleteVanityLink,
    updateVanityEnabled
}: VanityTabProps) {
    return (
        <div className="space-y-6 animate-fade-in max-w-5xl mx-auto">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Vanity Links</h2>
                    <p className="text-muted-foreground">Create custom redirects (e.g., /discord)</p>
                </div>
                <Button
                    size="sm"
                    className="gap-2"
                    onClick={() => {
                        setEditingVanity({ path: "", targetUrl: "", enabled: true });
                        setShowVanityEditor(true);
                    }}
                    data-testid="button-add-vanity"
                >
                    <Plus className="h-4 w-4" />
                    Add Link
                </Button>
            </div>
            <Separator />

            {showVanityEditor && editingVanity && (
                <Card className="p-6 border-primary/20 bg-primary/5">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold">{editingVanity.id ? "Edit Link" : "Add Link"}</h3>
                        <Button variant="ghost" size="icon" onClick={() => { setShowVanityEditor(false); setEditingVanity(null); }}>
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>Path (without leading slash)</Label>
                            <div className="flex items-center gap-2">
                                <span className="text-muted-foreground font-mono">/</span>
                                <Input
                                    value={editingVanity.path || ""}
                                    onChange={(e) => setEditingVanity({ ...editingVanity, path: e.target.value })}
                                    placeholder="discord"
                                    data-testid="input-vanity-path"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Target URL</Label>
                            <Input
                                value={editingVanity.targetUrl || ""}
                                onChange={(e) => setEditingVanity({ ...editingVanity, targetUrl: e.target.value })}
                                placeholder="https://discord.gg/yourserver"
                                data-testid="input-vanity-target"
                            />
                        </div>
                        <div className="flex items-center justify-between pt-2">
                            <div className="flex items-center gap-2">
                                <Switch
                                    checked={editingVanity.enabled ?? true}
                                    onCheckedChange={(checked) => setEditingVanity({ ...editingVanity, enabled: checked })}
                                />
                                <Label>Enabled</Label>
                            </div>
                            <Button onClick={saveVanityLink} className="gap-2" data-testid="button-save-vanity">
                                <Save className="h-4 w-4" />
                                Save Link
                            </Button>
                        </div>
                    </div>
                </Card>
            )}

            <div className="grid grid-cols-1 gap-4">
                {vanityLinks?.map((link) => (
                    <Card key={link.id} className="p-4 flex items-center justify-between hover:shadow-md transition-all">
                        <div className="flex items-center gap-4">
                            <div className="p-2 rounded-lg bg-primary/10 text-primary">
                                <LinkIcon className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="font-mono text-primary font-medium">/{link.path}</p>
                                <p className="text-sm text-muted-foreground truncate max-w-sm">{link.targetUrl}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Switch
                                checked={link.enabled ?? false}
                                onCheckedChange={(checked) => updateVanityEnabled(link.id, checked)}
                                data-testid={`switch-vanity-${link.id}`}
                            />
                            <div className="h-6 w-px bg-border mx-1" />
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => { setEditingVanity(link); setShowVanityEditor(true); }}
                                data-testid={`button-edit-vanity-${link.id}`}
                            >
                                <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="text-destructive hover:bg-destructive/10"
                                onClick={() => deleteVanityLink(link.id)}
                                data-testid={`button-delete-vanity-${link.id}`}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    </Card>
                ))}
                {(!vanityLinks || vanityLinks.length === 0) && !showVanityEditor && (
                    <div className="text-center py-16 text-muted-foreground border-2 border-dashed rounded-xl">
                        <LinkIcon className="h-12 w-12 mx-auto mb-4 opacity-20" />
                        <p className="font-medium">No vanity links configured</p>
                    </div>
                )}
            </div>
        </div>
    );
}
