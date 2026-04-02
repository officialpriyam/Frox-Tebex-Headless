import { SiteSettings } from "@data/schema";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Loader2, Save, Mail, Shield, Server, User, Lock, Send } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { useAdminAuth } from "../AdminLogin";
import { toast } from "@/hooks/use-toast";

interface SmtpSettingsTabProps {
    formData: Partial<SiteSettings>;
    setFormData: (data: Partial<SiteSettings>) => void;
    onSave?: () => void;
    isSaving?: boolean;
}

export function SmtpSettingsTab({ formData, setFormData, onSave, isSaving }: SmtpSettingsTabProps) {
    const { token } = useAdminAuth();
    const [isTesting, setIsTesting] = useState(false);

    const handleTestEmail = async () => {
        setIsTesting(true);
        try {
            const res = await fetch("/api/admin/test-email", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    to: formData.smtpFrom || "test@example.com",
                }),
            });
            if (!res.ok) throw new Error("Failed to send test email");
            toast({ title: "Test Email Sent", description: "Check your inbox (and spam folder)." });
        } catch (err) {
            toast({ 
                title: "Test Failed", 
                description: err instanceof Error ? err.message : "Unknown error", 
                variant: "destructive" 
            });
        } finally {
            setIsTesting(false);
        }
    };

    return (
        <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">SMTP Configuration</h2>
                    <p className="text-muted-foreground">Configure how the server sends automated emails.</p>
                </div>
                <Button 
                    variant="outline" 
                    onClick={handleTestEmail} 
                    disabled={isTesting || isSaving}
                    className="gap-2 border-orange-500/20 hover:bg-orange-500/5 text-orange-500"
                >
                    {isTesting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    Send Test Email
                </Button>
            </div>
            <Separator className="bg-border/40" />

            <div className="grid gap-8">
                <div className="space-y-4">
                    <h3 className="text-lg font-medium flex items-center gap-2">
                        <Server className="h-4 w-4 text-orange-500" />
                        Server Details
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="md:col-span-2 space-y-2">
                            <Label htmlFor="smtpHost">SMTP Host</Label>
                            <Input
                                id="smtpHost"
                                placeholder="smtp.mailgun.org"
                                value={formData.smtpHost || ""}
                                onChange={(e) => setFormData({ ...formData, smtpHost: e.target.value })}
                                className="bg-white/5 border-white/10"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="smtpPort">Port</Label>
                            <Input
                                id="smtpPort"
                                type="number"
                                placeholder="587"
                                value={formData.smtpPort || 587}
                                onChange={(e) => setFormData({ ...formData, smtpPort: parseInt(e.target.value) })}
                                className="bg-white/5 border-white/10"
                            />
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <h3 className="text-lg font-medium flex items-center gap-2">
                        <Shield className="h-4 w-4 text-orange-500" />
                        Authentication
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="smtpUser" className="flex items-center gap-2">
                                <User className="h-3 w-3" />
                                Username
                            </Label>
                            <Input
                                id="smtpUser"
                                placeholder="postmaster@yourdomain.com"
                                value={formData.smtpUser || ""}
                                onChange={(e) => setFormData({ ...formData, smtpUser: e.target.value })}
                                className="bg-white/5 border-white/10"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="smtpPass" className="flex items-center gap-2">
                                <Lock className="h-3 w-3" />
                                Password
                            </Label>
                            <Input
                                id="smtpPass"
                                type="password"
                                placeholder="••••••••••••"
                                value={formData.smtpPass || ""}
                                onChange={(e) => setFormData({ ...formData, smtpPass: e.target.value })}
                                className="bg-white/5 border-white/10"
                            />
                        </div>
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-xl border border-border/40 bg-orange-500/5 max-w-md">
                        <div className="space-y-0.5">
                            <Label className="text-base font-medium">Use Secure Connection (SSL/TLS)</Label>
                            <p className="text-xs text-muted-foreground">Encryption is recommended for all SMTP traffic.</p>
                        </div>
                        <Switch
                            checked={formData.smtpSecure ?? true}
                            onCheckedChange={(checked) => setFormData({ ...formData, smtpSecure: checked })}
                        />
                    </div>
                </div>

                <div className="space-y-4">
                    <h3 className="text-lg font-medium flex items-center gap-2">
                        <Mail className="h-4 w-4 text-orange-500" />
                        Sender Info
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="smtpFrom">Sender Email</Label>
                            <Input
                                id="smtpFrom"
                                placeholder="noreply@yourdomain.com"
                                value={formData.smtpFrom || ""}
                                onChange={(e) => setFormData({ ...formData, smtpFrom: e.target.value })}
                                className="bg-white/5 border-white/10"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="appName">Sender Name</Label>
                            <Input
                                id="appName"
                                placeholder="Kingdom Store"
                                value={formData.appName || "Kingdom Store"}
                                onChange={(e) => setFormData({ ...formData, appName: e.target.value })}
                                className="bg-white/5 border-white/10"
                            />
                        </div>
                    </div>
                </div>

                <div className="pt-6 border-t border-border/40">
                    <Button 
                        onClick={onSave} 
                        disabled={isSaving}
                        className="w-full md:w-auto px-8 bg-orange-500 hover:bg-orange-600 text-white shadow-lg shadow-orange-500/20"
                    >
                        {isSaving ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Saving Configuration...
                            </>
                        ) : (
                            <>
                                <Save className="mr-2 h-4 w-4" />
                                Save SMTP Settings
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
}
