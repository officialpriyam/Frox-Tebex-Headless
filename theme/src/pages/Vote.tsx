import { useQuery } from "@tanstack/react-query";
import { Layout, PageLoader } from "@/components/Layout";
import { GlassCard } from "@/components/GlassCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { VoteSite } from "@data/schema";
import { ExternalLink, Gift, Clock, Vote as VoteIcon, Trophy } from "lucide-react";

export default function Vote() {
  const { data: voteSites, isLoading } = useQuery<VoteSite[]>({
    queryKey: ["/api/vote-sites"],
  });

  const enabledSites = voteSites?.filter(site => site.enabled) || [];

  return (
    <Layout>
      <div className="max-w-5xl mx-auto px-4 py-8">
        <section className="relative rounded-2xl overflow-hidden mb-12 bg-gradient-to-r from-primary/20 via-primary/10 to-transparent p-8 md:p-12">
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-xl bg-primary/20">
                <VoteIcon className="h-8 w-8 text-primary" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold" data-testid="vote-title">Vote for Us</h1>
            </div>
            <p className="text-xl text-muted-foreground/80 max-w-2xl font-medium leading-relaxed">
              Supporting us is the simplest way to help the server thrive. Every vote elevates our standing and brings you exclusive in-game artifacts in return.
            </p>
          </div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
        </section>

        <section className="mb-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <GlassCard className="p-6 text-center">
              <div className="w-14 h-14 rounded-xl bg-yellow-500/20 flex items-center justify-center mx-auto mb-4">
                <Trophy className="h-7 w-7 text-yellow-500" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Daily Rewards</h3>
              <p className="text-muted-foreground text-sm">
                Vote on all sites daily for maximum rewards
              </p>
            </GlassCard>

            <GlassCard className="p-6 text-center">
              <div className="w-14 h-14 rounded-xl bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                <Gift className="h-7 w-7 text-green-500" />
              </div>
              <h3 className="font-semibold text-lg mb-2">In-Game Items</h3>
              <p className="text-muted-foreground text-sm">
                Receive exclusive items and bonuses
              </p>
            </GlassCard>

            <GlassCard className="p-6 text-center">
              <div className="w-14 h-14 rounded-xl bg-blue-500/20 flex items-center justify-center mx-auto mb-4">
                <Clock className="h-7 w-7 text-blue-500" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Quick & Easy</h3>
              <p className="text-muted-foreground text-sm">
                Takes just a few seconds to vote
              </p>
            </GlassCard>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-6">Voting Sites</h2>

          {isLoading ? (
            <div className="grid gap-4">
              {Array(3).fill(0).map((_, i) => (
                <GlassCard key={i} className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-white/10 rounded-xl animate-pulse" />
                    <div className="flex-1 space-y-2">
                      <div className="h-5 w-32 bg-white/10 rounded animate-pulse" />
                      <div className="h-4 w-48 bg-white/5 rounded animate-pulse" />
                    </div>
                    <div className="h-10 w-24 bg-white/10 rounded animate-pulse" />
                  </div>
                </GlassCard>
              ))}
            </div>
          ) : enabledSites.length > 0 ? (
            <div className="grid gap-4">
              {enabledSites.map((site, index) => (
                <GlassCard key={site.id} className="p-6" data-testid={`vote-site-${site.id}`}>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center font-bold text-xl text-primary shrink-0">
                        {index + 1}
                      </div>

                      {site.imageUrl ? (
                        <img
                          src={site.imageUrl}
                          alt={site.name}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                      ) : null}

                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-lg">{site.name}</h3>
                        {site.rewardDescription && (
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <Gift className="h-3 w-3" />
                            {site.rewardDescription}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 w-full sm:w-auto">
                      {site.cooldownHours && (
                        <Badge variant="outline" className="gap-1 bg-primary/10 text-primary border-primary/20">
                          <Clock className="h-3 w-3" />
                          {site.cooldownHours}h cooldown
                        </Badge>
                      )}

                      <a
                        href={site.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 sm:flex-none"
                      >
                        <Button className="w-full sm:w-auto gap-2" data-testid={`button-vote-${site.id}`}>
                          Vote
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </a>
                    </div>
                  </div>
                </GlassCard>
              ))}
            </div>
          ) : (
            <GlassCard className="p-12 text-center">
              <VoteIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold text-lg mb-2">No Voting Sites</h3>
              <p className="text-muted-foreground">
                Voting sites haven't been configured yet. Check back later!
              </p>
            </GlassCard>
          )}
        </section>
      </div>
    </Layout>
  );
}
