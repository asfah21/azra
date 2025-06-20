import { Button } from "@heroui/button";
import { ArrowRightCircleIcon as Azvan } from "@heroicons/react/24/outline";
import { HiOutlineCheck } from "react-icons/hi";
import Link from "next/link";

import { HeroBgBawah } from "./HeroBg";

export const ArrowRightCircleIcon = ({ size = 24, ...props }) => {
  return <Azvan height={size} width={size} {...props} />;
};

export default function HeroGamma() {
  const features = [
    {
      title: "Asset Tracking",
      icon: <HiOutlineCheck color="#006FEE" size={24} />,
    },
    {
      title: "Equipment Maintenance",
      icon: <HiOutlineCheck color="#006FEE" size={24} />,
    },
    {
      title: "Preventive Maintenance",
      icon: <HiOutlineCheck color="#006FEE" size={24} />,
    },
    {
      title: "Asset Reporting",
      icon: <HiOutlineCheck color="#006FEE" size={24} />,
    },
  ];

  return (
    <section className="px-6 md:px-20 relative z-10 flex flex-col gap-2 w-full mt-16 lg:mt-44 overflow-hidden">
      <div className="flex flex-col gap-8 min-h-[480px]">
        <div className="z-30 flex inset-0 h-full flex-col items-start justify-center leading-8 pt-4">
          <div className="relative max-w-fit min-w-min inline-flex items-center justify-between box-border whitespace-nowrap px-1 h-6 text-tiny rounded-full bg-primary text-primary-foreground ml-0.5 transition-colors bg-gradient-to-br from-cyan-600 to-blue-600">
            <span className="flex-1 text-inherit px-1 text-tiny font-semibold">
              New
            </span>
          </div>
          <div className="flex-col gap-2 items-start justify-center w-full mt-2 inline md:block">
            <h1 className="tracking-tight inline font-semibold text-4xl lg:text-6xl [text-shadow:_0_3px_0_rgb(0_0_0_/_10%)]">
              Manage assets&nbsp;
            </h1>
            <h1 className="tracking-tight inline font-semibold from-[#5EA2EF] to-[#0072F5] text-4xl lg:text-6xl bg-clip-text text-transparent bg-gradient-to-b [text-shadow:_0_3px_0_rgb(0_0_0_/_10%)]">
              faster&nbsp;
            </h1>
            <h1 className="tracking-tight inline font-semibold text-4xl lg:text-6xl [text-shadow:_0_3px_0_rgb(0_0_0_/_10%)]">
              with&nbsp;
            </h1>
            <div className="flex flex-col sm:flex-row">
              <h1 className="tracking-tight inline font-semibold text-4xl lg:text-6xl [text-shadow:_0_3px_0_rgb(0_0_0_/_10%)]">
                modern solutions
              </h1>
            </div>
          </div>
          <p className="w-full md:w-1/2 my-2 text-medium lg:text-large font-normal block max-w-full pr-12 text-foreground-500">
            Track assets, log equipment issues, plan preventive maintenance, and
            generate insightful reports — all in one intuitive platform.
          </p>
          <div className="mt-4 text-foreground-600 font-medium">
            {features.map((feature, index) => (
              <div key={index} className="flex gap-x-4 items-center">
                {feature.icon}
                {feature.title}
              </div>
            ))}
          </div>
          <div className="mt-4">
            <Link href="/dashboard">
              <Button
                color="primary"
                endContent={<ArrowRightCircleIcon />}
                variant="solid"
              >
                Explore More
              </Button>
            </Link>
          </div>
        </div>
        <HeroBgBawah />
      </div>
    </section>
  );
}
