import type { FC } from "react";
import Link from "next/link";

export interface BlogClientArticleProps {
  post: {
    title: string;
    createdAt: Date;
    content: string;
    coverImage?: string | null;
    authorName?: string | null;
    authorHandle?: string | null;
    authorAvatar?: string | null;
  };
}

function formatDate(date: Date) {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

const ClientPage: FC<BlogClientArticleProps> = ({ post }) => {
  const date = formatDate(post.createdAt);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Back link */}
      <div className="mb-6">
        <Link href="/blog" className="text-sm text-foreground/70 hover:text-foreground transition-colors">
          ← Back to blog
        </Link>
      </div>

      {/* Meta */}
      <div className="flex items-center gap-3 text-sm text-foreground/60">
        {post.authorAvatar ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={post.authorAvatar} alt={post.authorName ?? "Author"} className="h-8 w-8 rounded-full" />
        ) : (
          <div className="h-8 w-8 rounded-full bg-white/10 ring-1 ring-white/15" />
        )}
        <div className="flex flex-col">
          <span className="font-medium text-foreground/90">{post.authorName ?? ""}</span>
          <span className="text-xs">{post.authorHandle ?? date}</span>
        </div>
        {!post.authorHandle && (
          <span className="ml-auto text-xs">{date}</span>
        )}
      </div>

      {/* Title */}
      <h1 className="mt-4 text-3xl md:text-4xl font-bold tracking-tight">{post.title}</h1>

      {/* Hero image */}
      <div className="mt-6 rounded-xl overflow-hidden bg-gradient-to-br from-[#0D0F16] via-[#141724] to-[#1A1D2B] border border-white/10">
        <div className="aspect-[16/9] flex items-center justify-center">
          {post.coverImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={post.coverImage}
              alt={post.title}
              className="h-full w-full object-cover object-center"
            />
          ) : (
            <div className="p-6 text-center">
              <div className="mx-auto max-w-lg">
                <p className="text-2xl font-semibold">UI HeroUI</p>
                <p className="text-sm text-foreground/70 mt-2">A beautiful, modern UI experience.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <article className="prose prose-invert max-w-none mt-8">
        {/* Content comes from CMS (HTML) */}
        <div dangerouslySetInnerHTML={{ __html: post.content }} />
      </article>
    </div>
  );
};

export default ClientPage;
