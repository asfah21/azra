import type { NextRequest } from "next/server";

import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

import { defaultNavItems } from "@/lib/config/navigation"; // static mapping path<->menu id

// Helper: find nav item by pathname
function findNavItem(pathname: string) {
  // Exact match child first
  for (const parent of defaultNavItems) {
    if ("children" in parent && Array.isArray(parent.children)) {
      const child = parent.children.find((c) => c.path === pathname);

      if (child) return child;
    }
  }

  // Exact match parent
  let item = defaultNavItems.find((n) => "path" in n && n.path === pathname);

  if (item) return item;

  // Prefix match child first
  for (const parent of defaultNavItems) {
    if ("children" in parent && Array.isArray(parent.children)) {
      const child = parent.children.find(
        (c) => c.path && pathname.startsWith(c.path + "/"),
      );

      if (child) return child;
    }
  }

  // Prefix match parent
  item = defaultNavItems.find(
    (n) =>
      "path" in n &&
      n.path !== "/dashboard" &&
      pathname.startsWith(n.path + "/"),
  );
  if (item) return item;

  // Fallback dashboard root
  if (pathname.startsWith("/dashboard")) {
    return defaultNavItems.find((n) => n.id === "dashboard");
  }

  return null;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Proteksi route dashboard hanya validasi session dan role dari token
  if (pathname.startsWith("/dashboard")) {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    // Tidak ada session => redirect login
    if (!token) {
      const url = new URL("/login", request.url);

      url.searchParams.set("callbackUrl", pathname);

      return NextResponse.redirect(url);
    }

    const userRole = token.role as string | undefined;
    const isSuperAdmin = userRole === "super_admin";

    // Role dasar valid?
    const validRoles = [
      "super_admin",
      "admin_heavy",
      "admin_elec",
      "pengawas",
      "mekanik",
      "guest",
    ];

    if (!userRole || !validRoles.includes(userRole)) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    // Dashboard root selalu boleh diakses jika role valid
    if (pathname === "/dashboard" || pathname === "/dashboard/") {
      return NextResponse.next();
    }

    // Identifikasi nav item target
    const targetItem = findNavItem(pathname);

    if (!targetItem) {
      // Path tidak dikenali => izinkan (atau bisa redirect 404)
      return NextResponse.next();
    }

    if (isSuperAdmin) {
      return NextResponse.next();
    }

    // Ambil izin akses untuk role ini saja (tanpa fallback ke defaultRoles)
    const allowedSet = new Set<string>();

    try {
      const apiUrl = new URL(
        `/api/role-access?role=${encodeURIComponent(userRole)}`,
        request.url,
      );

      const res = await fetch(apiUrl.toString(), {
        headers: {
          cookie: request.headers.get("cookie") || "",
        },
        cache: "no-store",
      });

      if (res.ok) {
        // Data: array { menu, role }
        const data: Array<{ menu: string; role: string }> = await res.json();

        for (const entry of data) {
          if (entry.role === userRole) {
            allowedSet.add(entry.menu);
          }
        }
      } else {
        // Jika API gagal, treat as no access (fail-closed)
      }
    } catch {
      // Jika fetch error, treat as no access (fail-closed)
    }

    const hasAccess = allowedSet.has((targetItem as any).id);

    if (!hasAccess) {
      // Redirect balik ke dashboard (hindari loop jika sudah di dashboard)
      const redirectUrl = new URL("/dashboard", request.url);

      return NextResponse.redirect(redirectUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
