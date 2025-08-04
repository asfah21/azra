"use client";

import { Card, CardHeader, CardBody } from "@heroui/react";
import { motion } from "framer-motion";

import {
  IntuitiveDesignIcon,
  StatusMonitoring,
  MultiFormatExport,
  MultiRoleAccess,
} from "./Icons";

// Animasi dasar
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

const staggerContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.2,
    },
  },
};

const cards = [
  {
    title: "Intuitive Design",
    description: "Modern, easy-to-use interface for seamless asset management.",
    iconLeft: <IntuitiveDesignIcon />,
  },
  {
    title: "Status Monitoring",
    description:
      "Track asset conditions (ready, damaged, maintenance) in real-time.",
    iconLeft: <StatusMonitoring />,
  },
  {
    title: "Export to Excel",
    description:
      "Easily export full asset records to Excel spreadsheets for reporting and analysis.",
    iconLeft: <MultiFormatExport />,
  },
  {
    title: "Multi-Role Access",
    description: "Secure, flexible management for diverse user roles.",
    iconLeft: <MultiRoleAccess />,
  },
];

export default function Cards() {
  return (
    <motion.div
      className="px-6 md:px-20 flex justify-center"
      initial="hidden"
      animate="visible"
      variants={fadeIn} // animasi untuk lapisan utama
    >
      <motion.div
        className="backdrop-blur-md bg-white/5 dark:bg-default-400/10 rounded-xl p-6 w-full"
        initial="hidden"
        animate="visible"
        variants={staggerContainer} // animasi isi grid
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {cards.map((card, index) => (
            <motion.div key={index} variants={fadeIn}>
              <Card
                className="flex flex-col relative overflow-hidden h-auto text-foreground box-border outline-none shadow-medium rounded-large border-transparent transition-transform-background"
                shadow="sm"
              >
                <CardHeader className="flex gap-3 pb-0">
                  <div className="flex justify-center p-2 rounded-full items-center bg-primary-100/40 text-success-500">
                    {card.iconLeft}
                  </div>
                  <div className="flex flex-col">
                    <p className="text-lg font-bold">{card.title}</p>
                  </div>
                </CardHeader>
                <CardBody>
                  <p>{card.description}</p>
                </CardBody>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
