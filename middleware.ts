import type { NextRequest } from "next/server";

import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Proteksi route dashboard hanya validasi session dan role dari token
  if (pathname.startsWith("/dashboard")) {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    // Jika tidak ada token, redirect ke login
    if (!token) {
      const url = new URL("/login", request.url);

      url.searchParams.set("callbackUrl", pathname);

      return NextResponse.redirect(url);
    }

    // Validasi minimal: hanya user dengan role yang valid bisa akses dashboard
    const allowedRoles = [
      "super_admin",
      "admin_heavy",
      "admin_elec",
      "pengawas",
      "mekanik",
      "guest",
    ];

    if (!allowedRoles.includes(token.role)) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
