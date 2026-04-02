import { useState, useMemo } from "react";
import { useSearch } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Layout, PageLoader } from "@/components/Layout";
import { PackageCard, PackageCardSkeleton } from "@/components/PackageCard";
import { GlassCard } from "@/components/GlassCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCategoriesWithPackages } from "@/hooks/useTebex";
import { useSiteSettings } from "@/hooks/useSettings";
import { apiRequestJson } from "@/lib/queryClient";
import { cn } from "@/lib/utils";
import { Search, Filter, Grid3X3, Grid2X2, LayoutGrid, X, Target, TrendingUp, Shield, Gift, Ticket, Loader2 } from "lucide-react";
import type { TebexPackage } from "@data/schema";

interface TebexGoal {
  current: number;
  target: number;
  enabled: boolean;
  name?: string;
  description?: string;
}

interface GiftCardCheck {
  code: string | null;
  balance: number | null;
  initialBalance: number | null;
  currency: string | null;
  expiresAt: string | null;
  status: string | null;
}

interface CouponCheck {
  code: string | null;
  discount: number | null;
  discountType: "percent" | "amount" | null;
  minimumSpend: number | null;
  expiresAt: string | null;
  status: string | null;
}

function formatApiError(error: Error): string {
  const rawMessage = error.message || "Request failed";
  const separatorIndex = rawMessage.indexOf(":");
  const cleaned = separatorIndex >= 0 ? rawMessage.slice(separatorIndex + 1).trim() : rawMessage;

  try {
    const parsed = JSON.parse(cleaned);
    if (parsed?.message) {
      return String(parsed.message);
    }
  } catch {
    // Ignore JSON parse failures
  }

  return cleaned;
}

function formatDate(value: string | null): string | null {
  if (!value) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }
  return parsed.toLocaleDateString();
}

function formatAmount(value: number | null): string | null {
  if (value === null) return null;
  return value.toLocaleString();
}

function StoreGoalTracker() {
  const { data: goal, isLoading } = useQuery<TebexGoal>({
    queryKey: ["/api/store/goal"],
    refetchInterval: 60000,
  });
  const { data: settings } = useSiteSettings();
  const currencySymbol = settings?.currencySymbol || "$";

  if (isLoading || !goal?.enabled || goal.target <= 0) return null;

  const progress = Math.min((goal.current / goal.target) * 100, 100);

  return (
    <GlassCard className="p-6 mb-10 overflow-hidden relative group">
      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[80px] rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-primary/20 transition-colors duration-700" />

      <div className="relative z-10">
        <div className="flex flex-col sm:flex-row items-center gap-6 mb-6 text-center sm:text-left">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform duration-500">
            <Target className="h-8 w-8 text-primary animate-pulse" />
          </div>
          <div className="flex-1">
            <Badge variant="outline" className="mb-2 border-primary/30 text-primary bg-primary/5 px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest">Community Impact</Badge>
            <h3 className="text-2xl font-display font-bold leading-none">{goal.name || "Server Expansion"}</h3>
            <p className="text-muted-foreground/80 mt-1 font-medium">
              {goal.description || "Fueling the next evolution of our world together."}
            </p>
          </div>
          <div className="sm:text-right">
            <div className="flex items-baseline justify-center sm:justify-end gap-2">
              <span className="text-4xl font-display font-black text-primary">
                {currencySymbol}{goal.current?.toLocaleString()}
              </span>
              <span className="text-muted-foreground/60 text-sm font-bold">/ {currencySymbol}{goal.target?.toLocaleString()}</span>
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 mt-1">Capital Mobilized</p>
          </div>
        </div>

        <div className="relative pt-2">
          <div className="flex justify-between mb-3 text-[11px] font-black uppercase tracking-widest">
            <span className="text-primary flex items-center gap-1.5">
              <TrendingUp className="h-3.5 w-3.5" />
              {progress.toFixed(1)}% Operationalized
            </span>
            <span className="text-muted-foreground/60">
              {currencySymbol}{(goal.target - goal.current).toLocaleString()} Remaining
            </span>
          </div>
          <div className="h-4 w-full bg-white/5 rounded-full overflow-hidden border border-white/5 p-0.5">
            <div
              className="h-full bg-gradient-to-r from-primary via-primary to-primary/80 rounded-full relative"
              style={{ width: `${progress}%` }}
            >
              <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.2)_50%,transparent_75%)] bg-[length:40px_40px] animate-[shimmer_2s_linear_infinite]" />
            </div>
          </div>
        </div>
      </div>
    </GlassCard>
  );
}

