import { Button } from "@heroui/button";
import {
  ArrowRightEndOnRectangleIcon as Azvan,
  SparklesIcon as Azva,
} from "@heroicons/react/24/outline";
import { Card, CardHeader, CardBody } from "@heroui/card";
import { Link } from "@heroui/link";

import { HeroBgDelta } from "./HeroBg";

export const ArrowRightEndOnRectangleIcon = ({ size = 20, ...props }) => {
  return <Azvan height={size} width={size} {...props} />;
};

export const SparklesIcon = ({ size = 20, ...props }) => {
  return <Azva height={size} width={size} {...props} />;
};

export default function HeroDelta() {
  return (
    <section className="px-6 md:px-20 relative z-10 flex-col gap-2 bg-transparent dark:bg-transparent before:bg-background/10 before:content-[''] before:block before:z-[-1] before:absolute before:inset-0 before:backdrop-blur-md before:backdrop-saturate-200 border-t border-b border-divider px-8 w-full flex justify-center items-center mt-16 lg:mt-44">
      <div className=" w-full max-w-7xl py-10 grid grid-cols-12 gap-6 md:gap-0 z-20">
        <div className="flex flex-col gap-2 col-span-12 md:col-span-6">
          <div className="flex flex-col">
            <h1 className="tracking-tight font-semibold text-[clamp(1rem,10vw,2rem)] sm:text-[clamp(1rem,10vw,3rem)] lg:text-5xl inline">
              Lets make the
            </h1>
            <div>
              <h1 className="tracking-tight inline font-semibold text-[clamp(1rem,10vw,2rem)] sm:text-[clamp(1rem,10vw,3rem)] lg:text-5xl">
                Web&nbsp;
              </h1>
              <h1 className="tracking-tight font-semibold from-[#FF1CF7] to-[#b249f8] text-[clamp(1rem,10vw,2rem)] sm:text-[clamp(1rem,10vw,3rem)] lg:text-5xl bg-clip-text text-transparent bg-gradient-to-b inline">
                Prettier
              </h1>
            </div>
          </div>
          <p className="w-full my-2 font-normal text-default-500 block max-w-full md:w-full text-base lg:text-lg">
            Experience it firsthand and show us your creations!
          </p>
          <div className="flex flex-row gap-3 justify-start">
            <Button
              color="secondary"
              endContent={<ArrowRightEndOnRectangleIcon />}
              radius="full"
              variant="solid"
            >
              Get Started
            </Button>
            <Button
              color="default"
              endContent={<SparklesIcon />}
              radius="full"
              variant="ghost"
            >
              Github
            </Button>
          </div>
        </div>
        <div className="col-span-12 md:col-span-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:grid-cols-2">
            <Card
              isPressable
              as={Link}
              className="flex flex-col relative overflow-hidden h-auto text-foreground box-border outline-none data-[focus-visible=true]:z-10 data-[focus-visible=true]:outline-2 data-[focus-visible=true]:outline-focus data-[focus-visible=true]:outline-offset-2 shadow-medium rounded-large transition-transform-background motion-reduce:transition-none border-transparent bg-white/5 dark:bg-default-400/10 backdrop-blur-lg backdrop-saturate-[1.8]"
              href="http://gsi.db-ku.com"
              shadow="sm"
            >
              <CardHeader className="flex gap-3 pb-0">
                <div className="flex justify-center p-2 rounded-full items-center bg-secondary-100/80 text-pink-500">
                  <svg
                    aria-hidden="true"
                    className="text-pink-500"
                    fill="none"
                    focusable="false"
                    height="20"
                    role="presentation"
                    viewBox="0 0 24 24"
                    width="20"
                  >
                    <path
                      d="M3.5 20.5c.83.83 2.17.83 3 0l13-13c.83-.83.83-2.17 0-3-.83-.83-2.17-.83-3 0l-13 13c-.83.83-.83 2.17 0 3ZM18.01 8.99l-3-3"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.5"
                    />
                    <path
                      d="M8.5 2.44 10 2l-.44 1.5L10 5l-1.5-.44L7 5l.44-1.5L7 2l1.5.44ZM4.5 8.44 6 8l-.44 1.5L6 11l-1.5-.44L3 11l.44-1.5L3 8l1.5.44ZM19.5 13.44 21 13l-.44 1.5L21 16l-1.5-.44L18 16l.44-1.5L18 13l1.5.44Z"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <div className="flex flex-col">
                  <p className="text-md font-bold">Getting Started</p>
                </div>
              </CardHeader>
              <CardBody>
                <p>
                  Make beautiful, modern, and fast websites/applications
                  regardless of your design experience.
                </p>
              </CardBody>
            </Card>

            <Card
              isPressable
              as={Link}
              className="flex flex-col relative overflow-hidden h-auto text-foreground box-border outline-none data-[focus-visible=true]:z-10 data-[focus-visible=true]:outline-2 data-[focus-visible=true]:outline-focus data-[focus-visible=true]:outline-offset-2 shadow-medium rounded-large transition-transform-background motion-reduce:transition-none border-transparent bg-white/5 dark:bg-default-400/10 backdrop-blur-lg backdrop-saturate-[1.8]"
              href="http://gsi.db-ku.com"
              shadow="sm"
            >
              <CardHeader className="flex gap-3 pb-0">
                <div className="flex justify-center p-2 rounded-full items-center bg-secondary-100/80 text-pink-500">
                  <svg
                    aria-hidden="true"
                    className="text-pink-500"
                    fill="none"
                    focusable="false"
                    height="20"
                    role="presentation"
                    viewBox="0 0 24 24"
                    width="20"
                  >
                    <path
                      d="M3.5 20.5c.83.83 2.17.83 3 0l13-13c.83-.83.83-2.17 0-3-.83-.83-2.17-.83-3 0l-13 13c-.83.83-.83 2.17 0 3ZM18.01 8.99l-3-3"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.5"
                    />
                    <path
                      d="M8.5 2.44 10 2l-.44 1.5L10 5l-1.5-.44L7 5l.44-1.5L7 2l1.5.44ZM4.5 8.44 6 8l-.44 1.5L6 11l-1.5-.44L3 11l.44-1.5L3 8l1.5.44ZM19.5 13.44 21 13l-.44 1.5L21 16l-1.5-.44L18 16l.44-1.5L18 13l1.5.44Z"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <div className="flex flex-col">
                  <p className="text-md font-bold">NextJs + HeroUI</p>
                </div>
              </CardHeader>
              <CardBody>
                <p>
                  HeroUI is fully compatible with the new Next.js app/ directory
                  structure.
                </p>
              </CardBody>
            </Card>
          </div>
        </div>
      </div>
      <HeroBgDelta />
    </section>
  );
}
