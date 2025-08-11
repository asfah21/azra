import type { NextRequest } from "next/server";

import { NextResponse } from "next/server";

export function middleware(_request: NextRequest) {
  // Simple redirect-based protection (tidak menggunakan NextAuth middleware)
  // NextAuth middleware menyebabkan error di edge runtime
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
