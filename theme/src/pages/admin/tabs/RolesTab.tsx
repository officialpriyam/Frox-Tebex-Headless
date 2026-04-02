import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { 
    Shield, 
    Plus, 
    Pencil, 
    Trash2, 
    Loader2, 
    Check, 
    X,
    MoreVertical,
    Settings,
    LayoutDashboard,
    ShoppingBag,
    Users as UsersIcon,
    Mail,
    Terminal,
    MessageSquare,
    Save
} from "lucide-react";
import { useState } from "react";
import { AdminRole, InsertAdminRole } from "@data/schema";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const PERMISSION_KEYS = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "orders", label: "Orders", icon: ShoppingBag },
    { id: "store", label: "Store", icon: ShoppingBag },
    { id: "gamemodes", label: "Gamemodes", icon: Settings },
    { id: "features", label: "Features", icon: Settings },
    { id: "staff", label: "Staff", icon: UsersIcon },
    { id: "announcements", label: "Announcements", icon: MessageSquare },
    { id: "faq", label: "FAQ", icon: MessageSquare },
    { id: "vote_sites", label: "Vote Sites", icon: Settings },
    { id: "coupons", label: "Coupons", icon: ShoppingBag },
    { id: "emails", label: "Emails", icon: Mail },
    { id: "console", label: "Console", icon: Terminal },
    { id: "settings", label: "Settings", icon: Settings },
    { id: "users", label: "Users", icon: UsersIcon },
    { id: "roles", label: "Roles", icon: Shield },
    { id: "punishments", label: "Punishments", icon: Shield },
];

