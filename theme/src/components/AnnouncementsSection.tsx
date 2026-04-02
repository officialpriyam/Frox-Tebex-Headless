import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { GlassCard } from "./GlassCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Megaphone, ChevronRight, Calendar } from "lucide-react";
import type { Announcement } from "@data/schema";

interface AnnouncementCardProps {
    announcement: Announcement;
    onClick: () => void;
}

function AnnouncementCard({ announcement, onClick }: AnnouncementCardProps) {
    const formattedDate = announcement.createdAt
        ? new Date(announcement.createdAt).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
        })
        : "";

    return (
        <div
            className="glass-card cursor-pointer group p-6 flex flex-col h-full active:scale-[0.98] transition-transform"
            onClick={onClick}
        >
            <div className="flex items-center justify-between mb-6">
                <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center transition-all duration-500 group-hover:bg-primary group-hover:text-white group-hover:rotate-6">
                    <Megaphone className="h-6 w-6" />
                </div>
                <div className="flex flex-col items-end">
                    <div className="flex items-center gap-2 mb-1">
                        {announcement.featured && (
                            <div className="px-2 py-0.5 rounded-full bg-primary/90 text-white text-[9px] font-black uppercase tracking-tighter shadow-lg">Featured</div>
                        )}
                    </div>
                    <span className="text-[11px] font-bold text-muted-foreground/60 flex items-center gap-1 uppercase tracking-tighter">
                        <Calendar className="h-3 w-3" />
                        {formattedDate}
                    </span>
                </div>
            </div>

            <div className="flex-1 space-y-3">
                <h4 className="font-display font-bold text-lg group-hover:text-primary transition-colors leading-tight">
                    {announcement.title}
                </h4>
                {announcement.excerpt && (
                    <p className="text-sm text-muted-foreground/80 line-clamp-2 font-medium leading-relaxed">
                        {announcement.excerpt}
                    </p>
                )}
            </div>

            <div className="mt-6 pt-6 border-t border-border/30 flex items-center justify-between">
                <span className="text-[10px] font-black text-primary uppercase tracking-widest">Read Document</span>
                <ChevronRight className="h-4 w-4 text-primary group-hover:translate-x-1 transition-transform" />
            </div>
        </div>
    );
}

export function AnnouncementsSection() {
    const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);

    const { data: announcements = [] } = useQuery<Announcement[]>({
        queryKey: ["/api/announcements"],
    });

    if (announcements.length === 0) {
        return null;
    }

    return (
        <>
            <section className="py-20 sm:py-32 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 blur-[100px] rounded-full pointer-events-none translate-x-1/2 -translate-y-1/2" />

                <div className="max-w-7xl mx-auto px-4 relative z-10">
                    <div className="flex flex-col sm:flex-row items-end justify-between gap-6 mb-12 sm:mb-16">
                        <div className="space-y-4">
                            <Badge variant="outline" className="px-3 py-1 rounded-full border-primary/20 bg-primary/5 text-primary text-[10px] font-black uppercase tracking-widest">
                                The Latest
                            </Badge>
                            <h2 className="text-4xl sm:text-5xl font-display font-bold">Server <span className="text-primary">Journal</span></h2>
                            <p className="text-lg text-muted-foreground/80 max-w-xl font-medium">
                                Stay informed with the most recent updates, event logs, and community news.
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                        {announcements.slice(0, 6).map((announcement) => (
                            <AnnouncementCard
                                key={announcement.id}
                                announcement={announcement}
                                onClick={() => setSelectedAnnouncement(announcement)}
                            />
                        ))}
                    </div>
                </div>
            </section>

            <Dialog open={!!selectedAnnouncement} onOpenChange={() => setSelectedAnnouncement(null)}>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-xl">{selectedAnnouncement?.title}</DialogTitle>
                    </DialogHeader>
                    {selectedAnnouncement?.imageUrl && (
                        <img
                            src={selectedAnnouncement.imageUrl}
                            alt={selectedAnnouncement.title}
                            className="w-full h-48 object-cover rounded-lg"
                        />
                    )}
                    <div
                        className="prose prose-sm dark:prose-invert max-w-none"
                        dangerouslySetInnerHTML={{ __html: selectedAnnouncement?.content || "" }}
                    />
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-4 pt-4 border-t border-border">
                        <Calendar className="h-3 w-3" />
                        {selectedAnnouncement?.createdAt &&
                            new Date(selectedAnnouncement.createdAt).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                            })}
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}

