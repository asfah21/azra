import { Button } from "@heroui/button";
import {
  ArrowRightEndOnRectangleIcon as Azvan,
  SparklesIcon as Azva,
} from "@heroicons/react/24/outline";
import { Card, CardHeader, CardBody } from "@heroui/card";
import { Link } from "@heroui/link";

import { HeroBgDelta } from "./HeroBg";
import { FaMountainCity, FaWandMagicSparkles } from "react-icons/fa6";
import { SiSmart, SiViaplay } from "react-icons/si";

export const ArrowRightEndOnRectangleIcon = ({ size = 20, ...props }) => {
  return <Azvan height={size} width={size} {...props} />;
};

export const SparklesIcon = ({ size = 20, ...props }) => {
  return <Azva height={size} width={size} {...props} />;
};

export default function HeroDelta() {
  const features = [
    {
      title: "Let's Begin",
      description: "Track, organize, and optimize your assets with a modern, and intuitive apps. No prior experience needed.",
      icon: <SiViaplay size={20} />
    },
    {
      title: "Smart Asset Management",
      description: "Easily monitor asset conditions, locations, and usage — all in one place.",
      icon: <SiSmart size={20} />
    },
  ]
  return (
    <section className="px-6 md:px-20 relative z-10 flex-col gap-2 bg-transparent dark:bg-transparent before:bg-background/10 before:content-[''] before:block before:z-[-1] before:absolute before:inset-0 before:backdrop-blur-md before:backdrop-saturate-200 border-t border-b border-divider w-full flex justify-center items-center mt-16 lg:mt-44">
      <div className=" w-full max-w-7xl py-10 grid grid-cols-12 gap-6 md:gap-0 z-20">
        <div className="flex flex-col gap-2 col-span-12 md:col-span-6">
          <div className="flex flex-col">
            <h1 className="tracking-tight font-semibold text-[clamp(1rem,10vw,2rem)] sm:text-[clamp(1rem,10vw,3rem)] lg:text-5xl inline">
              Let's Manage
            </h1>
            <div>
              <h1 className="tracking-tight inline font-semibold text-[clamp(1rem,10vw,2rem)] sm:text-[clamp(1rem,10vw,3rem)] lg:text-5xl">
                Assets&nbsp;
              </h1>
              <h1 className="tracking-tight font-semibold from-[#FF1CF7] to-[#b249f8] text-[clamp(1rem,10vw,2rem)] sm:text-[clamp(1rem,10vw,3rem)] lg:text-5xl bg-clip-text text-transparent bg-gradient-to-b inline">
                Better
              </h1>
            </div>
          </div>
          <p className="w-full my-2 font-normal text-default-500 block max-w-full md:w-full text-base lg:text-lg">
            Experience it firsthand and streamline your asset operations!
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
          </div>

        </div>
        <div className="col-span-12 md:col-span-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:grid-cols-2">

            {features.map((feature, index) => (
              <div key={index} className="flex gap-x-4 items-center">
                <Card
                  isPressable
                  as={Link}
                  className="flex flex-col relative overflow-hidden h-auto text-foreground box-border outline-none data-[focus-visible=true]:z-10 data-[focus-visible=true]:outline-2 data-[focus-visible=true]:outline-focus data-[focus-visible=true]:outline-offset-2 shadow-medium rounded-large transition-transform-background motion-reduce:transition-none border-transparent bg-white/5 dark:bg-default-400/10 backdrop-blur-lg backdrop-saturate-[1.8]"
                  href="http://gsi.db-ku.com"
                  shadow="sm"
                >
                  <CardHeader className="flex gap-3 pb-0">
                    <div className="flex justify-center p-2 rounded-full items-center bg-secondary-100/80 text-pink-500">
                      {feature.icon}
                    </div>
                    <div className="flex flex-col">
                      <p className="text-md font-bold">{feature.title}</p>
                    </div>
                  </CardHeader>
                  <CardBody>
                    <p>
                      {feature.description}
                    </p>
                  </CardBody>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </div>
      <HeroBgDelta />
    </section>
  );
}
