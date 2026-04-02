import { cn } from "@/lib/utils";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}

export function GlassCard({ children, className, hover = false, onClick }: GlassCardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "relative bg-card text-card-foreground rounded-xl border border-border shadow-sm",
        hover && "cursor-pointer transition-all duration-200 hover:shadow-md hover:border-primary/20",
        onClick && "cursor-pointer",
        className
      )}
    >
      {children}
    </div>
  );
}

export function GlassPanel({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "bg-muted/50 border border-border rounded-lg",
        className
      )}
    >
      {children}
    </div>
  );
}
