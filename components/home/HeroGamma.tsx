import { Button } from "@heroui/button";
import { ArrowRightCircleIcon as Azvan } from "@heroicons/react/24/outline";

import { HeroBgBawah } from "./HeroBg";

export const ArrowRightCircleIcon = ({ size = 24, ...props }) => {
  return <Azvan height={size} width={size} {...props} />;
};

export default function HeroGamma() {
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
              Ship&nbsp;
            </h1>
            <h1 className="tracking-tight inline font-semibold from-[#5EA2EF] to-[#0072F5] text-4xl lg:text-6xl bg-clip-text text-transparent bg-gradient-to-b [text-shadow:_0_3px_0_rgb(0_0_0_/_10%)]">
              faster&nbsp;
            </h1>
            <h1 className="tracking-tight inline font-semibold text-4xl lg:text-6xl [text-shadow:_0_3px_0_rgb(0_0_0_/_10%)]">
              with&nbsp;
            </h1>
            <div className="flex flex-col sm:flex-row">
              <h1 className="tracking-tight inline font-semibold text-4xl lg:text-6xl [text-shadow:_0_3px_0_rgb(0_0_0_/_10%)]">
                beautiful components
              </h1>
            </div>
          </div>
          <p className="w-full md:w-1/2 my-2 text-medium lg:text-large font-normal block max-w-full pr-12 text-foreground-500">
            Premade templates of over 210+ beautiful and responsive components,
            professionally created by the team behind HeroUI.
          </p>
          <div className="mt-4 text-foreground-600 font-medium">
            <div className="flex gap-x-4 items-center">
              <svg
                fill="none"
                height="11"
                viewBox="0 0 13 11"
                width="13"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M1 6.4L4.14286 10L12 1"
                  stroke="#006FEE"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                />
              </svg>
              210+ Components
            </div>
            <div className="flex gap-x-4 items-center">
              <svg
                fill="none"
                height="11"
                viewBox="0 0 13 11"
                width="13"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M1 6.4L4.14286 10L12 1"
                  stroke="#006FEE"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                />
              </svg>
              Lifetime Access
            </div>
            <div className="flex gap-x-4 items-center">
              <svg
                fill="none"
                height="11"
                viewBox="0 0 13 11"
                width="13"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M1 6.4L4.14286 10L12 1"
                  stroke="#006FEE"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                />
              </svg>
              Free Updates
            </div>
            <div className="flex gap-x-4 items-center">
              <svg
                fill="none"
                height="11"
                viewBox="0 0 13 11"
                width="13"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M1 6.4L4.14286 10L12 1"
                  stroke="#006FEE"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                />
              </svg>
              Figma File Includes
            </div>
          </div>
          <div className="mt-4">
            <Button
              color="primary"
              endContent={<ArrowRightCircleIcon />}
              variant="solid"
            >
              Explore More
            </Button>
          </div>
        </div>
        <HeroBgBawah />
      </div>
    </section>
  );
}
