import { NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { NextRequestWithAuth } from 'next-auth/middleware'

export default async function middleware(request: NextRequestWithAuth) {
  const token = await getToken({ 
    req: request,
    cookieName: process.env.NODE_ENV === 'production' 
      ? '__Secure-next-auth.session-token'
      : 'next-auth.session-token'
  });
  
  const url = request.nextUrl.clone();

  const publicPaths = ['/sign-in', '/sign-up', '/verify', '/u', '/questions', '/reset-password'];
  const isPublicPath = publicPaths.some(path => 
    url.pathname === path || url.pathname.startsWith(`${path}/`)
  );

  const isDashboardPath = url.pathname === '/dashboard' || url.pathname.startsWith('/dashboard/');

  if (token && (url.pathname === '/sign-in' || url.pathname === '/sign-up')) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  if (!token && isDashboardPath) {
    return NextResponse.redirect(new URL('/sign-in', request.url));
  }

  if (!token && !isPublicPath) {
    return NextResponse.redirect(new URL('/sign-in', request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}