
import { SocialLink } from "@data/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Card } from "@/components/ui/card";
import { Plus, X, Save, Share2, Edit, Trash2 } from "lucide-react";
import { FaDiscord, FaTwitter, FaYoutube, FaGithub, FaReddit, FaInstagram, FaFacebook, FaTwitch, FaGlobe, FaWikipediaW } from "react-icons/fa";

interface SocialTabProps {
    socialLinks: SocialLink[];
    editingSocial: Partial<SocialLink> | null;
    setEditingSocial: (social: Partial<SocialLink> | null) => void;
    showSocialEditor: boolean;
    setShowSocialEditor: (show: boolean) => void;
    saveSocial: () => void;
    deleteSocial: (id: string) => void;
    updateSocialVisibility: (id: string, showInNav: boolean) => void;
}

const socialIcons: Record<string, React.ReactNode> = {
    discord: <FaDiscord className="h-4 w-4" />,
    twitter: <FaTwitter className="h-4 w-4" />,
    youtube: <FaYoutube className="h-4 w-4" />,
    github: <FaGithub className="h-4 w-4" />,
    reddit: <FaReddit className="h-4 w-4" />,
    instagram: <FaInstagram className="h-4 w-4" />,
    facebook: <FaFacebook className="h-4 w-4" />,
    twitch: <FaTwitch className="h-4 w-4" />,
    website: <FaGlobe className="h-4 w-4" />,
    wiki: <FaWikipediaW className="h-4 w-4" />,
};

export function SocialTab({
    socialLinks,
    editingSocial,
    setEditingSocial,
    showSocialEditor,
    setShowSocialEditor,
    saveSocial,
    deleteSocial,
    updateSocialVisibility
}: SocialTabProps) {
    return (
        <div className="space-y-6 animate-fade-in max-w-5xl mx-auto">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Social Links</h2>
                    <p className="text-muted-foreground">Manage your social media presence</p>
                </div>
                <Button
                    size="sm"
                    className="gap-2"
                    onClick={() => {
                        setEditingSocial({ platform: "", url: "", icon: "discord", showInNav: true });
                        setShowSocialEditor(true);
                    }}
                >
                    <Plus className="h-4 w-4" />
                    Add Social
                </Button>
            </div>
            <Separator />

            {showSocialEditor && editingSocial && (
                <Card className="p-6 border-primary/20 bg-primary/5">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold">{editingSocial.id ? "Edit" : "Add"} Social Link</h3>
                        <Button variant="ghost" size="icon" onClick={() => { setShowSocialEditor(false); setEditingSocial(null); }}>
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Platform Name</Label>
                                <Input
                                    value={editingSocial.platform || ""}
                                    onChange={(e) => setEditingSocial({ ...editingSocial, platform: e.target.value })}
                                    placeholder="Discord"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Icon Key</Label>
                                <Input
                                    value={editingSocial.icon || ""}
                                    onChange={(e) => setEditingSocial({ ...editingSocial, icon: e.target.value })}
                                    placeholder="discord, twitter..."
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>URL</Label>
                            <Input
                                value={editingSocial.url || ""}
                                onChange={(e) => setEditingSocial({ ...editingSocial, url: e.target.value })}
                                placeholder="https://..."
                            />
                        </div>
                        <div className="flex items-center justify-between mt-4">
                            <div className="flex items-center gap-2">
                                <Switch
                                    checked={editingSocial.showInNav ?? true}
                                    onCheckedChange={(checked) => setEditingSocial({ ...editingSocial, showInNav: checked })}
                                />
                                <Label>Show in Navbar</Label>
                            </div>
                            <Button onClick={saveSocial} className="gap-2">
                                <Save className="h-4 w-4" />
                                Save Link
                            </Button>
                        </div>
                    </div>
                </Card>
            )}

            <div className="grid grid-cols-1 gap-4">
                {socialLinks?.map((link) => (
                    <Card key={link.id} className="p-4 flex items-center justify-between bg-card hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-4">
                            <div className="p-2 rounded-lg bg-primary/10 text-primary">
                                {socialIcons[link.icon] || <Share2 className="h-5 w-5" />}
                            </div>
                            <div>
                                <p className="font-medium">{link.platform}</p>
                                <p className="text-sm text-muted-foreground">{link.url}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="flex items-center gap-2 mr-4">
                                <span className="text-xs text-muted-foreground">Nav</span>
                                <Switch
                                    checked={link.showInNav ?? false}
                                    onCheckedChange={(checked) => updateSocialVisibility(link.id, checked)}
                                />
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => { setEditingSocial(link); setShowSocialEditor(true); }}>
                                <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive/80" onClick={() => deleteSocial(link.id)}>
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    </Card>
                ))}
                {(!socialLinks || socialLinks.length === 0) && !showSocialEditor && (
                    <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-xl">
                        <Share2 className="h-12 w-12 mx-auto mb-4 opacity-20" />
                        <p>No social links configured</p>
                    </div>
                )}
            </div>
        </div>
    );
}