type SortOption = "name-asc" | "name-desc" | "price-asc" | "price-desc";

export default function Store() {
  const searchParams = useSearch();
  const params = new URLSearchParams(searchParams);
  const categoryFromUrl = params.get("category");

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(categoryFromUrl);
  const [sortBy, setSortBy] = useState<SortOption>("name-asc");
  const [columns, setColumns] = useState(4);
  const [giftCardCode, setGiftCardCode] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [giftCardResult, setGiftCardResult] = useState<GiftCardCheck | null>(null);
  const [couponResult, setCouponResult] = useState<CouponCheck | null>(null);
  const [giftCardError, setGiftCardError] = useState<string | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);

  const { data: categories, isLoading: categoriesLoading } = useCategoriesWithPackages();
  const { data: settings } = useSiteSettings();
  const currencySymbol = settings?.currencySymbol || "$";

  const allPackages = useMemo(() => {
    if (!categories) return [];
    return categories.flatMap((cat) => cat.packages || []);
  }, [categories]);

  const filteredPackages = useMemo(() => {
    let result = [...allPackages];

    if (selectedCategory) {
      result = result.filter(
        (pkg) => pkg.category?.id?.toString() === selectedCategory
      );
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (pkg) =>
          pkg.name.toLowerCase().includes(query) ||
          pkg.description?.toLowerCase().includes(query)
      );
    }

    switch (sortBy) {
      case "name-asc":
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "name-desc":
        result.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case "price-asc":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        result.sort((a, b) => b.price - a.price);
        break;
    }

    return result;
  }, [allPackages, selectedCategory, searchQuery, sortBy]);

  const selectedCategoryName = categories?.find(
    (c) => c.id.toString() === selectedCategory
  )?.name;

  const gridColsClass = {
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
  }[columns] || "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4";

  const categoryGradients = [
    "from-emerald-500/20 to-teal-500/20 border-emerald-500/30",
    "from-blue-500/20 to-cyan-500/20 border-blue-500/30",
    "from-purple-500/20 to-pink-500/20 border-purple-500/30",
    "from-orange-500/20 to-amber-500/20 border-orange-500/30",
    "from-rose-500/20 to-red-500/20 border-rose-500/30",
    "from-indigo-500/20 to-violet-500/20 border-indigo-500/30",
  ];

  const giftCardCheckMutation = useMutation({
    mutationFn: async (code: string) => {
      return await apiRequestJson<{ giftcard: GiftCardCheck }>(
        "GET",
        `/api/store/giftcards/check?code=${encodeURIComponent(code)}`,
      );
    },
    onSuccess: (data) => {
      setGiftCardResult(data.giftcard);
      setGiftCardError(null);
    },
    onError: (error: Error) => {
      setGiftCardResult(null);
      setGiftCardError(formatApiError(error));
    },
  });

  const couponCheckMutation = useMutation({
    mutationFn: async (code: string) => {
      return await apiRequestJson<{ coupon: CouponCheck }>(
        "GET",
        `/api/store/coupons/check?code=${encodeURIComponent(code)}`,
      );
    },
    onSuccess: (data) => {
      setCouponResult(data.coupon);
      setCouponError(null);
    },
    onError: (error: Error) => {
      setCouponResult(null);
      setCouponError(formatApiError(error));
    },
  });

  const handleGiftCardCheck = () => {
    const trimmed = giftCardCode.trim();
    if (!trimmed) {
      setGiftCardResult(null);
      setGiftCardError("Gift card code is required");
      return;
    }
    giftCardCheckMutation.mutate(trimmed);
  };

  const handleCouponCheck = () => {
    const trimmed = couponCode.trim();
    if (!trimmed) {
      setCouponResult(null);
      setCouponError("Coupon code is required");
      return;
    }
    couponCheckMutation.mutate(trimmed);
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-12">
          <Badge variant="outline" className="mb-4 border-primary/20 text-primary bg-primary/5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-[0.2em]">The Central Depot</Badge>
          <h1 className="text-5xl sm:text-6xl font-display font-bold mb-4 tracking-tight" data-testid="store-title">
            The <span className="text-primary text-glow">Emporium</span>
          </h1>
          <p className="text-xl text-muted-foreground/80 max-w-2xl font-medium leading-relaxed">
            Equip yourself for the road ahead. Whether you're looking to redefine your status or just gearing up for your next big project, everything here directly fuels the server's growth.
          </p>
        </div>

        <StoreGoalTracker />

        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="lg:w-72 shrink-0">
            <div className="sticky top-24 space-y-6">
              <GlassCard className="p-6 bg-gradient-to-b from-white/5 to-transparent border-white/5">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/60">
                    Department Select
                  </h3>
                  <Filter className="h-4 w-4 text-primary/40" />
                </div>

                <div className="space-y-1.5">
                  <button
                    onClick={() => setSelectedCategory(null)}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group",
                      !selectedCategory
                        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                        : "hover:bg-white/5 text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <div className={cn(
                      "w-2 h-2 rounded-full transition-all duration-500",
                      !selectedCategory ? "bg-white scale-125 shadow-[0_0_10px_white]" : "bg-primary/40 group-hover:bg-primary"
                    )} />
                    <span className="text-sm font-bold flex-1 text-left">All Manifests</span>
                    <Badge variant={!selectedCategory ? "outline" : "secondary"} className={cn(
                      "text-[10px] font-black border-none transition-colors",
                      !selectedCategory ? "bg-white/20 text-white" : "bg-white/5 text-muted-foreground"
                    )}>
                      {allPackages.length}
                    </Badge>
                  </button>

                  {categoriesLoading ? (
                    Array(4).fill(0).map((_, i) => (
                      <div key={i} className="h-12 bg-white/5 rounded-xl animate-pulse" />
                    ))
                  ) : (
                    categories?.map((category) => {
                      const isActive = selectedCategory === category.id.toString();
                      return (
                        <button
                          key={category.id}
                          onClick={() => setSelectedCategory(category.id.toString())}
                          className={cn(
                            "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group",
                            isActive
                              ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                              : "hover:bg-white/5 text-muted-foreground hover:text-foreground"
                          )}
                        >
                          <div className={cn(
                            "w-2 h-2 rounded-full transition-all duration-500",
                            isActive ? "bg-white scale-125 shadow-[0_0_10px_white]" : "bg-primary/40 group-hover:bg-primary"
                          )} />
                          <span className="text-sm font-bold flex-1 text-left">{category.name}</span>
                          <Badge variant={isActive ? "outline" : "secondary"} className={cn(
                            "text-[10px] font-black border-none transition-colors",
                            isActive ? "bg-white/20 text-white" : "bg-white/5 text-muted-foreground"
                          )}>
                            {category.packages?.length || 0}
                          </Badge>
                        </button>
                      );
                    })
                  )}
                </div>
              </GlassCard>

              <GlassCard className="p-5 bg-gradient-to-br from-white/5 to-transparent border-white/5">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/60">
                    Redeem Console
                  </h3>
                  <Gift className="h-4 w-4 text-primary/40" />
                </div>

                <div className="space-y-5">
                  <div className="space-y-2">
                    <Label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground/60">
                      Gift Card
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Enter gift card code"
                        value={giftCardCode}
                        onChange={(e) => {
                          setGiftCardCode(e.target.value);
                          if (giftCardResult) setGiftCardResult(null);
                          if (giftCardError) setGiftCardError(null);
                        }}
                        className="bg-white/5 border-white/10 h-9"
                        data-testid="input-giftcard-code"
                      />
                      <Button
                        type="button"
                        size="sm"
                        className="h-9 px-4 font-black uppercase tracking-widest text-[10px]"
                        onClick={handleGiftCardCheck}
                        disabled={giftCardCheckMutation.isPending}
                        data-testid="button-check-giftcard"
                      >
                        {giftCardCheckMutation.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          "Check"
                        )}
                      </Button>
                    </div>
                    {giftCardResult && (
                      <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-[11px] text-emerald-200">
                        <div className="font-black uppercase tracking-widest text-emerald-300">
                          Gift card verified
                        </div>
                        <div className="mt-1 text-emerald-200/80">
                          {(() => {
                            const balanceValue = giftCardResult.balance ?? giftCardResult.initialBalance;
                            const balanceText = balanceValue !== null ? `${currencySymbol}${formatAmount(balanceValue)}` : null;
                            const expiresText = formatDate(giftCardResult.expiresAt);
                            return [
                              balanceText ? `Balance: ${balanceText}` : "Balance: Unavailable",
                              expiresText ? `Expires: ${expiresText}` : null,
                            ]
                              .filter(Boolean)
                              .join(" • ");
                          })()}
                        </div>
                      </div>
                    )}
                    {giftCardError && (
                      <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-[11px] text-red-200">
                        {giftCardError}
                      </div>
                    )}
                  </div>

                  <div className="h-px bg-white/5" />

                  <div className="space-y-2">
                    <Label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground/60">
                      Coupon
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Enter coupon code"
                        value={couponCode}
                        onChange={(e) => {
                          setCouponCode(e.target.value);
                          if (couponResult) setCouponResult(null);
                          if (couponError) setCouponError(null);
                        }}
                        className="bg-white/5 border-white/10 h-9"
                        data-testid="input-coupon-code"
                      />
                      <Button
                        type="button"
                        size="sm"
                        className="h-9 px-4 font-black uppercase tracking-widest text-[10px] bg-primary text-primary-foreground hover:bg-primary/90"
                        onClick={handleCouponCheck}
                        disabled={couponCheckMutation.isPending}
                        data-testid="button-check-coupon"
                      >
                        {couponCheckMutation.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <Ticket className="h-3.5 w-3.5 mr-1" />
                            Check
                          </>
                        )}
                      </Button>
                    </div>
                    {couponResult && (
                      <div className="rounded-lg border border-blue-500/30 bg-blue-500/10 px-3 py-2 text-[11px] text-blue-200">
                        <div className="font-black uppercase tracking-widest text-blue-300">
                          Coupon verified
                        </div>
                        <div className="mt-1 text-blue-200/80">
                          {(() => {
                            const discountValue = couponResult.discount;
                            const discountText = discountValue !== null
                              ? couponResult.discountType === "percent"
                                ? `${discountValue}% off`
                                : `${currencySymbol}${formatAmount(discountValue)} off`
                              : null;
                            const expiresText = formatDate(couponResult.expiresAt);
                            return [
                              discountText ? `Discount: ${discountText}` : "Discount: Unavailable",
                              couponResult.minimumSpend !== null
                                ? `Minimum: ${currencySymbol}${formatAmount(couponResult.minimumSpend)}`
                                : null,
                              expiresText ? `Expires: ${expiresText}` : null,
                            ]
                              .filter(Boolean)
                              .join(" • ");
                          })()}
                        </div>
                      </div>
                    )}
                    {couponError && (
                      <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-[11px] text-red-200">
                        {couponError}
                      </div>
                    )}
                  </div>
                </div>
                <p className="text-[10px] text-muted-foreground/50 leading-relaxed">
                  Gift card and coupon checks require your Tebex private key. Add it in Admin &gt; Tebex if these show errors.
                </p>
              </GlassCard>

              {/* Secure Trust Banner - Bespoke touch */}
              <div className="p-6 rounded-3xl border border-white/5 bg-gradient-to-br from-emerald-500/10 to-transparent">
                <Shield className="h-6 w-6 text-emerald-500 mb-3" />
                <h4 className="text-xs font-black uppercase tracking-widest text-emerald-500/80 mb-1">Encrypted Access</h4>
                <p className="text-[11px] text-muted-foreground/60 leading-relaxed font-medium">
                  All transactions are handled through secure, industry-standard protocols.
                </p>
              </div>
            </div>
          </aside>

          <div className="flex-1">
            <GlassCard className="p-4 mb-6 bg-gradient-to-r from-white/5 to-transparent">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search packages..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-white/5 border-white/10"
                    data-testid="input-search-packages"
                  />
                  {searchQuery && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                      onClick={() => setSearchQuery("")}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
                  <SelectTrigger className="w-full sm:w-48 bg-white/5 border-white/10" data-testid="select-sort">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name-asc">Name (A-Z)</SelectItem>
                    <SelectItem value="name-desc">Name (Z-A)</SelectItem>
                    <SelectItem value="price-asc">Price (Low to High)</SelectItem>
                    <SelectItem value="price-desc">Price (High to Low)</SelectItem>
                  </SelectContent>
                </Select>

                <div className="flex items-center gap-1 border border-white/10 rounded-md p-1">
                  <Button
                    variant={columns === 2 ? "secondary" : "ghost"}
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setColumns(2)}
                    data-testid="grid-2-cols"
                  >
                    <Grid2X2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={columns === 3 ? "secondary" : "ghost"}
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setColumns(3)}
                    data-testid="grid-3-cols"
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={columns === 4 ? "secondary" : "ghost"}
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setColumns(4)}
                    data-testid="grid-4-cols"
                  >
                    <LayoutGrid className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </GlassCard>

            {selectedCategory && selectedCategoryName && (
              <div className="flex items-center gap-2 mb-4">
                <span className="text-muted-foreground">Showing:</span>
                <Badge variant="outline" className="gap-1 bg-primary/10 text-primary border-primary/20">
                  {selectedCategoryName}
                  <button
                    onClick={() => setSelectedCategory(null)}
                    className="ml-1 hover:text-foreground"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              </div>
            )}

            <div className={`grid ${gridColsClass} gap-6`}>
              {categoriesLoading ? (
                Array(8).fill(0).map((_, i) => <PackageCardSkeleton key={i} />)
              ) : filteredPackages.length > 0 ? (
                filteredPackages.map((pkg) => (
                  <PackageCard key={pkg.id} pkg={pkg} />
                ))
              ) : (
                <div className="col-span-full py-24 flex flex-col items-center text-center">
                  <div className="w-20 h-20 rounded-3xl bg-white/5 flex items-center justify-center mb-6">
                    <Search className="h-10 w-10 text-muted-foreground/20" />
                  </div>
                  <h3 className="text-2xl font-display font-bold mb-2">Manifest Not Found</h3>
                  <p className="text-muted-foreground/60 max-w-sm font-medium mb-8">
                    No results match your search parameters. Try broadening your criteria or selecting a different department.
                  </p>
                  {(searchQuery || selectedCategory) && (
                    <Button
                      variant="outline"
                      className="rounded-xl px-8 border-white/10 hover:bg-white/5 font-bold"
                      onClick={() => {
                        setSearchQuery("");
                        setSelectedCategory(null);
                      }}
                    >
                      Reset All Filters
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
