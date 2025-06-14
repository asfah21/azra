import {
  SiNextdotjs,
  SiTypescript,
  SiTailwindcss,
  SiSupabase,
  SiNextui,
  SiPrisma,
} from "react-icons/si";

export default function BuildWith() {
  return (
    // <section className="px-6 md:px-20 relative z-10 flex flex-col text-center w-full mt-16 lg:mt-44 overflow-hidden">
    <section className="relative z-10 flex flex-col gap-2 w-full text-center mt-24 lg:mt-32">
      <h3 className="mb-8 text-large text-default-500">
        A full-stack application built with
      </h3>
      <div className="w-full flex flex-wrap gap-x-5 gap-y-3 justify-center items-center">
        <div className="flex flex-wrap justify-center gap-x-5 gap-y-4 sm:flex-nowrap sm:gap-x-8">
          {/* Next.js - Black theme */}
          <a
            className="relative tap-highlight-transparent outline-none data-[focus-visible=true]:z-10 data-[focus-visible=true]:outline-2 data-[focus-visible=true]:outline-focus data-[focus-visible=true]:outline-offset-2 no-underline transition-all duration-300 flex flex-col items-center justify-center p-4 rounded-xl hover:bg-black/5 hover:shadow-lg hover:scale-105 group"
            href="https://nextjs.org/"
            rel="noopener noreferrer"
            target="_blank"
          >
            <SiNextdotjs
              className="text-black dark:text-white transition-colors duration-300 group-hover:scale-110"
              size={48}
            />
            <span className="text-xs font-medium text-gray-600 dark:text-gray-400 mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              Next.js
            </span>
          </a>

          {/* TypeScript - Blue theme */}
          <a
            className="relative tap-highlight-transparent outline-none data-[focus-visible=true]:z-10 data-[focus-visible=true]:outline-2 data-[focus-visible=true]:outline-focus data-[focus-visible=true]:outline-offset-2 no-underline transition-all duration-300 flex flex-col items-center justify-center p-4 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:shadow-lg hover:scale-105 group"
            href="https://www.typescriptlang.org/"
            rel="noopener noreferrer"
            target="_blank"
          >
            <SiTypescript
              className="text-blue-600 dark:text-blue-400 transition-all duration-300 group-hover:scale-110 group-hover:text-blue-700 dark:group-hover:text-blue-300"
              size={48}
            />
            <span className="text-xs font-medium text-blue-600 dark:text-blue-400 mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              TypeScript
            </span>
          </a>

          {/* NextUI - Purple theme */}
          <a
            className="relative tap-highlight-transparent outline-none data-[focus-visible=true]:z-10 data-[focus-visible=true]:outline-2 data-[focus-visible=true]:outline-focus data-[focus-visible=true]:outline-offset-2 no-underline transition-all duration-300 flex flex-col items-center justify-center p-4 rounded-xl hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:shadow-lg hover:scale-105 group"
            href="https://www.heroui.com/"
            rel="noopener noreferrer"
            target="_blank"
          >
            <SiNextui
              className="text-purple-600 dark:text-purple-400 transition-all duration-300 group-hover:scale-110 group-hover:text-purple-700 dark:group-hover:text-purple-300"
              size={48}
            />
            <span className="text-xs font-medium text-purple-600 dark:text-purple-400 mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              HeroUI
            </span>
          </a>

          {/* Tailwind CSS - Cyan theme */}
          <a
            className="relative tap-highlight-transparent outline-none data-[focus-visible=true]:z-10 data-[focus-visible=true]:outline-2 data-[focus-visible=true]:outline-focus data-[focus-visible=true]:outline-offset-2 no-underline transition-all duration-300 flex flex-col items-center justify-center p-4 rounded-xl hover:bg-cyan-50 dark:hover:bg-cyan-900/20 hover:shadow-lg hover:scale-105 group"
            href="https://tailwindcss.com/"
            rel="noopener noreferrer"
            target="_blank"
          >
            <SiTailwindcss
              className="text-cyan-500 dark:text-cyan-400 transition-all duration-300 group-hover:scale-110 group-hover:text-cyan-600 dark:group-hover:text-cyan-300"
              size={48}
            />
            <span className="text-xs font-medium text-cyan-500 dark:text-cyan-400 mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              Tailwind CSS
            </span>
          </a>

          {/* Supabase - Green theme with text */}
          <a
            className="relative tap-highlight-transparent outline-none data-[focus-visible=true]:z-10 data-[focus-visible=true]:outline-2 data-[focus-visible=true]:outline-focus data-[focus-visible=true]:outline-offset-2 no-underline transition-all duration-300 flex flex-col items-center justify-center p-4 rounded-xl hover:bg-cyan-50 dark:hover:bg-cyan-900/20 hover:shadow-lg hover:scale-105 group"
            href="https://supabase.com/"
            rel="noopener noreferrer"
            target="_blank"
          >
            <SiSupabase
              className="text-green-600 dark:text-green-400 transition-all duration-300 group-hover:scale-110 group-hover:text-green-700 dark:group-hover:text-green-300"
              size={43}
            />
            <span className="text-xs font-medium text-green-700 dark:text-green-300 mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              {/* <span className="text-sm font-medium text-green-700 dark:text-green-300 transition-colors duration-300 group-hover:text-green-800 dark:group-hover:text-green-200"> */}
              Supabase
            </span>
          </a>

          {/* Prisma - Indigo/Dark theme */}
          <a
            className="relative tap-highlight-transparent outline-none data-[focus-visible=true]:z-10 data-[focus-visible=true]:outline-2 data-[focus-visible=true]:outline-focus data-[focus-visible=true]:outline-offset-2 no-underline transition-all duration-300 flex flex-col items-center justify-center p-4 rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:shadow-lg hover:scale-105 group"
            href="https://prisma.io"
            rel="noopener noreferrer"
            target="_blank"
          >
            <SiPrisma
              className="text-indigo-700 dark:text-indigo-300 transition-all duration-300 group-hover:scale-110 group-hover:text-indigo-800 dark:group-hover:text-indigo-200"
              size={43}
            />
            <span className="text-xs font-medium text-indigo-700 dark:text-indigo-300 mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              Prisma
            </span>
          </a>
        </div>
      </div>
    </section>
  );
}
