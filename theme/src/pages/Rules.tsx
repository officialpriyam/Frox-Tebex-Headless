import { useQuery } from "@tanstack/react-query";
import { Layout, PageLoader } from "@/components/Layout";
import { GlassCard } from "@/components/GlassCard";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import type { Rule } from "@data/schema";
import { BookOpen, Scale, AlertTriangle, FileText } from "lucide-react";

export default function Rules() {
  const { data: rules, isLoading } = useQuery<Rule[]>({
    queryKey: ["/api/rules"],
  });

  const sortedRules = rules?.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0)) || [];

  const groupedRules = sortedRules.reduce((acc, rule) => {
    const category = rule.category || "General";
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(rule);
    return acc;
  }, {} as Record<string, Rule[]>);

  const categories = Object.keys(groupedRules);

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <section className="relative rounded-2xl overflow-hidden mb-12 bg-gradient-to-r from-amber-500/20 via-amber-500/10 to-transparent p-8 md:p-12">
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-xl bg-amber-500/20">
                <Scale className="h-8 w-8 text-amber-500" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold" data-testid="rules-title">Server Rules</h1>
            </div>
            <p className="text-xl text-muted-foreground/80 max-w-2xl font-medium leading-relaxed">
              Our rules are here to keep the game fair and the community decent. By following them, you help us maintain a world everyone actually wants to play in.
            </p>
          </div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl" />
        </section>

        <GlassCard className="p-6 mb-8">
          <div className="flex items-start gap-4">
            <div className="p-2 rounded-lg bg-yellow-500/20 shrink-0">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
            </div>
            <div>
              <h3 className="font-semibold mb-1">Important Notice</h3>
              <p className="text-muted-foreground text-sm font-medium">
                Fair play is non-negotiable. Breaking these guidelines results in mutes, kicks, or bans depending on impact. Staff decisions are final—if you're unsure about a rule, just ask in Discord.
              </p>
            </div>
          </div>
        </GlassCard>

        {isLoading ? (
          <div className="space-y-4">
            {Array(3).fill(0).map((_, i) => (
              <GlassCard key={i} className="p-6">
                <div className="h-6 w-48 bg-white/10 rounded animate-pulse mb-4" />
                <div className="space-y-2">
                  <div className="h-4 w-full bg-white/5 rounded animate-pulse" />
                  <div className="h-4 w-3/4 bg-white/5 rounded animate-pulse" />
                </div>
              </GlassCard>
            ))}
          </div>
        ) : categories.length > 0 ? (
          <div className="space-y-6">
            {categories.map((category) => (
              <GlassCard key={category} className="overflow-hidden" data-testid={`rules-category-${category.toLowerCase().replace(/\s+/g, "-")}`}>
                <div className="p-4 border-b border-white/10 flex items-center gap-3">
                  <BookOpen className="h-5 w-5 text-primary" />
                  <h2 className="font-semibold text-lg">{category}</h2>
                  <Badge variant="outline" className="ml-auto bg-primary/10 text-primary border-primary/20">
                    {groupedRules[category].length} {groupedRules[category].length === 1 ? "rule" : "rules"}
                  </Badge>
                </div>

                <Accordion type="single" collapsible className="px-4">
                  {groupedRules[category].map((rule, index) => (
                    <AccordionItem
                      key={rule.id}
                      value={rule.id}
                      className="border-white/10"
                    >
                      <AccordionTrigger className="py-4 hover:no-underline">
                        <div className="flex items-center gap-3 text-left">
                          <span className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-sm font-medium text-primary shrink-0">
                            {index + 1}
                          </span>
                          <span className="font-medium">{rule.title}</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="pl-10 pb-4">
                        <div
                          className="text-muted-foreground prose prose-sm dark:prose-invert max-w-none"
                          dangerouslySetInnerHTML={{ __html: rule.content }}
                        />
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </GlassCard>
            ))}
          </div>
        ) : (
          <GlassCard className="p-12 text-center">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold text-lg mb-2">No Rules Yet</h3>
            <p className="text-muted-foreground">
              Server rules haven't been configured yet. Check back later!
            </p>
          </GlassCard>
        )}
      </div>
    </Layout>
  );
}
