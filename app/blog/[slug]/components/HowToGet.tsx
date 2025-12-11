import { PackageOpen, Download, ListChecks } from "lucide-react";

interface HowToGetProps {
    post: {
        title: string;
        link?: string | null;
        category?: string | null;
    };
}

export default function HowToGet({ post }: HowToGetProps) {
    return (
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
    )
}