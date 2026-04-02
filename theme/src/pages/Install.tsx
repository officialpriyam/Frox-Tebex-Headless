import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { apiRequestJson } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Server, Shield, Store, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

const installSchema = z.object({
  siteName: z.string().min(2, "Site name must be at least 2 characters"),
  adminPassword: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
  databaseUrl: z.string().min(1, "PostgreSQL database URL is required"),
  tebexPublicToken: z.string().optional(),
  tebexPrivateKey: z.string().optional(),
  tebexPluginApiKey: z.string().optional(),
  discordInviteUrl: z.string().optional(),
  javaServerIp: z.string().min(1, "Java server IP is required"),
  bedrockServerIp: z.string().optional(),
  bedrockPort: z.string().optional(),
}).refine((data) => data.adminPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type InstallFormData = z.infer<typeof installSchema>;

export default function Install() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [step, setStep] = useState(1);

  const form = useForm<InstallFormData>({
    resolver: zodResolver(installSchema),
    defaultValues: {
      siteName: "",
      adminPassword: "",
      confirmPassword: "",
      databaseUrl: "",
      tebexPublicToken: "",
      tebexPrivateKey: "",
      tebexPluginApiKey: "",
      discordInviteUrl: "",
      javaServerIp: "",
      bedrockServerIp: "",
      bedrockPort: "19132",
    },
  });

  const installMutation = useMutation({
    mutationFn: async (data: InstallFormData) => {
      return await apiRequestJson("POST", "/api/install", {
        siteName: data.siteName,
        adminPassword: data.adminPassword,
        databaseUrl: data.databaseUrl,
        tebexPublicToken: data.tebexPublicToken || undefined,
        tebexPrivateKey: data.tebexPrivateKey || undefined,
        tebexPluginApiKey: data.tebexPluginApiKey || undefined,
        discordInviteUrl: data.discordInviteUrl || undefined,
        javaServerIp: data.javaServerIp,
        bedrockServerIp: data.bedrockServerIp || undefined,
        bedrockPort: data.bedrockPort ? parseInt(data.bedrockPort) : undefined,
      });
    },
    onSuccess: (data: any) => {
      if (data.token) {
        localStorage.setItem("adminToken", data.token);
      }
      toast({
        title: "Installation Complete",
        description: "Your site has been set up successfully! Redirecting...",
      });
      // Hard redirect to force a full page reload so install status is re-checked
      setTimeout(() => {
        window.location.href = "/";
      }, 1500);
    },
    onError: (error: Error) => {
      toast({
        title: "Installation Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InstallFormData) => {
    installMutation.mutate(data);
  };

  const nextStep = async () => {
    const fieldsToValidate = step === 1
      ? ["siteName", "adminPassword", "confirmPassword", "databaseUrl"] as const
      : step === 2
        ? ["javaServerIp"] as const
        : step === 3
          ? ["tebexPublicToken"] as const
          : [];

    const isValid = await form.trigger(fieldsToValidate);
    if (isValid) {
      setStep(step + 1);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] relative overflow-hidden flex items-center justify-center p-4">
      {/* Premium Background Effects */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-orange-500/10 rounded-full blur-[120px] animate-pulse transition-all duration-[5000ms]" />

      <div className="w-full max-w-2xl relative z-10">
        <div className="text-center mb-10">
          <div className="w-24 h-24 rounded-[2rem] bg-gradient-to-br from-primary via-primary/80 to-orange-500 flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-primary/20 rotate-3 hover:rotate-0 transition-transform duration-500 overflow-hidden">
            <img src="/logo.png" alt="SnapTebex" className="w-16 h-16 object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; (e.target as HTMLImageElement).parentElement!.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M7 7v10"/><path d="M11 7v10"/><path d="m15 7 2 10"/></svg>'; }} />
          </div>
          <h1 className="text-4xl font-black tracking-tighter mb-3 bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent" data-testid="text-install-title">SnapTebex</h1>
          <p className="text-muted-foreground/80 font-medium">Experience the next generation of Minecraft server stores.</p>
        </div>

        <div className="flex items-center justify-center gap-4 mb-10">
          {[
            { id: 1, icon: Shield },
            { id: 2, icon: Server },
            { id: 3, icon: Store }
          ].map((s) => {
            const Icon = s.icon;
            const isActive = s.id === step;
            const isCompleted = s.id < step;

            return (
              <div key={s.id} className="flex items-center">
                <div
                  className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 border-2",
                    isActive
                      ? "bg-primary/20 border-primary text-primary scale-110 shadow-lg shadow-primary/20"
                      : isCompleted
                        ? "bg-primary border-primary text-white"
                        : "bg-muted/50 border-border/50 text-muted-foreground"
                  )}
                >
                  <Icon className="w-5 h-5" />
                </div>
                {s.id < 3 && (
                  <div className={cn("w-8 h-0.5 mx-2 rounded-full", isCompleted ? "bg-primary" : "bg-muted/50")} />
                )}
              </div>
            );
          })}
        </div>

        <Card className="backdrop-blur-3xl bg-card/40 border-white/5 border-t-white/10 shadow-2xl rounded-[2.5rem] overflow-hidden">
          <CardHeader className="pt-10 pb-6 px-10">
            <div className="flex items-center gap-4">
              <div className="w-1 h-8 bg-primary rounded-full shadow-[0_0_15px_rgba(var(--primary),0.5)]" />
              <div>
                <CardTitle className="text-2xl font-bold tracking-tight">
                  {step === 1 && "Core Foundation"}
                  {step === 2 && "World Connection"}
                  {step === 3 && "Commerce Hub"}
                </CardTitle>
                <CardDescription className="font-medium text-muted-foreground/80">
                  {step === 1 && "Establish your identity and secure access."}
                  {step === 2 && "Link your Minecraft server to the platform."}
                  {step === 3 && "Unify your store and community presence."}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="px-10 pb-10">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {step === 1 && (
                  <>
                    <FormField
                      control={form.control}
                      name="siteName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Site Name</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="My Minecraft Server"
                              {...field}
                              data-testid="input-site-name"
                            />
                          </FormControl>
                          <FormDescription>
                            This will be displayed as your server/store name
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="adminPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Admin Password</FormLabel>
                          <FormControl>
                            <Input
                              type="password"
                              placeholder="Create a secure password"
                              {...field}
                              data-testid="input-admin-password"
                            />
                          </FormControl>
                          <FormDescription>
                            You'll use this to access the admin panel
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirm Password</FormLabel>
                          <FormControl>
                            <Input
                              type="password"
                              placeholder="Confirm your password"
                              {...field}
                              data-testid="input-confirm-password"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="databaseUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>PostgreSQL Database URL</FormLabel>
                          <FormControl>
                            <Input
                              type="password"
                              placeholder="postgresql://user:password@host:5432/database"
                              {...field}
                              data-testid="input-database-url"
                            />
                          </FormControl>
                          <FormDescription>
                            Your PostgreSQL connection string
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}

                {step === 2 && (
                  <>
                    <FormField
                      control={form.control}
                      name="javaServerIp"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Java Server IP</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="play.myserver.com"
                              {...field}
                              data-testid="input-java-ip"
                            />
                          </FormControl>
                          <FormDescription>
                            The IP address players use to join your server
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="bedrockServerIp"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bedrock Server IP (Optional)</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="bedrock.myserver.com"
                              {...field}
                              data-testid="input-bedrock-ip"
                            />
                          </FormControl>
                          <FormDescription>
                            Leave empty if you don't support Bedrock
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="bedrockPort"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bedrock Port</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="19132"
                              {...field}
                              data-testid="input-bedrock-port"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}

                {step === 3 && (
                  <>
                    <FormField
                      control={form.control}
                      name="tebexPublicToken"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tebex Public Token (Optional)</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Your Tebex public token"
                              {...field}
                              data-testid="input-tebex-public"
                            />
                          </FormControl>
                          <FormDescription>
                            You can add this later in the Admin Tebex settings
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="tebexPrivateKey"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Private Key (Optional)</FormLabel>
                          <FormControl>
                            <Input
                              type="password"
                              placeholder="Your Tebex private key"
                              {...field}
                              data-testid="input-tebex-private"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="tebexPluginApiKey"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Plugin API Key (Optional)</FormLabel>
                          <FormControl>
                            <Input
                              type="password"
                              placeholder="Your Tebex plugin API key"
                              {...field}
                              data-testid="input-tebex-plugin"
                            />
                          </FormControl>
                          <FormDescription>
                             Used to fetch community goals
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="discordInviteUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <MessageSquare className="w-4 h-4" />
                            Discord Invite Link
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="https://discord.gg/yourserver"
                              {...field}
                              data-testid="input-discord-invite"
                            />
                          </FormControl>
                          <FormDescription>
                            Your community Discord invite link
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}

                <div className="flex gap-4 pt-4">
                  {step > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setStep(step - 1)}
                      data-testid="button-back"
                    >
                      Back
                    </Button>
                  )}
                  {step < 3 ? (
                    <Button
                      type="button"
                      className="flex-1"
                      onClick={nextStep}
                      data-testid="button-next"
                    >
                      Continue
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      className="flex-1"
                      disabled={installMutation.isPending}
                      data-testid="button-install"
                    >
                      {installMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Installing...
                        </>
                      ) : (
                        "Complete Installation"
                      )}
                    </Button>
                  )}
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
