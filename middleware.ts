import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

import { defaultNavItems } from "@/lib/config/navigation";

// ---------------- Helper ----------------
function findNavItem(pathname: string) {
  for (const parent of defaultNavItems) {
    if ("children" in parent && Array.isArray(parent.children)) {
      const child = parent.children.find((c) => c.path === pathname);
      if (child) return child;
    }
  }

  let item = defaultNavItems.find((n) => "path" in n && n.path === pathname);
  if (item) return item;

  for (const parent of defaultNavItems) {
    if ("children" in parent && Array.isArray(parent.children)) {
      const child = parent.children.find(
        (c) => c.path && pathname.startsWith(c.path + "/")
      );
      if (child) return child;
    }
  }

  item = defaultNavItems.find(
    (n) =>
      "path" in n &&
      n.path !== "/dashboard" &&
      pathname.startsWith(n.path + "/")
  );
  if (item) return item;

  if (pathname.startsWith("/dashboard")) {
    return defaultNavItems.find((n) => n.id === "dashboard");
  }

  return null;
}

// ---------------- Middleware ----------------
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Proteksi API yang sensitif
  const protectedAPIs = [
    "/api/dashboard",
    "/api/fingerprint",
    "/api/user",
    "/api/roles",
    "/api/role-access",
    "/api/settings",
    "/api/timentry",
    "/api/timesheet",
    "/api/timesheetall",
  ];

  const isProtectedAPI = protectedAPIs.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );

  if (isProtectedAPI) {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
      secureCookie: process.env.NODE_ENV === "production",
    });

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.next();
  }

  // Proteksi halaman dashboard
  const isDashboard = pathname.startsWith("/dashboard");

  if (isDashboard) {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
      secureCookie: process.env.NODE_ENV === "production",
    });

    if (!token) {
      const url = new URL("/login", request.url);
      url.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(url);
    }

    const userRole = token.role as string | undefined;
    const isSuperAdmin = userRole === "super_admin";

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

    if (pathname === "/dashboard" || pathname === "/dashboard/") {
      return NextResponse.next();
    }

    const targetItem = findNavItem(pathname);
    if (!targetItem) return NextResponse.next();
    if (isSuperAdmin) return NextResponse.next();

    // Ambil dynamic role access dari API
    let dynamicAccess: Record<string, string[]> = {};
    let apiStatus = "none";

    try {
      const apiUrl = new URL("/api/role-access?skip_rl=1", request.url);
      const res = await fetch(apiUrl.toString(), {
        headers: { cookie: request.headers.get("cookie") || "" },
        cache: "no-store",
      });

      apiStatus = String(res.status);

      if (res.ok) {
        const data: Array<{ menu: string; role: string }> = await res.json();
        for (const entry of data) {
          if (!dynamicAccess[entry.menu]) dynamicAccess[entry.menu] = [];
          dynamicAccess[entry.menu].push(entry.role);
        }
      }
    } catch {
      apiStatus = "error";
    }

    let isChild = false;
    for (const parent of defaultNavItems) {
      if ("children" in parent && Array.isArray(parent.children)) {
        if (parent.children.some((c) => c.id === (targetItem as any).id)) {
          isChild = true;
          break;
        }
      }
    }

    let allowedRoles: string[] = [];
    if (isChild) {
      allowedRoles = dynamicAccess[(targetItem as any).id] || [];
      if (allowedRoles.length === 0) {
        allowedRoles =
          (targetItem as any).defaultRoles?.length > 0
            ? [...(targetItem as any).defaultRoles]
            : [];
      }
    } else {
      allowedRoles = dynamicAccess[(targetItem as any).id] || [];
      if (allowedRoles.length === 0) {
        allowedRoles =
          (targetItem as any).defaultRoles ||
          validRoles.filter((r) => r !== "super_admin");
      }
    }

    if (!allowedRoles.includes(userRole)) {
      const redirectUrl = new URL("/dashboard", request.url);
      const resp = NextResponse.redirect(redirectUrl);

      resp.headers.set("x-auth-role", userRole || "");
      resp.headers.set("x-menu-id", (targetItem as any).id);
      resp.headers.set("x-api-status", apiStatus);
      resp.headers.set("x-allowed-roles", String(allowedRoles.length));
      resp.headers.set("x-access", "deny");

      return resp;
    }

    const resp = NextResponse.next();
    resp.headers.set("x-auth-role", userRole || "");
    resp.headers.set("x-menu-id", (targetItem as any).id);
    resp.headers.set("x-api-status", apiStatus);
    resp.headers.set("x-allowed-roles", String(allowedRoles.length));
    resp.headers.set("x-access", "allow");

    return resp;
  }

  return NextResponse.next();
}

// ---------------- Matcher ----------------
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/api/:path*",
  ],
};
