import { Switch, Route, useLocation, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider, useQuery } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Store from "@/pages/Store";
import Vote from "@/pages/Vote";
import Rules from "@/pages/Rules";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import PackageDetail from "@/pages/PackageDetail";
import CustomPage from "@/pages/CustomPage";
import Blogs from "@/pages/Blogs";
import BlogDetail from "@/pages/BlogDetail";
import AdminLogin from "@/pages/admin/AdminLogin";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import CheckoutSuccess from "@/pages/CheckoutSuccess";
import LegalPage from "@/pages/LegalPage";
import Install from "@/pages/Install";
import Staff from "@/pages/Staff";
import Faq from "@/pages/Faq";
import { Loader2 } from "lucide-react";
import { useTheme } from "./components/ThemeProvider";
import { useSiteSettings } from "./hooks/useSettings";
import { useEffect } from "react";

function InstallationGuard({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  const { data, isLoading, isError, error } = useQuery<{ installed: boolean }>({
    queryKey: ["/api/install/status"],
    staleTime: 1000 * 60 * 5,
    retry: 2,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center p-8">
          <p className="text-lg font-medium text-destructive mb-2">Connection Error</p>
          <p className="text-muted-foreground mb-4">
            {error instanceof Error ? error.message : "Unable to connect to server"}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const isInstalled = data?.installed === true;
  const isInstallPage = location === "/install";

  if (!isInstalled && !isInstallPage) {
    return <Redirect to="/install" />;
  }

  if (isInstalled && isInstallPage) {
    return <Redirect to="/" />;
  }

  return <>{children}</>;
}

function Router() {
  return (
    <InstallationGuard>
      <Switch>
        <Route path="/install" component={Install} />
        <Route path="/" component={Home} />
        <Route path="/store" component={Store} />
        <Route path="/store/package/:id" component={PackageDetail} />
        <Route path="/p/:slug" component={CustomPage} />
        <Route path="/blogs" component={Blogs} />
        <Route path="/blog/:slug" component={BlogDetail} />
        <Route path="/vote" component={Vote} />
        <Route path="/rules" component={Rules} />
        <Route path="/login" component={Login} />
        <Route path="/register" component={Register} />
        <Route path="/admin/login" component={AdminLogin} />
        <Route path="/admin" component={AdminDashboard} />
        <Route path="/staff" component={Staff} />
        <Route path="/faq" component={Faq} />
        <Route path="/privacy-policy">
          <LegalPage type="privacy" />
        </Route>
        <Route path="/terms-of-service">
          <LegalPage type="terms" />
        </Route>
        <Route path="/checkout/success" component={CheckoutSuccess} />
        <Route component={NotFound} />
      </Switch>
    </InstallationGuard>
  );
}

function ThemeSyncer() {
  const { data: settings } = useSiteSettings();
  const { setActiveTheme } = useTheme();

  useEffect(() => {
    if (settings?.activeTheme) {
      setActiveTheme(settings.activeTheme);

      // Dynamically load theme CSS from the templates folder
      const themeName = settings.activeTheme;
      if (themeName && themeName !== "default") {
        fetch(`/api/themes/${themeName}/css`)
          .then((res) => {
            if (res.ok) return res.text();
            return "";
          })
          .then((css) => {
            const existing = document.getElementById("snap-theme-css");
            if (existing) existing.remove();

            if (css) {
              const style = document.createElement("style");
              style.id = "snap-theme-css";
              style.textContent = css;
              document.head.appendChild(style);
            }
          })
          .catch(() => { /* silently fail */ });
      } else {
        const existing = document.getElementById("snap-theme-css");
        if (existing) existing.remove();
      }
    }
  }, [settings?.activeTheme, setActiveTheme]);

  return null;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <ThemeSyncer />
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
