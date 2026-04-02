import { useState } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useSiteSettings, useSocialLinks } from "@/hooks/useSettings";
import { useFeaturedPackages, useCategoriesWithPackages } from "@/hooks/useTebex";
import { Layout } from "@/components/Layout";
import { GlassCard } from "@/components/GlassCard";
import { PackageCard, PackageCardSkeleton } from "@/components/PackageCard";
import { CategoryCard, CategoryCardSkeleton } from "@/components/CategoryCard";
import { GoalTracker } from "@/components/GoalTracker";
import { AnnouncementsSection } from "@/components/AnnouncementsSection";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowRight,
  Users,
  Shield,
  Play,
  Copy,
  Check,
  Server,
  Smartphone,
  Newspaper,
  Calendar
} from "lucide-react";
import { SiDiscord } from "react-icons/si";
import type { Blog } from "@data/schema";

interface ServerStatus {
  online: boolean;
  players: {
    online: number;
    max: number;
  };
  version: string | null;
  motd: string | null;
  icon: string | null;
}

function StatusDot({ online }: { online: boolean }) {
  return (
    <div
      className={`w-3 h-3 rounded-full ${online ? "bg-green-500" : "bg-red-500"
        }`}
    />
  );
}

function ServerStatusCard() {
  const { data: serverStatus, isLoading, isError } = useQuery<ServerStatus>({
    queryKey: ["/api/server-status"],
    refetchInterval: 30000,
    retry: 1,
  });

  if (isLoading) {
    return (
      <GlassCard className="p-4">
        <div className="flex items-center gap-3">
          <Skeleton className="w-3 h-3 rounded-full" />
          <Skeleton className="h-4 w-24" />
        </div>
      </GlassCard>
    );
  }

  const isOnline = !isError && serverStatus?.online === true;

  return (
    <GlassCard className="p-4" data-testid="card-server-status">
      <div className="flex items-center gap-3">
        <StatusDot online={isOnline} />
        <div>
          <p className="font-medium text-sm">
            {isOnline ? "Server Online" : "Server Offline"}
          </p>
          {isOnline && serverStatus && (
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Users className="w-3 h-3" />
              {serverStatus.players.online} / {serverStatus.players.max} players
            </p>
          )}
        </div>
      </div>
    </GlassCard>
  );
}

function ServerIPCard() {
  const { data: settings } = useSiteSettings();
  const { toast } = useToast();
  const [copiedJava, setCopiedJava] = useState(false);
  const [copiedBedrock, setCopiedBedrock] = useState(false);

  const copyIp = async (ip: string, type: "java" | "bedrock") => {
    await navigator.clipboard.writeText(ip);
    if (type === "java") {
      setCopiedJava(true);
      setTimeout(() => setCopiedJava(false), 2000);
    } else {
      setCopiedBedrock(true);
      setTimeout(() => setCopiedBedrock(false), 2000);
    }
    toast({
      title: "Copied!",
      description: "Server IP copied to clipboard",
    });
  };

  if (!settings?.javaServerIp) return null;

  return (
    <GlassCard className="p-4" data-testid="card-server-ip">
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Server className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium">Java</span>
          <code className="flex-1 px-2 py-1 rounded bg-black/20 dark:bg-white/5 font-mono text-xs truncate">
            {settings.javaServerIp}
          </code>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => copyIp(settings.javaServerIp!, "java")}
            data-testid="button-copy-java"
          >
            {copiedJava ? (
              <Check className="h-3 w-3 text-green-500" />
            ) : (
              <Copy className="h-3 w-3" />
            )}
          </Button>
        </div>
        {settings.bedrockSupport && settings.bedrockServerIp && (
          <div className="flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">Bedrock</span>
            <code className="flex-1 px-2 py-1 rounded bg-black/20 dark:bg-white/5 font-mono text-xs truncate">
              {settings.bedrockServerIp}:{settings.bedrockPort}
            </code>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => copyIp(`${settings.bedrockServerIp}:${settings.bedrockPort}`, "bedrock")}
              data-testid="button-copy-bedrock"
            >
              {copiedBedrock ? (
                <Check className="h-3 w-3 text-green-500" />
              ) : (
                <Copy className="h-3 w-3" />
              )}
            </Button>
          </div>
        )}
      </div>
    </GlassCard>
  );
}

