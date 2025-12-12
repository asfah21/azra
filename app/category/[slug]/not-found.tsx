import Link from "next/link";

export default function NotFound() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-6">
            <h2 className="text-3xl font-bold mb-4">Category Not Found</h2>
            <p className="text-muted-foreground mb-8 text-center max-w-md">
                Sorry, we couldn&apos;t find any posts in this category. It may have been removed or doesn&apos;t exist yet.
            </p>
            <Link
                href="/category"
                className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
                Browse All Categories
            </Link>
        </div>
    );
}
