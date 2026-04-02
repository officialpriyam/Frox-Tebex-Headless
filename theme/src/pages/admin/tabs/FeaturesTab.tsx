import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
    Plus, 
    MoreVertical, 
    Pencil, 
    Trash2, 
    Sparkles,
    Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";
import { Feature, InsertFeature } from "@data/schema";
import { useAdminAuth } from "../AdminLogin";

export function FeaturesTab() {
    const { token } = useAdminAuth();
    const queryClient = useQueryClient();
    const [isOpen, setIsOpen] = useState(false);
    const [editingFeature, setEditingFeature] = useState<Partial<Feature> | null>(null);

    const { data: features, isLoading } = useQuery<Feature[]>({
        queryKey: ["/api/admin/features"],
        enabled: !!token,
        queryFn: async () => {
            const res = await fetch("/api/admin/features", {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) throw new Error("Failed to fetch features");
            return res.json();
        },
    });

    const saveMutation = useMutation({
        mutationFn: async (data: Partial<InsertFeature>) => {
            const url = editingFeature?.id 
                ? `/api/admin/features/${editingFeature.id}` 
                : "/api/admin/features";
            const method = editingFeature?.id ? "PATCH" : "POST";
            
            const res = await fetch(url, {
                method,
                headers: { 
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}` 
                },
                body: JSON.stringify(data),
            });
            if (!res.ok) throw new Error("Failed to save feature");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/admin/features"] });
            setIsOpen(false);
            setEditingFeature(null);
            toast({ title: editingFeature?.id ? "Feature updated" : "Feature added" });
        },
        onError: (error: Error) => {
            toast({ 
                title: "Error", 
                description: error.message, 
                variant: "destructive" 
            });
        }
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            const res = await fetch(`/api/admin/features/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) throw new Error("Failed to delete feature");
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/admin/features"] });
            toast({ title: "Feature deleted" });
        }
    });

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const data: Partial<InsertFeature> = {
            name: formData.get("name") as string,
            description: formData.get("description") as string,
            icon: formData.get("icon") as string,
            active: formData.get("active") === "on",
            sortOrder: parseInt(formData.get("sortOrder") as string) || 0,
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
                    <h2 className="text-2xl font-bold tracking-tight">Features</h2>
                    <p className="text-muted-foreground">Manage highlighting features for your server</p>
                </div>
                <Dialog open={isOpen} onOpenChange={(open) => {
                    setIsOpen(open);
                    if (!open) setEditingFeature(null);
                }}>
                    <DialogTrigger asChild>
                        <Button className="gap-2 bg-orange-500 hover:bg-orange-600 text-white shadow-lg shadow-orange-500/20">
                            <Plus className="h-4 w-4" />
                            Add Feature
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px] bg-card/95 backdrop-blur-xl border-border/50">
                        <form onSubmit={handleSubmit}>
                            <DialogHeader>
                                <DialogTitle>{editingFeature ? "Edit Feature" : "Add New Feature"}</DialogTitle>
                                <DialogDescription>
                                    Define a new feature to showcase on your landing page.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="name">Name</Label>
                                    <Input 
                                        id="name" 
                                        name="name" 
                                        defaultValue={editingFeature?.name} 
                                        placeholder="e.g. Robust Trading" 
                                        required 
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="icon">Icon (Lucide name or URL)</Label>
                                    <Input 
                                        id="icon" 
                                        name="icon" 
                                        defaultValue={editingFeature?.icon || "Sparkles"} 
                                        placeholder="Sparkles" 
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="description">Description</Label>
                                    <Textarea 
                                        id="description" 
                                        name="description" 
                                        defaultValue={editingFeature?.description || ""} 
                                        placeholder="Briefly explain this feature..." 
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="sortOrder">Sort Order</Label>
                                        <Input 
                                            id="sortOrder" 
                                            name="sortOrder" 
                                            type="number" 
                                            defaultValue={editingFeature?.sortOrder || 0} 
                                        />
                                    </div>
                                    <div className="flex items-center space-x-2 pt-8">
                                        <Switch 
                                            id="active" 
                                            name="active" 
                                            defaultChecked={editingFeature?.active ?? true} 
                                        />
                                        <Label htmlFor="active">Active</Label>
                                    </div>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button 
                                    type="submit" 
                                    disabled={saveMutation.isPending}
                                    className="bg-orange-500 hover:bg-orange-600 text-white"
                                >
                                    {saveMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Save
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="rounded-xl border border-border/40 bg-card/30 backdrop-blur-sm overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="hover:bg-transparent border-border/40">
                            <TableHead className="w-[80px]">Icon</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead className="text-center w-[100px]">Status</TableHead>
                            <TableHead className="text-right w-[100px]">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {features?.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                                    No features found. Highlight your server's uniqueness!
                                </TableCell>
                            </TableRow>
                        ) : (
                            features?.map((f) => (
                                <TableRow key={f.id} className="hover:bg-primary/5 border-border/40 group transition-colors">
                                    <TableCell>
                                        <div className="p-2 rounded-lg bg-orange-500/10 text-orange-500 w-fit">
                                            <Sparkles className="h-5 w-5" />
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-bold">{f.name}</TableCell>
                                    <TableCell className="text-muted-foreground line-clamp-1 max-w-xs">
                                        {f.description || "No description"}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                            f.active 
                                                ? "bg-green-500/10 text-green-500 border border-green-500/20" 
                                                : "bg-red-500/10 text-red-500 border border-red-500/20"
                                        }`}>
                                            {f.active ? "Active" : "Disabled"}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="hover:bg-primary/10">
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="bg-card/95 backdrop-blur-xl border-border/50">
                                                <DropdownMenuItem onClick={() => {
                                                    setEditingFeature(f);
                                                    setIsOpen(true);
                                                }} className="gap-2 focus:bg-orange-500/10 focus:text-orange-500">
                                                    <Pencil className="h-4 w-4" />
                                                    Edit
                                                </DropdownMenuItem>
                                                <DropdownMenuItem 
                                                    onClick={() => deleteMutation.mutate(f.id)}
                                                    className="gap-2 text-destructive focus:bg-destructive/10 focus:text-destructive"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                    Delete
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
