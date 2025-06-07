"use client";

import { Link } from "@heroui/link";

export default function Footer() {
  return (
    <footer className="flex items-center w-full border-t p-5 text-default-600 justify-center">
      <Link
        isExternal
        className="flex items-center gap-1 text-current"
        href="/about"
        title="AZRA - About Us"
      >
        <span>&copy; {new Date().getFullYear()} </span>
        <p className="text-primary font-semibold">&nbsp;AZRA</p>
        <span>&nbsp;- All rights reserved</span>
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
