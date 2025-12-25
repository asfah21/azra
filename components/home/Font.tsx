"use client";
import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Card, Input, Button, Tooltip } from "@heroui/react";
import { MagnifyingGlassIcon, ArrowDownTrayIcon, ArrowPathIcon, ShareIcon } from "@heroicons/react/24/outline";

type FontVariant = {
    name: string;
    file: string;
};

type Font = {
    name: string;
    variants: FontVariant[];
};

const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.6, ease: "easeOut" },
    },
};

export default function Fonts() {
    const [fonts, setFonts] = useState<Font[]>([]);
    const [previewText, setPreviewText] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(true);
    const [fontSize, setFontSize] = useState<number>(55);
    const [textColor, setTextColor] = useState("#000000");
    const [backgroundColor, setBackgroundColor] = useState("#ffffff");

    // Initialize colors based on theme
    useEffect(() => {
        // Function to update colors based on theme
        const updateColors = (isDark: boolean) => {
            if (isDark) {
                setBackgroundColor("#303846"); // rgb(48, 56, 70) converted to hex
                setTextColor("#ffffff");
            } else {
                setBackgroundColor("#ffffff");
                setTextColor("#000000");
            }
        };

        // Check initial theme
        const isDark = document.documentElement.classList.contains("dark");
        updateColors(isDark);

        // Observer for theme changes
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.attributeName === "class") {
                    const isDarkNow = document.documentElement.classList.contains("dark");
                    updateColors(isDarkNow);
                }
            });
        });

        observer.observe(document.documentElement, { attributes: true });

        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        setLoading(true);
        fetch("/api/fonts")
            .then((res) => res.json())
            .then((data) => {
                setFonts(data.fonts);
                setLoading(false);
            })
            .catch((err) => {
                console.error("Error fetching fonts:", err);
                setLoading(false);
            });
    }, []);

    const resetSettings = () => {
        setFontSize(55);
        setPreviewText("");
        const isDark = document.documentElement.classList.contains("dark");
        if (isDark) {
            setBackgroundColor("#303846");
            setTextColor("#ffffff");
        } else {
            setBackgroundColor("#ffffff");
            setTextColor("#000000");
        }
    };

    return (
        <motion.section
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            id="fonts"
            className="px-6 md:px-20 w-full flex justify-center py-10"
        >
            <div className="w-full max-w-screen-2xl">
                <Card
                    className="w-full bg-background/60 dark:bg-default-100/50 backdrop-blur-lg border border-none p-2 md:p-5"
                    radius="lg"
                    shadow="sm"
                >
                    <div className="flex flex-col gap-6">
                        {/* Toolbar */}
                        <div className="flex flex-wrap md:flex-nowrap gap-4 items-center bg-default-100/50 p-2 md:p-3 rounded-xl justify-between">
                            <div className="w-full md:w-64 lg:w-80">
                                <Input
                                    placeholder="Type your own text..."
                                    value={previewText}
                                    onValueChange={setPreviewText}
                                    classNames={{
                                        inputWrapper: "bg-default-200/50 shadow-none",
                                    }}
                                    startContent={<MagnifyingGlassIcon className="w-4 h-3 text-default-400" />}
                                    size="md"
                                    onFocus={(e: React.FocusEvent<HTMLInputElement>) => {
                                        e.target.style.outline = "none";
                                    }}
                                />
                            </div>

                            <div className="flex-1 flex justify-center px-4 min-w-[30%]">
                                <div className="flex items-center gap-3 w-full max-w-[150px]">
                                    {/* <span className="hidden sm:inline">Size</span> */}
                                    <input
                                        type="range"
                                        min={20}
                                        max={200}
                                        value={fontSize}
                                        onChange={(e) => setFontSize(Number(e.target.value))}
                                        className="w-full h-1.5 bg-default-300 rounded-lg appearance-none cursor-pointer accent-primary"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center gap-4 md:gap-6 flex-none justify-end">
                                <div className="flex items-center gap-3">
                                    <div className="flex flex-col gap-1 items-center">
                                        <div className="relative overflow-hidden w-6 h-6 rounded-md border border-default-300 cursor-pointer shadow-sm hover:scale-105 transition-transform bg-white">
                                            <input
                                                type="color"
                                                value={textColor}
                                                onChange={(e) => setTextColor(e.target.value)}
                                                className="absolute -top-2 -left-2 w-[200%] h-[200%] cursor-pointer p-0 border-0"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-1 items-center">
                                        <div className="relative overflow-hidden w-6 h-6 rounded-md border border-default-300 cursor-pointer shadow-sm hover:scale-105 transition-transform bg-black">
                                            <input
                                                type="color"
                                                value={backgroundColor}
                                                onChange={(e) => setBackgroundColor(e.target.value)}
                                                className="absolute -top-2 -left-2 w-[200%] h-[200%] cursor-pointer p-0 border-0"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="h-6 w-px bg-default-300 hidden md:block"></div>

                                <div className="flex items-center gap-1">
                                    <Tooltip content="Reset Settings">
                                        <Button
                                            isIconOnly
                                            variant="light"
                                            size="sm"
                                            onPress={resetSettings}
                                        >
                                            <ArrowPathIcon className="w-5 h-5 text-default-500" />
                                        </Button>
                                    </Tooltip>
                                    <Tooltip content="Share">
                                        <Button
                                            isIconOnly
                                            variant="light"
                                            size="sm"
                                        >
                                            <ShareIcon className="w-5 h-5 text-default-500" />
                                        </Button>
                                    </Tooltip>
                                </div>
                            </div>
                        </div>

                        {/* Font Grid */}
                        <div className="grid grid-cols-1 gap-6">
                            {loading ? (
                                Array.from({ length: 3 }).map((_, i) => (
                                    <div key={i} className="h-40 w-full animate-pulse rounded-xl bg-default-200" />
                                ))
                            ) : (
                                fonts.map((font, index) => (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        key={index}
                                        className="group relative overflow-hidden rounded-xl bg-content1 border border-default-200 shadow-sm transition-all hover:shadow-md hover:border-primary/50"
                                    >
                                        <style jsx global>{`
                                            @font-face {
                                                font-family: "${font.variants[0].name}";
                                                src: url("${font.variants[0].file}");
                                            }
                                        `}</style>

                                        <div className="p-4 flex flex-col gap-4">
                                            <div className="flex justify-between items-start">
                                                <div className="flex gap-2">
                                                    <span className="px-2 py-1 bg-default-100 rounded-md text-xs font-medium text-default-600 border border-default-200">
                                                        {font.name}
                                                    </span>
                                                    {/* <span className="px-2 py-1 bg-primary/10 text-primary rounded-md text-xs font-medium border border-primary/20">
                                                        Premium
                                                    </span> */}
                                                </div>

                                                <Button
                                                    size="sm"
                                                    color="primary"
                                                    variant="flat"
                                                    startContent={<ArrowDownTrayIcon className="w-4 h-4" />}
                                                    onPress={() => {
                                                        const link = document.createElement("a");
                                                        link.href = `/fonts/${font.name}.zip`;
                                                        link.download = `${font.name}.zip`;
                                                        document.body.appendChild(link);
                                                        link.click();
                                                        document.body.removeChild(link);
                                                    }}
                                                >
                                                    Download
                                                </Button>
                                            </div>

                                            <div
                                                className="w-full overflow-hidden text-ellipsis whitespace-nowrap py-4 px-4 rounded-lg transition-colors border border-dashed border-default-300"
                                                style={{
                                                    fontFamily: font.variants[0].name,
                                                    fontSize: `${fontSize}px`,
                                                    color: textColor,
                                                    backgroundColor: backgroundColor,
                                                }}
                                            >
                                                {previewText || font.variants[0].name}
                                            </div>
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </div>
                    </div>
                </Card>
            </div>
        </motion.section>
    );
}