import { Link, useLocation } from "wouter";
import { useState } from "react";
import { Menu, X, ShoppingCart, User, LogOut, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./ThemeToggle";
import { useAuth } from "@/hooks/useAuth";
import { useSiteSettings, useSocialLinks, usePageSettings, useCustomPages } from "@/hooks/useSettings";
import { useBasket } from "@/hooks/useTebex";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function Navbar() {
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const { data: settings } = useSiteSettings();
  const { data: pageSettings } = usePageSettings();
  const { data: customPages } = useCustomPages();
  const { data: basket } = useBasket();

  const enabledPages = pageSettings?.filter(p => p.enabled).map(p => p.pageName) || ["Home", "Store", "Vote", "Rules"];

  const navItems = [
    { name: "Home", path: "/", show: enabledPages.includes("Home") },
    { name: "Store", path: "/store", show: enabledPages.includes("Store") },
    { name: "Staff", path: "/staff", show: true },
    { name: "FAQ", path: "/faq", show: true },
    { name: "Blogs", path: "/blogs", show: true },
    ...(customPages?.filter(p => p.showInNav && p.published).map(p => ({
      name: p.title,
      path: `/p/${p.slug}`,
      show: true
    })) || []),
    { name: "Vote", path: "/vote", show: enabledPages.includes("Vote") },
    { name: "Rules", path: "/rules", show: enabledPages.includes("Rules") },
  ].filter(item => item.show);



  const basketItemCount = basket?.packages?.reduce((acc, pkg) => acc + pkg.quantity, 0) || 0;

  return (
    <nav className="sticky top-0 z-50 py-3 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* User-uploaded Corner Decorations (vines) */}
        {settings?.decoAsset1 && (
          <>
            <img
              src={settings.decoAsset1}
              alt="Corner Decoration"
              className="absolute -top-4 -left-4 w-16 h-16 sm:w-20 sm:h-20 object-contain z-40 pointer-events-none"
            />
            <img
              src={settings.decoAsset1}
              alt="Corner Decoration"
              className="absolute -top-4 -right-4 w-16 h-16 sm:w-20 sm:h-20 object-contain z-40 scale-x-[-1] pointer-events-none"
            />
          </>
        )}

        <div className={cn(
          "grid grid-cols-3 items-center gap-4 px-4 py-2 transition-shadow duration-300 relative z-10",
          settings?.showNavbarBox !== false 
            ? "navbar-container bg-background/60 backdrop-blur-xl rounded-xl border border-border/50 shadow-sm hover:shadow-md" 
            : "bg-transparent border-transparent"
        )}>
          <div className="justify-self-start z-20">
            <Link href="/" className="flex items-center gap-3">
              {settings?.logoUrl && (
                <img
                  src={settings.logoUrl}
                  alt={settings.appName || "Logo"}
                  className="h-10 w-auto drop-shadow-sm relative z-20"
                  data-testid="img-navbar-logo"
                />
              )}
            </Link>
          </div>

          <div className="hidden md:flex items-center gap-1 justify-self-center">
            {navItems.map((item) => (
              <Link key={item.path} href={item.path}>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "relative rounded-md transition-all duration-300 px-4",
                    location === item.path
                      ? "text-primary bg-primary/10 font-bold shadow-sm shadow-primary/10"
                      : "text-muted-foreground hover:text-primary hover:bg-primary/5"
                  )}
                  data-testid={`nav-${item.name.toLowerCase()}`}
                >
                  {item.name}
                  {location === item.path && (
                    <div className="absolute -bottom-[22px] left-1/2 -translate-x-1/2 w-4 h-1 bg-primary rounded-full shadow-[0_0_10px_rgba(var(--primary),0.5)]" />
                  )}
                </Button>
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-3 justify-self-end">


            <div className="flex items-center gap-2">
              <ThemeToggle />

              {basketItemCount > 0 && (
                <Link href="/checkout">
                  <Button variant="ghost" size="icon" className="relative rounded-md" data-testid="button-cart">
                    <ShoppingCart className="h-5 w-5" />
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs shadow-sm">
                      {basketItemCount}
                    </Badge>
                  </Button>
                </Link>
              )}

              {isAuthenticated && user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center gap-2 rounded-md px-2" data-testid="button-user-menu">
                      <Avatar className="h-7 w-7 ring-1 ring-border">
                        <AvatarImage src={`https://mc-heads.net/avatar/${user.minecraftUsername}/32`} />
                        <AvatarFallback>{user.minecraftUsername?.charAt(0).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <span className="hidden sm:block text-sm font-medium">{user.minecraftUsername}</span>
                      <ChevronDown className="h-4 w-4 opacity-50" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem asChild>
                      <Link href="/profile" className="flex items-center gap-2 cursor-pointer">
                        <User className="h-4 w-4" />
                        Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={logout}
                      className="flex items-center gap-2 cursor-pointer text-destructive focus:text-destructive"
                    >
                      <LogOut className="h-4 w-4" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="flex items-center gap-2">
                  <Link href="/login">
                    <Button variant="ghost" size="sm" className="rounded-md px-4" data-testid="button-login">
                      Login
                    </Button>
                  </Link>
                  <Link href="/register">
                    <Button variant="default" size="sm" className="rounded-md px-4" data-testid="button-register">
                      Register
                    </Button>
                  </Link>
                </div>
              )}
            </div>

            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="outline" size="icon" className="rounded-md" data-testid="button-mobile-menu">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72 bg-background border-l border-border">
                <div className="flex flex-col gap-4 mt-8">
                  {navItems.map((item) => (
                    <Link
                      key={item.path}
                      href={item.path}
                      onClick={() => setMobileOpen(false)}
                    >
                      <Button
                        variant="ghost"
                        className={cn(
                          "w-full justify-start text-lg rounded-xl h-14 transition-all duration-300",
                          location === item.path
                            ? "text-primary bg-primary/10 font-bold border-l-4 border-primary pl-6"
                            : "text-muted-foreground hover:text-primary hover:bg-primary/5"
                        )}
                      >
                        {item.name}
                      </Button>
                    </Link>
                  ))}


                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}
