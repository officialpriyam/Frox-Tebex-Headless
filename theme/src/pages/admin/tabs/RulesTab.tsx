
import { Rule } from "@data/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Scale, Plus, X, Save, Edit, Trash2 } from "lucide-react";

interface RulesTabProps {
    rules: Rule[];
    editingRule: Partial<Rule> | null;
    setEditingRule: (rule: Partial<Rule> | null) => void;
    showRuleEditor: boolean;
    setShowRuleEditor: (show: boolean) => void;
    saveRule: () => void;
    deleteRule: (id: string) => void;
}

export function RulesTab({
    rules,
    editingRule,
    setEditingRule,
    showRuleEditor,
    setShowRuleEditor,
    saveRule,
    deleteRule
}: RulesTabProps) {
    return (
        <div className="space-y-6 animate-fade-in max-w-5xl mx-auto">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Server Rules</h2>
                    <p className="text-muted-foreground">Manage your community guidelines</p>
                </div>
                <Button
                    size="sm"
                    className="gap-2"
                    onClick={() => {
                        setEditingRule({ title: "", content: "", category: "General" });
                        setShowRuleEditor(true);
                    }}
                    data-testid="button-add-rule"
                >
                    <Plus className="h-4 w-4" />
                    Add Rule
                </Button>
            </div>
            <Separator />

            {showRuleEditor && editingRule && (
                <Card className="p-6 border-primary/20 bg-primary/5">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold">{editingRule.id ? "Edit Rule" : "Add New Rule"}</h3>
                        <Button variant="ghost" size="icon" onClick={() => { setShowRuleEditor(false); setEditingRule(null); }}>
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Title</Label>
                                <Input
                                    value={editingRule.title || ""}
                                    onChange={(e) => setEditingRule({ ...editingRule, title: e.target.value })}
                                    placeholder="No Cheating"
                                    data-testid="input-rule-title"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Category</Label>
                                <Input
                                    value={editingRule.category || ""}
                                    onChange={(e) => setEditingRule({ ...editingRule, category: e.target.value })}
                                    placeholder="General"
                                    data-testid="input-rule-category"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Content</Label>
                            <Textarea
                                value={editingRule.content || ""}
                                onChange={(e) => setEditingRule({ ...editingRule, content: e.target.value })}
                                placeholder="Rule description..."
                                className="min-h-[100px]"
                                data-testid="input-rule-content"
                            />
                        </div>
                        <div className="flex justify-end">
                            <Button onClick={saveRule} className="gap-2" data-testid="button-save-rule">
                                <Save className="h-4 w-4" />
                                Save Rule
                            </Button>
                        </div>
                    </div>
                </Card>
            )}

            <div className="grid grid-cols-1 gap-4">
                {rules?.map((rule) => (
                    <Card key={rule.id} className="p-4 bg-card hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                                <h4 className="font-medium text-lg">{rule.title}</h4>
                                <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">{rule.content}</p>
                                <Badge variant="secondary" className="mt-3 text-xs">{rule.category}</Badge>
                            </div>
                            <div className="flex items-center gap-1">
                                <Button variant="ghost" size="icon" onClick={() => { setEditingRule(rule); setShowRuleEditor(true); }}>
                                    <Edit className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10" onClick={() => deleteRule(rule.id)}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </Card>
                ))}
                {(!rules || rules.length === 0) && !showRuleEditor && (
                    <div className="text-center py-16 text-muted-foreground border-2 border-dashed rounded-xl">
                        <Scale className="h-12 w-12 mx-auto mb-4 opacity-20" />
                        <p className="font-medium">No rules configured</p>
                    </div>
                )}
            </div>
        </div>
    );
}
