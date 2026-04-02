
import { Rank } from "@data/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { badgeVariants, Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card } from "@/components/ui/card";
import { Crown, Plus, X, Save, Edit, Trash2 } from "lucide-react";

interface RanksTabProps {
    ranks: Rank[];
    editingRank: Partial<Rank> | null;
    setEditingRank: (rank: Partial<Rank> | null) => void;
    showRankEditor: boolean;
    setShowRankEditor: (show: boolean) => void;
    saveRank: () => void;
    deleteRank: (id: string) => void;
}

export function RanksTab({
    ranks,
    editingRank,
    setEditingRank,
    showRankEditor,
    setShowRankEditor,
    saveRank,
    deleteRank
}: RanksTabProps) {
    return (
        <div className="space-y-6 animate-fade-in max-w-5xl mx-auto">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Ranks Table</h2>
                    <p className="text-muted-foreground">Configure ranks displayed on your store</p>
                </div>
                <Button
                    size="sm"
                    className="gap-2"
                    onClick={() => {
                        setEditingRank({ name: "", price: "0", color: "#3b82f6", permissions: [], sortOrder: 0, enabled: true });
                        setShowRankEditor(true);
                    }}
                    data-testid="button-create-rank"
                >
                    <Plus className="h-4 w-4" />
                    Add Rank
                </Button>
            </div>
            <Separator />

            {showRankEditor && editingRank && (
                <Card className="p-6 border-primary/20 bg-primary/5">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold">{editingRank.id ? "Edit Rank" : "Create Rank"}</h3>
                        <Button variant="ghost" size="icon" onClick={() => { setShowRankEditor(false); setEditingRank(null); }}>
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label>Rank Name *</Label>
                                <Input
                                    value={editingRank.name || ""}
                                    onChange={(e) => setEditingRank({ ...editingRank, name: e.target.value })}
                                    placeholder="VIP"
                                    data-testid="input-rank-name"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Price</Label>
                                <Input
                                    value={editingRank.price || ""}
                                    onChange={(e) => setEditingRank({ ...editingRank, price: e.target.value })}
                                    placeholder="9.99"
                                    data-testid="input-rank-price"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Color</Label>
                                <div className="flex gap-2">
                                    <input
                                        type="color"
                                        value={editingRank.color || "#3b82f6"}
                                        onChange={(e) => setEditingRank({ ...editingRank, color: e.target.value })}
                                        className="w-10 h-9 rounded cursor-pointer border border-input"
                                    />
                                    <Input
                                        value={editingRank.color || "#3b82f6"}
                                        onChange={(e) => setEditingRank({ ...editingRank, color: e.target.value })}
                                        className="flex-1"
                                        data-testid="input-rank-color"
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Tebex Package ID (optional)</Label>
                                <Input
                                    value={editingRank.packageId || ""}
                                    onChange={(e) => setEditingRank({ ...editingRank, packageId: e.target.value })}
                                    placeholder="12345"
                                    data-testid="input-rank-package-id"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Sort Order</Label>
                                <Input
                                    type="number"
                                    value={editingRank.sortOrder || 0}
                                    onChange={(e) => setEditingRank({ ...editingRank, sortOrder: parseInt(e.target.value) || 0 })}
                                    data-testid="input-rank-sort"
                                />
                            </div>
                        </div>
                        <div className="flex items-center justify-between pt-2">
                            <div className="flex items-center gap-2">
                                <Switch
                                    checked={editingRank.enabled ?? true}
                                    onCheckedChange={(checked) => setEditingRank({ ...editingRank, enabled: checked })}
                                    data-testid="switch-rank-enabled"
                                />
                                <Label>Enabled</Label>
                            </div>
                            <Button onClick={saveRank} className="gap-2" data-testid="button-save-rank">
                                <Save className="h-4 w-4" />
                                Save Rank
                            </Button>
                        </div>
                    </div>
                </Card>
            )}

            <div className="grid grid-cols-1 gap-3">
                {ranks?.map((rank) => (
                    <Card key={rank.id} className="p-4 flex items-center justify-between hover:shadow-md transition-all">
                        <div className="flex items-center gap-4">
                            <div
                                className="w-8 h-8 rounded-full border-2 border-background shadow-sm"
                                style={{ backgroundColor: rank.color || "#3b82f6" }}
                            />
                            <div>
                                <p className="font-semibold text-lg" style={{ color: rank.color || undefined }}>{rank.name}</p>
                                <p className="text-sm text-muted-foreground font-mono">${rank.price}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Badge variant={rank.enabled ? "default" : "secondary"}>
                                {rank.enabled ? "Active" : "Disabled"}
                            </Badge>
                            <div className="h-6 w-px bg-border mx-2" />
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => { setEditingRank(rank); setShowRankEditor(true); }}
                                data-testid={`button-edit-rank-${rank.id}`}
                            >
                                <Edit className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="text-destructive hover:bg-destructive/10"
                                onClick={() => deleteRank(rank.id)}
                                data-testid={`button-delete-rank-${rank.id}`}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    </Card>
                ))}
                {(!ranks || ranks.length === 0) && !showRankEditor && (
                    <div className="text-center py-16 text-muted-foreground border-2 border-dashed rounded-xl">
                        <Crown className="h-12 w-12 mx-auto mb-4 opacity-20" />
                        <p className="font-medium">No ranks configured</p>
                        <p className="text-sm mt-1">Click "Add Rank" to get started</p>
                    </div>
                )}
            </div>
        </div>
    );
}
