"use client";
import { Card, CardHeader, CardBody } from "@heroui/react";
import {
  TbAffiliateFilled,
  TbChartBubbleFilled,
  TbExternalLink,
  TbHelpHexagonFilled,
} from "react-icons/tb";
import { motion } from "framer-motion";

// Motion variants
const fadeIn = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

const staggerContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const cards = [
  {
    title: "Collaboration",
    description:
      "Work better together — transparent, organized, and always accessible.",
    iconLeft: <TbAffiliateFilled className="text-primary-500" size={30} />,
    iconRight: <TbExternalLink />,
  },
  {
    title: "Build to Improve",
    description:
      "Designed with adaptability in mind, evolving to support operational excellence.",
    iconLeft: <TbChartBubbleFilled className="text-warning-500" size={30} />,
    iconRight: <TbExternalLink />,
  },
  {
    title: "Need Help?",
    description: "Reach out to our support team for assistance, feedback, or suggestions.",
    iconLeft: <TbHelpHexagonFilled className="text-success-500" size={30} />,
    iconRight: <TbExternalLink />,
  },
];

export default function FooterBefore() {
  return (
    <motion.section
      className="px-6 relative z-10 gap-2 w-full flex flex-col items-center mt-4 lg:mt-44 pb-16 lg:pb-28"
      initial="hidden"
      variants={staggerContainer}
      viewport={{ once: true, amount: 0.3 }}
      whileInView="visible"
    >
      <div className="max-w-4xl flex flex-col gap-8">
        <motion.div
          className="mt-8 flex flex-col gap-2 justify-center w-full items-center"
          variants={fadeIn}
        >
          <h1 className="tracking-tight inline font-semibold text-4xl lg:text-6xl">
            Stay Connected
          </h1>
        </motion.div>

        <motion.p
          className="w-full my-2 text-medium lg:text-large font-normal text-default-500 max-w-full md:w-full text-center flex justify-center items-center"
          variants={fadeIn}
        >
          We’re committed to helping you manage assets efficiently and securely.
        </motion.p>

        {/* <div className="mb-2" /> */}

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:grid-cols-3"
          variants={staggerContainer}
        >
          {cards.map((card, index) => (
            <motion.div key={index} variants={fadeIn}>
              <Card
                isPressable
                className="flex flex-col relative overflow-hidden h-auto text-foreground box-border outline-none data-[focus-visible=true]:z-10 data-[focus-visible=true]:outline-2 data-[focus-visible=true]:outline-focus data-[focus-visible=true]:outline-offset-2 shadow-medium rounded-large transition-transform-background motion-reduce:transition-none border-transparent bg-white/5 dark:bg-default-400/10 backdrop-blur-lg backdrop-saturate-[1.8]"
                shadow="sm"
              >
                <CardHeader className="flex gap-3 pb-0">
                  <div className="flex justify-center p-1 items-center w-10 h-10">
                    {card.iconLeft}
                  </div>
                  <div className="flex flex-col">
                    <p className="text-md font-bold">{card.title}</p>
                  </div>
                  {card.iconRight}
                </CardHeader>
                <CardBody>
                  <p>{card.description}</p>
                </CardBody>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </motion.section>
  );
}
