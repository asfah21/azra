"use client";

import {
  RiAdminFill,
  RiAedFill,
  RiBlueskyFill,
  RiFocus2Fill,
  RiGlobalFill,
  RiTimerFlashFill,
} from "react-icons/ri";
import { motion } from "framer-motion";

const fadeIn = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut",
    },
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

export default function HeroAlpha() {
  const features = [
    { title: "Managed focus", icon: <RiFocus2Fill size={22} /> },
    { title: "Real-time data", icon: <RiTimerFlashFill size={22} /> },
    { title: "Optimize Performance", icon: <RiAedFill size={22} /> },
    { title: "Role-based access", icon: <RiAdminFill size={22} /> },
    { title: "Consistent UI patterns", icon: <RiBlueskyFill size={22} /> },
    { title: "Accessible from everywhere", icon: <RiGlobalFill size={22} /> },
  ];

  return (
    <motion.section
      className="px-6 md:px-20 relative flex flex-col gap-10 w-full z-20 mt-16 lg:mt-32"
      initial="hidden"
      variants={staggerContainer}
      viewport={{ once: true, amount: 0.3 }}
      whileInView="visible"
    >
      <motion.div className="flex flex-col gap-6" variants={fadeIn}>
        <div className="flex flex-col gap-2 items-start justify-center">
          <h1 className="tracking-tight font-semibold text-4xl lg:text-6xl">
            Integrated
          </h1>
          <h1 className="tracking-tight font-semibold text-4xl lg:text-6xl bg-clip-text text-transparent bg-gradient-to-b from-[#6FEE8D] to-[#17c964]">
            Work Order&nbsp;
          </h1>
        </div>
        <p className="w-full md:w-1/2 text-medium lg:text-large text-default-500">
          Our Work Order dashboard is designed with operational efficiency and
          accessibility in mind — helping every user monitor and manage tasks
          effortlessly.
        </p>
      </motion.div>

      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
        variants={staggerContainer}
      >
        {features.map((feature, index) => (
          <motion.div key={index} variants={fadeIn}>
            <div className="group relative flex items-center gap-3 p-4 rounded-xl transition-all duration-500 border border-default-200 dark:border-default-100/20 bg-white/70 dark:bg-white/5 hover:bg-white/90 dark:hover:bg-white/10 shadow-lg">
              <div className="flex items-center justify-center p-2 rounded-full bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-300 transition-transform duration-500 group-hover:scale-110">
                {feature.icon}
              </div>
              <p className="text-base font-medium">{feature.title}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      <motion.div
        className="flex flex-col items-start mt-4 gap-4"
        variants={fadeIn}
      >
        <a
          className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-success/20 text-success-700 dark:text-success hover:opacity-80 transition"
          href="/dashboard"
        >
          Learn more
        </a>
        {/* <p className="text-xs text-default-400">Made with ❤️ by Alpha</p> */}
      </motion.div>
    </motion.section>
  );
}
