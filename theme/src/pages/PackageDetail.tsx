import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Layout, PageLoader } from "@/components/Layout";
import { GlassCard } from "@/components/GlassCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useSiteSettings } from "@/hooks/useSettings";
import { useAuth } from "@/hooks/useAuth";
import { apiRequestJson } from "@/lib/queryClient";
import type { TebexPackage } from "@data/schema";
import {
  ArrowLeft,
  ShoppingCart,
  Minus,
  Plus,
  Loader2,
  Check,
  Shield,
  Zap,
  Gift,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { Link } from "wouter";

export default function PackageDetail() {
  const params = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();
  const { data: settings } = useSiteSettings();
  const currencySymbol = settings?.currencySymbol || "$";

  const [quantity, setQuantity] = useState(1);
  const [username, setUsername] = useState("");
  const [selectedVariation, setSelectedVariation] = useState<string>("");

  const { data: pkg, isLoading } = useQuery<TebexPackage>({
    queryKey: ["/api/store/packages", params.id],
    enabled: !!params.id,
  });

  const purchaseMutation = useMutation({
    mutationFn: async (data: { packageId: number; username: string; quantity: number }) => {
      return await apiRequestJson("POST", "/api/checkout", data);
    },
    onSuccess: (data: any) => {
      console.log("Checkout response data:", data);
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        toast({
          title: "Error",
          description: "Failed to create checkout session",
          variant: "destructive",
        });
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Checkout Failed",
        description: error.message || "Failed to proceed to checkout",
        variant: "destructive",
      });
    },
  });

  const handlePurchase = () => {
    const purchaseUsername = isAuthenticated && user?.minecraftUsername
      ? user.minecraftUsername
      : username.trim();

    if (!purchaseUsername) {
      toast({
        title: "Username Required",
        description: "Please enter your Minecraft username",
        variant: "destructive",
      });
      return;
    }

    if (!pkg) return;

    purchaseMutation.mutate({
      packageId: pkg.id,
      username: purchaseUsername,
      quantity,
    });
  };

  if (isLoading) {
    return (
      <Layout>
        <PageLoader />
      </Layout>
    );
  }

  if (!pkg) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Package Not Found</h1>
          <p className="text-muted-foreground mb-8">
            The package you're looking for doesn't exist or has been removed.
          </p>
          <Link href="/store">
            <Button>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Store
            </Button>
          </Link>
        </div>
      </Layout>
    );
  }

  const hasDiscount = pkg.sale?.active && pkg.sale?.discount;
  const discountedPrice = hasDiscount
    ? pkg.price * (1 - (pkg.sale?.discount || 0) / 100)
    : pkg.price;
  const totalPrice = discountedPrice * quantity;

  const quantitySelectionIds = settings?.quantitySelectionIds || [];
  const showQuantitySelector = quantitySelectionIds.includes(pkg.id.toString());

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 py-8">
        <Link href="/store">
          <Button variant="ghost" className="mb-6 gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Store
          </Button>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <GlassCard className="overflow-hidden border-white/5 shadow-2xl">
              <div className="aspect-square relative flex items-center justify-center p-8 bg-gradient-to-br from-primary/10 to-transparent">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(var(--primary-rgb),0.1),transparent_70%)]" />

                {hasDiscount && (
                  <div className="absolute top-6 left-6 z-20">
                    <Badge variant="destructive" className="bg-destructive text-white px-4 py-1.5 rounded-xl font-black text-sm shadow-xl shadow-destructive/20 animate-pulse">
                      -{pkg.sale?.discount}% SAVINGS
                    </Badge>
                  </div>
                )}

                {pkg.image ? (
                  <img
                    src={pkg.image}
                    alt={pkg.name}
                    className="w-full h-full object-contain relative z-10 drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-transform duration-700 hover:scale-105"
                  />
                ) : (
                  <div className="relative z-10 w-48 h-48 rounded-[2.5rem] bg-primary/10 border border-primary/20 flex items-center justify-center shadow-inner">
                    <Sparkles className="h-24 w-24 text-primary opacity-40" />
                  </div>
                )}
              </div>
            </GlassCard>
          </div>

          <div>
            <div className="mb-10">
              {pkg.category?.name && (
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/60">
                    {pkg.category.name} Department
                  </span>
                </div>
              )}
              <h1 className="text-4xl md:text-5xl font-display font-bold mb-6 tracking-tight leading-tight" data-testid="package-title">
                {pkg.name}
              </h1>

              <div className="relative group inline-block mb-8">
                <div className="absolute -inset-4 bg-primary/20 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-full" />
                <div className="relative flex items-baseline gap-4">
                  <span className="text-6xl font-display font-black text-primary drop-shadow-[0_0_15px_hsla(var(--primary)/0.3)]">
                    {currencySymbol}{(discountedPrice ?? 0).toFixed(2)}
                  </span>
                  {hasDiscount && (
                    <div className="flex flex-col">
                      <span className="text-sm font-black text-destructive uppercase tracking-tighter">Limited Offer</span>
                      <span className="text-xl text-muted-foreground/40 line-through font-bold decoration-destructive/30">
                        {currencySymbol}{(pkg.price ?? 0).toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {pkg.description && (
                <div className="relative p-6 rounded-2xl bg-black/40 border border-white/5 shadow-inner">
                  <div className="absolute top-0 left-0 w-1 h-full bg-primary/40 rounded-full" />
                  <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground font-medium leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: pkg.description }}
                  />
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              <div className="p-4 rounded-2xl border border-white/5 bg-black/40 group hover:bg-black/60 transition-colors">
                <Shield className="h-5 w-5 text-primary mb-3 group-hover:scale-110 transition-transform" />
                <h4 className="text-[10px] font-black uppercase tracking-widest mb-1">Encrypted</h4>
                <p className="text-[11px] text-muted-foreground/60 font-medium">End-to-end secure stack</p>
              </div>
              <div className="p-4 rounded-2xl border border-white/5 bg-black/40 group hover:bg-black/60 transition-colors">
                <Zap className="h-5 w-5 text-amber-500 mb-3 group-hover:scale-110 transition-transform" />
                <h4 className="text-[10px] font-black uppercase tracking-widest mb-1">Logistics</h4>
                <p className="text-[11px] text-muted-foreground/60 font-medium">Instant asset deployment</p>
              </div>
              <div className="p-4 rounded-2xl border border-white/5 bg-black/40 group hover:bg-black/60 transition-colors">
                <Check className="h-5 w-5 text-emerald-500 mb-3 group-hover:scale-110 transition-transform" />
                <h4 className="text-[10px] font-black uppercase tracking-widest mb-1">Service</h4>
                <p className="text-[11px] text-muted-foreground/60 font-medium">24/7 Priority support</p>
              </div>
            </div>

            <GlassCard className="p-6 space-y-6">
              {!isAuthenticated && (
                <div className="space-y-2">
                  <Label htmlFor="username">Minecraft Username</Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="Enter your username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="bg-white/5 border-white/10"
                    data-testid="input-purchase-username"
                  />
                </div>
              )}

              {isAuthenticated && user?.minecraftUsername && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                  <Check className="h-4 w-4 text-green-500" />
                  <span className="text-sm">
                    Purchasing as <strong>{user.minecraftUsername}</strong>
                  </span>
                </div>
              )}

              {showQuantitySelector && (
                <div className="space-y-2">
                  <Label>Quantity</Label>
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                      data-testid="button-decrease-quantity"
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-12 text-center font-semibold text-lg">
                      {quantity}
                    </span>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setQuantity(quantity + 1)}
                      data-testid="button-increase-quantity"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              <div className="pt-6 border-t border-white/5">
                <div className="flex items-center justify-between mb-8 px-2">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">Acquisition Total</span>
                    <span className="text-3xl font-display font-black text-primary drop-shadow-[0_0_10px_hsla(var(--primary)/0.2)]">
                      {currencySymbol}{(totalPrice ?? 0).toFixed(2)}
                    </span>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                    <ShoppingCart className="h-5 w-5 text-primary" />
                  </div>
                </div>

                <Button
                  className="w-full h-16 text-lg font-black uppercase tracking-widest bg-primary hover:bg-primary/90 rounded-2xl shadow-xl shadow-primary/20 active:scale-[0.98] transition-all group overflow-hidden relative"
                  onClick={handlePurchase}
                  disabled={purchaseMutation.isPending}
                  data-testid="button-purchase"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                  <span className="relative z-10 flex items-center gap-3">
                    {purchaseMutation.isPending ? (
                      <>
                        <Loader2 className="h-6 w-6 animate-spin" />
                        Synchronizing...
                      </>
                    ) : (
                      <>
                        Buy Now
                        <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </span>
                </Button>

                <p className="text-[9px] text-center mt-6 font-black uppercase tracking-[0.3em] text-muted-foreground/30 px-8">
                  By proceeding, you acknowledge the terms of the server manifest.
                </p>
              </div>
            </GlassCard>
          </div>
        </div>
      </div>
    </Layout>
  );
}
