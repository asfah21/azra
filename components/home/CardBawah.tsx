"use client";

import { Card, CardHeader, CardBody, Link } from "@heroui/react";

export default function CardBawah() {
  return (
    <div className="mt-8 md:mt-14 grid grid-cols-1 md:grid-cols-2 gap-4 lg:grid-cols-2">
      <Card
        as={Link}
        className="flex flex-col relative overflow-hidden h-auto text-foreground box-border outline-none data-[focus-visible=true]:z-10 data-[focus-visible=true]:outline-2 data-[focus-visible=true]:outline-focus data-[focus-visible=true]:outline-offset-2 shadow-medium rounded-large transition-transform-background motion-reduce:transition-none border-transparent bg-white/5 dark:bg-default-400/10 backdrop-blur-lg backdrop-saturate-[1.8]"
        href="#"
      >
        <CardHeader className="flex gap-3 pb-0">
          <div className="flex justify-center p-2 rounded-full items-center bg-secondary-100/80 text-pink-500">
            <svg
              aria-hidden="true"
              className="text-pink-500"
              fill="none"
              focusable="false"
              height="25"
              role="presentation"
              viewBox="0 0 24 24"
              width="25"
            >
              <path
                d="M3.5 20.5c.83.83 2.17.83 3 0l13-13c.83-.83.83-2.17 0-3-.83-.83-2.17-.83-3 0l-13 13c-.83.83-.83 2.17 0 3ZM18.01 8.99l-3-3"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
              />
              <path
                d="M8.5 2.44 10 2l-.44 1.5L10 5l-1.5-.44L7 5l.44-1.5L7 2l1.5.44ZM4.5 8.44 6 8l-.44 1.5L6 11l-1.5-.44L3 11l.44-1.5L3 8l1.5.44ZM19.5 13.44 21 13l-.44 1.5L21 16l-1.5-.44L18 16l.44-1.5L18 13l1.5.44Z"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div className="flex flex-col">
            <p className="text-lg font-bold">Open Collective</p>
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

      <Card
        as={Link}
        className="flex flex-col relative overflow-hidden h-auto text-foreground box-border outline-none data-[focus-visible=true]:z-10 data-[focus-visible=true]:outline-2 data-[focus-visible=true]:outline-focus data-[focus-visible=true]:outline-offset-2 shadow-medium rounded-large transition-transform-background motion-reduce:transition-none border-transparent bg-white/5 dark:bg-default-400/10 backdrop-blur-lg backdrop-saturate-[1.8]"
        href="https://github.com/heroui-inc/heroui"
      >
        <CardHeader className="flex gap-3 pb-0">
          <div className="flex justify-center p-2 rounded-full items-center bg-secondary-100/80 text-pink-500">
            <svg
              aria-hidden="true"
              className="text-pink-500"
              fill="none"
              focusable="false"
              height="25"
              role="presentation"
              viewBox="0 0 24 24"
              width="25"
            >
              <path
                d="M3.5 20.5c.83.83 2.17.83 3 0l13-13c.83-.83.83-2.17 0-3-.83-.83-2.17-.83-3 0l-13 13c-.83.83-.83 2.17 0 3ZM18.01 8.99l-3-3"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
              />
              <path
                d="M8.5 2.44 10 2l-.44 1.5L10 5l-1.5-.44L7 5l.44-1.5L7 2l1.5.44ZM4.5 8.44 6 8l-.44 1.5L6 11l-1.5-.44L3 11l.44-1.5L3 8l1.5.44ZM19.5 13.44 21 13l-.44 1.5L21 16l-1.5-.44L18 16l.44-1.5L18 13l1.5.44Z"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div className="flex flex-col">
            <p className="text-lg font-bold">Open Collective</p>
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
          <p>Sponsor the creator, Junior Garcia.</p>
        </CardBody>
      </Card>
    </div>
  );
}
