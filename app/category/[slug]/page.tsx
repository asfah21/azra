import { Navbar } from "@/components/navbar";
import Footer from "@/components/Footer";
import { prisma } from "@/lib/prisma";
import GridCard from "../components/GridCard";
import { notFound } from "next/navigation";

interface CategoryPageProps {
    params: Promise<{
        slug: string;
    }>;
}

export async function generateMetadata({ params }: CategoryPageProps) {
    const { slug } = await params;
    const categoryName = decodeURIComponent(slug);

    return {
        title: `${categoryName.charAt(0).toUpperCase() + categoryName.slice(1)} - Category`,
        description: `Browse all posts in ${categoryName} category`,
    };
}

export default async function CategoryDetailPage({ params }: CategoryPageProps) {
    const { slug } = await params;
    const categoryName = decodeURIComponent(slug);

    // Get posts for this category
    const posts = await prisma.post.findMany({
        where: {
            category: {
                equals: categoryName,
                mode: 'insensitive', // case-insensitive search
            },
            published: true,
        },
        orderBy: { createdAt: "desc" },
        select: {
            title: true,
            slug: true,
            description: true,
            createdAt: true,
            coverImage: true,
        },
    });

    // If no posts found, show 404
    if (posts.length === 0) {
        notFound();
    }

    return (
        <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-1">
                <div className="max-w-6xl mx-auto px-6 py-8">
                    <div className="mb-8">
                        <h1 className="text-4xl font-bold mb-2">
                            {categoryName.charAt(0).toUpperCase() + categoryName.slice(1)}
                        </h1>
                        <p className="text-muted-foreground">
                            {posts.length} {posts.length === 1 ? 'post' : 'posts'} found
                        </p>
                    </div>
                    <GridCard posts={posts} hideHeader />
                </div>
            </main>
            <Footer />
        </div>
    );
}
