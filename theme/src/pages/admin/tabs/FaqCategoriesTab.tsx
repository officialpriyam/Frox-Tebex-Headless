import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { 
    Plus, 
    Pencil, 
    Trash2, 
    Loader2, 
    MoreVertical,
    HelpCircle,
    Settings,
    Save,
    LayoutGrid
} from "lucide-react";
import { useState } from "react";
import { FaqCategory, InsertFaqCategory } from "@data/schema";
import { useAdminAuth } from "../AdminLogin";
import { toast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
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

export function FaqCategoriesTab() {
    const { token } = useAdminAuth();
    const queryClient = useQueryClient();
    const [isOpen, setIsOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Partial<FaqCategory> | null>(null);

    const { data: categories, isLoading } = useQuery<FaqCategory[]>({
        queryKey: ["/api/admin/faq-categories"],
        enabled: !!token,
        queryFn: async () => {
            const res = await fetch("/api/admin/faq-categories", {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) throw new Error("Failed to fetch FAQ categories");
            return res.json();
        },
    });

    const saveMutation = useMutation({
        mutationFn: async (data: Partial<InsertFaqCategory>) => {
            const url = editingCategory?.id 
                ? `/api/admin/faq-categories/${editingCategory.id}` 
                : "/api/admin/faq-categories";
            const method = editingCategory?.id ? "PATCH" : "POST";
            
            const res = await fetch(url, {
                method,
                headers: { 
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}` 
                },
                body: JSON.stringify(data),
            });
            if (!res.ok) throw new Error("Failed to save FAQ category");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/admin/faq-categories"] });
            setIsOpen(false);
            setEditingCategory(null);
            toast({ title: "Category saved successfully" });
        },
        onError: (error: Error) => {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        }
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            const res = await fetch(`/api/admin/faq-categories/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) throw new Error("Failed to delete category");
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/admin/faq-categories"] });
            toast({ title: "Category deleted" });
        }
    });

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const data: Partial<InsertFaqCategory> = {
            name: formData.get("name") as string,
            icon: formData.get("icon") as string,
            sortOrder: parseInt(formData.get("sortOrder") as string) || 0,
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
                    <h2 className="text-2xl font-bold tracking-tight">FAQ Categories</h2>
                    <p className="text-muted-foreground">Organize your frequently asked questions into logical groups.</p>
                </div>
                <Dialog open={isOpen} onOpenChange={(open) => {
                    setIsOpen(open);
                    if (!open) setEditingCategory(null);
                }}>
                    <DialogTrigger asChild>
                        <Button className="gap-2 bg-orange-500 hover:bg-orange-600 text-white shadow-lg shadow-orange-500/20">
                            <Plus className="h-4 w-4" />
                            Add Category
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px] bg-card/95 backdrop-blur-xl border-border/50">
                        <form onSubmit={handleSubmit}>
                            <DialogHeader>
                                <DialogTitle>{editingCategory ? "Edit Category" : "Add FAQ Category"}</DialogTitle>
                                <DialogDescription>
                                    Enter the group name and preferred icon.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="name">Category Name</Label>
                                    <Input 
                                        id="name" 
                                        name="name" 
                                        defaultValue={editingCategory?.name} 
                                        placeholder="e.g. Server Rules" 
                                        required 
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="icon">Lucide Icon Name</Label>
                                    <Input 
                                        id="icon" 
                                        name="icon" 
                                        defaultValue={editingCategory?.icon || "HelpCircle"} 
                                        placeholder="HelpCircle, Settings, Shield, etc." 
                                    />
                                    <p className="text-[10px] text-muted-foreground">Uses Lucide-react icons. Case sensitive.</p>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="sortOrder">Sort Order</Label>
                                        <Input 
                                            id="sortOrder" 
                                            name="sortOrder" 
                                            type="number" 
                                            defaultValue={editingCategory?.sortOrder || 0} 
                                        />
                                    </div>
                                    <div className="flex items-center space-x-2 pt-8">
                                        <Switch 
                                            id="active" 
                                            name="active" 
                                            defaultChecked={editingCategory?.active ?? true} 
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
                                    <Save className="mr-2 h-4 w-4" />
                                    {editingCategory ? "Update Category" : "Save Category"}
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
                            <TableHead>Category</TableHead>
                            <TableHead className="text-center">Icon</TableHead>
                            <TableHead className="text-center">Order</TableHead>
                            <TableHead className="text-center">Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {categories?.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center opacity-50">
                                    No categories found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            categories?.map((cat) => (
                                <TableRow key={cat.id} className="hover:bg-primary/5 border-border/40 transition-colors group">
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
                                                <LayoutGrid className="h-4 w-4 text-orange-500" />
                                            </div>
                                            <span className="font-bold">{cat.name}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-center font-mono text-sm text-muted-foreground">
                                        {cat.icon}
                                    </TableCell>
                                    <TableCell className="text-center font-mono text-muted-foreground">
                                        {cat.sortOrder}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <Badge variant={cat.active ? "outline" : "secondary"} className={cat.active ? "text-emerald-500 border-emerald-500/20 bg-emerald-500/10" : ""}>
                                            {cat.active ? "ONLINE" : "OFFLINE"}
                                        </Badge>
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
                                                    setEditingCategory(cat);
                                                    setIsOpen(true);
                                                }} className="gap-2 focus:bg-orange-500/10 focus:text-orange-500 cursor-pointer">
                                                    <Pencil className="h-4 w-4" />
                                                    Edit
                                                </DropdownMenuItem>
                                                <DropdownMenuItem 
                                                    onClick={() => deleteMutation.mutate(cat.id)}
                                                    className="gap-2 text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer"
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
