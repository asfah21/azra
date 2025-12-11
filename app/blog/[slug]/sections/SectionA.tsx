import { PackageOpen } from "lucide-react";

interface SectionAProps {
    post: {
        title: string;
        category?: string | null;
    };
}

export default function SectionA({ post }: SectionAProps) {
    return (
        <section className="space-y-6 !mt-0">
            <h2 className="inline-flex items-center gap-2">
                <PackageOpen className="w-5 h-5 opacity-80" /> Section A : Innovative Applications
            </h2>

            <p>
                The finely crafted <strong>{post.title}</strong> / typeface is suitable
                for both creative and commercial use. It is one of the most popular
                choices for anybody seeking for a{" "}
                <strong>free {post.category} font</strong> that yet appears high-end, as
                designers like its balance of authenticity and beauty.
            </p>

            <p>
                <strong>{post.title}</strong> is commonly used by artists for branding
                and logos to create a homey, friendly, and distinctive image. Its
                flowing lines make it ideal for invitations and greeting cards, where
                authenticity and feeling are essential. This display script font
                provides T-shirt printing and apparel logos a sophisticated,
                individualized look in the fashion business. It provides a noticeable
                personal touch to posters, quotations, and product packaging, drawing
                attention straight away.
            </p>

            <p>
                Digital designers value how effectively it works on screens,
                guaranteeing readability while preserving artistic quality in anything
                from social media photos to website banners. Even lengthy phrases are
                enjoyable to read thanks to the typeface&apos;s lively and captivating
                rhythm.
            </p>

            <p>
                <strong>{post.title}</strong> Font provides a distinct, handcrafted
                liveliness to every project, whether you&apos;re designing an expressive
                title or a basic logo. It is one of the best{" "}
                <strong>free font downloads</strong> for print and digital projects due
                to its versatility and readability.
            </p>
        </section>
    );
};


