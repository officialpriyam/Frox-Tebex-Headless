import { useQuery } from "@tanstack/react-query";
import { type Page } from "@data/schema";
import { PageLoader } from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { FileText, Calendar, Clock } from "lucide-react";
import { format } from "date-fns";

interface CustomPageProps {
    params: {
        slug: string;
    };
}

export default function CustomPage({ params }: CustomPageProps) {
    const { slug } = params;

    const { data: page, isLoading, error } = useQuery<Page>({
        queryKey: [`/api/pages/${slug}`],
    });

    if (isLoading) return <PageLoader />;

    if (error || !page) {
        return (
            <div className="container mx-auto px-4 py-20">
                <Card className="p-8 text-center bg-card/50 backdrop-blur-xl border-border/50">
                    <FileText className="h-16 w-16 mx-auto mb-4 opacity-20" />
                    <h1 className="text-3xl font-bold mb-2">Manifest Not Found</h1>
                    <p className="text-muted-foreground">The content you are looking for has been moved or lost in the archive.</p>
                </Card>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-16 animate-fade-in">
            <div className="max-w-4xl mx-auto space-y-8">
                {/* Header Section */}
                <div className="space-y-4">
                    <h1 className="text-5xl font-black tracking-tight bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent italic">
                        {page.title}
                    </h1>
                    <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground font-mono uppercase tracking-widest">
                        <div className="flex items-center gap-2">
                            <Calendar className="h-3 w-3" />
                            {page.createdAt ? format(new Date(page.createdAt), "MMM d, yyyy") : "Archive Date Unknown"}
                        </div>
                        <div className="flex items-center gap-2">
                            <Clock className="h-3 w-3" />
                            {page.updatedAt ? format(new Date(page.updatedAt), "HH:mm") : "Last Modified Unknown"}
                        </div>
                        <div className="px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 text-[10px] font-black">
                            Verified Manifest
                        </div>
                    </div>
                </div>

                <Separator className="bg-white/5 h-[2px]" />

                {/* Content Area */}
                <Card className="p-10 bg-card/30 backdrop-blur-2xl border-white/5 rounded-3xl overflow-hidden shadow-2xl relative">
                    {/* Subtle Background Aesthetic */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent/5 rounded-full blur-[100px] pointer-events-none" />

                    <div
                        className="prose prose-invert max-w-none prose-headings:font-display prose-headings:font-black prose-headings:tracking-tight prose-p:text-muted-foreground/90 prose-p:leading-relaxed prose-strong:text-foreground prose-strong:font-bold prose-a:text-primary prose-a:no-underline hover:prose-a:underline font-medium text-lg relative z-10"
                        dangerouslySetInnerHTML={{ __html: page.content }}
                    />
                </Card>

                {/* Footer Polish */}
                <div className="pt-8 text-center">
                    <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.3em] opacity-40">
                        End of Transmission • Reference UID: {page.id.slice(0, 8)}
                    </p>
                </div>
            </div>
        </div>
    );
}
