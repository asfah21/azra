export default function HeroAlpha() {
  return (
    <section className="px-6 md:px-20 relative flex flex-col gap-2 w-full z-20 mt-16 lg:mt-44">
      <div className="flex flex-col gap-8">
        <div aria-hidden="true">
          <div className="flex flex-col gap-2 items-start justify-center w-full">
            <h1 className="tracking-tight inline font-semibold text-4xl lg:text-6xl">
              Accessibility
            </h1>
            <div>
              <h1 className="tracking-tight inline font-semibold from-[#6FEE8D] to-[#17c964] text-4xl lg:text-6xl bg-clip-text text-transparent bg-gradient-to-b">
                out of the&nbsp;
              </h1>
              <h1 className="tracking-tight inline font-semibold text-4xl lg:text-6xl">
                box.
              </h1>
            </div>
          </div>
          <p className="w-full md:w-1/2 my-2 text-medium lg:text-large font-normal text-default-500 block max-w-full">
            HeroUI components are built on top of&nbsp;
            <a
              className="relative inline-flex items-center tap-highlight-transparent outline-none data-[focus-visible=true]:z-10 data-[focus-visible=true]:outline-2 data-[focus-visible=true]:outline-focus data-[focus-visible=true]:outline-offset-2 underline hover:opacity-hover active:opacity-disabled transition-opacity underline-offset-4 text-xl text-default-500 font-light [&amp;&gt;svg]:ml-1"
              href="https://react-spectrum.adobe.com/react-aria/"
              rel="noopener noreferrer"
              target="_blank"
            >
              React Aria
            </a>
            &nbsp;ensuring exceptional accessibility support as a top priority.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div aria-hidden="true" className="flex flex-col mt-8 lg:mt-16 gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
              <div className="flex flex-col relative overflow-hidden h-auto text-foreground box-border outline-none data-[focus-visible=true]:z-10 data-[focus-visible=true]:outline-2 data-[focus-visible=true]:outline-focus data-[focus-visible=true]:outline-offset-2 shadow-medium rounded-large transition-transform-background motion-reduce:transition-none border-transparent backdrop-blur-lg backdrop-saturate-[1.8] bg-white dark:bg-default-400/10">
                <div className="flex p-3 z-10 w-full justify-start items-center shrink-0 overflow-inherit color-inherit subpixel-antialiased rounded-t-large gap-2 pb-3">
                  <div className="flex justify-center p-2 rounded-full items-center bg-default-100 dark:bg-transparent text-default-500/50">
                    <svg
                      aria-hidden="true"
                      fill="none"
                      focusable="false"
                      height="24"
                      role="presentation"
                      viewBox="0 0 24 24"
                      width="24"
                    >
                      <path
                        d="M20.9597 17.8385L19.3297 18.3885C18.8797 18.5385 18.5197 18.8885 18.3697 19.3485L17.8197 20.9785C17.3497 22.3885 15.3697 22.3585 14.9297 20.9485L13.0797 14.9985C12.7197 13.8185 13.8097 12.7185 14.9797 13.0885L20.9397 14.9385C22.3397 15.3785 22.3597 17.3685 20.9597 17.8385Z"
                        fill="currentColor"
                      />
                      <path
                        d="M20.9994 11.4994C20.9994 11.9294 20.9694 12.3594 20.9194 12.7794C20.8794 13.0794 20.5694 13.2594 20.2794 13.1694L15.4294 11.6594C14.3494 11.3294 13.1994 11.6094 12.3994 12.3994C11.5994 13.1994 11.3094 14.3694 11.6494 15.4494L13.1494 20.2794C13.2394 20.5694 13.0494 20.8794 12.7494 20.9194C12.3294 20.9694 11.9194 20.9994 11.4994 20.9994C6.15942 20.9994 1.85942 16.6094 1.99942 11.2294C2.13942 6.26942 6.26942 2.13942 11.2294 1.99942C16.6094 1.85942 20.9994 6.15942 20.9994 11.4994Z"
                        fill="currentColor"
                      />
                    </svg>
                  </div>
                  <p className="text-base font-semibold">Managed focus</p>
                </div>
              </div>
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
