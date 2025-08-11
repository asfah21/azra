"use client";

import { Button } from "@heroui/react";
import { Globe, Headphones, GraduationCap, Smartphone } from "lucide-react";
import Image from "next/image";

export default function HeroSection() {
  const services = [
    { icon: <Globe className="w-6 h-6" />, label: "Remote Access" },
    { icon: <Headphones className="w-6 h-6" />, label: "Technical Support" },
    {
      icon: <GraduationCap className="w-6 h-6" />,
      label: "Education or Research",
    },
    {
      icon: <Smartphone className="w-6 h-6" />,
      label: "Managing Remote Devices",
    },
  ];

  return (
    <section className="mt-32 relative bg-gradient-to-r from-primary to-success text-white mt-10 py-8 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-8 md:gap-10">
        {/* Gambar kiri */}
        <div className="flex-1 hidden md:block">
          <Image
            alt="Monitor"
            className="mt-[-160px] w-full max-w-sm mx-auto drop-shadow-xl"
            height={400}
            src="/pc.jpg"
            width={500}
          />
        </div>

        {/* Konten kanan */}
        <div className="flex-1 text-center md:text-left">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold leading-snug mb-3 sm:mb-4">
            Accessibility Ready from day one.
          </h1>
          <p className="text-base sm:text-lg font-medium mb-4 sm:mb-6">
            Our asset management app is built with accessibility in mind,
            ensuring users of all abilities can interact with the system
            effortlessly.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-5 sm:mb-6">
            {services.map((s, idx) => (
              <div
                key={idx}
                className="flex flex-col items-center bg-white/10 p-3 sm:p-4 rounded-lg hover:bg-white/20 transition"
              >
                <div className="bg-purple-600 rounded-full p-2 sm:p-3 mb-1 sm:mb-2">
                  {s.icon}
                </div>
                <p className="text-xs sm:text-sm font-medium">{s.label}</p>
              </div>
            ))}
          </div>

          <Button className="bg-white text-red-600 hover:bg-red-100 font-semibold text-sm sm:text-base px-4 py-2 sm:px-6 sm:py-2.5">
            Learn More
          </Button>
        </div>
      </div>
    </section>
  );
}
