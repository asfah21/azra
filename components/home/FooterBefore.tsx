import { Card, CardHeader, CardBody } from "@heroui/card";
// import { Link } from "@heroui/link";
import {
  TbAffiliateFilled,
  TbChartBubbleFilled,
  TbExternalLink,
  TbHelpHexagonFilled,
} from "react-icons/tb";

const cards = [
  {
    title: "Collaboration",
    description:
      "Work better together — transparent, organized, and always accessible.",
    // href: "http://gsi.db-ku.com",
    iconLeft: <TbAffiliateFilled size={30} />,
    iconRight: <TbExternalLink />,
  },
  {
    title: "Build to Improve",
    description:
      "Designed with adaptability in mind, evolving to support operational excellence.",
    // href: "http://laravel-site.com",
    iconLeft: <TbChartBubbleFilled size={30} />,
    iconRight: <TbExternalLink />,
  },
  {
    title: "Need Help?",
    description: "Reach out to our support team for assistance or feedback.",
    // href: "http://react-tailwind.com",
    iconLeft: <TbHelpHexagonFilled size={30} />,
    iconRight: <TbExternalLink />,
  },
];

export default function FooterBefore() {
  return (
    <section className="px-6 relative z-10 gap-2 w-full flex flex-col items-center mt-16 lg:mt-44 pb-16 lg:pb-28">
      <div className="max-w-4xl flex flex-col gap-8">
        <div>
          <div className="flex flex-col gap-2 justify-center w-full items-center">
            <h1 className="tracking-tight inline font-semibold text-4xl lg:text-6xl">
              Stay Connected
            </h1>
          </div>
          <p className="w-full my-2 text-medium lg:text-large font-normal text-default-500 max-w-full md:w-full text-center flex justify-center items-center">
            We’re committed to helping you manage assets efficiently and
            securely.
          </p>
          <div className="mb-12" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:grid-cols-3">
            {cards.map((card, index) => (
              <Card
                key={index}
                isPressable
                // as={Link}
                className="flex flex-col relative overflow-hidden h-auto text-foreground box-border outline-none data-[focus-visible=true]:z-10 data-[focus-visible=true]:outline-2 data-[focus-visible=true]:outline-focus data-[focus-visible=true]:outline-offset-2 shadow-medium rounded-large transition-transform-background motion-reduce:transition-none border-transparent bg-white/5 dark:bg-default-400/10 backdrop-blur-lg backdrop-saturate-[1.8]"
                // href={card.href}
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
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
