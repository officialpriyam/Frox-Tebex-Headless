import { useQuery } from "@tanstack/react-query";
import { Layout } from "@/components/Layout";
import { GlassCard } from "@/components/GlassCard";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Loader2, ShieldCheck, Mail, Network } from "lucide-react";
import { StaffMember } from "@data/schema";
import { apiRequestJson } from "@/lib/queryClient";

export default function Staff() {
  const { data: staff, isLoading, isError } = useQuery<StaffMember[]>({
    queryKey: ["/api/staff"],
    queryFn: async () => apiRequestJson<StaffMember[]>("GET", "/api/admin/staff"),
  });

  const activeStaff = staff?.filter(s => s.active).sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)) || [];

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold tracking-tight mb-4">Our Staff Team</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Meet the dedicated individuals who keep our community safe and enjoyable.
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
          </div>
        ) : isError ? (
          <div className="py-20 text-center">
            <p className="text-destructive font-bold mb-2">Connection Issues</p>
            <p className="text-muted-foreground">Unable to retrieve staff data. Please try again later.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {activeStaff.map((member) => (
              <GlassCard key={member.id} className="p-6 flex flex-col items-center text-center group hover:scale-[1.02] transition-transform duration-300">
                <div className="relative mb-4">
                  <div className="absolute -inset-1 bg-gradient-to-r from-primary to-primary/50 rounded-full blur opacity-25 group-hover:opacity-50 transition-opacity" />
                  <Avatar className="h-24 w-24 ring-2 ring-border relative">
                    <AvatarImage src={`https://mc-heads.net/avatar/${member.minecraftUsername}/96`} />
                    <AvatarFallback>{member.minecraftUsername.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-2 -right-2 bg-background rounded-full p-1 border border-border">
                    <ShieldCheck className="h-5 w-5 text-primary" />
                  </div>
                </div>

                <h3 className="text-xl font-bold mb-1">{member.minecraftUsername}</h3>
                <Badge 
                  style={{ 
                    backgroundColor: member.roleColor ? `${member.roleColor}20` : undefined, 
                    color: member.roleColor || undefined, 
                    borderColor: member.roleColor ? `${member.roleColor}30` : undefined 
                  }}
                  className="mb-4 px-3 py-1 font-semibold uppercase tracking-wider text-[10px]"
                >
                  {member.role}
                </Badge>

                <div className="mt-auto pt-4 border-t border-border/50 w-full flex justify-center gap-4">
                   <button className="text-muted-foreground hover:text-primary transition-colors">
                      <Mail className="h-4 w-4" />
                   </button>
                   <button className="text-muted-foreground hover:text-primary transition-colors">
                      <Network className="h-4 w-4" />
                   </button>
                </div>
              </GlassCard>
            ))}
            {activeStaff.length === 0 && (
              <div className="col-span-full py-20 text-center">
                <p className="text-muted-foreground italic">The staff list is currently empty.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
