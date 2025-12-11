"use client";

import { useRef, useState, useEffect } from "react";

interface ImageSliderProps {
    images: string[];
}

export default function ImageSlider({ images }: ImageSliderProps) {
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [activeIndex, setActiveIndex] = useState(0);

    const handleScroll = () => {
        if (!scrollContainerRef.current) return;
        const { scrollLeft, clientWidth } = scrollContainerRef.current;
        const index = Math.round(scrollLeft / clientWidth);
        if (index !== activeIndex && index >= 0 && index < images.length) {
            setActiveIndex(index);
        }
    };

    const scrollTo = (index: number) => {
        if (!scrollContainerRef.current) return;
        scrollContainerRef.current.scrollTo({
            left: index * scrollContainerRef.current.clientWidth,
            behavior: "smooth",
        });
    };

    if (!images || images.length === 0) return null;

    return (
        <div className="relative group">
            {/* Scroll Container */}
            <div
                ref={scrollContainerRef}
                onScroll={handleScroll}
                className="flex w-full overflow-x-auto snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] rounded-xl border border-neutral-200 dark:border-white/10 shadow-sm bg-neutral-100 dark:bg-neutral-800"
            >
                {images.map((img, idx) => (
                    <div
                        key={idx}
                        className="flex-none w-full snap-center relative aspect-[16/9]"
                    >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={img}
                            alt={`Slide ${idx + 1}`}
                            className="absolute inset-0 h-full w-full object-cover"
                            loading="lazy"
                        />
                    </div>
                ))}
            </div>

            {/* Dots Indicator */}
            {images.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-10 p-2 rounded-full bg-black/20 backdrop-blur-sm border border-white/10">
                    {images.map((_, idx) => (
                        <button
                            key={idx}
                            onClick={() => scrollTo(idx)}
                            className={`w-2 h-2 rounded-full transition-all duration-300 ${idx === activeIndex
                                ? "bg-white w-4"
                                : "bg-white/50 hover:bg-white/80"
                                }`}
                            aria-label={`Go to slide ${idx + 1}`}
                        />
                    ))}
                </div>
            )}

            {/* Navigation Hints - Optional, only visible on hover for desktop */}
            <div className="pointer-events-none absolute inset-0 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-300 px-4">
                {/* Could add arrows here if requested, but user asked for "swipe only" essentially, so keeping it clean */}
            </div>
        </div>
    );
}
