import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public paths
  if (
    pathname === '/login' ||
    pathname === '/contact' ||
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/images/') ||
    pathname.startsWith('/headshots/') ||
    pathname.startsWith('/photos/') ||
    pathname.startsWith('/programs/') ||
    pathname.startsWith('/logos/') ||
    pathname === '/favicon.ico' ||
    pathname === '/icon.png' ||
    pathname === '/apple-icon.png'
  ) {
    return NextResponse.next();
  }

  // Admin page requires admin cookie
  if (pathname === '/admin') {
    const adminCookie = request.cookies.get('ffi_admin');
    if (adminCookie?.value !== 'authenticated') {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    return NextResponse.next();
  }

  // All other pages require user cookie
  const userCookie = request.cookies.get('ffi_user');
  if (userCookie?.value !== 'authenticated') {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image).*)'],
};
