// import { Zap } from "lucide-react";
import { RiAdminFill, RiAedFill, RiBlueskyFill, RiFeedbackFill, RiFocus2Fill, RiGlobalFill, RiTimeFill, RiTimerFlashFill,  } from "react-icons/ri";

export default function HeroAlpha() {

  const features = [
    {title: "Managed focus", icon: <RiFocus2Fill size={24} />},
    {title: "Real-time data", icon: <RiTimerFlashFill size={24} />},
    {title: "Optimize Performance", icon: <RiAedFill size={24} />},
    {title: "Role-based access", icon: <RiAdminFill size={24} />},
    {title: "Consistent UI patterns", icon: <RiBlueskyFill size={24} />},
    {title: "Accessible from everywhere", icon: <RiGlobalFill size={24} />},
  ]

  return (
    <section className="px-6 md:px-20 relative flex flex-col gap-2 w-full z-20 mt-16 lg:mt-32">
      <div className="flex flex-col gap-8">
        <div aria-hidden="true">
          <div className="flex flex-col gap-2 items-start justify-center w-full">
            <h1 className="tracking-tight inline font-semibold text-4xl lg:text-6xl">
              Accessibility
            </h1>
            <div>
              <h1 className="tracking-tight inline font-semibold from-[#6FEE8D] to-[#17c964] text-4xl lg:text-6xl bg-clip-text text-transparent bg-gradient-to-b">
                Ready from day&nbsp;
              </h1>
              <h1 className="tracking-tight inline font-semibold text-4xl lg:text-6xl">
                one.
              </h1>
            </div>
          </div>
          <p className="w-full md:w-1/2 my-2 text-medium lg:text-large font-normal text-default-500 block max-w-full">
            Our asset management app is built with accessibility in mind,
            &nbsp;ensuring users of all abilities can interact with the system effortlessly.
            {/* &nbsp;ensuring exceptional accessibility support as a top priority. */}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div aria-hidden="true" className="flex flex-col mt-8 lg:mt-16 gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">

              {features.map((feature, index) => (

                <div key={index} className="flex flex-col relative overflow-hidden h-auto text-foreground box-border outline-none data-[focus-visible=true]:z-10 data-[focus-visible=true]:outline-2 data-[focus-visible=true]:outline-focus data-[focus-visible=true]:outline-offset-2 shadow-medium rounded-large transition-transform-background motion-reduce:transition-none border-transparent backdrop-blur-lg backdrop-saturate-[1.8] bg-white dark:bg-default-400/10">
                  <div className="flex p-3 z-10 w-full justify-start items-center shrink-0 overflow-inherit color-inherit subpixel-antialiased rounded-t-large gap-2 pb-3">
                    <div className="flex justify-center p-2 rounded-full items-center bg-default-100 dark:bg-transparent text-default-500/50">
                      {feature.icon}
                    </div>
                    <p className="text-base font-semibold">{feature.title}</p>
                  </div>
                </div>

              ))}

            </div>
            <a
              aria-label="Learn more about accessibility"
              className="z-0 group relative inline-flex items-center justify-center box-border appearance-none select-none whitespace-nowrap font-normal subpixel-antialiased overflow-hidden tap-highlight-transparent transform-gpu data-[pressed=true]:scale-[0.97] outline-none data-[focus-visible=true]:z-10 data-[focus-visible=true]:outline-2 data-[focus-visible=true]:outline-focus data-[focus-visible=true]:outline-offset-2 px-3 min-w-16 h-8 text-tiny gap-2 rounded-full [&amp;&gt;svg]:max-w-[theme(spacing.8)] transition-transform-colors-opacity motion-reduce:transition-none bg-success/20 text-success-700 dark:text-success data-[hover=true]:opacity-hover max-w-fit"
              href="/docs/customization/customize-theme"
              role="button"
            >
              Learn more
            </a>
          </div>
          <div className="flex relative w-full bg-gradient-to-r from-[#4ADE80] to-[#06B6D4] rounded-2xl h-full min-h-[200px] lg:min-h-[390px] max-h-[300px] lg:pt-8 items-center lg:items-start justify-center" />
        </div>

      </div>
    </section>
  );
}
