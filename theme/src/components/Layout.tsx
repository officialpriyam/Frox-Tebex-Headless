import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { SeasonalEffects } from "./SeasonalEffects";
import { useSiteSettings } from "@/hooks/useSettings";
import { Loader2 } from "lucide-react";
import { hexToHSLComponents } from "@/lib/utils";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { data: settings, isLoading } = useSiteSettings();

  const dynamicStyles = settings ? `
    :root {
      ${settings.primaryColor ? `--primary: ${hexToHSLComponents(settings.primaryColor)};` : ""}
      ${settings.accentColor ? `--accent: ${hexToHSLComponents(settings.accentColor)};` : ""}
      ${settings.secondaryColor ? `--secondary: ${hexToHSLComponents(settings.secondaryColor)};` : ""}
      ${settings.mutedColor ? `--muted: ${hexToHSLComponents(settings.mutedColor)};` : ""}
    }
  ` : "";

  if (settings?.maintenanceMode) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center p-8">
          <h1 className="text-4xl font-bold mb-4">Under Maintenance</h1>
          <p className="text-muted-foreground">
            We're currently performing maintenance. Please check back soon.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background relative">
      <style dangerouslySetInnerHTML={{ __html: dynamicStyles }} />
      {settings?.siteBackgroundImageUrl && (
        <>
          <div
            className="fixed inset-0 z-0"
            style={{
              backgroundImage: `url(${settings.siteBackgroundImageUrl})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
            }}
          />
          <div className="fixed inset-0 bg-background/60 backdrop-blur-[2px] z-0" />
        </>
      )}
      <div className="relative z-10 flex flex-col min-h-screen bg-mesh grid-pattern">
        <SeasonalEffects />
        <Navbar />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
      </div>
    </div>
  );
}

export function PageLoader() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}