export function RolesTab() {
  const { token } = useAdminAuth();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Partial<AdminRole> | null>(null);

  const { data: roles, isLoading } = useQuery<AdminRole[]>({
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
        const url = editingRole?.id && roles?.find(r => r.id === editingRole.id)
            ? `/api/admin/roles/${editingRole.id}` 
            : "/api/admin/roles";
        const method = editingRole?.id && roles?.find(r => r.id === editingRole.id) ? "PATCH" : "POST";
        
        const res = await fetch(url, {
            method,
            headers: { 
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}` 
            },
            body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error("Failed to save role");
        return res.json();
    },
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["/api/admin/roles"] });
        setIsOpen(false);
        setEditingRole(null);
        toast({ title: "Role saved successfully" });
    },
    onError: (error: Error) => {
        toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
        const res = await fetch(`/api/admin/roles/${id}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to delete role");
    },
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["/api/admin/roles"] });
        toast({ title: "Role deleted" });
    }
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    // Extract permissions from checkboxes
    const permissions: Record<string, any> = {};
    PERMISSION_KEYS.forEach(pk => {
        const view = formData.get(`perm_${pk.id}_view`) === "on";
        const manage = formData.get(`perm_${pk.id}_manage`) === "on" || formData.get(`perm_${pk.id}_command`) === "on";
        
        if (pk.id === "console") {
            permissions[pk.id] = { view, command: manage };
        } else {
            permissions[pk.id] = { view, manage };
        }
    });

    const data: Partial<InsertAdminRole> = {
        id: (formData.get("id") as string).toLowerCase().replace(/[^a-z0-9]/g, "_"),
        displayName: formData.get("displayName") as string,
        color: formData.get("color") as string,
        hasAdminAccess: formData.get("hasAdminAccess") === "on",
        showOnStaffPage: formData.get("showOnStaffPage") === "on",
        sortOrder: parseInt(formData.get("sortOrder") as string) || 0,
        permissions: permissions
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
          <h2 className="text-2xl font-bold tracking-tight">Roles & Permissions</h2>
          <p className="text-muted-foreground">Define access levels for your team members.</p>
        </div>
        <Dialog open={isOpen} onOpenChange={(open) => {
            setIsOpen(open);
            if (!open) setEditingRole(null);
        }}>
            <DialogTrigger asChild>
                <Button className="gap-2 bg-orange-500 hover:bg-orange-600 text-white shadow-lg shadow-orange-500/20">
                    <Plus className="h-4 w-4" />
                    Create Role
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[700px] bg-card/95 backdrop-blur-xl border-border/50 max-h-[90vh] overflow-hidden flex flex-col p-0">
                <form onSubmit={handleSubmit} className="flex flex-col h-full">
                    <DialogHeader className="p-6 pb-0">
                        <DialogTitle>{editingRole ? "Edit Role" : "Create Role"}</DialogTitle>
                        <DialogDescription>
                            Configure core identity and granular permissions for this role.
                        </DialogDescription>
                    </DialogHeader>
                    
                    <ScrollArea className="flex-1 p-6">
                        <Tabs defaultValue="general" className="w-full">
                            <TabsList className="grid w-full grid-cols-2 bg-card border mb-6">
                                <TabsTrigger value="general">General Info</TabsTrigger>
                                <TabsTrigger value="permissions">Permissions</TabsTrigger>
                            </TabsList>
                            
                            <TabsContent value="general" className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="id">Internal ID</Label>
                                        <Input 
                                            id="id" 
                                            name="id" 
                                            placeholder="e.g. moderator" 
                                            defaultValue={editingRole?.id}
                                            disabled={!!editingRole?.id && roles?.some(r => r.id === editingRole.id)}
                                            required 
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="displayName">Display Name</Label>
                                        <Input 
                                            id="displayName" 
                                            name="displayName" 
                                            placeholder="e.g. Moderator" 
                                            defaultValue={editingRole?.displayName}
                                            required 
                                        />
                                    </div>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="color">Role Color (Hex)</Label>
                                        <div className="flex gap-2">
                                            <Input 
                                                id="color" 
                                                name="color" 
                                                placeholder="#22c55e" 
                                                defaultValue={editingRole?.color || "#94a3b8"}
                                                className="font-mono"
                                            />
                                            <div className="w-10 h-10 rounded border border-border/40" style={{ backgroundColor: editingRole?.color || "#94a3b8" }} />
                                        </div>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="sortOrder">Sort Order</Label>
                                        <Input 
                                            id="sortOrder" 
                                            name="sortOrder" 
                                            type="number"
                                            placeholder="0" 
                                            defaultValue={editingRole?.sortOrder || 0}
                                        />
                                    </div>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-6 pt-4">
                                    <div className="flex items-center justify-between p-3 rounded-lg border bg-card/50">
                                        <div className="space-y-0.5">
                                            <Label className="text-sm font-medium">Admin Access</Label>
                                            <p className="text-[10px] text-muted-foreground">Can access admin dashboard</p>
                                        </div>
                                        <Switch name="hasAdminAccess" defaultChecked={editingRole?.hasAdminAccess ?? false} />
                                    </div>
                                    <div className="flex items-center justify-between p-3 rounded-lg border bg-card/50">
                                        <div className="space-y-0.5">
                                            <Label className="text-sm font-medium">Show on Staff</Label>
                                            <p className="text-[10px] text-muted-foreground">Visible on public staff page</p>
                                        </div>
                                        <Switch name="showOnStaffPage" defaultChecked={editingRole?.showOnStaffPage ?? false} />
                                    </div>
                                </div>
                            </TabsContent>
                            
                            <TabsContent value="permissions">
                                <div className="space-y-2">
                                    <div className="grid grid-cols-12 gap-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2 px-2">
                                        <div className="col-span-6">Module</div>
                                        <div className="col-span-3 text-center">View</div>
                                        <div className="col-span-3 text-center">Manage</div>
                                    </div>
                                    <div className="space-y-1">
                                        {PERMISSION_KEYS.map(pk => (
                                            <div key={pk.id} className="grid grid-cols-12 gap-2 p-2 rounded-md hover:bg-primary/5 transition-colors items-center border border-transparent hover:border-primary/10">
                                                <div className="col-span-6 flex items-center gap-2">
                                                    <pk.icon className="h-3.5 w-3.5 text-primary/70" />
                                                    <span className="text-sm font-medium">{pk.label}</span>
                                                </div>
                                                <div className="col-span-3 flex justify-center">
                                                    <Switch 
                                                        name={`perm_${pk.id}_view`} 
                                                        defaultChecked={(editingRole?.permissions as any)?.[pk.id]?.view ?? false} 
                                                    />
                                                </div>
                                                <div className="col-span-3 flex justify-center">
                                                    <Switch 
                                                        name={`perm_${pk.id}_${pk.id === 'console' ? 'command' : 'manage'}`} 
                                                        defaultChecked={(editingRole?.permissions as any)?.[pk.id]?.[pk.id === 'console' ? 'command' : 'manage'] ?? false} 
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </TabsContent>
                        </Tabs>
                    </ScrollArea>

                    <DialogFooter className="p-6 pt-2 border-t mt-auto">
                        <Button 
                            type="submit" 
                            disabled={saveMutation.isPending}
                            className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                        >
                            {saveMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            <Save className="mr-2 h-4 w-4" />
                            {editingRole ? "Update Role" : "Create Role"}
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
              <TableHead>Role</TableHead>
              <TableHead>Permissions Overview</TableHead>
              <TableHead className="text-center">Admin Access</TableHead>
              <TableHead className="text-center">Staff Page</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {roles?.map((role) => (
              <TableRow key={role.id} className="hover:bg-primary/5 border-border/40 transition-colors group">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div 
                        className="w-4 h-4 rounded-full shadow-sm border border-white/10" 
                        style={{ backgroundColor: role.color || "#currentColor" }} 
                    />
                    <div className="flex flex-col">
                      <span className="font-bold text-base leading-tight" style={{ color: role.color || "inherit" }}>
                        {role.displayName}
                      </span>
                      <span className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider">{role.id}</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {Object.entries(role.permissions as Record<string, any>)
                        .filter(([_, perms]) => perms.view || perms.manage || perms.command)
                        .slice(0, 4)
                        .map(([key, perms]) => (
                            <Badge key={key} variant="outline" className="text-[10px] px-1.5 py-0 bg-white/5 border-white/10 opacity-70">
                                {key} {perms.manage || perms.command ? "*" : ""}
                            </Badge>
                        ))
                    }
                    {Object.keys(role.permissions as object).length > 4 && (
                        <span className="text-[10px] text-muted-foreground">+{Object.keys(role.permissions as object).length - 4} more</span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-center">
                    {role.hasAdminAccess ? (
                        <Badge className="bg-green-500/10 text-green-500 border-green-500/20 hover:bg-green-500/20">
                            <Check className="h-3 w-3 mr-1" /> YES
                        </Badge>
                    ) : (
                        <Badge variant="outline" className="text-muted-foreground opacity-50 border-border/40">
                            NO
                        </Badge>
                    )}
                </TableCell>
                <TableCell className="text-center">
                    {role.showOnStaffPage ? (
                        <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20 hover:bg-blue-500/20">
                            YES
                        </Badge>
                    ) : (
                        <Badge variant="outline" className="text-muted-foreground opacity-50 border-border/40">
                            NO
                        </Badge>
                    )}
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
                                setEditingRole(role);
                                setIsOpen(true);
                            }} className="gap-2 focus:bg-orange-500/10 focus:text-orange-500 cursor-pointer">
                                <Pencil className="h-4 w-4" />
                                Edit Role
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                                onClick={() => deleteMutation.mutate(role.id)}
                                disabled={role.id === "owner" || role.id === "user"}
                                className="gap-2 text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer"
                            >
                                <Trash2 className="h-4 w-4" />
                                Delete Role
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
