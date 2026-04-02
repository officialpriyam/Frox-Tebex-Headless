import { useState } from "react";
import { useLocation, Link } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { Layout } from "@/components/Layout";
import { GlassCard } from "@/components/GlassCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequestJson, queryClient } from "@/lib/queryClient";
import { Loader2, User, Mail, Lock, ArrowRight, Gamepad2 } from "lucide-react";

export default function Login() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");

  const loginMutation = useMutation({
    mutationFn: async (data: { login: string; password?: string }) => {
      return await apiRequestJson<{ user: any; token: string }>("POST", "/api/auth/login", data);
    },
    onSuccess: (data: { user: any; token: string }) => {
      localStorage.setItem("authToken", data.token);
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Welcome Back!",
        description: "Successfully logged in.",
      });
      setLocation("/");
    },
    onError: (error: Error) => {
      toast({
        title: "Login Failed",
        description: error.message || "Failed to login. Please check your credentials.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!login.trim()) {
      toast({
        title: "Identifier Required",
        description: "Please enter your Email or Minecraft Username.",
        variant: "destructive",
      });
      return;
    }
    loginMutation.mutate({
      login: login.trim(),
      password: password.trim() || undefined,
    });
  };

  return (
    <Layout>
      <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center mx-auto mb-4">
              <Gamepad2 className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold mb-2">Welcome Back</h1>
            <p className="text-muted-foreground">
              Sign in with your Email or Minecraft name
            </p>
          </div>

          <GlassCard className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="login-identifier" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Email or Minecraft Username
                  <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="login-identifier"
                  type="text"
                  placeholder="name@example.com or Steve"
                  value={login}
                  onChange={(e) => setLogin(e.target.value)}
                  className="bg-white/5 border-white/10"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  Password
                  <span className="text-muted-foreground text-xs">(Req. if set)</span>
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-white/5 border-white/10"
                />
                <p className="text-xs text-muted-foreground">
                  Leave blank if only using Minecraft login (standard accounts require password)
                </p>
              </div>

              <Button
                type="submit"
                className="w-full mt-2"
                disabled={loginMutation.isPending}
              >
                {loginMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Logging in...
                  </>
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm">
              <span className="text-muted-foreground">New here? </span>
              <Link href="/register" className="text-primary hover:underline font-medium">
                Create Account
              </Link>
            </div>
          </GlassCard>
        </div>
      </div>
    </Layout>
  );
}

