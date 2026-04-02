
import { Blog } from "@data/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Newspaper, Plus, X, Save, Edit, Trash2 } from "lucide-react";

interface BlogTabProps {
    blogs: Blog[];
    editingBlog: Partial<Blog> | null;
    setEditingBlog: (blog: Partial<Blog> | null) => void;
    showBlogEditor: boolean;
    setShowBlogEditor: (show: boolean) => void;
    saveBlog: () => void;
    deleteBlog: (id: string) => void;
}

export function BlogTab({
    blogs,
    editingBlog,
    setEditingBlog,
    showBlogEditor,
    setShowBlogEditor,
    saveBlog,
    deleteBlog
}: BlogTabProps) {
    return (
        <div className="space-y-6 animate-fade-in max-w-5xl mx-auto">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Blog Posts</h2>
                    <p className="text-muted-foreground">Manage news and announcements</p>
                </div>
                <Button
                    size="sm"
                    className="gap-2"
                    onClick={() => {
                        setEditingBlog({ title: "", content: "", excerpt: "", published: false, featured: false, author: "Admin" });
                        setShowBlogEditor(true);
                    }}
                    data-testid="button-create-blog"
                >
                    <Plus className="h-4 w-4" />
                    Create Post
                </Button>
            </div>
            <Separator />

            {showBlogEditor && editingBlog && (
                <Card className="p-6 border-primary/20 bg-primary/5">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold">{editingBlog.id ? "Edit Post" : "Create New Post"}</h3>
                        <Button variant="ghost" size="icon" onClick={() => { setShowBlogEditor(false); setEditingBlog(null); }}>
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>Title *</Label>
                            <Input
                                value={editingBlog.title || ""}
                                onChange={(e) => setEditingBlog({ ...editingBlog, title: e.target.value })}
                                placeholder="Post title"
                                className="font-medium text-lg"
                                data-testid="input-blog-title"
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Slug (Optional, auto-generated)</Label>
                                <Input
                                    value={editingBlog.slug || ""}
                                    onChange={(e) => setEditingBlog({ ...editingBlog, slug: e.target.value })}
                                    placeholder="post-slug"
                                    data-testid="input-blog-slug"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Author</Label>
                                <Input
                                    value={editingBlog.author || ""}
                                    onChange={(e) => setEditingBlog({ ...editingBlog, author: e.target.value })}
                                    placeholder="Admin"
                                    data-testid="input-blog-author"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Excerpt</Label>
                            <Input
                                value={editingBlog.excerpt || ""}
                                onChange={(e) => setEditingBlog({ ...editingBlog, excerpt: e.target.value })}
                                placeholder="Brief summary of the post..."
                                data-testid="input-blog-excerpt"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Feature Image URL</Label>
                            <Input
                                value={editingBlog.imageUrl || ""}
                                onChange={(e) => setEditingBlog({ ...editingBlog, imageUrl: e.target.value })}
                                placeholder="https://example.com/image.jpg"
                                data-testid="input-blog-image"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Content (Markdown supported) *</Label>
                            <Textarea
                                value={editingBlog.content || ""}
                                onChange={(e) => setEditingBlog({ ...editingBlog, content: e.target.value })}
                                placeholder="Write your post content here..."
                                className="min-h-[250px] font-mono text-sm"
                                data-testid="input-blog-content"
                            />
                        </div>
                        <div className="flex items-center justify-between pt-2">
                            <div className="flex items-center gap-6">
                                <div className="flex items-center gap-2">
                                    <Switch
                                        checked={editingBlog.published || false}
                                        onCheckedChange={(checked) => setEditingBlog({ ...editingBlog, published: checked })}
                                        data-testid="switch-blog-published"
                                    />
                                    <Label>Publish Immediately</Label>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Switch
                                        checked={editingBlog.featured || false}
                                        onCheckedChange={(checked) => setEditingBlog({ ...editingBlog, featured: checked })}
                                        data-testid="switch-blog-featured"
                                    />
                                    <Label>Featured Post</Label>
                                </div>
                            </div>
                            <Button onClick={saveBlog} className="gap-2" data-testid="button-save-blog">
                                <Save className="h-4 w-4" />
                                Save Post
                            </Button>
                        </div>
                    </div>
                </Card>
            )}

            <div className="grid grid-cols-1 gap-4">
                {blogs?.map((blog) => (
                    <Card key={blog.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start gap-4">
                            {blog.imageUrl ? (
                                <img src={blog.imageUrl} alt="" className="w-24 h-16 object-cover rounded-md bg-muted" />
                            ) : (
                                <div className="w-24 h-16 rounded-md bg-muted flex items-center justify-center">
                                    <Newspaper className="h-6 w-6 text-muted-foreground/50" />
                                </div>
                            )}
                            <div>
                                <h3 className="font-semibold text-lg line-clamp-1">{blog.title}</h3>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                                    <span>{blog.author}</span>
                                    <span>•</span>
                                    <span>{blog.createdAt && new Date(blog.createdAt).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="flex gap-2">
                                {blog.featured && <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">Featured</Badge>}
                                <Badge variant={blog.published ? "default" : "outline"}>
                                    {blog.published ? "Published" : "Draft"}
                                </Badge>
                            </div>
                            <div className="h-6 w-px bg-border hidden md:block" />
                            <div className="flex gap-1">
                                <Button variant="ghost" size="icon" onClick={() => { setEditingBlog(blog); setShowBlogEditor(true); }}>
                                    <Edit className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10" onClick={() => deleteBlog(blog.id)}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </Card>
                ))}
                {(!blogs || blogs.length === 0) && !showBlogEditor && (
                    <div className="text-center py-16 text-muted-foreground border-2 border-dashed rounded-xl">
                        <Newspaper className="h-12 w-12 mx-auto mb-4 opacity-20" />
                        <p className="font-medium">No blog posts yet</p>
                        <p className="text-sm mt-1">Share news with your community</p>
                    </div>
                )}
            </div>
        </div>
    );
}
