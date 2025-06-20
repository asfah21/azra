"use client";

import { Card, CardHeader, CardBody, Link } from "@heroui/react";
import { FaMountainCity, FaWandMagicSparkles } from "react-icons/fa6";

export default function CardBawah() {

  const features = [
    {
      title: "Built for Efficiency", 
      description: "An internal tool developed with focus and functionality to manage assets reliably and effectively.",
      icon: <FaWandMagicSparkles size={24}/>
    },
    { 
      title: "Optimized for the Field",
      description: "Engineered by IT Site to simplify asset tracking, maintenance, and decision-making on the ground.",
      icon: <FaMountainCity size={24}/> 
    },
  ]

  return (
    <div className="mx-8 px-4 justify-center mt-8 md:mt-14 grid grid-cols-1 md:grid-cols-2 gap-4 lg:grid-cols-2">
      {features.map((feature, index) => (
        <div key={index}>
          <Card
            as={Link}
            className="flex flex-col relative overflow-hidden h-auto text-foreground box-border outline-none data-[focus-visible=true]:z-10 data-[focus-visible=true]:outline-2 data-[focus-visible=true]:outline-focus data-[focus-visible=true]:outline-offset-2 shadow-medium rounded-large transition-transform-background motion-reduce:transition-none border-transparent bg-white/5 dark:bg-default-400/10 backdrop-blur-lg backdrop-saturate-[1.8]"
            href="#"
          >
            <CardHeader className="flex gap-3 pb-0">
              <div className="flex justify-center p-2 rounded-full items-center bg-secondary-100/80 text-pink-500">
                {feature.icon}
              </div>
              <div className="flex flex-col">
                <p className="text-lg font-bold">{feature.title}</p>
              </div>
              <svg
                className="size-5"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </CardHeader>

            <CardBody>
              <p>Sponsor the HeroUI maintainers</p>
            </CardBody>
          </Card>
        </div>
      ))}
    </div>
  );
}
