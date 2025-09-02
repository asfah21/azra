import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { defaultNavItems } from "@/lib/config/navigation"; // static mapping path<->menu id

// Helper: find nav item by pathname
function findNavItem(pathname: string) {
  // Exact match child first
  for (const parent of defaultNavItems) {
    if ('children' in parent && Array.isArray(parent.children)) {
      const child = parent.children.find((c) => c.path === pathname);
      if (child) return child;
    }
  }

  // Exact match parent
  let item = defaultNavItems.find((n) => 'path' in n && n.path === pathname);
  if (item) return item;

  // Prefix match child first
  for (const parent of defaultNavItems) {
    if ('children' in parent && Array.isArray(parent.children)) {
      const child = parent.children.find(
        (c) => c.path && pathname.startsWith(c.path + "/"),
      );
      if (child) return child;
    }
  }

  // Prefix match parent
  item = defaultNavItems.find(
    (n) => 'path' in n && n.path !== "/dashboard" && pathname.startsWith(n.path + "/"),
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

    // Ambil konfigurasi akses dinamis dari API (database)
    let dynamicAccess: Record<string, string[]> = {};
    try {
      const apiUrl = new URL("/api/role-access", request.url);
      const res = await fetch(apiUrl.toString(), {
        headers: {
          cookie: request.headers.get("cookie") || "",
        },
        // Hindari cache agar perubahan cepat berlaku
        cache: "no-store",
      });
      if (res.ok) {
        // Data: array { menu, role }
        const data: Array<{ menu: string; role: string }> = await res.json();
        for (const entry of data) {
          if (!dynamicAccess[entry.menu]) dynamicAccess[entry.menu] = [];
          dynamicAccess[entry.menu].push(entry.role);
        }
      }
    } catch {
      // Fail open: jika API gagal, gunakan defaultRoles dari config
    }

    // Jika targetItem adalah child menu, cek akses child saja
    let isChild = false;
    for (const parent of defaultNavItems) {
      if ('children' in parent && Array.isArray(parent.children)) {
        if (parent.children.some((c) => c.id === targetItem.id)) {
          isChild = true;
          break;
        }
      }
    }

  let allowedRoles: string[] = [];
    if (isChild) {
      allowedRoles = dynamicAccess[targetItem.id];
      // Jika child tidak punya entry di DB dan defaultRoles kosong, akses ditolak
      if ((!allowedRoles || allowedRoles.length === 0)) {
        if ((targetItem as any).defaultRoles && (targetItem as any).defaultRoles.length > 0) {
          allowedRoles = [...(targetItem as any).defaultRoles];
        } else {
          // Tidak ada akses sama sekali
          allowedRoles = [];
        }
      }
    } else {
      // Parent menu: cek akses parent
      allowedRoles = dynamicAccess[targetItem.id];
      if (!allowedRoles || allowedRoles.length === 0) {
        allowedRoles = (targetItem as any).defaultRoles
          ? [...(targetItem as any).defaultRoles]
          : validRoles.filter((r) => r !== "super_admin");
      }
    }

    const hasAccess = allowedRoles.includes(userRole);
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
