"use client";

import { Link } from "@heroui/link";

export default function Footer() {
  return (
    <footer className="text-xs flex items-center w-full border-t border-default-200 p-5 bg-default-50 justify-center">
      <Link
        className="flex items-center gap-1 text-default-600 text-small"
        color="foreground"
        href="/"
        underline="none"
      >
        <span className="text-center">
          &copy; {new Date().getFullYear()} Copyright by PT Gunung Samudera
          Internasional
        </span>
        {/* <span className="bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent font-semibold hover:from-green-600 hover:to-blue-600 transition-all duration-300">
          Azvan
        </span> */}
        {/* <span></span> */}
      </Link>
    </footer>
  );
}

{
  /* <footer className="w-full flex items-center justify-center py-3">
<Link
  isExternal
  className="flex items-center gap-1 text-current"
  href="https://heroui.com?utm_source=next-app-template"
  title="heroui.com homepage"
>
  <span className="text-default-600">Powered by</span>
  <p className="text-primary">HeroUI</p>
</Link>
</footer> */
}
