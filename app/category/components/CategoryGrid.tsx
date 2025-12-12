"use client";
import type { FC } from "react";

import Link from "next/link";
import { Card, CardHeader, CardBody } from "@heroui/react";

export interface CategoryItem {
    name: string;
    count: number;
    coverImage?: string | null;
}

export const CategoryGrid: FC<{ categories: CategoryItem[] }> = ({ categories }) => {
    return (
        <div className="max-w-6xl mx-auto px-6 py-12">
            <h1 className="text-4xl font-bold text-center mb-2">
                Browse by Category
            </h1>
            <p className="text-center text-sm text-muted-foreground mb-10">
                Explore content organized by topics that interest you.
            </p>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {categories.map((category) => (
                    <Link
                        key={category.name}
                        aria-label={`Browse ${category.name} category`}
                        className="group block focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded-xl"
                        href={`/category/${encodeURIComponent(category.name.toLowerCase())}`}
                    >
                        <Card
                            className="relative overflow-hidden border border-zinc-200/80 bg-white shadow-md transition-all duration-300 group-hover:shadow-xl dark:border-white/10 dark:bg-[#12141c] dark:shadow-[0_6px_28px_-10px_rgba(0,0,0,0.7)]"
                            radius="lg"
                        >
                            <CardHeader className="p-5 pb-3">
                                <h3 className="text-xl font-semibold tracking-tight line-clamp-1">
                                    {category.name}
                                </h3>
                            </CardHeader>

                            <div className="px-5">
                                <div className="aspect-[16/9] w-full rounded-xl overflow-hidden bg-zinc-100 dark:bg-black/40 flex items-center justify-center">
                                    {category.coverImage ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img
                                            alt={category.name}
                                            className="h-full w-full object-cover object-center group-hover:scale-[1.02] transition-transform"
                                            src={category.coverImage}
                                        />
                                    ) : (
                                        <span className="px-4 text-lg font-semibold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-black to-black/60 dark:from-white dark:to-white/60 text-center">
                                            {category.name}
                                        </span>
                                    )}
                                </div>
                            </div>

                            <CardBody className="p-5">
                                <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                                    {category.count} {category.count === 1 ? 'post' : 'posts'} in this category
                                </p>

                                <div className="mt-auto flex items-center justify-between text-xs text-muted-foreground">
                                    <span className="text-primary font-medium">View All →</span>
                                    <span className="pointer-events-none h-8 w-8 rounded-full border border-zinc-200/80 bg-zinc-50 text-zinc-600 flex items-center justify-center shadow-sm dark:border-white/10 dark:bg-white/5 dark:text-white/80">
                                        {category.count}
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

export default CategoryGrid;
