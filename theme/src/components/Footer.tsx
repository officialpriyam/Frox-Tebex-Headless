import { Link } from "wouter";
import { useSiteSettings, useSocialLinks } from "@/hooks/useSettings";
import {
  SiDiscord,
  SiX,
  SiYoutube,
  SiGithub,
  SiReddit,
  SiInstagram,
  SiFacebook,
  SiTwitch
} from "react-icons/si";
import { Globe, Book, Twitter } from "lucide-react";

const socialIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  discord: SiDiscord,
  twitter: SiX,
  x: SiX,
  youtube: SiYoutube,
  github: SiGithub,
  reddit: SiReddit,
  instagram: SiInstagram,
  facebook: SiFacebook,
  twitch: SiTwitch,
  website: Globe,
  wiki: Book,
};

export function Footer() {
  const { data: settings } = useSiteSettings();
  const { data: socialLinks } = useSocialLinks();

  const visibleLinks = socialLinks?.filter(link => link.showInNav) || [];

  return (
    <footer className="border-t border-border bg-card mt-auto relative overflow-visible">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              {settings?.logoUrl && (
                <img
                  src={settings.logoUrl}
                  alt={settings.appName || "Logo"}
                  className="h-8 w-auto"
                />
              )}
              <span className="font-bold text-xl">{settings?.appName || "Store"}</span>
            </div>
            <p className="text-muted-foreground text-sm">
              Purchase ranks, items, and support the server.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <div className="flex flex-col gap-2">
              <Link href="/store" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
                Store
              </Link>
              <Link href="/vote" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
                Vote
              </Link>
              <Link href="/rules" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
                Rules
              </Link>
              {settings?.privacyPolicyUrl && (
                <Link href={settings.privacyPolicyUrl} className="text-muted-foreground hover:text-foreground transition-colors text-sm">
                  Privacy Policy
                </Link>
              )}
              {settings?.termsOfServiceUrl && (
                <Link href={settings.termsOfServiceUrl} className="text-muted-foreground hover:text-foreground transition-colors text-sm">
                  Terms of Service
                </Link>
              )}
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Connect With Us</h3>
            <div className="flex flex-wrap gap-3">
              {visibleLinks.map((link) => {
                const IconComponent = socialIcons[link.platform.toLowerCase()];
                return IconComponent ? (
                  <a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg bg-muted/60 text-foreground/80 border border-border/50 hover:bg-accent/80 hover:text-foreground transition-colors"
                    data-testid={`social-${link.platform.toLowerCase()}`}
                  >
                    <IconComponent className="h-5 w-5" />
                  </a>
                ) : null;
              })}
            </div>

            {settings?.javaServerIp && (
              <div className="mt-6">
                <p className="text-sm text-muted-foreground mb-1">Server IP</p>
                <p className="font-mono text-sm">{settings.javaServerIp}</p>
                {settings?.bedrockSupport && settings?.bedrockServerIp && (
                  <>
                    <p className="text-sm text-muted-foreground mb-1 mt-2">Bedrock IP</p>
                    <p className="font-mono text-sm">
                      {settings.bedrockServerIp}:{settings.bedrockPort}
                    </p>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} {settings?.appName || "Store"}. All rights reserved.</p>
          <p className="mt-1">Powered by Tebex</p>
        </div>
      </div>
    </footer>
  );
}
