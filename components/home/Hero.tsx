"use client";

import { Card, CardFooter, Image, Button } from "@heroui/react";

export default function Hero() {
  return (
    <section className="px-6 md:px-20 flex flex-col items-center justify-center">
      <section className="flex relative overflow-hidden lg:overflow-visible w-full flex-nowrap justify-between items-center h-[calc(100vh_-_64px)] 2xl:h-[calc(84vh_-_64px)] max-w-screen-2xl mx-auto">
        <div className="relative z-20 flex flex-col w-full gap-6 lg:w-1/2 xl:mt-10 max-w-[720px]">
          <div className="flex justify-center w-full md:hidden">
            <a
              className="relative max-w-fit min-w-min inline-flex items-center justify-between box-border whitespace-nowrap px-1 h-7 text-small rounded-full text-primary-600 bg-default-200/50 border-1 hover:bg-default-200/80 border-default-400/50 cursor-pointer"
              href="/blog/v2.7.0"
            >
              <span className="flex-1 px-2 font-semibold text-foreground text-xs">
                Azra v0.3.1 (beta)&nbsp;
                <span aria-label="emoji" role="img">
                  🔥
                </span>
              </span>
            </a>
          </div>

          <h1 className="tracking-tight inline font-semibold text-[clamp(1.8rem,8vw,3.2rem)] leading-tight text-center md:text-left">
            Discover{" "}
            <span className="tracking-tight inline font-bold from-success to-primary bg-clip-text text-transparent bg-gradient-to-b">
              AZRA
            </span>{" "}
            a stunning&nbsp;
            <br className="hidden md:inline" />
            asset management apps designed for simplicity.
          </h1>

          <p className="my-2 text-base md:text-lg font-normal text-default-500 text-center md:text-left">
            Sleek, fast app to manage assets, track statuses (maintenance,
            damaged, etc.) and export A to Z records to Excel. Simple, powerful
            for all users.
          </p>

          <div className="flex flex-col items-center gap-4 md:flex-row">
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
          </div>
        </div>

        <div className="hidden lg:flex flex-col relative z-20 w-1/2">
          <div className="absolute z-10 -top-[120px] -right-[1px] animate-[levitate_14s_ease_infinite_1s]">
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
        </div>
      </section>
    </section>
  );
}
