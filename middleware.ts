import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Routes that require authentication
const protectedRoutes = ['/artist', '/client', '/admin', '/onboarding']

// Routes that should redirect to dashboard if already authenticated
const authRoutes = ['/login', '/register']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  // Decode the URL-encoded cookie value
  const rawToken = request.cookies.get('accessToken')?.value
  const accessToken = rawToken ? decodeURIComponent(rawToken) : null

  // Check if the route is protected
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  )

  // Check if the route is an auth route
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route))

  // If trying to access protected route without token, redirect to login
  if (isProtectedRoute && !accessToken) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // If trying to access auth routes while logged in, redirect to dashboard
  // Note: We can't determine role from cookie alone, so we redirect to a common route
  // The actual role-based redirect happens client-side after fetching user data
  if (isAuthRoute && accessToken) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*|manifest\\.json).*)',
  ],
}
