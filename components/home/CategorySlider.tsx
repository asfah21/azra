"use client";

import { ScrollShadow } from "@heroui/react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ReactNode } from "react";

interface Category {
    name: string;
    id: string;
    link?: string;
    icon?: ReactNode;
}

export default function CategorySlider() {
    const categories: Category[] = [
        {
            name: "Graffiti Fonts",
            id: "graffiti-fonts",
            link: "/graffiti-fonts",
            icon: (
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="text-orange-500 rotate-12"
                >
                    <path d="M18.8835 4.39999C18.4907 3.52086 17.6186 2.94315 16.6579 2.94315H7.34208C5.69466 2.94315 4.25418 4.10379 3.93175 5.71966L2.09115 14.922C1.9478 15.6385 2.14856 16.3813 2.63669 16.9387C3.12481 17.4961 3.83925 17.817 4.58071 17.817H6.94315V20.0569C6.94315 20.6091 7.39086 21.0569 7.94315 21.0569H16.0569C16.6091 21.0569 17.0569 20.6091 17.0569 20.0569V17.817H19.4193C20.1608 17.817 20.8752 17.4961 21.3633 16.9387C21.8514 16.3813 22.0522 15.6385 21.9089 14.922L20.0683 5.71966C19.8803 4.78018 19.4727 4.15655 18.8835 4.39999ZM5.38539 6.00971C5.59968 4.93516 6.54585 4.16315 7.64208 4.16315H16.3579C17.4542 4.16315 18.4003 4.93516 18.6146 6.00971L19.4429 10.1631H4.55712L5.38539 6.00971Z" />
                </svg>
            )
        },
        {
            name: "Display",
            id: "display",
            link: "/category/display",
        },
        {
            name: "Handwritten",
            id: "handwritten",
            link: "/category/handwritten",
        },
        {
            name: "Serif",
            id: "serif",
            link: "/category/serif",
        },
        {
            name: "Sans Serif",
            id: "sans-serif",
            link: "/category/sans-serif",
        }
    ];

    return (
        <motion.section
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="px-6 md:px-20 flex flex-col items-center justify-center"
        >
            <div className="w-full max-w-screen-2xl px-6">
                <ScrollShadow
                    orientation="horizontal"
                    hideScrollBar
                    className="w-full py-4"
                    offset={10}
                >
                    <div className="flex w-max space-x-16 px-2 items-center">
                        {categories.map((category) => (
                            <Link
                                key={category.id}
                                href={category.link || "#"}
                                className="group flex items-center gap-2 text-small font-small text-default-500 hover:text-foreground transition-colors cursor-pointer select-none"
                            >
                                {category.icon && (
                                    <span className="text-xl group-hover:scale-110 transition-transform duration-300">
                                        {category.icon}
                                    </span>
                                )}
                                <span className="relative">
                                    {category.name}
                                    {/* Animated underline on hover */}
                                    <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-foreground transition-all duration-300 group-hover:w-full rounded-full"></span>
                                </span>
                            </Link>
                        ))}
                    </div>
                </ScrollShadow>
            </div>
        </motion.section>
    );
}
