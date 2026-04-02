
import { VoteSite } from "@data/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Card } from "@/components/ui/card";
import { Vote, Plus, X, Save, Edit, Trash2 } from "lucide-react";

interface VoteTabProps {
    voteSites: VoteSite[];
    editingVote: Partial<VoteSite> | null;
    setEditingVote: (vote: Partial<VoteSite> | null) => void;
    showVoteEditor: boolean;
    setShowVoteEditor: (show: boolean) => void;
    saveVoteSite: () => void;
    deleteVoteSite: (id: string) => void;
}

export function VoteTab({
    voteSites,
    editingVote,
    setEditingVote,
    showVoteEditor,
    setShowVoteEditor,
    saveVoteSite,
    deleteVoteSite
}: VoteTabProps) {
    return (
        <div className="space-y-6 animate-fade-in max-w-5xl mx-auto">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Vote Sites</h2>
                    <p className="text-muted-foreground">Manage voting links and rewards</p>
                </div>
                <Button
                    size="sm"
                    className="gap-2"
                    onClick={() => {
                        setEditingVote({ name: "", url: "", cooldownHours: 24, enabled: true });
                        setShowVoteEditor(true);
                    }}
                    data-testid="button-add-vote"
                >
                    <Plus className="h-4 w-4" />
                    Add Site
                </Button>
            </div>
            <Separator />

            {showVoteEditor && editingVote && (
                <Card className="p-6 border-primary/20 bg-primary/5">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold">{editingVote.id ? "Edit Vote Site" : "Add Vote Site"}</h3>
                        <Button variant="ghost" size="icon" onClick={() => { setShowVoteEditor(false); setEditingVote(null); }}>
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Site Name</Label>
                                <Input
                                    value={editingVote.name || ""}
                                    onChange={(e) => setEditingVote({ ...editingVote, name: e.target.value })}
                                    placeholder="Planet Minecraft"
                                    data-testid="input-vote-site-name"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Cooldown (hours)</Label>
                                <Input
                                    type="number"
                                    value={editingVote.cooldownHours || 24}
                                    onChange={(e) => setEditingVote({ ...editingVote, cooldownHours: parseInt(e.target.value) })}
                                    data-testid="input-vote-cooldown"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>URL</Label>
                            <Input
                                value={editingVote.url || ""}
                                onChange={(e) => setEditingVote({ ...editingVote, url: e.target.value })}
                                placeholder="https://planetminecraft.com/vote/yourserver"
                                data-testid="input-vote-url"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Image URL (optional)</Label>
                            <Input
                                value={editingVote.imageUrl || ""}
                                onChange={(e) => setEditingVote({ ...editingVote, imageUrl: e.target.value })}
                                placeholder="https://example.com/vote-icon.png"
                                data-testid="input-vote-image"
                            />
                        </div>
                        <div className="flex justify-end pt-2">
                            <Button onClick={saveVoteSite} className="gap-2" data-testid="button-save-vote">
                                <Save className="h-4 w-4" />
                                Save Site
                            </Button>
                        </div>
                    </div>
                </Card>
            )}

            <div className="grid grid-cols-1 gap-4">
                {voteSites?.map((site) => (
                    <Card key={site.id} className="p-4 flex items-center justify-between hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-4">
                            {site.imageUrl && <img src={site.imageUrl} alt={site.name} className="w-10 h-10 object-contain rounded" />}
                            <div>
                                <h4 className="font-medium">{site.name}</h4>
                                <p className="text-sm text-muted-foreground truncate max-w-sm">{site.url}</p>
                                <p className="text-xs text-muted-foreground mt-0.5">Cooldown: {site.cooldownHours}h</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-1">
                            <Button variant="ghost" size="icon" onClick={() => { setEditingVote(site); setShowVoteEditor(true); }}>
                                <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10" onClick={() => deleteVoteSite(site.id)}>
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    </Card>
                ))}
                {(!voteSites || voteSites.length === 0) && !showVoteEditor && (
                    <div className="text-center py-16 text-muted-foreground border-2 border-dashed rounded-xl">
                        <Vote className="h-12 w-12 mx-auto mb-4 opacity-20" />
                        <p className="font-medium">No vote sites configured</p>
                    </div>
                )}
            </div>
        </div>
    );
}
