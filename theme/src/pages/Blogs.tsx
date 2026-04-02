import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Layout } from "@/components/Layout";
import { GlassCard } from "@/components/GlassCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, ArrowLeft, Clock, User } from "lucide-react";
import type { Blog } from "@data/schema";

function BlogCardSkeleton() {
  return (
    <GlassCard className="overflow-hidden">
      <Skeleton className="h-48 w-full" />
      <div className="p-6 space-y-3">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <div className="flex gap-4 pt-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-20" />
        </div>
      </div>
    </GlassCard>
  );
}

function BlogCard({ blog }: { blog: Blog }) {
  const formattedDate = blog.createdAt ? new Date(blog.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }) : "";

  return (
    <Link href={`/blog/${blog.slug}`}>
      <GlassCard className="overflow-hidden hover:bg-white/10 transition-all cursor-pointer group h-full flex flex-col" data-testid={`card-blog-${blog.id}`}>
        {blog.imageUrl && (
          <div className="relative h-48 overflow-hidden">
            <img
              src={blog.imageUrl}
              alt={blog.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            {blog.featured && (
              <Badge className="absolute top-3 right-3 bg-primary/90">Featured</Badge>
            )}
          </div>
        )}
        <div className="p-6 flex flex-col flex-1">
          <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors line-clamp-2">
            {blog.title}
          </h3>
          {blog.excerpt && (
            <p className="text-muted-foreground text-sm mb-4 line-clamp-3 flex-1">
              {blog.excerpt}
            </p>
          )}
          <div className="flex items-center gap-4 text-xs text-muted-foreground mt-auto pt-4 border-t border-white/10">
            <span className="flex items-center gap-1">
              <User className="h-3 w-3" />
              {blog.author || "Admin"}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {formattedDate}
            </span>
          </div>
        </div>
      </GlassCard>
    </Link>
  );
}

export default function Blogs() {
  const { data: blogs, isLoading } = useQuery<Blog[]>({
    queryKey: ["/api/blogs"],
  });

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-2 mb-4" data-testid="link-back-home">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Button>
          </Link>
          <h1 className="text-4xl font-bold mb-2" data-testid="blogs-title">Blog</h1>
          <p className="text-muted-foreground">
            News, updates, and announcements from the server
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            Array(6).fill(0).map((_, i) => <BlogCardSkeleton key={i} />)
          ) : blogs && blogs.length > 0 ? (
            blogs.map((blog) => (
              <BlogCard key={blog.id} blog={blog} />
            ))
          ) : (
            <div className="col-span-full text-center py-16">
              <Clock className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-medium mb-2">No posts yet</h3>
              <p className="text-muted-foreground">
                Check back later for news and updates
              </p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
