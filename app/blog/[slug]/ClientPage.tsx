import type { FC } from "react";

import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  User2,
  Tag,
  Download,
  PackageOpen,
  ListChecks,
} from "lucide-react";

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
    link?: string | null;
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
    <div className="max-w-3xl mx-auto px-4 py-8 text-neutral-800 dark:text-foreground">
      {/* Back link */}
      <div className="mb-6">
        <Link
          className="inline-flex items-center gap-2 text-sm text-foreground/70 hover:text-foreground transition-colors px-3 py-1.5 rounded-full bg-neutral-50 dark:bg-white/5 border border-neutral-200 dark:border-white/10 hover:bg-neutral-100 dark:hover:bg-white/10"
          href="/blog"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to blog</span>
        </Link>
      </div>

      {/* Meta */}
      <div className="flex items-center gap-3 text-sm text-foreground/70">
        {post.authorAvatar ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            alt={post.authorName ?? "Author"}
            className="h-9 w-9 rounded-full ring-1 ring-neutral-300 dark:ring-white/15 object-cover"
            src={post.authorAvatar}
          />
        ) : (
          <div className="h-9 w-9 rounded-full bg-neutral-200 dark:bg-white/10 ring-1 ring-neutral-300 dark:ring-white/15" />
        )}
        <div className="flex flex-col">
          <span className="font-medium text-foreground/90 inline-flex items-center gap-1">
            <User2 className="w-3.5 h-3.5 opacity-70" />{" "}
            {post.authorName ?? "Creative Font"}
          </span>
          <div className="flex flex-wrap items-center gap-2 mt-0.5">
            <span className="inline-flex items-center gap-1.5 text-xs px-2 py-0.5 rounded-md bg-neutral-50 dark:bg-white/5 border border-neutral-200 dark:border-white/10">
              <Tag className="w-3 h-3 opacity-70" />{" "}
              {post.category ?? "General"}
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs px-2 py-0.5 rounded-md bg-neutral-50 dark:bg-white/5 border border-neutral-200 dark:border-white/10">
              <Calendar className="w-3 h-3 opacity-70" /> {date ?? "General"}
            </span>
            {/* <span className="inline-flex items-center gap-1.5 text-xs px-2 py-0.5 rounded-md bg-neutral-50 dark:bg_white/5 border border-neutral-200 dark:border-white/10">
              <Tag className="w-3 h-3 opacity-70" /> {date ?? "1 January 2026"}
            </span> */}
          </div>
        </div>
      </div>

      {/* Title */}
      <h1 className="mt-5 text-3xl md:text-4xl font-extrabold tracking-tight leading-tight bg-gradient-to-r from-neutral-900 via-neutral-800 to-neutral-600 dark:from-white dark:via-white dark:to-white/70 bg-clip-text text-transparent">
        {post.title}
      </h1>
      {/* {post.description && (
        <p className="mt-3 text-base md:text-lg text-foreground/70 font-light italic border-l-4 pl-4 border-primary/40">
          {post.description}
        </p>
      )} */}

      {/* Hero image */}
      <div className="mt-6 rounded-xl overflow-hidden border border-neutral-300 dark:border-white/10 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.15)] dark:shadow-[0_10px_30px_-10px_rgba(0,0,0,0.35)]">
        <div className="relative aspect-[16/9]">
          {post.coverImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              alt={post.title}
              className="absolute inset-0 h-full w-full object-cover object-center"
              src={post.coverImage}
            />
          ) : (
            <div className="absolute inset-0 p-6 flex items-center justify-center bg-gradient-to-br from-neutral-100 via-neutral-200 to-neutral-300 dark:from-[#0D0F16] dark:via-[#141724] dark:to-[#1A1D2B]">
              <div className="mx-auto max-w-lg text-center">
                <p className="text-2xl font-semibold">UI HeroUI</p>
                <p className="text-sm text-foreground/70 mt-2">
                  A beautiful, modern UI experience.
                </p>
              </div>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-900/10 via-neutral-900/5 to-transparent dark:from-black/40 dark:via-black/10 dark:to-transparent pointer-events-none" />
        </div>
      </div>

      {/* Content */}
      <article className="prose dark:prose-invert max-w-none mt-8 [&_p]:text-justify [&_li]:text-justify [&_h2]:mt-12 [&_h2]:scroll-mt-24 [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:tracking-tight [&_h3]:mt-6 [&_h3]:text-xl [&_code]:text-xs space-y-12 [&_a:not(.btn)]:text-primary [&_a:not(.btn):hover]:opacity-90">
        {/* Dynamic (CMS) content */}
        <div
          dangerouslySetInnerHTML={{ __html: post.content }}
          className="text-justify prose max-w-none"
        />

        {/* Structured sections */}
        {/* <section className="space-y-6 !mt-0">
          <h2 className="inline-flex items-center gap-2">
            <PackageOpen className="w-5 h-5 opacity-80" /> Innovative Applications
          </h2> */}

        <section className="space-y-6 !mt-0">
          <h2 className="inline-flex items-center gap-2">
            <PackageOpen className="w-5 h-5 opacity-80" /> Innovative
            Applications
          </h2>

          <p>
            The finely crafted <strong>{post.title}</strong> / typeface is
            suitable for both creative and commercial use. It is one of the most
            popular choices for anybody seeking for a{" "}
            <strong>free {post.category} font</strong> that yet appears
            high-end, as designers like its balance of authenticity and beauty.
          </p>

          <p>
            <strong>{post.title}</strong> is commonly used by artists for
            branding and logos to create a homey, friendly, and distinctive
            image. Its flowing lines make it ideal for invitations and greeting
            cards, where authenticity and feeling are essential. This display
            script font provides T-shirt printing and apparel logos a
            sophisticated, individualized look in the fashion business. It
            provides a noticeable personal touch to posters, quotations, and
            product packaging, drawing attention straight away.
          </p>

          <p>
            Digital designers value how effectively it works on screens,
            guaranteeing readability while preserving artistic quality in
            anything from social media photos to website banners. Even lengthy
            phrases are enjoyable to read thanks to the typeface&apos;s lively
            and captivating rhythm.
          </p>

          <p>
            <strong>{post.title}</strong> Font provides a distinct, handcrafted
            liveliness to every project, whether you&apos;re designing an
            expressive title or a basic logo. It is one of the best{" "}
            <strong>free font downloads</strong> for print and digital projects
            due to its versatility and readability.
          </p>
        </section>

        {post.description && (
          <section>
            <blockquote className="mt-2 border-l-4 pl-4 text-foreground/80 italic">
              {post.description}
            </blockquote>
          </section>
        )}

        <section className="space-y-4 !mt-0">
          <h2 className="inline-flex items-center gap-2">
            <Download className="w-5 h-5 opacity-80" /> How to Get It
          </h2>
          <p>
            {" "}
            It&apos;s easy to get the <strong>{post.title} Font</strong>, and
            depending on the distributor, it can be free for personal use or
            include a commercial license option. While some websites may include
            it as part of a paid font bundle, others may offer it for free.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="rounded-lg border border-neutral-300 dark:border-white/10 bg-neutral-50/80 dark:bg-white/[0.06] backdrop-blur p-4 shadow-sm text-sm leading-relaxed">
              <h3 className="text-base md:text-lg font-semibold inline-flex items-center gap-2 !mt-0">
                <PackageOpen className="w-4 h-4 opacity-80" /> Get the Package
                Details
              </h3>
              <ul className="mt-2 space-y-1.5 list-disc pl-4">
                <li>File types: OTF, TTF, RAR/ZIP archive</li>
                <li>
                  License: Personal or Full Commercial License (varies by
                  source)
                </li>
              </ul>
            </div>

            <div className="rounded-lg border border-neutral-300 dark:border-white/10 bg-neutral-50/80 dark:bg-white/[0.06] backdrop-blur p-4 shadow-sm text-sm leading-relaxed">
              <h3 className="text-base md:text-lg font-semibold inline-flex items-center gap-2 !mt-0">
                <ListChecks className="w-4 h-4 opacity-80" /> Steps for
                Installation
              </h3>
              <ol className="mt-2 space-y-1.5 list-decimal pl-4">
                <li>Unzip the font package after downloading it.</li>
                <li>
                  Choose Install when you right-click the .otf or.ttf file on
                  Windows.
                </li>
                <li>
                  Double-click the font file on a Mac, then select Install Font.
                </li>
              </ol>
            </div>
          </div>

          <p>
            Following installation, creative programs such as Adobe Photoshop,
            Illustrator, Figma, Canva, and even Microsoft Word will
            automatically display the <strong>{post.title}</strong>
          </p>

          <div className="mt-6 text-center">
            <a
              className="btn inline-flex items-center gap-2 px-3 py-2 text-sm font-semibold rounded-xl bg-primary text-white hover:bg-primary/90 transition-colors shadow-sm ring-1 ring-neutral-200 dark:ring-white/20"
              href={post.link ?? "#"}
              rel="noopener noreferrer"
              target="_blank"
            >
              <Download className="w-4 h-4" />
              <span>Download {post.title} </span>
            </a>
          </div>

          <p>It is simple to embed for use on the web by:</p>
          <ul className="list-none mt-1 space-y-1.5 ml-2 text-sm leading-relaxed">
            <li className="flex gap-3 items-start">
              <span className="mt-0.5 h-4.5 w-4.5 shrink-0 rounded-full bg-primary/15 text-primary/80 dark:bg-primary/20 flex items-center justify-center text-[10px] font-semibold">
                1
              </span>
              <p className="m-0">
                For fast global loading, include a{" "}
                <code className="px-1.5 py-0.5 rounded bg-black/30 border border-white/10">
                  &lt;tag&gt;
                </code>{" "}
                in your HTML head.
              </p>
            </li>
            <li className="flex gap-3 items-start">
              <span className="mt-0.5 h-4.5 w-4.5 shrink-0 rounded-full bg-primary/15 text-primary/80 dark:bg-primary/20 flex items-center justify-center text-[10px] font-semibold">
                2
              </span>
              <p className="m-0">
                For optimal performance, place{" "}
                <code className="px-1.5 py-0.5 rounded bg-black/30 border border-white/10">
                  @import
                </code>{" "}
                @at the top of your CSS.
              </p>
            </li>
            <li className="flex gap-3 items-start">
              <span className="mt-0.5 h-4.5 w-4.5 shrink-0 rounded-full bg-primary/15 text-primary/80 dark:bg-primary/20 flex items-center justify-center text-[10px] font-semibold">
                3
              </span>
              <p className="m-0">
                Define a unique{" "}
                <code className="px-1.5 py-0.5 rounded bg-black/30 border border-white/10">
                  @font-face
                </code>{" "}
                for font-display control, fallbacks, and formats.
              </p>
            </li>
          </ul>

          <div className="rounded-lg border border-neutral-300 dark:border-white/10 bg-neutral-50/80 dark:bg-white/[0.04] p-4 text-sm leading-relaxed">
            <h3 className="text-base md:text-lg font-semibold !mt-0">
              Details of the License{" "}
            </h3>
            <p className="mt-2">
              Although <strong>{post.title}</strong> typeface is frequently
              offered as a free {post.category} typeface, before using it for
              commercial purposes, make sure to review the license terms from
              the source. While some websites offer the complete license for
              free, others charge a nominal price for commercial use.
            </p>
            <p className="mt-1.5">
              Either way, you&apos;ll get a professional-grade font with
              outstanding kerning, flowing vectors, and consistent baseline
              alignment—perfect for projects like product packaging, digital
              ads, and printed materials for both you and your clients.
            </p>
          </div>
        </section>
      </article>
    </div>
  );
};

export default ClientPage;
