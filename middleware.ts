import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

// Daftar route yang dilindungi beserta role yang diizinkan
const protectedRoutes = [
  {
    path: "/dashboard/auth",
    allowedRoles: ['super_admin']
  },
  {
    path: "/dashboard/users",
    allowedRoles: ['super_admin', 'admin_heavy', 'admin_elec']
  },
  {
    path: "/dashboard/settings",
    allowedRoles: ['super_admin', 'admin_heavy', 'admin_elec', 'pengawas']
  },
  {
    path: "/dashboard/workorders",
    allowedRoles: ['super_admin', 'admin_heavy', 'admin_elec', 'mekanik']
  },
  {
    path: "/dashboard/reports",
    allowedRoles: ['super_admin', 'admin_heavy', 'admin_elec', 'pengawas']
  },
  {
    path: "/dashboard/maintenance",
    allowedRoles: ['super_admin', 'admin_heavy', 'mekanik']
  }
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Cari route yang sesuai dengan path yang diakses
  const matchedRoute = protectedRoutes.find(route => 
    pathname.startsWith(route.path)
  );

  if (matchedRoute) {
    const token = await getToken({ 
      req: request,
      secret: process.env.NEXTAUTH_SECRET 
    });

    // Jika tidak ada token, redirect ke halaman login
    if (!token) {
      const url = new URL('/login', request.url);
      url.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(url);
    }

    // Periksa apakah user memiliki role yang diizinkan
    const hasAccess = matchedRoute.allowedRoles.includes(token.role);
    if (!hasAccess) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
  ],
};