export default function Home() {
  const { data: settings, isLoading: settingsLoading } = useSiteSettings();
  const { data: featuredPackages, isLoading: featuredLoading } = useFeaturedPackages();
  const { data: categories, isLoading: categoriesLoading } = useCategoriesWithPackages();
  const { data: socialLinks } = useSocialLinks();
  const { data: featuredBlogs, isLoading: blogsLoading } = useQuery<Blog[]>({
    queryKey: ["/api/blogs/featured"],
  });

  const discordLink = socialLinks?.find(l => l.platform.toLowerCase() === "discord");
  const categoryColors = settings?.categoryColors || {};
  const categoryLogos = settings?.categoryLogos || {};
  const showHomeAbout = !!settings?.homeAboutEnabled && (!!settings?.homeAboutTitle || !!settings?.homeAboutContent);

  return (
    <Layout>
      <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden px-4 py-20">
        {/* Bespoke Background Treatment */}
        {settings?.heroImageUrl && (
          <div className="absolute inset-0 z-0">
            <div
              className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-105 animate-subtle-zoom"
              style={{
                backgroundImage: `url(${settings.heroImageUrl})`,
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-background/10 via-background/40 to-background z-10" />
          </div>
        )}

        <div className="relative z-30 w-full max-w-7xl mx-auto">
          <div className="flex flex-col items-center text-center space-y-8">
            {/* Logo with enhanced glow */}
            <div className="relative group">
              <div className="absolute -inset-4 bg-primary/20 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              {settings?.logoUrl ? (
                <img
                  src={settings.logoUrl}
                  alt="Server Logo"
                  className="relative w-32 h-32 sm:w-48 sm:h-48 mx-auto object-contain drop-shadow-2xl animate-float"
                  data-testid="img-server-logo"
                />
              ) : (
                <div className="relative w-24 h-24 sm:w-32 sm:h-32 mx-auto rounded-3xl bg-primary flex items-center justify-center shadow-2xl shadow-primary/20 animate-float">
                  <Server className="w-12 h-12 sm:w-16 sm:h-16 text-primary-foreground" />
                </div>
              )}
            </div>

            {/* Hero Text with premium typography */}
            <div className="space-y-4 max-w-3xl mx-auto">
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-display font-bold tracking-tight text-glow leading-[1.1]">
                Welcome to <span className="text-primary">{settings?.appName || "FunBlocks"}</span>
              </h1>
              <p className="text-lg sm:text-xl text-muted-foreground/80 font-medium max-w-2xl mx-auto leading-relaxed">
                Built for the players, by the players. Join a community that values the craft, the chaos, and the collective journey.
              </p>
            </div>

            {/* Humanized Action Row - IP and Discord side-by-side */}
            <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
              <div className="hidden sm:block">
                <ServerIPCard />
              </div>
              {discordLink && (
                <a href={discordLink.url} target="_blank" rel="noopener noreferrer" className="block">
                  <GlassCard className="p-4 group hover:bg-white/5 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-[#5865F2]/10 text-[#5865F2] group-hover:bg-[#5865F2] group-hover:text-white transition-colors">
                        <SiDiscord className="w-5 h-5" />
                      </div>
                      <div className="text-left">
                        <p className="text-[10px] uppercase tracking-widest font-black opacity-50">Community</p>
                        <p className="text-sm font-bold">Join Discord</p>
                      </div>
                    </div>
                  </GlassCard>
                </a>
              )}
            </div>

            {/* Server Status - Moved Above CTA */}
            <div className="pt-4">
              <ServerStatusCard />
            </div>

            {/* Primary CTA - Moved Down */}
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent z-40" />
      </section>

      {settings?.goalEnabled && (
        <section className="py-10 sm:py-14 px-4">
          <div className="max-w-7xl mx-auto">
            <GoalTracker />
          </div>
        </section>
      )}

      {showHomeAbout && (
        <section className="py-14 sm:py-20 px-4 relative">
          <div className="max-w-6xl mx-auto">
            <GlassCard className="p-8 sm:p-10 bg-gradient-to-br from-primary/5 via-transparent to-transparent">
              <div className="max-w-3xl">
                <Badge variant="outline" className="px-4 py-1.5 rounded-full border-primary/20 bg-primary/5 text-primary text-xs font-bold uppercase tracking-widest">
                  About
                </Badge>
                <h2 className="text-3xl sm:text-4xl font-display font-bold mt-4 mb-3">
                  {settings?.homeAboutTitle || "About the Server"}
                </h2>
                {settings?.homeAboutContent && (
                  <p className="text-lg text-muted-foreground/80 leading-relaxed whitespace-pre-line">
                    {settings.homeAboutContent}
                  </p>
                )}
              </div>
            </GlassCard>
          </div>
        </section>
      )}

      <section className="py-20 sm:py-32 px-4 relative">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row items-end justify-between gap-6 mb-12 sm:mb-16">
            <div className="space-y-4">
              <Badge variant="outline" className="px-4 py-1.5 rounded-full border-primary/20 bg-primary/5 text-primary text-xs font-bold uppercase tracking-widest">
                Our Collection
              </Badge>
              <h2 className="text-4xl sm:text-5xl font-display font-bold flex items-center gap-4">
                Exclusive <span className="text-primary">Packages</span>
              </h2>
              <p className="text-lg text-muted-foreground/80 max-w-xl">
                Unlock unique perks, powerful gear, and cosmetic upgrades to stand out in the community.
              </p>
            </div>
            <Link href="/store">
              <Button variant="outline" className="h-12 px-6 gap-2 rounded-xl border-border/50 bg-background/50 backdrop-blur-sm hover:translate-x-1 transition-all duration-300" data-testid="link-view-all-packages">
                View All Collection
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
            {featuredLoading ? (
              Array(4).fill(0).map((_, i) => <PackageCardSkeleton key={i} />)
            ) : featuredPackages && featuredPackages.length > 0 ? (
              featuredPackages.slice(0, 4).map((pkg) => (
                <PackageCard key={pkg.id} pkg={pkg} featured />
              ))
            ) : (
              <div className="col-span-full text-center py-20 glass-card">
                <p className="text-muted-foreground font-medium">No featured packages available at the moment.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Announcements */}
      <AnnouncementsSection />

      <section className="py-20 sm:py-32 px-4 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center space-y-4 mb-16">
            <Badge variant="outline" className="px-4 py-1.5 rounded-full border-primary/20 bg-primary/5 text-primary text-xs font-bold uppercase tracking-widest">
              Categories
            </Badge>
            <h2 className="text-4xl sm:text-5xl font-display font-bold">Browse our <span className="text-primary">Department</span></h2>
            <p className="text-lg text-muted-foreground/80 max-w-2xl mx-auto">
              Find exactly what you need by exploring our specialized categories.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
            {categoriesLoading ? (
              Array(3).fill(0).map((_, i) => <CategoryCardSkeleton key={i} />)
            ) : categories && categories.length > 0 ? (
              categories.slice(0, 6).map((category, index) => (
                <CategoryCard
                  key={category.id}
                  category={category}
                  color={categoryColors[(index + 1).toString()]}
                  logoUrl={categoryLogos[(index + 1).toString()]}
                />
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="text-muted-foreground">No categories available</p>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="py-10 sm:py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
            <GlassCard className="p-4 sm:p-6 text-center">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <Shield className="h-6 w-6 sm:h-7 sm:w-7 text-primary" />
              </div>
              <h3 className="font-semibold text-base sm:text-lg mb-2">Secure Payments</h3>
              <p className="text-muted-foreground text-xs sm:text-sm">
                All transactions are processed securely through Tebex
              </p>
            </GlassCard>

            <GlassCard className="p-4 sm:p-6 text-center">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg bg-green-500/10 flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <Play className="h-6 w-6 sm:h-7 sm:w-7 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="font-semibold text-base sm:text-lg mb-2">Instant Delivery</h3>
              <p className="text-muted-foreground text-xs sm:text-sm">
                Purchases are delivered automatically within minutes
              </p>
            </GlassCard>

            <GlassCard className="p-4 sm:p-6 text-center sm:col-span-2 md:col-span-1">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg bg-blue-500/10 flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <Users className="h-6 w-6 sm:h-7 sm:w-7 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="font-semibold text-base sm:text-lg mb-2">24/7 Support</h3>
              <p className="text-muted-foreground text-xs sm:text-sm">
                Get help anytime through our Discord server
              </p>
            </GlassCard>
          </div>
        </div>
      </section>

      {
        featuredBlogs && featuredBlogs.length > 0 && (
          <section className="py-10 sm:py-16 px-4">
            <div className="max-w-7xl mx-auto">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-6 sm:mb-8">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
                    <Newspaper className="h-5 w-5 sm:h-7 sm:w-7 text-primary" />
                    Latest News
                  </h2>
                  <p className="text-muted-foreground text-sm sm:text-base mt-1">Stay updated with our latest announcements</p>
                </div>
                <Link href="/blogs">
                  <Button variant="ghost" className="gap-2" data-testid="link-view-all-blogs">
                    View All
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {blogsLoading ? (
                  Array(3).fill(0).map((_, i) => (
                    <GlassCard key={i} className="p-6">
                      <Skeleton className="h-40 w-full mb-4" />
                      <Skeleton className="h-6 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-full" />
                    </GlassCard>
                  ))
                ) : (
                  featuredBlogs.slice(0, 3).map((blog) => (
                    <Link key={blog.id} href={`/blog/${blog.slug}`}>
                      <GlassCard className="overflow-hidden hover:bg-white/10 transition-all cursor-pointer group h-full flex flex-col" data-testid={`card-blog-${blog.id}`}>
                        {blog.imageUrl && (
                          <div className="relative h-40 overflow-hidden">
                            <img
                              src={blog.imageUrl}
                              alt={blog.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            {blog.featured && (
                              <Badge className="absolute top-3 right-3 bg-primary/90">Featured</Badge>
                            )}
                          </div>
                        )}
                        <div className="p-5 flex flex-col flex-1">
                          <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors line-clamp-2">
                            {blog.title}
                          </h3>
                          {blog.excerpt && (
                            <p className="text-muted-foreground text-sm mb-3 line-clamp-2 flex-1">
                              {blog.excerpt}
                            </p>
                          )}
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-auto pt-3 border-t border-white/10">
                            <Calendar className="h-3 w-3" />
                            {blog.createdAt && new Date(blog.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </GlassCard>
                    </Link>
                  ))
                )}
              </div>
            </div>
          </section>
        )
      }

      <section className="py-10 sm:py-16 px-4 bg-gradient-to-b from-transparent via-primary/5 to-transparent">
        <div className="max-w-7xl mx-auto">
          <GlassCard className="p-4 sm:p-8">
            <h3 className="font-semibold text-lg sm:text-xl mb-4 sm:mb-6 text-center">How to Purchase</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
              <div className="text-center">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-primary flex items-center justify-center mx-auto mb-3 sm:mb-4 text-primary-foreground font-bold text-base sm:text-lg">
                  1
                </div>
                <h4 className="font-medium text-sm sm:text-base mb-2">Browse the Store</h4>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Explore our categories and find what you need
                </p>
              </div>
              <div className="text-center">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-primary flex items-center justify-center mx-auto mb-3 sm:mb-4 text-primary-foreground font-bold text-base sm:text-lg">
                  2
                </div>
                <h4 className="font-medium text-sm sm:text-base mb-2">Enter Your Username</h4>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Make sure to enter your exact Minecraft username
                </p>
              </div>
              <div className="text-center">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-primary flex items-center justify-center mx-auto mb-3 sm:mb-4 text-primary-foreground font-bold text-base sm:text-lg">
                  3
                </div>
                <h4 className="font-medium text-sm sm:text-base mb-2">Complete Purchase</h4>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Pay securely and receive your items instantly
                </p>
              </div>
            </div>
          </GlassCard>
        </div>
      </section>
    </Layout >
  );
}
