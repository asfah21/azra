"use client";

import { Card, CardFooter, Image, Button } from "@heroui/react";
import { motion } from "framer-motion";

import TypingMotion from "../TypingMotion";

// Animasi
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

const staggerContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut",
      staggerChildren: 0.15,
    },
  },
};

export default function Hero() {
  return (
    <motion.section
      animate="visible"
      className="px-6 md:px-20 flex flex-col items-center justify-center"
      initial="hidden"
      variants={staggerContainer}
    >
      <motion.div
        variants={cardVariants}
        className="w-full"
      >
        <Card
          radius="lg"
          shadow="sm"
          className="w-full p-6 bg-background/60 dark:bg-default-100/50 backdrop-blur-lg border border-white/20"
        >
          <section className="flex relative overflow-hidden lg:overflow-visible w-full flex-nowrap justify-between items-center max-w-screen-2xl mx-auto">
            <motion.div
              className="relative z-20 flex flex-col w-full gap-6 lg:w-1/2 max-w-[720px]"
              variants={fadeIn}
            >
              <motion.div
                className="flex justify-center w-full pb-[-4px] md:hidden"
                variants={fadeIn}
              />

              <motion.h1
                className="tracking-tight inline font-semibold text-[clamp(1.8rem,8vw,3.2rem)] leading-tight text-center md:text-left"
                variants={fadeIn}
              >
                Explore{" "}
                <span className="tracking-tight inline font-bold from-success to-primary bg-clip-text text-transparent bg-gradient-to-b">
                  AZRA
                </span>{" "}
                &nbsp;
                <br className="inline" />
                <TypingMotion
                  className="text-foreground"
                  pauseTime={1100}
                  typingSpeed={85}
                  words={[
                    "Free & Premium Fonts",
                    "For Branding & UI",
                    "Instant Design Boost",
                    "Curated Collection",
                  ]}
                />
              </motion.h1>

              <motion.p
                className="my-2 text-base md:text-lg font-normal text-default-500 text-center md:text-left"
                variants={fadeIn}
              >
                A complete font destination for free and premium collections,
                support branding, interface design, elevate visual experiences,
                flexible, and built for modern creators.
              </motion.p>

              <motion.div
                className="flex flex-col items-center gap-4 md:flex-row"
                variants={fadeIn}
              >
                <a
                  className="text-sm bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-full transition"
                  href="/login"
                >
                  Get Started →
                </a>
                <div className="bg-green-600 hover:bg-green-700 transition text-white px-4 py-3 rounded-full font-mono text-sm flex items-center gap-2">
                  <span>#</span>
                  <span>Ask for access </span>
                  <button
                    aria-label="Copy command"
                    className="ml-2"
                    onClick={() => navigator.clipboard.writeText("+6282271548976")}
                  >
                    📋
                  </button>
                </div>
              </motion.div>
            </motion.div>

            <motion.div
              className="hidden lg:flex flex-col relative z-20 w-1/2"
              variants={fadeIn}
            >
              <div className="absolute z-10 -top-[145px] -right-[1px] animate-[levitate_14s_ease_infinite_1s]">
                <Card
                  isFooterBlurred
                  className="border-none animate-float priority opacity-85"
                  radius="lg"
                >
                  <Image
                    alt="Azra Management Assets"
                    className="object-cover"
                    height={300}
                    src="/hero-v2.svg"
                    width={450}
                  />
                  <CardFooter className="justify-between before:bg-white/10 border-white/20 border-1 overflow-hidden py-1 absolute before:rounded-xl rounded-large bottom-1 w-[calc(100%_-_8px)] shadow-small ml-1 z-10">
                    <p className="text-tiny text-white/80">Currently in Beta</p>
                    <Button
                      className="text-tiny text-white bg-black/20"
                      color="default"
                      radius="lg"
                      size="sm"
                      variant="flat"
                    >
                      Notify me
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </motion.div>
          </section>
        </Card>
      </motion.div>
    </motion.section>
  );
}
