import type { FC } from "react";

import Link from "next/link";

export interface BlogClientArticleProps {
  post: {
    title: string;
    createdAt: Date;
    category?: string | null;
    description?: string | null;
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
        <Link
          className="text-sm text-foreground/70 hover:text-foreground transition-colors"
          href="/blog"
        >
          ← Back to blog
        </Link>
      </div>

      {/* Meta */}
      <div className="flex items-center gap-3 text-sm text-foreground/60">
        {post.authorAvatar ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            alt={post.authorName ?? "Author"}
            className="h-8 w-8 rounded-full"
            src={post.authorAvatar}
          />
        ) : (
          <div className="h-8 w-8 rounded-full bg-white/10 ring-1 ring-white/15" />
        )}
        <div className="flex flex-col">
          <span className="font-medium text-foreground/90">
            {post.authorName ?? "Creative Font"}
          </span>
          <span className="text-xs">{post.category ?? date}</span>
        </div>
        {!post.authorHandle && <span className="ml-auto text-xs">{date}</span>}
      </div>

      {/* Title */}
      <h1 className="mt-4 text-3xl md:text-4xl font-bold tracking-tight leading-tight">
        {post.title}
      </h1>

      {/* Hero image */}
      <div className="mt-6 rounded-xl overflow-hidden bg-gradient-to-br from-[#0D0F16] via-[#141724] to-[#1A1D2B] border border-white/10">
        <div className="aspect-[16/9] flex items-center justify-center">
          {post.coverImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              alt={post.title}
              className="h-full w-full object-cover object-center"
              src={post.coverImage}
            />
          ) : (
            <div className="p-6 text-center">
              <div className="mx-auto max-w-lg">
                <p className="text-2xl font-semibold">UI HeroUI</p>
                <p className="text-sm text-foreground/70 mt-2">
                  A beautiful, modern UI experience.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <article className="prose prose-invert max-w-none mt-8 [&_p]:text-justify [&_li]:text-justify [&_h2]:mt-12 [&_h2]:scroll-mt-24 [&_h2]:text-2xl [&_h2]:font-semibold [&_h3]:mt-8 [&_h3]:text-xl [&_code]:text-xs space-y-10 md:space-y-12 [&>section]:space-y-4">
        {/* Dynamic (CMS) content */}
        <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: post.content }} />

        {/* Structured sections */}
        <section>
          <h2>Creative Uses</h2>
          <p><strong>Gently Harmony Font</strong> shines in creative and commercial projects alike. Here are a few popular uses among designers:</p>
          <ul>
            <li>Logos and branding – build identity with a handcrafted signature look</li>
            <li>Greeting cards and invitations – express warmth and emotion naturally</li>
            <li>T-shirt and fashion prints – achieve a custom, expressive feel</li>
            <li>Posters, quotes, and packaging – stand out with bold, human lettering</li>
            <li>Web banners and social media visuals – add softness and visual appeal</li>
          </ul>
          <p>The font’s readability and personality make it ideal for both headlines and decorative text. Its smooth rhythm ensures that even long phrases remain pleasant to read, while still catching attention at a glance.</p>
        </section>

        <section>
          {post.description && (
            <p className="text-base md:text-lg text-foreground/70 font-light italic border-l-4 pl-4 border-primary/40">
              {post.description}
            </p>
          )}
        </section>

        <section>
          <h2>How to Download</h2>
          <p>Downloading <strong>Gently Harmony Font</strong> is simple — and depending on the distributor, it may be free for personal use or come with a commercial license option. Some websites offer it entirely free, while others may include it as part of a premium font bundle.</p>

          <h3>Download Package Details</h3>
          <ul>
            <li>File types: OTF, TTF, RAR/ZIP archive</li>
            <li>License: Personal or Full Commercial License (varies by source)</li>
          </ul>

          <h3>Installation Steps</h3>
          <ol>
            <li>Download and unzip the font package.</li>
            <li>On Windows, right-click the <code>.otf</code> or <code>.ttf</code> file and select <strong>Install</strong>.</li>
            <li>On Mac, double-click the font file and choose <strong>Install Font</strong>.</li>
          </ol>
          <p>After installation, <strong>Gently Harmony Font</strong> will appear automatically in design apps like Adobe Photoshop, Illustrator, Figma, Canva, or even Microsoft Word.</p>
          <p>For web use, it can be easily embedded via:</p>
          <ul>
            <li>A <code>&lt;link&gt;</code> tag in your HTML</li>
            <li>An <code>@import</code> rule in CSS</li>
            <li>A custom <code>@font-face</code> declaration for full control</li>
          </ul>

          <h3>License Information</h3>
          <p>While <strong>Gently Harmony</strong> is often distributed as a free handwritten font, make sure to check the license terms from the source before using it commercially. Some sites include the full license at no cost, while others require a small fee for business use.</p>
          <p>Either way, you’ll get a professional-grade font with high-quality kerning, smooth vectors, and consistent baseline alignment — perfect for both personal and client projects, including printed materials, digital ads, and product packaging.</p>

          <div className="mt-6">
            <a
              href="#"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-6 py-3 text-sm font-semibold rounded-xl bg-primary text-white hover:bg-primary/90 transition-colors shadow-sm"
            >
              ⬇️ Download Gently Harmony Font
            </a>
          </div>
        </section>
      </article>
    </div>
  );
};

export default ClientPage;
