
import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequestJson } from "@/lib/queryClient";
import { useSiteSettings } from "@/hooks/useSettings";
import { Loader2, Lock, Shield, Sparkles } from "lucide-react";

export function useAdminAuth() {
  const [location, setLocation] = useLocation();
  const token = localStorage.getItem("adminToken");

  const logout = () => {
    localStorage.removeItem("adminToken");
    setLocation("/admin/login");
  };

  return { token, logout };
}

export default function AdminLogin() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [password, setPassword] = useState("");
  const { data: settings } = useSiteSettings();

  const loginMutation = useMutation({
    mutationFn: async (password: string) => {
      return await apiRequestJson<{ token: string }>("POST", "/api/admin/login", { password });
    },
    onSuccess: (data: { token: string }) => {
      if (data.token) {
        localStorage.setItem("adminToken", data.token);
        toast({
          title: "Welcome, Admin",
          description: "Successfully logged into admin panel",
        });
        setLocation("/admin");
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Access Denied",
        description: error.message || "Invalid password",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      toast({
        title: "Password Required",
        description: "Please enter the admin password",
        variant: "destructive",
      });
      return;
    }
    loginMutation.mutate(password);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative selection:bg-primary/20">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 z-0 opacity-[0.03]"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }}>
      </div>

      <div className="w-full max-w-md px-6 z-10">
        <div className="flex flex-col items-center mb-10">
          <div className="h-12 w-12 rounded-lg bg-primary text-primary-foreground flex items-center justify-center mb-6 shadow-md shadow-primary/20">
            <Shield className="h-6 w-6" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground" data-testid="admin-login-title">
            Welcome back
          </h1>
          <p className="text-muted-foreground mt-2 text-center text-sm max-w-xs">
            Enter your credentials to access the admin dashboard.
          </p>
        </div>

        <div className="bg-card rounded-xl border border-border shadow-sm p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-11"
                required
                data-testid="input-admin-password"
              />
            </div>

            <Button
              type="submit"
              className="w-full h-11 text-base font-medium transition-all"
              disabled={loginMutation.isPending}
              data-testid="button-admin-login"
            >
              {loginMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-8 opacity-60">
          &copy; {new Date().getFullYear()} {settings?.appName || 'SnapTebex'}. All rights reserved.
        </p>
      </div>
    </div>
  );
}
