import { useQuery } from "@tanstack/react-query";
import { Layout } from "@/components/Layout";
import { GlassCard } from "@/components/GlassCard";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Loader2, Search, HelpCircle } from "lucide-react";
import { useState } from "react";
import { FaqCategory, FaqItem } from "@data/schema";
import { Input } from "@/components/ui/input";
import { apiRequestJson } from "@/lib/queryClient";

export default function Faq() {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: categories, isLoading: catsLoading, isError: catsError } = useQuery<FaqCategory[]>({
    queryKey: ["/api/faq-categories"],
    queryFn: async () => apiRequestJson<FaqCategory[]>("GET", "/api/faq-categories"),
  });

  const { data: items, isLoading: itemsLoading, isError: itemsError } = useQuery<FaqItem[]>({
    queryKey: ["/api/faq-items"],
    queryFn: async () => apiRequestJson<FaqItem[]>("GET", "/api/faq-items"),
  });

  const isLoading = catsLoading || itemsLoading;
  const isError = catsError || itemsError;

  const filteredItems = items?.filter(item => 
    item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.answer.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const activeCategories = categories?.filter(c => c.active).sort((a,b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)) || [];

  return (
    <Layout>
      <div className="max-w-5xl mx-auto px-4 py-12 md:py-20 lg:px-8">
        <div className="text-center space-y-4 mb-16">
          <div className="inline-flex p-3 rounded-2xl bg-primary/10 text-primary mb-2 shadow-inner">
            <HelpCircle className="h-10 w-10" />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
            Frequently Asked <span className="text-primary">Questions</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto font-medium leading-relaxed">
            Everything you need to know about our server, community, and services.
          </p>

          <div className="max-w-xl mx-auto relative mt-8">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search for answers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 h-14 bg-card/40 border-border/50 text-lg rounded-xl shadow-lg focus:ring-primary/20"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-12 w-12 animate-spin text-primary opacity-50" />
          </div>
        ) : isError ? (
          <div className="py-20 text-center">
             <p className="text-destructive font-bold mb-2">Connection Issues</p>
             <p className="text-muted-foreground">Unable to retrieve FAQ data at this moment. Please try again later.</p>
          </div>
        ) : (
          <div className="space-y-12">
            {activeCategories.map((category) => {
              if (!category || !category.id) return null;
              
              const categoryItems = filteredItems.filter(i => i && i.categoryId === category.id && i.active);
              if (categoryItems.length === 0) return null;

              return (
                <div key={category.id} className="space-y-4">
                  <h2 className="text-2xl font-bold border-b border-primary/20 pb-2 text-primary uppercase tracking-widest text-sm">
                    {category.name || "General"}
                  </h2>
                  
                  <GlassCard className="overflow-hidden">
                    <Accordion type="single" collapsible className="w-full">
                      {categoryItems.sort((a,b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)).map((item) => (
                        <AccordionItem key={item.id} value={item.id || String(Math.random())} className="border-b-0">
                          <AccordionTrigger className="px-6 py-4 hover:bg-primary/5 transition-colors text-left font-semibold">
                            {item.question || "Untitled Question"}
                          </AccordionTrigger>
                          <AccordionContent className="px-6 pb-6 pt-2 text-muted-foreground leading-relaxed whitespace-pre-wrap">
                            {item.answer || "No answer provided."}
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </GlassCard>
                </div>
              );
            })}
            
            {(activeCategories.length === 0 || filteredItems.length === 0) && (
              <div className="py-20 text-center">
                <p className="text-muted-foreground text-lg italic">No matching questions found.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
