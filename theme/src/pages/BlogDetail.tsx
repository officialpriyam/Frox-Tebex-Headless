import { Link, useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Layout } from "@/components/Layout";
import { GlassCard } from "@/components/GlassCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, ArrowLeft, User } from "lucide-react";
import type { Blog } from "@data/schema";

export default function BlogDetail() {
  const { slug } = useParams<{ slug: string }>();

  const { data: blog, isLoading, error } = useQuery<Blog>({
    queryKey: ["/api/blogs", slug],
    enabled: !!slug,
  });

  if (isLoading) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Skeleton className="h-8 w-32 mb-4" />
          <Skeleton className="h-12 w-3/4 mb-4" />
          <Skeleton className="h-64 w-full mb-6" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </Layout>
    );
  }

  if (error || !blog) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Post not found</h1>
          <p className="text-muted-foreground mb-6">The blog post you're looking for doesn't exist.</p>
          <Link href="/blogs">
            <Button>View all posts</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  const formattedDate = blog.createdAt ? new Date(blog.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }) : "";

  return (
    <Layout>
      <article className="max-w-4xl mx-auto px-4 py-8">
        <Link href="/blogs">
          <Button variant="ghost" size="sm" className="gap-2 mb-6" data-testid="link-back-blogs">
            <ArrowLeft className="h-4 w-4" />
            Back to Blog
          </Button>
        </Link>

        <header className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            {blog.featured && <Badge>Featured</Badge>}
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-4" data-testid="blog-title">
            {blog.title}
          </h1>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <User className="h-4 w-4" />
              {blog.author || "Admin"}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {formattedDate}
            </span>
          </div>
        </header>

        {blog.imageUrl && (
          <div className="mb-8 rounded-lg overflow-hidden">
            <img
              src={blog.imageUrl}
              alt={blog.title}
              className="w-full h-auto max-h-96 object-cover"
            />
          </div>
        )}

        <GlassCard className="p-6 md:p-8">
          <div
            className="prose prose-invert max-w-none prose-headings:text-foreground prose-p:text-muted-foreground prose-a:text-primary"
            dangerouslySetInnerHTML={{ __html: blog.content.replace(/\n/g, '<br />') }}
          />
        </GlassCard>
      </article>
    </Layout>
  );
}
