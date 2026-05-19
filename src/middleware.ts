import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const publicRoutes = ['/', '/login', '/register', '/plans', '/onboarding', '/landing'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Get user from localStorage (client-side) - this won't work in middleware
  // For now, we'll rely on client-side protection in the components
  // In production, you'd use JWT tokens in HTTP cookies
  
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));
  
  // Allow public routes
  if (isPublicRoute) {
    return NextResponse.next();
  }
  
  // For protected routes, we'll check client-side
  // This is a simplified approach - in production, use proper JWT validation
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
