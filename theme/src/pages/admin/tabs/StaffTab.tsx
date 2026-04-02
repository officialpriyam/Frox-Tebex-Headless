import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
    Plus, 
    Edit2, 
    Trash2, 
    Loader2, 
    MoreVertical,
    Pencil,
    Network
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
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "@/hooks/use-toast";
import { StaffMember, InsertStaffMember } from "@data/schema";
import { useAdminAuth } from "../AdminLogin";

export function StaffTab() {
    const { token } = useAdminAuth();
    const queryClient = useQueryClient();
    const [isOpen, setIsOpen] = useState(false);
    const [editingMember, setEditingMember] = useState<Partial<StaffMember> | null>(null);

    const { data: staff, isLoading } = useQuery<StaffMember[]>({
        queryKey: ["/api/admin/staff"],
        enabled: !!token,
        queryFn: async () => {
            const res = await fetch("/api/admin/staff", {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) throw new Error("Failed to fetch staff");
            return res.json();
        },
    });

    const saveMutation = useMutation({
        mutationFn: async (data: Partial<InsertStaffMember>) => {
            const url = editingMember?.id 
                ? `/api/admin/staff/${editingMember.id}` 
                : "/api/admin/staff";
            const method = editingMember?.id ? "PATCH" : "POST";
            
            const res = await fetch(url, {
                method,
                headers: { 
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}` 
                },
                body: JSON.stringify(data),
            });
            if (!res.ok) throw new Error("Failed to save staff member");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/admin/staff"] });
            setIsOpen(false);
            setEditingMember(null);
            toast({ title: editingMember?.id ? "Staff member updated" : "Staff member added" });
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
            const res = await fetch(`/api/admin/staff/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) throw new Error("Failed to delete staff member");
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/admin/staff"] });
            toast({ title: "Staff member removed" });
        }
    });

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const data: Partial<InsertStaffMember> = {
            minecraftUsername: formData.get("minecraftUsername") as string,
            role: formData.get("role") as string,
            roleColor: formData.get("roleColor") as string,
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
                    <h2 className="text-2xl font-bold tracking-tight">Staff Roster</h2>
                    <p className="text-muted-foreground">Manage the team members displayed on your public staff page.</p>
                </div>
                <Dialog open={isOpen} onOpenChange={(open) => {
                    setIsOpen(open);
                    if (!open) setEditingMember(null);
                }}>
                    <DialogTrigger asChild>
                        <Button className="gap-2 bg-orange-500 hover:bg-orange-600 text-white shadow-lg shadow-orange-500/20">
                            <Plus className="h-4 w-4" />
                            Add Staff Member
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px] bg-card/95 backdrop-blur-xl border-border/50">
                        <form onSubmit={handleSubmit}>
                            <DialogHeader>
                                <DialogTitle>{editingMember ? "Edit Staff Member" : "Add Staff Member"}</DialogTitle>
                                <DialogDescription>
                                    Enter the staff member's details. Minecraft skins are fetched automatically.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="minecraftUsername">Minecraft Username</Label>
                                    <Input 
                                        id="minecraftUsername" 
                                        name="minecraftUsername" 
                                        defaultValue={editingMember?.minecraftUsername} 
                                        placeholder="Username" 
                                        required 
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="role">Role</Label>
                                    <Input 
                                        id="role" 
                                        name="role" 
                                        defaultValue={editingMember?.role} 
                                        placeholder="e.g. Moderator" 
                                        required 
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="roleColor">Role Color (Hex)</Label>
                                    <div className="flex gap-2">
                                        <Input 
                                            id="roleColor" 
                                            name="roleColor" 
                                            defaultValue={editingMember?.roleColor || "#22c55e"} 
                                            placeholder="#22c55e" 
                                            className="font-mono"
                                        />
                                        <div 
                                            className="w-10 h-10 rounded border" 
                                            style={{ backgroundColor: editingMember?.roleColor || "#22c55e" }} 
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="sortOrder">Sort Order</Label>
                                        <Input 
                                            id="sortOrder" 
                                            name="sortOrder" 
                                            type="number" 
                                            defaultValue={editingMember?.sortOrder || 0} 
                                        />
                                    </div>
                                    <div className="flex items-center space-x-2 pt-8">
                                        <Switch 
                                            id="active" 
                                            name="active" 
                                            defaultChecked={editingMember?.active ?? true} 
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
                                    Save Staff Member
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
                            <TableHead>Member</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead className="text-center">Status</TableHead>
                            <TableHead className="text-center">Order</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {staff?.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                                    No staff members found. Build your team!
                                </TableCell>
                            </TableRow>
                        ) : (
                            staff?.map((member) => (
                                <TableRow key={member.id} className="hover:bg-primary/5 border-border/40 group transition-colors">
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-10 w-10 border-2 border-primary/20">
                                                <AvatarImage src={`https://mc-heads.net/avatar/${member.minecraftUsername}/40`} />
                                                <AvatarFallback>{member.minecraftUsername.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <span className="font-bold text-lg">{member.minecraftUsername}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <div 
                                                className="w-3 h-3 rounded-full shadow-sm" 
                                                style={{ backgroundColor: member.roleColor || "#currentColor" }} 
                                            />
                                            <span className="font-medium" style={{ color: member.roleColor || "inherit" }}>
                                                {member.role}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                            member.active 
                                                ? "bg-green-500/10 text-green-500 border border-green-500/20" 
                                                : "bg-red-500/10 text-red-500 border border-red-500/20"
                                        }`}>
                                            {member.active ? "Active" : "Inactive"}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-center font-mono text-muted-foreground">
                                        {member.sortOrder}
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
                                                    setEditingMember(member);
                                                    setIsOpen(true);
                                                }} className="gap-2 focus:bg-orange-500/10 focus:text-orange-500">
                                                    <Pencil className="h-4 w-4" />
                                                    Edit Member
                                                </DropdownMenuItem>
                                                <DropdownMenuItem 
                                                    onClick={() => deleteMutation.mutate(member.id)}
                                                    className="gap-2 text-destructive focus:bg-destructive/10 focus:text-destructive"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                    Remove Member
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
