"use client";

import React from "react";
import { Button, Card, CardBody } from "@heroui/react";
import { motion } from "framer-motion";
import { CheckCircle } from "lucide-react";

import { title } from "@/components/primitives";

interface MissionSectionProps {
  fadeIn: any;
  staggerContainer: any;
}

interface MissionItem {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  text: string;
}

const missions: MissionItem[] = [
  {
    icon: CheckCircle,
    text: "Implement good corporate governance to protect stakeholder interests.",
  },
  {
    icon: CheckCircle,
    text: "Develop and innovate effective systems and technologies to boost business productivity.",
  },
  {
    icon: CheckCircle,
    text: "Promote professionalism and quality of life for human resources.",
  },
  {
    icon: CheckCircle,
    text: "Create an engaging, challenging, and professional work environment to support national economic growth.",
  },
  {
    icon: CheckCircle,
    text: "Deliver quality services and products with a focus on Occupational Safety (K3), Operational Safety (KO), and Environmental Protection.",
  },
];

export default function MissionSection({
  fadeIn,
  staggerContainer,
}: MissionSectionProps) {
  return (
    <motion.div
      className="py-16"
      initial="hidden"
      variants={staggerContainer}
      viewport={{ once: true, amount: 0.3 }}
      whileInView="visible"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <motion.div variants={fadeIn}>
          <h2 className={title({ size: "md", color: "cyan", class: "mb-6" })}>
            Our Vision
          </h2>
          <p className="text-lg text-default-700 mb-6 mt-4 leading-loose">
            To become the largest and best company in Indonesia, particularly in
            the fields of mining and construction, and to serve as a Center of
            Excellence—growing and enduring over time as one of the
            nation&apos;s most valuable assets.
          </p>
          <Button
            className="font-medium"
            color="warning"
            radius="full"
            variant="bordered"
          >
            Learn More
          </Button>
        </motion.div>

        <motion.div variants={fadeIn}>
          <Card className="bg-gradient-to-br from-primary-50 to-secondary-50 shadow-lg border-none">
            <CardBody className="p-8">
              <h2
                className={title({ size: "md", color: "cyan", class: "mb-6" })}
              >
                Our Mission
              </h2>
              <div className="space-y-4 text-default-600">
                {missions.map((item, index) => {
                  const Icon = item.icon;

                  return (
                    <div key={index} className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center">
                        <Icon className="text-primary w-5 h-5" />
                      </div>
                      <p>{item.text}</p>
                    </div>
                  );
                })}
              </div>
            </CardBody>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
