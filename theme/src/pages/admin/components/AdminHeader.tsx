
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ExternalLink, Home } from "lucide-react";

export function AdminHeader() {
    return (
        <header className="h-16 border-b border-border bg-card/40 backdrop-blur-sm sticky top-0 z-40 flex items-center justify-between px-6">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>Dashboard</span>
                <span className="opacity-20">/</span>
                <span className="text-foreground font-medium">Overview</span>
            </div>

            <div className="flex items-center gap-3">
                <Link href="/">
                    <Button variant="outline" size="sm" className="gap-2 h-9">
                        <Home className="h-4 w-4" />
                        View Site
                    </Button>
                </Link>
            </div>
        </header>
    );
}
