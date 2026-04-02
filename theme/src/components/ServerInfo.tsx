import { useState } from "react";
import { useSiteSettings } from "@/hooks/useSettings";
import { GlassCard } from "./GlassCard";
import { Button } from "@/components/ui/button";
import { Copy, Check, Server, Smartphone } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function ServerInfo() {
  const { data: settings } = useSiteSettings();
  const { toast } = useToast();
  const [copiedJava, setCopiedJava] = useState(false);
  const [copiedBedrock, setCopiedBedrock] = useState(false);

  const copyJavaIp = async () => {
    if (settings?.javaServerIp) {
      await navigator.clipboard.writeText(settings.javaServerIp);
      setCopiedJava(true);
      toast({
        title: "Copied!",
        description: "Server IP copied to clipboard",
      });
      setTimeout(() => setCopiedJava(false), 2000);
    }
  };

  const copyBedrockIp = async () => {
    if (settings?.bedrockServerIp) {
      const ip = `${settings.bedrockServerIp}:${settings.bedrockPort}`;
      await navigator.clipboard.writeText(ip);
      setCopiedBedrock(true);
      toast({
        title: "Copied!",
        description: "Bedrock IP copied to clipboard",
      });
      setTimeout(() => setCopiedBedrock(false), 2000);
    }
  };

  if (!settings?.javaServerIp) return null;

  return (
    <GlassCard className="p-6">
      <h3 className="font-semibold mb-4 flex items-center gap-2">
        <Server className="h-5 w-5 text-primary" />
        Join the Server
      </h3>

      <div className="space-y-4">
        <div>
          <p className="text-sm text-muted-foreground mb-2">Java Edition</p>
          <div className="flex items-center gap-2">
            <code className="flex-1 px-3 py-2 rounded-lg bg-white/5 font-mono text-sm">
              {settings.javaServerIp}
            </code>
            <Button
              variant="outline"
              size="icon"
              onClick={copyJavaIp}
              data-testid="button-copy-java-ip"
            >
              {copiedJava ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {settings.bedrockSupport && settings.bedrockServerIp && (
          <div>
            <p className="text-sm text-muted-foreground mb-2 flex items-center gap-2">
              <Smartphone className="h-4 w-4" />
              Bedrock Edition
            </p>
            <div className="flex items-center gap-2">
              <code className="flex-1 px-3 py-2 rounded-lg bg-white/5 font-mono text-sm">
                {settings.bedrockServerIp}:{settings.bedrockPort}
              </code>
              <Button
                variant="outline"
                size="icon"
                onClick={copyBedrockIp}
                data-testid="button-copy-bedrock-ip"
              >
                {copiedBedrock ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </GlassCard>
  );
}
