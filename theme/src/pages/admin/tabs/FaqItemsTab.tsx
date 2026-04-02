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
    MessageCircle,
    LayoutList
} from "lucide-react";
import { useState } from "react";
import { FaqItem, FaqCategory, InsertFaqItem } from "@data/schema";
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

export function FaqItemsTab() {
    const { token } = useAdminAuth();
    const queryClient = useQueryClient();
    const [isOpen, setIsOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<Partial<FaqItem> | null>(null);

    const { data: items, isLoading } = useQuery<FaqItem[]>({
        queryKey: ["/api/admin/faq-items"],
        enabled: !!token,
        queryFn: async () => {
            const res = await fetch("/api/admin/faq-items", {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) throw new Error("Failed to fetch FAQ items");
            return res.json();
        },
    });

    const { data: categories } = useQuery<FaqCategory[]>({
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
        mutationFn: async (data: Partial<InsertFaqItem>) => {
            const url = editingItem?.id 
                ? `/api/admin/faq-items/${editingItem.id}` 
                : "/api/admin/faq-items";
            const method = editingItem?.id ? "PATCH" : "POST";
            
            const res = await fetch(url, {
                method,
                headers: { 
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}` 
                },
                body: JSON.stringify(data),
            });
            if (!res.ok) throw new Error("Failed to save FAQ item");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/admin/faq-items"] });
            setIsOpen(false);
            setEditingItem(null);
            toast({ title: "FAQ item saved successfully" });
        },
        onError: (error: Error) => {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        }
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            const res = await fetch(`/api/admin/faq-items/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) throw new Error("Failed to delete FAQ item");
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/admin/faq-items"] });
            toast({ title: "FAQ item deleted" });
        }
    });

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const data: Partial<InsertFaqItem> = {
            question: formData.get("question") as string,
            answer: formData.get("answer") as string,
            categoryId: formData.get("categoryId") as string,
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
                    <h2 className="text-2xl font-bold tracking-tight">FAQ Manager</h2>
                    <p className="text-muted-foreground">Manage the content of your frequently asked questions.</p>
                </div>
                <Dialog open={isOpen} onOpenChange={(open) => {
                    setIsOpen(open);
                    if (!open) setEditingItem(null);
                }}>
                    <DialogTrigger asChild>
                        <Button className="gap-2 bg-orange-500 hover:bg-orange-600 text-white shadow-lg shadow-orange-500/20">
                            <Plus className="h-4 w-4" />
                            Add FAQ Item
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px] bg-card/95 backdrop-blur-xl border-border/50">
                        <form onSubmit={handleSubmit}>
                            <DialogHeader>
                                <DialogTitle>{editingItem ? "Edit FAQ" : "Add FAQ Item"}</DialogTitle>
                                <DialogDescription>
                                    Create a helpful question and answer pair for your players.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="question">Question</Label>
                                    <Input 
                                        id="question" 
                                        name="question" 
                                        defaultValue={editingItem?.question} 
                                        placeholder="e.g. How do I join the Discord?" 
                                        required 
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="answer">Answer</Label>
                                    <Textarea 
                                        id="answer" 
                                        name="answer" 
                                        defaultValue={editingItem?.answer} 
                                        placeholder="Enter the detailed answer here..." 
                                        className="min-h-[120px]"
                                        required 
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="categoryId">Category</Label>
                                    <Select name="categoryId" defaultValue={editingItem?.categoryId}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {categories?.map(cat => (
                                                <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="sortOrder">Sort Order</Label>
                                        <Input 
                                            id="sortOrder" 
                                            name="sortOrder" 
                                            type="number" 
                                            defaultValue={editingItem?.sortOrder || 0} 
                                        />
                                    </div>
                                    <div className="flex items-center space-x-2 pt-8">
                                        <Switch 
                                            id="active" 
                                            name="active" 
                                            defaultChecked={editingItem?.active ?? true} 
                                        />
                                        <Label htmlFor="active">Published</Label>
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
                                    {editingItem ? "Update FAQ" : "Save FAQ"}
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
                            <TableHead className="w-[40%]">Question</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead className="text-center">Order</TableHead>
                            <TableHead className="text-center">Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {items?.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center opacity-50">
                                    No FAQ items found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            items?.map((item) => {
                                const category = categories?.find(c => c.id === item.categoryId);
                                return (
                                    <TableRow key={item.id} className="hover:bg-primary/5 border-border/40 transition-colors group">
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                                    <MessageCircle className="h-4 w-4 text-primary" />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-sm line-clamp-1">{item.question}</span>
                                                    <span className="text-[10px] text-muted-foreground line-clamp-1">{item.answer.substring(0, 50)}...</span>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="font-normal border-primary/20 text-primary bg-primary/5">
                                                {category?.name || "Uncategorized"}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-center font-mono text-muted-foreground">
                                            {item.sortOrder}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <div className={`w-2 h-2 rounded-full mx-auto ${item.active ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]' : 'bg-red-500 opacity-30'}`} />
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
                                                        setEditingItem(item);
                                                        setIsOpen(true);
                                                    }} className="gap-2 focus:bg-orange-500/10 focus:text-orange-500 cursor-pointer">
                                                        <Pencil className="h-4 w-4" />
                                                        Edit
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem 
                                                        onClick={() => deleteMutation.mutate(item.id)}
                                                        className="gap-2 text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                        Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
