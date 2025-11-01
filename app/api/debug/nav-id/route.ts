// filepath: d:\PAM-PROJECT\azra\app\api\debug\nav-id\route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { defaultNavItems } from "@/lib/config/navigation";

function findNavItem(pathname: string) {
  // Exact match child first
  for (const parent of defaultNavItems) {
    // @ts-ignore
    if ("children" in parent && Array.isArray(parent.children)) {
      // @ts-ignore
      const child = parent.children.find((c) => c.path === pathname);

      if (child) return child;
    }
  }
  // Exact match parent
  // @ts-ignore
  let item = defaultNavItems.find((n) => "path" in n && n.path === pathname);

  if (item) return item;
  // Prefix match child first
  for (const parent of defaultNavItems) {
    // @ts-ignore
    if ("children" in parent && Array.isArray(parent.children)) {
      // @ts-ignore
      const child = parent.children.find(
        (c) => c.path && pathname.startsWith(c.path + "/"),
      );

      if (child) return child;
    }
  }
  // Prefix match parent
  // @ts-ignore
  item = defaultNavItems.find(
    (n) =>
      "path" in n &&
      n.path !== "/dashboard" &&
      pathname.startsWith(n.path + "/"),
  );
  if (item) return item;
  // Fallback dashboard root
  if (pathname.startsWith("/dashboard")) {
    // @ts-ignore
    return defaultNavItems.find((n) => n.id === "dashboard");
  }

  return null;
}

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const path = url.searchParams.get("path") || "/dashboard";
  const item = findNavItem(path);

  if (!item) return NextResponse.json({ path, found: false });

  // @ts-ignore
  const { id, path: itemPath, label } = item;

  return NextResponse.json({ path, found: true, id, itemPath, label });
}
