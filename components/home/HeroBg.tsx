"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function HeroBgAtas() {
  return (
    <div
      className="absolute -top-20 lg:top-10 inset-0 h-screen z-0 opacity-0 overflow-hidden data-[mounted=true]:opacity-100 transition-opacity bg-left bg-no-repeat bg-[url('/pattern.svg')] after:content-[''] after:absolute after:top-0 after:left-0 after:w-full after:h-full after:z-[-1] dark:after:to-black after:z-[-1]"
      data-mounted="true"
    />
    // <div
    //   className="absolute -top-20 lg:top-10 inset-0 h-screen z-0 opacity-0 overflow-hidden data-[mounted=true]:opacity-100 transition-opacity bg-left bg-no-repeat bg-[url('../public/pattern.svg')] after:content-[''] after:absolute after:top-0 after:left-0 after:w-full after:h-full after:z-[-1] dark:after:to-black after:z-[-1]"
    //   data-mounted="true"
    // />
  );
}

export function HeroBgBawah() {
  const { resolvedTheme } = useTheme();
  const [bgUrl, setBgUrl] = useState("/hero-light.webp");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true); // client sudah mounted
  }, []);

  useEffect(() => {
    if (resolvedTheme === "dark") {
      setBgUrl("/hero-bg.webp");
    } else {
      setBgUrl("/hero-light.webp");
    }
  }, [resolvedTheme]);

  return (
    <div className="overflow-hidden">
      <div className="[--gap:1rem] overflow-hidden max-h-[calc(100vh_-_200px)] h-78 hidden md:flex w-full mt-4 md:absolute md:inset-0 isolate md:max-h-dvh">
        <div className="relative w-full h-full overflow-hidden">
          <div className="absolute w-full h-[200%] animate-scroll-vertical">
            <div
              className="w-full h-full bg-no-repeat bg-cover bg-top"
              style={{
                backgroundImage: `url('${bgUrl}')`,
                backgroundSize: "cover",
              }}
            />
            <div
              className="w-full h-full bg-no-repeat bg-cover bg-top"
              style={{
                backgroundImage: `url('${bgUrl}')`,
                backgroundSize: "cover",
              }}
            />
          </div>
        </div>
      </div>

      {/* Gradient overlay */}
      {mounted && (
        <div className="absolute hidden md:block md:inset-0 md:pointer-events-none md:top-0 md:z-20">
          {resolvedTheme === "dark" ? (
            <div className="h-full w-full bg-[radial-gradient(at_80%_50%,_rgba(255,255,255,_0)_20%,_rgba(0,0,0,_0.8)_40%,_rgba(0,0,0,1)_100%)]" />
          ) : (
            <div className="h-full w-full bg-[radial-gradient(at_80%_50%,_rgba(0,0,0,_0)_20%,_rgba(255,255,255,_0.9)_40%,_rgba(255,255,255,1)_100%)]" />
          )}
        </div>
      )}
    </div>
  );
}

export function HeroBgDelta() {
  return (
    <div
      className="absolute -top-20 lg:top-10 -translate-y-1/2 h-screen w-full bg-left bg-no-repeat bg-[url('/pattern-bw.svg')] -z-50 left-0 opacity-100 data-[mounted=true]:opacity-100 transition-opacity 
        after:content-[''] after:absolute after:top-0 after:left-0 
        after:w-full after:h-full after:z-[-1] 
        after:bg-gradient-to-b after:from-transparent after:to-white/80 
        dark:after:to-black/20
      "
    />
  );
}
