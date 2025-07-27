"use client";

import { Card, CardHeader, CardBody } from "@heroui/react";

import {
  IntuitiveDesignIcon,
  StatusMonitoring,
  MultiFormatExport,
  MultiRoleAccess,
} from "./Icons";

const cards = [
  {
    title: "Intuitive Design",
    description: "Modern, easy-to-use interface for seamless asset management.",
    iconLeft: <IntuitiveDesignIcon />,
    // iconRight: <IconLink />,
    // href: "http://gsi.db-ku.com"
  },
  {
    title: "Status Monitoring",
    description:
      "Track asset conditions (ready, damaged, maintenance) in real-time.",
    iconLeft: <StatusMonitoring />,
    // iconRight: <IconLink />,
    // href: "http://gsi.db-ku.com"
  },
  {
    title: "Export to Excel",
    description:
      "Easily export full asset records to Excel spreadsheets for reporting and analysis.",
    iconLeft: <MultiFormatExport />,
    // iconRight: <IconLink />,
    // href: "http://gsi.db-ku.com"
  },
  {
    title: "Multi-Role Access",
    description: "Secure, flexible management for diverse user roles.",
    iconLeft: <MultiRoleAccess />,
    // iconRight: <IconLink />,
    // href: "http://gsi.db-ku.com"
  },
];

export default function Cards() {
  return (
    <div className="px-6 md:px-20 flex justify-center">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card, index) => (
          <Card
            key={index}
            // as={Link}
            // href={card.href}
            // isPressable
            className="flex flex-col relative overflow-hidden h-auto text-foreground box-border outline-none data-[focus-visible=true]:z-10 data-[focus-visible=true]:outline-2 data-[focus-visible=true]:outline-focus data-[focus-visible=true]:outline-offset-2 shadow-medium rounded-large transition-transform-background motion-reduce:transition-none border-transparent bg-white/5 dark:bg-default-400/10 backdrop-blur-lg backdrop-saturate-[1.8]"
            shadow="sm"
          >
            <CardHeader className="flex gap-3 pb-0">
              <div className="flex justify-center p-2 rounded-full items-center bg-primary-100/40 text-success-500">
                {card.iconLeft}
              </div>
              <div className="flex flex-col">
                <p className="text-lg font-bold">{card.title}</p>
              </div>
              {/* {card.iconRight} */}
            </CardHeader>
            <CardBody>
              <p>{card.description}</p>
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
}
