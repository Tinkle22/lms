import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request) {
  // Get token with the correct secret
  const token = await getToken({ 
    req: request,
    secret: process.env.NEXTAUTH_SECRET
  });
  
  const isAuthenticated = !!token;
  const isSuperAdmin = token?.role === 'SUPER_ADMIN';
  const isAdminRoute = request.nextUrl.pathname.startsWith('/dashboard');
  const isSuperAdminRoute = request.nextUrl.pathname.startsWith('/super-dashboard');
  const isAuthRoute = request.nextUrl.pathname.startsWith('/auth') || 
                      request.nextUrl.pathname === '/login' ||
                      request.nextUrl.pathname === '/register';

  // Redirect authenticated users away from auth pages
  if (isAuthenticated && isAuthRoute) {
    if (isSuperAdmin) {
      return NextResponse.redirect(new URL('/super-dashboard', request.url));
    } else {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  // Protect admin routes
  if (!isAuthenticated && isAdminRoute) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Protect super admin routes
  if (isSuperAdminRoute) {
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    
    if (!isSuperAdmin) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*', 
    '/super-dashboard/:path*', 
    '/auth/:path*',
    '/login',
    '/register'
  ],
};