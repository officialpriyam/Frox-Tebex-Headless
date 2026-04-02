import { SiteSettings } from "@data/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Loader2, Save, Sparkles } from "lucide-react";
import { FaSnowflake, FaGhost, FaLeaf, FaSun, FaOm } from "react-icons/fa";
import { Separator } from "@/components/ui/separator";
import { Card } from "@/components/ui/card";

interface SeasonalTabProps {
    formData: Partial<SiteSettings>;
    setFormData: (data: Partial<SiteSettings>) => void;
    onSave?: () => void;
    isSaving?: boolean;
}

const seasonalThemeIcons: Record<string, React.ReactNode> = {
    christmas: <FaSnowflake className="h-5 w-5 text-blue-400" />,
    winter: <FaSnowflake className="h-5 w-5 text-cyan-300" />,
    halloween: <FaGhost className="h-5 w-5 text-orange-500" />,
    autumn: <FaLeaf className="h-5 w-5 text-amber-600" />,
    summer: <FaSun className="h-5 w-5 text-yellow-500" />,
    diwali: <FaOm className="h-5 w-5 text-yellow-600" />,
};

export function SeasonalTab({ formData, setFormData, onSave, isSaving }: SeasonalTabProps) {
    return (
        <div className="space-y-6 animate-fade-in max-w-5xl mx-auto">
            <div>
                <h2 className="text-2xl font-bold tracking-tight">Seasonal Themes</h2>
                <p className="text-muted-foreground">Enable seasonal effects on your store</p>
            </div>
            <Separator />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                    { id: "christmas", name: "Christmas", description: "Snow, snowman, and gifts" },
                    { id: "winter", name: "Winter", description: "Snowfall effect" },
                    { id: "halloween", name: "Halloween", description: "Spooky orange overlay" },
                    { id: "autumn", name: "Autumn", description: "Warm amber tones" },
                    { id: "summer", name: "Summer", description: "Bright sunny vibes" },
                    { id: "diwali", name: "Diwali", description: "Festival of lights" },
                ].map((theme) => (
                    <Card
                        key={theme.id}
                        className={`p-4 cursor-pointer transition-all ${formData.activeSeasonalTheme === theme.id
                            ? "ring-2 ring-primary bg-primary/10 border-primary"
                            : "hover:bg-muted/50 hover:border-primary/50"
                            }`}
                        onClick={() => setFormData({ ...formData, activeSeasonalTheme: theme.id })}
                        data-testid={`card-theme-${theme.id}`}
                    >
                        <div className="flex items-center gap-3 mb-2">
                            {seasonalThemeIcons[theme.id]}
                            <span className="font-semibold">{theme.name}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">{theme.description}</p>
                    </Card>
                ))}

                <Card
                    className={`p-4 cursor-pointer transition-all ${!formData.activeSeasonalTheme || formData.activeSeasonalTheme === "none"
                        ? "ring-2 ring-primary bg-primary/10 border-primary"
                        : "hover:bg-muted/50 hover:border-primary/50"
                        }`}
                    onClick={() => setFormData({ ...formData, activeSeasonalTheme: "none" })}
                    data-testid="card-theme-none"
                >
                    <div className="flex items-center gap-3 mb-2">
                        <Sparkles className="h-5 w-5 text-muted-foreground" />
                        <span className="font-semibold">No Theme</span>
                    </div>
                </Card>
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
                            Save Seasonal Theme
                        </>
                    )}
                </Button>
            </div>
        </div>
    );
}
