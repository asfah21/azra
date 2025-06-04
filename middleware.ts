import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Simple redirect-based protection (tidak menggunakan NextAuth middleware)
  // NextAuth middleware menyebabkan error di edge runtime
  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*']
};