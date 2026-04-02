import { Link } from "wouter";
import { GlassCard } from "./GlassCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSiteSettings } from "@/hooks/useSettings";
import type { TebexPackage } from "@data/schema";
import { ShoppingCart, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface PackageCardProps {
  pkg: TebexPackage;
  featured?: boolean;
}

export function PackageCard({ pkg, featured }: PackageCardProps) {
  const { data: settings } = useSiteSettings();
  const price = pkg.price;
  const hasDiscount = pkg.sale?.active;
  const discountedPrice = hasDiscount ? price * (1 - pkg.sale!.discount / 100) : price;
  const currencySymbol = settings?.currencySymbol || "$";

  return (
    <Link href={`/store/package/${pkg.id}`}>
      <div
        className={cn(
          "glass-card group flex flex-col h-full bg-muted/30 hover:bg-muted/40",
          featured ? "border-primary/30 ring-1 ring-primary/10 shadow-primary/5" : "border-border/40",
          settings?.packageClickAnimation && "active:scale-95"
        )}
        data-testid={`package-card-${pkg.id}`}
      >
        <div className="relative aspect-square overflow-hidden rounded-t-[0.75rem] m-2">
          {featured && (
            <div className="absolute top-3 left-3 z-20">
              <div className="px-3 py-1 rounded-full bg-primary/90 backdrop-blur-md text-[10px] font-bold text-primary-foreground flex items-center gap-1 shadow-lg animate-pulse">
                <Sparkles className="h-3 w-3" />
                ELITE CHOICE
              </div>
            </div>
          )}

          {hasDiscount && (
            <div className="absolute top-3 right-3 z-20">
              <div className="px-2.5 py-1 rounded-lg bg-destructive text-white text-[11px] font-black shadow-lg">
                SAVE {pkg.sale?.discount}%
              </div>
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10" />

          {pkg.image ? (
            <img
              src={pkg.image}
              alt={pkg.name}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-muted/30">
              <ShoppingCart className="h-10 w-10 text-muted-foreground/30" />
            </div>
          )}

          <div className="absolute bottom-4 left-4 right-4 z-20 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
            <Button size="sm" className="w-full h-9 rounded-xl font-bold bg-primary text-primary-foreground hover:bg-primary/90 shadow-xl border-none">
              Details
            </Button>
          </div>
        </div>

        <div className="p-6 flex flex-col flex-1">
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              {pkg.category?.name && (
                <span className="text-[10px] font-black uppercase tracking-widest text-primary/60">
                  {pkg.category.name}
                </span>
              )}
            </div>

            <h3 className="font-display font-bold text-xl group-hover:text-primary transition-colors line-clamp-1 leading-tight">
              {pkg.name}
            </h3>

            <p className="text-sm text-muted-foreground/80 line-clamp-2 font-medium leading-relaxed">
              {pkg.description?.replace(/<[^>]*>/g, "") || "A specialized enhancement hand-crafted to elevate your journey on the server."}
            </p>
          </div>

          <div className="mt-6 pt-6 border-t border-border/30 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-xs font-bold text-muted-foreground/60 uppercase tracking-tighter -mb-1">Investment</span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-display font-black text-primary">
                  {currencySymbol}{discountedPrice.toFixed(2)}
                </span>
                {hasDiscount && (
                  <span className="text-xs text-muted-foreground line-through font-medium opacity-60">
                    {currencySymbol}{price.toFixed(2)}
                  </span>
                )}
              </div>
            </div>

            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300">
              <ShoppingCart className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

export function PackageCardSkeleton() {
  return (
    <GlassCard className="overflow-hidden">
      <div className="aspect-square bg-white/5 animate-pulse" />
      <div className="p-4 space-y-3">
        <div className="h-5 bg-white/10 rounded animate-pulse" />
        <div className="h-4 w-2/3 bg-white/5 rounded animate-pulse" />
        <div className="h-8 bg-white/10 rounded animate-pulse" />
        <div className="flex justify-between items-center">
          <div className="h-6 w-16 bg-white/10 rounded animate-pulse" />
          <div className="h-8 w-16 bg-white/10 rounded animate-pulse" />
        </div>
      </div>
    </GlassCard>
  );
}
