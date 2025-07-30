"use client";

import { title, subtitle } from "@/components/primitives";
import { Card, CardBody, CardHeader } from "@heroui/react";
import { motion } from "framer-motion";
import { FaRocket, FaLightbulb, FaUsers, FaChartLine, FaShieldAlt } from "react-icons/fa";
import { FaClipboardCheck, FaGem } from "react-icons/fa6";

interface ValuesSectionProps {
  fadeIn: any;
  staggerContainer: any;
}

export default function ValuesSection({ fadeIn, staggerContainer }: ValuesSectionProps) {
  return (
    <motion.div 
      className="py-16"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      variants={staggerContainer}
    >
      <motion.div 
        className="text-center mb-16"
        variants={fadeIn}
      >
        <h2 className={title({ size: "md", color: "green", class: "mb-4" })}>
          Our Core Values
        </h2>
        <p className={subtitle({ class: "mx-auto max-w-4xl mt-4" })}>
        Core principles guiding our pursuit of excellence at PT Gunung Samudera Internasional, shaping every decision and solution we deliver.
        </p>
      </motion.div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {[
        {
            icon: <FaShieldAlt className="text-3xl text-primary" />,
            title: "Integrity",
            description:
              "Building trust through honesty, transparency, and responsibility in our mining operations and work culture.",
          },
          {
            icon: <FaLightbulb className="text-3xl text-primary" />,
            title: "Innovation",
            description:
              "Continuously creating and improving ideas, systems, and technology to support effective and efficient work.",
          },
          {
            icon: <FaGem className="text-3xl text-primary" />,
            title: "Quality",
            description:
              "Providing professional services that meet customer expectations and comply with applicable standards.",
          },
          {
            icon: <FaClipboardCheck className="text-3xl text-primary" />,
            title: "Accountability",
            description:
              "Executing tasks responsibly and being answerable for all actions and decisions taken.",
          },
          
        ].map((value, index) => (
          <motion.div 
            key={index}
            variants={fadeIn}
          >
            <Card className="h-full hover:shadow-xl transition-shadow duration-300 border-none bg-white/80 dark:bg-default-50/50">
              <CardBody className="flex flex-col items-center text-center p-6">
                <div className="bg-primary/10 dark:bg-primary/20 p-4 rounded-full mb-6">
                  <div className="text-primary">
                    {value.icon}
                  </div>
                </div>
                <CardHeader className="p-0 mb-3 flex justify-center">
                  <h3 className="text-xl font-bold text-center">{value.title}</h3>
                </CardHeader>
                <p className="text-default-600">{value.description}</p>
              </CardBody>
            </Card>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
