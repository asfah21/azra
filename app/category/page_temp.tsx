import { Navbar } from "@/components/navbar";
import Footer from "@/components/Footer";
import { prisma } from "@/lib/prisma";
import CategoryGrid from "./components/CategoryGrid";

export const metadata = {
    title: "Categories - Browse by Topic",
    description: "Explore all categories and find content that interests you",
};

export default async function CategoryPage() {
    // Get all posts with their categories
    const posts = await prisma.post.findMany({
        where: { published: true },
        select: {
            category: true,
            coverImage: true,
        },
    });

    // Group posts by category and count them
    const categoryMap = new Map<string, { count: number; image: string | null }>();

    posts.forEach((post) => {
        const existing = categoryMap.get(post.category);
        if (existing) {
            existing.count++;
            // Keep the first image found
            if (!existing.image && post.coverImage) {
                existing.image = post.coverImage;
            }
        } else {
            categoryMap.set(post.category, {
                count: 1,
                image: post.coverImage || null,
            });
        }
    });

    // Convert to array
    const categories = Array.from(categoryMap.entries()).map(([name, data]) => ({
        name,
        count: data.count,
        coverImage: data.image,
    }));

    return (
        <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-1">
                <CategoryGrid categories={categories} />
            </main>
            <Footer />
        </div>
    );
}