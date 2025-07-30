"use client";

import { title, subtitle } from "@/components/primitives";
import { Button } from "@heroui/react";
import { motion } from "framer-motion";

interface HeroSectionProps {
  fadeIn: any;
  staggerContainer: any;
}

export default function HeroSection({ fadeIn, staggerContainer }: HeroSectionProps) {
  return (
    <motion.div 
      className="text-center py-16 md:py-24"
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
    >
      <motion.h1 
        className={title({ size: "lg", color: "blue", class: "mb-6" })}
        variants={fadeIn}
      >
        About Us
      </motion.h1>
      
      <motion.div 
        className={subtitle({ class: "mx-auto mb-10 mt-6 max-w-7xl text-justify"})}
        variants={fadeIn}
      ><p className="leading-relaxed">
         &nbsp;&nbsp;&nbsp;&nbsp; We are a company engaged in nickel ore mining services, heavy equipment rental services, and manpower services. 
         We are committed to continuously improving our company’s performance through the implementation of Good Corporate Governance (GCG), supported by the application of Occupational Health and Safety Management Systems (SMK3) and Mineral and Coal Mining Safety Management Systems (SMKP), in accordance with the company’s risk management framework.
      </p></motion.div>
      <motion.div variants={fadeIn}>
        <Button 
          color="primary" 
          size="lg" 
          radius="full" 
          className="font-medium px-8 py-6 text-lg shadow-lg hover:shadow-xl transition-shadow"
        >
          Get Started
        </Button>
      </motion.div>
    </motion.div>
  );
}
