import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
    Search, 
    Shield, 
    Trash2, 
    Loader2, 
    Plus, 
    MoreVertical,
    Pencil,
    UserPlus,
    Mail,
    Lock,
    Gamepad2
} from "lucide-react";
import { useState } from "react";
import { User, AdminRole, InsertUser } from "@data/schema";
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
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export function UsersTab() {
  const { token } = useAdminAuth();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<Partial<User> | null>(null);

  const { data: users, isLoading } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
    enabled: !!token,
    queryFn: async () => {
      const res = await fetch("/api/admin/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch users");
      return res.json();
    },
  });

  const { data: roles } = useQuery<AdminRole[]>({
    queryKey: ["/api/admin/roles"],
    enabled: !!token,
    queryFn: async () => {
      const res = await fetch("/api/admin/roles", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch roles");
      return res.json();
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (data: any) => {
        const url = editingUser?.id 
            ? `/api/admin/users/${editingUser.id}` 
            : "/api/admin/users";
        const method = editingUser?.id ? "PATCH" : "POST";
        
        const res = await fetch(url, {
            method,
            headers: { 
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}` 
            },
            body: JSON.stringify(data),
        });
        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.message || "Failed to save user");
        }
        return res.json();
    },
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
        setIsOpen(false);
        setEditingUser(null);
        toast({ title: editingUser?.id ? "User updated" : "User created" });
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
        const res = await fetch(`/api/admin/users/${id}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to delete user");
    },
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
        toast({ title: "User deleted" });
    }
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data: any = {
        minecraftUsername: formData.get("minecraftUsername") as string,
        email: formData.get("email") as string,
        roleId: formData.get("roleId") as string,
    };
    
    const password = formData.get("password") as string;
    if (password) data.password = password;

    saveMutation.mutate(data);
  };

  const filteredUsers = users?.filter(u => 
    u.minecraftUsername.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">User Management</h2>
          <p className="text-muted-foreground">Manage community members and their server roles.</p>
        </div>
        <div className="flex items-center gap-2">
            <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 bg-card/50"
                />
            </div>
            <Dialog open={isOpen} onOpenChange={(open) => {
                setIsOpen(open);
                if (!open) setEditingUser(null);
            }}>
                <DialogTrigger asChild>
                    <Button className="gap-2 bg-orange-500 hover:bg-orange-600 text-white shadow-lg shadow-orange-500/20">
                        <Plus className="h-4 w-4" />
                        Add User
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px] bg-card/95 backdrop-blur-xl border-border/50">
                    <form onSubmit={handleSubmit}>
                        <DialogHeader>
                            <DialogTitle>{editingUser ? "Edit User" : "Create New User"}</DialogTitle>
                            <DialogDescription>
                                {editingUser ? "Update profile for " + editingUser.minecraftUsername : "Create a new community member manually."}
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="minecraftUsername" className="flex items-center gap-2">
                                    <Gamepad2 className="h-4 w-4" />
                                    Minecraft Username
                                </Label>
                                <Input 
                                    id="minecraftUsername" 
                                    name="minecraftUsername" 
                                    defaultValue={editingUser?.minecraftUsername} 
                                    placeholder="Username" 
                                    required 
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="email" className="flex items-center gap-2">
                                    <Mail className="h-4 w-4" />
                                    Email Address
                                </Label>
                                <Input 
                                    id="email" 
                                    name="email" 
                                    type="email"
                                    defaultValue={editingUser?.email || ""} 
                                    placeholder="name@example.com" 
                                    required 
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="password" className="flex items-center gap-2">
                                    <Lock className="h-4 w-4" />
                                    Password {editingUser && "(Leave blank to keep)"}
                                </Label>
                                <Input 
                                    id="password" 
                                    name="password" 
                                    type="password"
                                    placeholder="••••••••" 
                                    required={!editingUser} 
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="roleId" className="flex items-center gap-2">
                                    <Shield className="h-4 w-4" />
                                    Role
                                </Label>
                                <Select name="roleId" defaultValue={editingUser?.roleId || "user"}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select role" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {roles?.map(role => (
                                            <SelectItem key={role.id} value={role.id}>
                                                {role.displayName}
                                            </SelectItem>
                                        ))}
                                        {!roles && <SelectItem value="user">User</SelectItem>}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button 
                                type="submit" 
                                disabled={saveMutation.isPending}
                                className="bg-orange-500 hover:bg-orange-600 text-white"
                            >
                                {saveMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {editingUser ? "Update User" : "Create User"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
      </div>

      <div className="rounded-xl border border-border/40 bg-card/30 backdrop-blur-sm overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-border/40">
              <TableHead>User</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers?.map((user) => (
              <TableRow key={user.id} className="hover:bg-primary/5 border-border/40 transition-colors group">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="relative">
                        <Avatar className="h-10 w-10 border-2 border-primary/20 group-hover:border-primary/40 transition-colors">
                        <AvatarImage src={`https://mc-heads.net/avatar/${user.minecraftUsername}/40`} />
                        <AvatarFallback className="bg-orange-500/10 text-orange-500">{user.minecraftUsername.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-green-500 border-2 border-background" />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-bold text-base leading-tight">{user.minecraftUsername}</span>
                      <span className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider">{user.id.slice(0, 8)}</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">{user.email || <span className="italic opacity-50">Not set</span>}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={`capitalize bg-primary/5 border-primary/20 text-primary px-2 py-0.5 rounded-md`}>
                    {user.roleId || "user"}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground text-sm font-medium">
                    {new Date(user.createdAt!).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                </TableCell>
                <TableCell className="text-right">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-9 w-9 hover:bg-primary/10 transition-colors">
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-card/95 backdrop-blur-xl border-border/50 min-w-[150px]">
                            <DropdownMenuItem onClick={() => {
                                setEditingUser(user);
                                setIsOpen(true);
                            }} className="gap-2 focus:bg-orange-500/10 focus:text-orange-500 cursor-pointer">
                                <Pencil className="h-4 w-4" />
                                Edit Profile
                            </DropdownMenuItem>
                            <DropdownMenuItem className="gap-2 focus:bg-orange-500/10 focus:text-orange-500 cursor-pointer">
                                <Shield className="h-4 w-4" />
                                Permissions
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                                onClick={() => deleteMutation.mutate(user.id)}
                                className="gap-2 text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer"
                            >
                                <Trash2 className="h-4 w-4" />
                                Delete User
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
            {filteredUsers?.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center">
                    <div className="flex flex-col items-center gap-2 opacity-50">
                        <Search className="h-8 w-8" />
                        <p>No adventurers found matching that name.</p>
                    </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
