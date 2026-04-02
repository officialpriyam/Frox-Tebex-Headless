import { useSiteSettings } from "@/hooks/useSettings";
import { Layout, PageLoader } from "@/components/Layout";
import { GlassCard } from "@/components/GlassCard";

interface LegalPageProps {
    type: 'privacy' | 'terms';
}

export default function LegalPage({ type }: LegalPageProps) {
    const { data: settings, isLoading } = useSiteSettings();

    if (isLoading) return <PageLoader />;

    const title = type === 'privacy' ? 'Privacy Policy' : 'Terms of Service';
    const content = type === 'privacy'
        ? settings?.privacyPolicyContent
        : settings?.termsOfServiceContent;

    if (!content) {
        return (
            <Layout>
                <div className="min-h-[60vh] flex items-center justify-center p-8">
                    <GlassCard className="p-12 text-center max-w-2xl">
                        <h1 className="text-3xl font-display font-bold mb-4">{title} Not Found</h1>
                        <p className="text-muted-foreground">The manifest for this legal document has not been initialized.</p>
                    </GlassCard>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="py-20 px-4">
                <div className="max-w-4xl mx-auto space-y-8">
                    <div className="text-center space-y-4">
                        <h1 className="text-4xl sm:text-6xl font-display font-black tracking-tight text-glow uppercase italic">
                            {title}
                        </h1>
                        <div className="h-1 w-24 bg-primary mx-auto rounded-full" />
                    </div>

                    <GlassCard className="p-8 sm:p-12">
                        <div
                            className="prose prose-invert prose-emerald max-w-none prose-headings:font-display prose-headings:font-bold prose-p:text-muted-foreground/90 prose-p:leading-relaxed"
                            dangerouslySetInnerHTML={{ __html: content }}
                        />
                    </GlassCard>
                </div>
            </div>
        </Layout>
    );
}
