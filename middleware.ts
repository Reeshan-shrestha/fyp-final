import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Only protect the admin dashboard route
  if (request.nextUrl.pathname === '/admin/dashboard') {
    // Check for admin token
    const adminToken = request.cookies.get('adminToken')?.value;

    if (!adminToken) {
      // Redirect to login if no token is found
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/admin/dashboard',
}; 