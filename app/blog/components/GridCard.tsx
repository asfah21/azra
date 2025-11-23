"use client";
import type { FC } from "react";

import Link from "next/link";
import { Card, CardHeader, CardBody } from "@heroui/react";

export interface GridCardPost {
  title: string;
  slug: string;
  description: string | null;
  createdAt: Date;
  coverImage?: string | null;
}

function formatDate(date: Date) {
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export const GridCard: FC<{ posts: GridCardPost[] }> = ({ posts }) => {
  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <h1 className="text-4xl font-bold text-center mb-2">
        Latest Font Updates
      </h1>
      <p className="text-center text-sm text-muted-foreground mb-10">
        All the latest news about our platform.
      </p>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <Link
            key={post.slug}
            aria-label={`Open ${post.title}`}
            className="group block focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded-xl"
            href={`/blog/${post.slug}`}
          >
            <Card
              className="relative overflow-hidden border border-zinc-200/80 bg-white shadow-md transition-all duration-300 group-hover:shadow-xl dark:border-white/10 dark:bg-[#12141c] dark:shadow-[0_6px_28px_-10px_rgba(0,0,0,0.7)]"
              radius="lg"
            >
              <CardHeader className="p-5 pb-3">
                <h3 className="text-xl font-semibold tracking-tight line-clamp-1">
                  {post.title}
                </h3>
              </CardHeader>

              <div className="px-5">
                <div className="aspect-[16/9] w-full rounded-xl overflow-hidden bg-zinc-100 dark:bg-black/40 flex items-center justify-center">
                  {post.coverImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      alt={post.title}
                      className="h-full w-full object-cover object-center group-hover:scale-[1.02] transition-transform"
                      src={post.coverImage}
                    />
                  ) : (
                    <span className="px-4 text-lg font-semibold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-black to-black/60 dark:from-white dark:to-white/60 text-center">
                      {post.title}
                    </span>
                  )}
                </div>
              </div>

              <CardBody className="p-5">
                <p className="text-sm text-muted-foreground leading-relaxed mb-6 line-clamp-2">
                  {post.description || "No description available."}
                </p>

                <div className="mt-auto flex items-center justify-between text-xs text-muted-foreground">
                  <span>{formatDate(post.createdAt)}</span>
                  <span className="pointer-events-none h-8 w-8 rounded-full border border-zinc-200/80 bg-zinc-50 text-zinc-600 flex items-center justify-center shadow-sm dark:border-white/10 dark:bg-white/5 dark:text-white/80">
                    ●
                  </span>
                </div>
              </CardBody>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default GridCard;
