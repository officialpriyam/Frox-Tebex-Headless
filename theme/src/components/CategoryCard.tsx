import { Link } from "wouter";
import { GlassCard } from "./GlassCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { TebexCategory } from "@data/schema";
import { ArrowRight, Package } from "lucide-react";

interface CategoryCardProps {
  category: TebexCategory;
  color?: string;
  logoUrl?: string;
}

export function CategoryCard({ category, color, logoUrl }: CategoryCardProps) {
  const packageCount = category.packages?.length || 0;

  return (
    <Link href={`/store?category=${category.id}`}>
      <div className="group relative h-full glass-card overflow-hidden">
        <div
          className="absolute -top-8 -right-8 w-24 h-24 blur-3xl opacity-20 group-hover:opacity-40 transition-opacity duration-500"
          style={{ backgroundColor: color || "hsl(var(--primary))" }}
        />

        <div className="relative p-6 flex flex-col h-full z-10">
          <div className="flex items-start justify-between mb-6">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-2xl transition-all duration-500 group-hover:scale-110 group-hover:rotate-3"
              style={{
                backgroundColor: color ? `${color}15` : "hsla(var(--primary) / 0.1)",
                border: `1px solid ${color ? `${color}30` : "hsla(var(--primary) / 0.2)"}`
              }}
            >
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt={category.name}
                  className="w-8 h-8 object-contain drop-shadow-md"
                />
              ) : (
                <Package
                  className="h-7 w-7 drop-shadow-md"
                  style={{ color: color || "hsl(var(--primary))" }}
                />
              )}
            </div>

            <div className="px-3 py-1 rounded-full bg-primary/5 border border-primary/10 text-[10px] font-bold uppercase tracking-tighter text-primary">
              {packageCount} {packageCount === 1 ? "Product" : "Products"}
            </div>
          </div>

          <h3 className="font-display font-bold text-xl mb-2 group-hover:text-primary transition-colors leading-tight">
            {category.name}
          </h3>

          {category.description && (
            <p className="text-sm text-muted-foreground/80 line-clamp-2 leading-relaxed mb-6 font-medium">
              {category.description.replace(/<[^>]*>/g, "")}
            </p>
          )}

          <div className="mt-auto flex items-center justify-between">
            <div className="flex items-center text-xs font-bold text-primary tracking-wide">
              Browse Category
              <ArrowRight className="ml-2 h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

export function CategoryCardSkeleton() {
  return (
    <GlassCard className="p-6">
      <div className="w-12 h-12 rounded-lg bg-white/10 animate-pulse mb-4" />
      <div className="h-5 w-3/4 bg-white/10 rounded animate-pulse mb-2" />
      <div className="h-4 w-full bg-white/5 rounded animate-pulse mb-2" />
      <div className="h-4 w-2/3 bg-white/5 rounded animate-pulse mb-4" />
      <div className="flex justify-between items-center">
        <div className="h-5 w-16 bg-white/10 rounded animate-pulse" />
        <div className="h-4 w-4 bg-white/5 rounded animate-pulse" />
      </div>
    </GlassCard>
  );
}
