import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { FileQuestion, Home, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background relative overflow-hidden bg-mesh grid-pattern">
      {/* Background Decorative Elements */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[100px] animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-[100px] animate-pulse delay-700" />

      <div className="relative z-10 w-full max-w-2xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="glass-card p-12 text-center"
        >
          <div className="mb-8 flex justify-center">
            <div className="p-6 rounded-3xl bg-primary/10 text-primary border border-primary/20 shadow-2xl shadow-primary/20 relative group">
              <FileQuestion className="h-16 w-16 group-hover:rotate-12 transition-transform duration-500" />
              <div className="absolute inset-0 bg-primary/20 rounded-3xl blur-2xl -z-10 group-hover:blur-3xl transition-all" />
            </div>
          </div>

          <h1 className="text-8xl font-display font-black mb-4 bg-gradient-to-b from-foreground to-foreground/50 bg-clip-text text-transparent">
            404
          </h1>

          <h2 className="text-2xl font-display font-bold mb-6">Manifest Not Found</h2>

          <p className="text-muted-foreground text-lg mb-10 max-w-md mx-auto leading-relaxed">
            The coordinates you've followed appear to lead into the void. This manifest has either been archived or never existed in this sector.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" className="btn-glow-primary rounded-2xl px-8 h-14 font-bold gap-2 text-base" asChild>
              <Link href="/">
                <Home className="h-5 w-5" />
                Return to Port
              </Link>
            </Button>

            <Button variant="ghost" size="lg" className="rounded-2xl px-8 h-14 font-bold gap-2 border border-border/50 hover:bg-card/50" onClick={() => window.history.back()}>
              <ArrowLeft className="h-5 w-5" />
              Backtrack
            </Button>
          </div>
        </motion.div>

        <div className="mt-12 text-center">
          <p className="text-xs font-mono text-muted-foreground/50 tracking-widest uppercase">
            Error Signature: COORDINATES_UNRESOLVED_BY_MASTER_MANIFEST
          </p>
        </div>
      </div>
    </div>
  );
}
