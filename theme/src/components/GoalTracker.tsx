import { useQuery } from "@tanstack/react-query";
import { useSiteSettings } from "@/hooks/useSettings";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Target } from "lucide-react";

interface StoreGoal {
  current: number;
  target: number;
  enabled: boolean;
  name?: string;
  description?: string;
}

export function GoalTracker() {
  const { data: settings } = useSiteSettings();
  const { data: goal, isLoading } = useQuery<StoreGoal>({
    queryKey: ["/api/store/goal"],
    refetchInterval: 60000,
  });

  if (isLoading || !goal?.enabled || goal.target <= 0) return null;

  const progress = Math.min((goal.current / goal.target) * 100, 100);

  const currencySymbol = settings?.currencySymbol || "$";

  return (
    <div className="glass-card p-8 relative overflow-hidden group">
      {/* Background Glow */}
      <div className="absolute -top-24 -left-24 w-48 h-48 bg-primary/10 blur-[100px] rounded-full pointer-events-none" />

      <div className="relative z-10">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-8">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center shadow-2xl transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6">
            <Target className="h-8 w-8 text-primary drop-shadow-md" />
          </div>
          <div className="text-center sm:text-left space-y-1 flex-1">
            <Badge variant="outline" className="mb-2 px-3 py-0.5 rounded-full border-primary/20 bg-primary/5 text-primary text-[10px] font-black uppercase tracking-widest">
              Community Milestone
            </Badge>
            <h3 className="font-display font-bold text-2xl tracking-tight leading-none group-hover:text-primary transition-colors">
              {goal.name || "Server Evolution"}
            </h3>
            <p className="text-sm text-muted-foreground/80 font-medium">
              {goal.description || "Support our growth and unlock community rewards."}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="relative">
            <Progress value={progress} className="h-4 rounded-full bg-primary/5 border border-primary/10 overflow-hidden" />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer pointer-events-none" />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest">Current Momentum</span>
              <span className="text-xl font-display font-bold text-foreground">
                {currencySymbol}{goal.current?.toLocaleString() || 0}
              </span>
            </div>

            <div className="flex flex-col items-end">
              <span className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest">Ultimate Target</span>
              <span className="text-xl font-display font-bold text-primary">
                {currencySymbol}{goal.target?.toLocaleString() || 0}
              </span>
            </div>
          </div>

          <div className="pt-4 border-t border-border/30 flex items-center justify-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-sm font-black text-primary uppercase tracking-tighter">
                {progress.toFixed(1)}% ACHIEVED
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
