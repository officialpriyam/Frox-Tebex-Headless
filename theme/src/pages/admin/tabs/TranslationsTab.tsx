
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Languages, Info } from "lucide-react";

export function TranslationsTab() {
    return (
        <div className="space-y-6 animate-fade-in max-w-5xl mx-auto">
            <div>
                <h2 className="text-2xl font-bold tracking-tight">Translations</h2>
                <p className="text-muted-foreground">Customize site text and localized content</p>
            </div>
            <Separator />

            <Card className="p-8 flex flex-col items-center justify-center text-center space-y-4 border-dashed bg-muted/20">
                <div className="h-16 w-16 rounded-full bg-orange-500/10 flex items-center justify-center">
                    <Languages className="h-8 w-8 text-orange-500" />
                </div>
                <div className="space-y-2 max-w-md">
                    <h3 className="text-xl font-semibold">Under Construction</h3>
                    <p className="text-muted-foreground">
                        The internationalization system is currently being developed.
                        In the next update, you'll be able to translate every piece of text on your store.
                    </p>
                </div>
                <div className="flex items-center gap-2 text-xs text-orange-500/80 bg-orange-500/5 px-3 py-1.5 rounded-full border border-orange-500/10">
                    <Info className="h-3.5 w-3.5" />
                    <span>Coming Q1 2026</span>
                </div>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 opacity-50 grayscale select-none">
                <div className="space-y-4 p-6 border rounded-lg border-border">
                    <h4 className="font-medium">Active Languages</h4>
                    <div className="space-y-2">
                        <div className="flex items-center justify-between p-2 rounded bg-muted/50">
                            <span>English (US)</span>
                            <span className="text-xs font-medium px-2 py-0.5 rounded bg-orange-500/20 text-orange-500">Default</span>
                        </div>
                        <div className="flex items-center justify-between p-2 rounded bg-muted/50">
                            <span>French</span>
                            <span className="text-xs text-muted-foreground">Disabled</span>
                        </div>
                    </div>
                </div>
                <div className="space-y-4 p-6 border rounded-lg border-border">
                    <h4 className="font-medium">Quick Translation</h4>
                    <p className="text-sm text-muted-foreground">Translate title, slogans and buttons on the fly.</p>
                </div>
            </div>
        </div>
    );
}
