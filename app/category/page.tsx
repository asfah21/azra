import { Navbar } from "@/components/navbar";
import Footer from "@/components/Footer";
import { prisma } from "@/lib/prisma";
import GridCard from "./components/GridCard";

export const metadata = {
    title: "Category",
    description: "Category",
};

export default async function CategoryPage() {
    const posts = await prisma.post.findMany({
        orderBy: { createdAt: "desc" },
        select: {
            title: true,
            slug: true,
            description: true,
            createdAt: true,
            coverImage: true,
        },
        take: 9,
    });
    return (
        <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-1">
                <GridCard posts={posts} />
            </main>
            <Footer />
        </div>
    );
}