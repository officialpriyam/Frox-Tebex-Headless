import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { 
    Plus, 
    Pencil, 
    Trash2, 
    Loader2, 
    MoreVertical,
    Save,
    Mail,
    FileText,
    Code
} from "lucide-react";
import { useState } from "react";
import { EmailTemplate, InsertEmailTemplate } from "@data/schema";
import { useAdminAuth } from "../AdminLogin";
import { toast } from "@/hooks/use-toast";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

export function EmailTemplatesTab() {
    const { token } = useAdminAuth();
    const queryClient = useQueryClient();
    const [isOpen, setIsOpen] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState<Partial<EmailTemplate> | null>(null);

    const { data: templates, isLoading } = useQuery<EmailTemplate[]>({
        queryKey: ["/api/admin/email-templates"],
        enabled: !!token,
        queryFn: async () => {
            const res = await fetch("/api/admin/email-templates", {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) throw new Error("Failed to fetch templates");
            return res.json();
        },
    });

    const saveMutation = useMutation({
        mutationFn: async (data: Partial<InsertEmailTemplate>) => {
            const url = editingTemplate?.id 
                ? `/api/admin/email-templates/${editingTemplate.id}` 
                : "/api/admin/email-templates";
            const method = editingTemplate?.id ? "PATCH" : "POST";
            
            const res = await fetch(url, {
                method,
                headers: { 
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}` 
                },
                body: JSON.stringify(data),
            });
            if (!res.ok) throw new Error("Failed to save template");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/admin/email-templates"] });
            setIsOpen(false);
            setEditingTemplate(null);
            toast({ title: "Template saved successfully" });
        },
        onError: (error: Error) => {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        }
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            const res = await fetch(`/api/admin/email-templates/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) throw new Error("Failed to delete template");
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/admin/email-templates"] });
            toast({ title: "Template deleted" });
        }
    });

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const data: Partial<InsertEmailTemplate> = {
            type: formData.get("type") as string,
            subject: formData.get("subject") as string,
            bodyHtml: formData.get("bodyHtml") as string,
            active: formData.get("active") === "on",
        };
        saveMutation.mutate(data);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Email Templates</h2>
                    <p className="text-muted-foreground">Customize the automated emails sent by your store.</p>
                </div>
                <Dialog open={isOpen} onOpenChange={(open) => {
                    setIsOpen(open);
                    if (!open) setEditingTemplate(null);
                }}>
                    <DialogTrigger asChild>
                        <Button className="gap-2 bg-orange-500 hover:bg-orange-600 text-white shadow-lg shadow-orange-500/20">
                            <Plus className="h-4 w-4" />
                            Add Template
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[700px] bg-card/95 backdrop-blur-xl border-border/50 max-h-[90vh] flex flex-col p-0">
                        <form onSubmit={handleSubmit} className="flex flex-col h-full">
                            <DialogHeader className="p-6 pb-0">
                                <DialogTitle>{editingTemplate ? "Edit Template" : "Add Email Template"}</DialogTitle>
                                <DialogDescription>
                                    Use variables like {"{{username}}"}, {"{{order_id}}"}, and {"{{site_name}}"} in your content.
                                </DialogDescription>
                            </DialogHeader>
                            
                            <ScrollArea className="flex-1 p-6">
                                <div className="grid gap-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="type">Template Type / Identifier</Label>
                                            <Input 
                                                id="type" 
                                                name="type" 
                                                defaultValue={editingTemplate?.type} 
                                                placeholder="e.g. purchase, delivery" 
                                                required 
                                            />
                                        </div>
                                        <div className="flex items-center space-x-2 pt-8">
                                            <Switch 
                                                id="active" 
                                                name="active" 
                                                defaultChecked={editingTemplate?.active ?? true} 
                                            />
                                            <Label htmlFor="active">Template Active</Label>
                                        </div>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="subject">Subject Line</Label>
                                        <Input 
                                            id="subject" 
                                            name="subject" 
                                            defaultValue={editingTemplate?.subject || ""} 
                                            placeholder="Your order confirmed - {{site_name}}" 
                                            required 
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="bodyHtml" className="flex items-center gap-2">
                                            <Code className="h-4 w-4" />
                                            HTML Content
                                        </Label>
                                        <Textarea 
                                            id="bodyHtml" 
                                            name="bodyHtml" 
                                            defaultValue={editingTemplate?.bodyHtml || ""} 
                                            placeholder="<div style='...'>...</div>" 
                                            className="min-h-[400px] font-mono text-xs"
                                            required 
                                        />
                                    </div>
                                </div>
                            </ScrollArea>
                            
                            <DialogFooter className="p-6 pt-2 border-t mt-auto">
                                <Button 
                                    type="submit" 
                                    disabled={saveMutation.isPending}
                                    className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                                >
                                    {saveMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    <Save className="mr-2 h-4 w-4" />
                                    {editingTemplate ? "Update Template" : "Save Template"}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="rounded-xl border border-border/40 bg-card/30 backdrop-blur-sm overflow-hidden shadow-sm">
                <Table>
                    <TableHeader>
                        <TableRow className="hover:bg-transparent border-border/40">
                            <TableHead>Template Type</TableHead>
                            <TableHead className="w-[40%]">Subject</TableHead>
                            <TableHead className="text-center">Status</TableHead>
                            <TableHead className="text-center">Last Updated</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {templates?.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center opacity-50">
                                    No email templates found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            templates?.map((tpl) => (
                                <TableRow key={tpl.id} className="hover:bg-primary/5 border-border/40 transition-colors group">
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                                <FileText className="h-4 w-4 text-primary" />
                                            </div>
                                            <span className="font-bold uppercase tracking-wide text-xs">{tpl.type}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground text-sm italic">
                                        "{tpl.subject}"
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <Badge variant={tpl.active ? "default" : "secondary"}>
                                            {tpl.active ? "ACTIVE" : "DISABLED"}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-center text-xs text-muted-foreground">
                                        {new Date(tpl.updatedAt!).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-primary/10 transition-colors">
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="bg-card/95 backdrop-blur-xl border-border/50">
                                                <DropdownMenuItem onClick={() => {
                                                    setEditingTemplate(tpl);
                                                    setIsOpen(true);
                                                }} className="gap-2 focus:bg-orange-500/10 focus:text-orange-500 cursor-pointer">
                                                    <Pencil className="h-4 w-4" />
                                                    Edit Template
                                                </DropdownMenuItem>
                                                <DropdownMenuItem 
                                                    onClick={() => deleteMutation.mutate(tpl.id)}
                                                    className="gap-2 text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                    Delete Template
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
