import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
    Plus, 
    MoreVertical, 
    Pencil, 
    Trash2, 
    Gamepad2,
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Gamemode, InsertGamemode } from "@data/schema";
import { useAdminAuth } from "../AdminLogin";

export function GameModesTab() {
    const { token } = useAdminAuth();
    const queryClient = useQueryClient();
    const [isOpen, setIsOpen] = useState(false);
    const [editingGamemode, setEditingGamemode] = useState<Partial<Gamemode> | null>(null);

    const { data: gamemodes, isLoading } = useQuery<Gamemode[]>({
        queryKey: ["/api/admin/gamemodes"],
        enabled: !!token,
        queryFn: async () => {
            const res = await fetch("/api/admin/gamemodes", {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) throw new Error("Failed to fetch gamemodes");
            return res.json();
        },
    });

    const saveMutation = useMutation({
        mutationFn: async (data: Partial<InsertGamemode>) => {
            const url = editingGamemode?.id 
                ? `/api/admin/gamemodes/${editingGamemode.id}` 
                : "/api/admin/gamemodes";
            const method = editingGamemode?.id ? "PATCH" : "POST";
            
            const res = await fetch(url, {
                method,
                headers: { 
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}` 
                },
                body: JSON.stringify(data),
            });
            if (!res.ok) throw new Error("Failed to save gamemode");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/admin/gamemodes"] });
            setIsOpen(false);
            setEditingGamemode(null);
            toast({ title: editingGamemode?.id ? "Gamemode updated" : "Gamemode added" });
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
            const res = await fetch(`/api/admin/gamemodes/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) throw new Error("Failed to delete gamemode");
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/admin/gamemodes"] });
            toast({ title: "Gamemode deleted" });
        }
    });

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const data: Partial<InsertGamemode> = {
            name: formData.get("name") as string,
            icon: formData.get("icon") as string,
            status: formData.get("status") as string,
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
                    <h2 className="text-2xl font-bold tracking-tight">Gamemodes</h2>
                    <p className="text-muted-foreground">Manage your server's gamemodes</p>
                </div>
                <Dialog open={isOpen} onOpenChange={(open) => {
                    setIsOpen(open);
                    if (!open) setEditingGamemode(null);
                }}>
                    <DialogTrigger asChild>
                        <Button className="gap-2 bg-orange-500 hover:bg-orange-600 text-white shadow-lg shadow-orange-500/20">
                            <Plus className="h-4 w-4" />
                            Add Gamemode
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px] bg-card/95 backdrop-blur-xl border-border/50">
                        <form onSubmit={handleSubmit}>
                            <DialogHeader>
                                <DialogTitle>{editingGamemode ? "Edit Gamemode" : "Add New Gamemode"}</DialogTitle>
                                <DialogDescription>
                                    Fill in the details for the gamemode. Click save when you're done.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="name">Name</Label>
                                    <Input 
                                        id="name" 
                                        name="name" 
                                        defaultValue={editingGamemode?.name} 
                                        placeholder="e.g. Survival" 
                                        required 
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="icon">Icon (Lucide name or URL)</Label>
                                    <Input 
                                        id="icon" 
                                        name="icon" 
                                        defaultValue={editingGamemode?.icon || "Gamepad2"} 
                                        placeholder="Gamepad2" 
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="status">Status</Label>
                                        <Select name="status" defaultValue={editingGamemode?.status || "ONLINE"}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="ONLINE">ONLINE</SelectItem>
                                                <SelectItem value="SOON">SOON</SelectItem>
                                                <SelectItem value="OFFLINE">OFFLINE</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="sortOrder">Sort Order</Label>
                                        <Input 
                                            id="sortOrder" 
                                            name="sortOrder" 
                                            type="number" 
                                            defaultValue={editingGamemode?.sortOrder || 0} 
                                        />
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
                            <TableHead className="text-center w-[120px]">Status</TableHead>
                            <TableHead className="text-center w-[100px]">Order</TableHead>
                            <TableHead className="text-right w-[100px]">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {gamemodes?.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                                    No gamemodes found. Add your first one above!
                                </TableCell>
                            </TableRow>
                        ) : (
                            gamemodes?.map((gm) => (
                                <TableRow key={gm.id} className="hover:bg-primary/5 border-border/40 group transition-colors">
                                    <TableCell>
                                        <div className="p-2 rounded-lg bg-orange-500/10 text-orange-500 w-fit">
                                            <Gamepad2 className="h-5 w-5" />
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-bold">{gm.name}</TableCell>
                                    <TableCell className="text-center">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                            gm.status === "ONLINE" 
                                                ? "bg-green-500/10 text-green-500 border border-green-500/20" 
                                                : gm.status === "SOON"
                                                ? "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                                                : "bg-red-500/10 text-red-500 border border-red-500/20"
                                        }`}>
                                            {gm.status}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-center font-mono text-muted-foreground">
                                        {gm.sortOrder}
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
                                                    setEditingGamemode(gm);
                                                    setIsOpen(true);
                                                }} className="gap-2 focus:bg-orange-500/10 focus:text-orange-500">
                                                    <Pencil className="h-4 w-4" />
                                                    Edit
                                                </DropdownMenuItem>
                                                <DropdownMenuItem 
                                                    onClick={() => deleteMutation.mutate(gm.id)}
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
