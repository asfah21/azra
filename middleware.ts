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

    // Fetch izin akses spesifik untuk menu target, meneruskan cookies
    const menuId = (targetItem as any).id as string;
    let hasAccess = false;
    let apiStatus = "none";
    let apiLen = 0;
    let fallbackStatus = "none";
    let fallbackLen = 0;

    try {
      const apiUrl = new URL(
        `/api/role-access?menu=${encodeURIComponent(menuId)}&skip_rl=1`,
        request.url,
      );

      const res = await fetch(apiUrl.toString(), {
        headers: {
          cookie: request.headers.get("cookie") || "",
        },
        cache: "no-store",
      });

      apiStatus = String(res.status);

      if (res.ok) {
        const data: Array<{ menu: string; role: string }> = await res.json();
        apiLen = Array.isArray(data) ? data.length : 0;
        // pastikan role dan menu cocok (defensive)
        hasAccess = Array.isArray(data)
          ? data.some((d) => d.menu === menuId && d.role === userRole)
          : false;
      }

      // Fallback: jika kosong, coba fetch by role agar bisa inspeksi daftar menu role tsb
      if (!hasAccess) {
        const apiUrl2 = new URL(
          `/api/role-access?role=${encodeURIComponent(userRole!)}&skip_rl=1`,
          request.url,
        );
        const res2 = await fetch(apiUrl2.toString(), {
          headers: {
            cookie: request.headers.get("cookie") || "",
          },
          cache: "no-store",
        });
        fallbackStatus = String(res2.status);
        if (res2.ok) {
          const data2: Array<{ menu: string; role: string }> = await res2.json();
          fallbackLen = Array.isArray(data2) ? data2.length : 0;
          hasAccess = Array.isArray(data2)
            ? data2.some((d) => d.menu === menuId && d.role === userRole)
            : false;
        }
      }
    } catch {
      // ignore
    }

    if (!hasAccess) {
      const redirectUrl = new URL("/dashboard", request.url);
      const resp = NextResponse.redirect(redirectUrl);
      // Debug headers untuk inspeksi di Network tab
      resp.headers.set("x-auth-role", userRole || "");
      resp.headers.set("x-menu-id", menuId);
      resp.headers.set("x-api-status", apiStatus);
      resp.headers.set("x-api-len", String(apiLen));
      resp.headers.set("x-api-fallback-status", fallbackStatus);
      resp.headers.set("x-api-fallback-len", String(fallbackLen));
      resp.headers.set("x-access", "deny");
      return resp;
    }

    const resp = NextResponse.next();
    // Debug headers untuk inspeksi di Network tab
    resp.headers.set("x-auth-role", userRole || "");
    resp.headers.set("x-menu-id", menuId);
    resp.headers.set("x-api-status", apiStatus);
    resp.headers.set("x-api-len", String(apiLen));
    resp.headers.set("x-api-fallback-status", fallbackStatus);
    resp.headers.set("x-api-fallback-len", String(fallbackLen));
    resp.headers.set("x-access", "allow");
    return resp;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
