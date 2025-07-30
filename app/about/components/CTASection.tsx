"use client";

import { Button } from "@heroui/react";
import { motion } from "framer-motion";

interface CTASectionProps {
  fadeIn: any;
}

export default function CTASection({ fadeIn }: CTASectionProps) {
  return (
    <motion.div 
      className="py-20 text-center"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={fadeIn}
    >
      <div className="max-w-3xl mx-auto bg-gradient-to-r from-primary to-success-400 rounded-2xl p-10 shadow-2xl">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Our Commitment to Excellence</h2>
        <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
          PT Gunung Samudera Internasional is dedicated to sustainable growth through responsible mining practices, innovative technology, and unwavering commitment to safety and quality.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Button 
            color="warning" 
            radius="full" 
            size="lg" 
            className="font-bold px-8 py-6 text-lg"
          >
            Explore Our Services
          </Button>
          <Button 
            variant="bordered" 
            radius="full" 
            size="lg" 
            className="font-bold px-8 py-6 text-lg bg-white/10 text-white border-white/30 hover:bg-white/20"
          >
            View Projects
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
