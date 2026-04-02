
import {
    LayoutDashboard,
    Settings,
    ShoppingBag,
    Percent,
    Gamepad2,
    Sparkles,
    Newspaper,
    Gavel,
    Network,
    StickyNote,
    FileText,
    Vote,
    Users,
    Shield,
    Mail,
    LogOut
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

interface AdminSidebarProps {
    activeTab: string;
    setActiveTab: (tab: string) => void;
    onLogout: () => void;
}

const menuItems = [
    { id: "store", label: "Categories", icon: ShoppingBag },
    { id: "coupons", label: "Coupons", icon: Percent },
    { id: "separator-content", label: "CONTENT", isHeader: true },
    { id: "gamemodes", label: "Gamemodes", icon: Gamepad2 },
    { id: "features", label: "Features", icon: Sparkles },
    { id: "blog", label: "Announcements", icon: Newspaper },
    { id: "separator-community", label: "COMMUNITY", isHeader: true },
    { id: "punishments", label: "Punishments", icon: Gavel },
    { id: "staff", label: "Staff List", icon: Network },
    { id: "faq-items", label: "FAQ Items", icon: StickyNote },
    { id: "faq-categories", label: "FAQ Categories", icon: FileText },
    { id: "vote", label: "Vote Sites", icon: Vote },
    { id: "separator-system", label: "SYSTEM", isHeader: true },
    { id: "users", label: "Users", icon: Users },
    { id: "roles", label: "Roles", icon: Shield },
    { id: "email-templates", label: "Email Templates", icon: Mail },
    { id: "smtp-settings", label: "SMTP Settings", icon: Mail },
    { id: "tebex", label: "Tebex Settings", icon: Settings },
    { id: "rank-upgrader", label: "Rank Upgrader", icon: Sparkles },
    { id: "seasonal", label: "Seasonal Themes", icon: LayoutDashboard },
    { id: "theme-settings", label: "Theme Settings", icon: Settings },
    { id: "general", label: "Settings", icon: Settings },
];

export function AdminSidebar({ activeTab, setActiveTab, onLogout }: AdminSidebarProps) {
    const [, setLocation] = useLocation();

    return (
        <div className="w-64 border-r border-border bg-card/60 backdrop-blur-xl h-screen flex flex-col fixed left-0 top-0 z-50">
            <div className="p-6 border-b border-border/50">
                <div
                    className="flex items-center gap-2 font-bold text-xl cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => setLocation("/")}
                >
                    <LayoutDashboard className="h-6 w-6 text-primary" />
                    <span>Admin</span>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1 admin-sidebar-scroll">
                {menuItems.map((item) => {
                    if (item.id.startsWith("separator")) {
                        return (
                            <div key={item.id} className="px-3 pt-4 pb-2 text-[10px] font-bold text-muted-foreground/60 tracking-wider">
                                {item.label}
                            </div>
                        );
                    }

                    const Icon = item.icon;
                    return (
                        <Button
                            key={item.id}
                            variant={activeTab === item.id ? "secondary" : "ghost"}
                            className={cn(
                                "w-full justify-start gap-3 h-10 font-medium",
                                activeTab === item.id
                                    ? "bg-primary/10 text-primary hover:bg-primary/15"
                                    : "text-muted-foreground hover:text-foreground"
                            )}
                            onClick={() => setActiveTab(item.id)}
                        >
                            {Icon && <Icon className="h-4 w-4" />}
                            {item.label}
                        </Button>
                    );
                })}
            </div>

            <div className="p-4 border-t border-border/50">
                <Button
                    variant="outline"
                    className="w-full gap-2 text-muted-foreground hover:text-destructive hover:border-destructive/30"
                    onClick={onLogout}
                >
                    <LogOut className="h-4 w-4" />
                    Logout
                </Button>
            </div>
        </div>
    );
}
