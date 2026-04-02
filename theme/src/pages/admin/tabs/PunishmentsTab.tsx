import { Card, CardContent } from "@/components/ui/card";
import { ShieldAlert, Construction, Sparkles, Clock, Hammer } from "lucide-react";

export function PunishmentsTab() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[500px] text-center p-8 space-y-6 animate-in fade-in zoom-in duration-500">
      <div className="relative">
        <div className="absolute inset-0 bg-orange-500/20 blur-3xl rounded-full scale-150" />
        <div className="relative w-24 h-24 rounded-2xl bg-card border border-border/50 flex items-center justify-center shadow-2xl">
          <Hammer className="h-12 w-12 text-orange-500 animate-bounce" />
        </div>
        <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center shadow-lg">
          <Clock className="h-4 w-4 text-white" />
        </div>
      </div>

      <div className="space-y-2 max-w-md">
        <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-b from-foreground to-foreground/60 bg-clip-text text-transparent italic">
          Forge of Justice
        </h2>
        <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-500/10 text-orange-500 border border-orange-500/20 mb-4 uppercase tracking-widest">
          Upcoming Module
        </div>
        <p className="text-muted-foreground text-lg italic">
          "The hammers of the kingdom are being forged. Soon, you shall wield the power of absolute justice over the realm."
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-2xl mt-8">
        {[
          { title: "Global Bans", desc: "Exile players from all realms at once.", icon: ShieldAlert },
          { title: "Mute System", desc: "Silence the unruly in global chat.", icon: Construction },
          { title: "Warning History", desc: "Keep a scribe's log of all infractions.", icon: Sparkles },
          { title: "Appeals Portal", desc: "Allow players to plead their case.", icon: Construction },
        ].map((feat, i) => (
          <div key={i} className="flex items-start gap-4 p-4 rounded-xl border border-border/40 bg-card/50 backdrop-blur-sm opacity-60 hover:opacity-80 transition-opacity">
            <div className="mt-1 w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center shrink-0">
               <feat.icon className="h-4 w-4 text-orange-500" />
            </div>
            <div className="text-left">
              <h4 className="font-bold text-sm">{feat.title}</h4>
              <p className="text-xs text-muted-foreground">{feat.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
