"use client";

import { motion } from "framer-motion";
import {
  SiNextdotjs,
  SiTypescript,
  SiTailwindcss,
  SiNextui,
  SiPrisma,
} from "react-icons/si";
import { BiLogoPostgresql } from "react-icons/bi";

const fadeIn = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut",
      delayChildren: 0.2,
      staggerChildren: 0.1,
    },
  },
};

export default function BuildWith() {
  return (
    <motion.section
      className="relative z-10 flex flex-col gap-2 w-full text-center mt-24 lg:mt-32"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      variants={fadeIn}
    >
      <motion.h3
        className="mb-8 text-large text-default-500"
        variants={fadeIn}
      >
        A full-stack application built with
      </motion.h3>

      <motion.div
        className="w-full flex flex-wrap gap-x-5 gap-y-3 justify-center items-center"
        variants={fadeIn}
      >
        <div className="flex flex-wrap justify-center gap-x-5 gap-y-4 sm:flex-nowrap sm:gap-x-8">
          {[
            {
              href: "https://nextjs.org/",
              icon: (
                <SiNextdotjs
                  className="text-black dark:text-white transition-colors duration-300 group-hover:scale-110"
                  size={48}
                />
              ),
              label: "Next.js",
              className: "text-gray-600 dark:text-gray-400",
            },
            {
              href: "https://www.typescriptlang.org/",
              icon: (
                <SiTypescript
                  className="text-blue-600 dark:text-blue-400 transition-all duration-300 group-hover:scale-110 group-hover:text-blue-700 dark:group-hover:text-blue-300"
                  size={48}
                />
              ),
              label: "TypeScript",
              className: "text-blue-600 dark:text-blue-400",
            },
            {
              href: "https://www.heroui.com/",
              icon: (
                <SiNextui
                  className="text-purple-600 dark:text-purple-400 transition-all duration-300 group-hover:scale-110 group-hover:text-purple-700 dark:group-hover:text-purple-300"
                  size={48}
                />
              ),
              label: "HeroUI",
              className: "text-purple-600 dark:text-purple-400",
            },
            {
              href: "https://tailwindcss.com/",
              icon: (
                <SiTailwindcss
                  className="text-cyan-500 dark:text-cyan-400 transition-all duration-300 group-hover:scale-110 group-hover:text-cyan-600 dark:group-hover:text-cyan-300"
                  size={48}
                />
              ),
              label: "Tailwind CSS",
              className: "text-cyan-500 dark:text-cyan-400",
            },
            {
              href: "https://postgresql.org/",
              icon: (
                <BiLogoPostgresql
                  className="text-[#699eca] dark:text-[#699eca] transition-all duration-300 group-hover:scale-110 group-hover:text-[#699eca] dark:group-hover:text-[#699eca]"
                  size={52}
                />
              ),
              label: "PostgreSQL",
              className: "text-[#699eca] dark:text-[#699eca]",
            },
            {
              href: "https://prisma.io",
              icon: (
                <SiPrisma
                  className="text-indigo-700 dark:text-indigo-300 transition-all duration-300 group-hover:scale-110 group-hover:text-indigo-800 dark:group-hover:text-indigo-200"
                  size={43}
                />
              ),
              label: "Prisma",
              className: "text-indigo-700 dark:text-indigo-300",
            },
          ].map((tech, i) => (
            <motion.a
              key={i}
              href={tech.href}
              target="_blank"
              rel="noopener noreferrer"
              className="relative tap-highlight-transparent outline-none data-[focus-visible=true]:z-10 data-[focus-visible=true]:outline-2 data-[focus-visible=true]:outline-focus data-[focus-visible=true]:outline-offset-2 no-underline transition-all duration-300 flex flex-col items-center justify-center p-4 rounded-xl hover:shadow-lg hover:scale-105 group"
              variants={fadeIn}
            >
              {tech.icon}
              <span
                className={`text-xs font-medium mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${tech.className}`}
              >
                {tech.label}
              </span>
            </motion.a>
          ))}
        </div>
      </motion.div>
    </motion.section>
  );
}
