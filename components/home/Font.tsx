"use client";
import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Card, Input, Button, Tooltip } from "@heroui/react";
import { MagnifyingGlassIcon, ArrowDownTrayIcon, ArrowPathIcon } from "@heroicons/react/24/outline";

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

    // Initialize colors based on system preference or default
    useEffect(() => {
        // You might want to use useTheme from next-themes here if available
        // to detect current theme for defaults, but keeping simple for now
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
        setTextColor("#000000");
        setBackgroundColor("#ffffff");
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
                    className="w-full bg-background/60 dark:bg-default-100/50 backdrop-blur-lg border border-white/20 p-2 md:p-5"
                    radius="md"
                    shadow="sm"
                >
                    <div className="flex flex-col gap-8">
                        {/* Toolbar */}
                        <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-default-100/50 p-4 rounded-xl border border-default-200/50">
                            <div className="flex-grow w-full md:w-auto">
                                <Input
                                    placeholder="Type something to preview..."
                                    value={previewText}
                                    onValueChange={setPreviewText}
                                    classNames={{
                                        inputWrapper: "bg-default-200/50",
                                    }}
                                    startContent={<MagnifyingGlassIcon className="w-4 h-4 text-default-400" />}
                                    size="lg"
                                    onFocus={(e: React.FocusEvent<HTMLInputElement>) => {
                                        e.target.style.outline = "none";
                                    }}
                                />
                            </div>

                            <div className="flex flex-wrap items-center gap-4 w-full md:w-auto justify-center md:justify-end">
                                <div className="flex items-center gap-2 w-60">
                                    <span className="text-small text-default-500">Size</span>
                                    <input
                                        type="range"
                                        min={20}
                                        max={150}
                                        value={fontSize}
                                        onChange={(e) => setFontSize(Number(e.target.value))}
                                        className="w-full h-2 bg-default-300 rounded-lg appearance-none cursor-pointer accent-primary"
                                    />
                                </div>

                                <div className="flex items-center gap-2 border-l border-default-300 pl-4">
                                    <div className="flex flex-col gap-1 items-center">
                                        <label className="text-[10px] uppercase text-default-500 font-bold">Text</label>
                                        <div className="relative overflow-hidden w-8 h-8 rounded-full border border-default-300 cursor-pointer shadow-sm hover:scale-105 transition-transform">
                                            <input
                                                type="color"
                                                value={textColor}
                                                onChange={(e) => setTextColor(e.target.value)}
                                                className="absolute -top-2 -left-2 w-[200%] h-[200%] cursor-pointer p-0 border-0"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-1 items-center">
                                        <label className="text-[10px] uppercase text-default-500 font-bold">Bg</label>
                                        <div className="relative overflow-hidden w-8 h-8 rounded-full border border-default-300 cursor-pointer shadow-sm hover:scale-105 transition-transform">
                                            <input
                                                type="color"
                                                value={backgroundColor}
                                                onChange={(e) => setBackgroundColor(e.target.value)}
                                                className="absolute -top-2 -left-2 w-[200%] h-[200%] cursor-pointer p-0 border-0"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <Tooltip content="Reset Settings">
                                    <Button
                                        isIconOnly
                                        variant="light"
                                        color="danger"
                                        onPress={resetSettings}
                                    >
                                        <ArrowPathIcon className="w-5 h-5" />
                                    </Button>
                                </Tooltip>
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
                                                    <span className="px-2 py-1 bg-primary/10 text-primary rounded-md text-xs font-medium border border-primary/20">
                                                        Premium
                                                    </span>
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
                                                className="w-full overflow-hidden text-ellipsis whitespace-nowrap py-8 px-4 rounded-lg transition-colors border border-dashed border-default-300"
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