import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    // The middleware will only be called if the user is authenticated
    // If we reach here, the user is logged in and can access protected routes
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl
        
        // Public routes that don't require authentication
        const publicRoutes = [
          '/',                    // Root page
          '/login',              // Login page
          '/signup',             // Signup page
          // Note: /character-creation requires authentication (accessed after login)
          // Note: /dashboard, /settings, /achievements, /view-progress require authentication
        ]
        
        // Public API routes that don't require authentication
        const publicApiRoutes = [
          '/api/auth',           // NextAuth API routes (for login/signup functionality)
          '/api/auth/signin',    // Custom signin API
          '/api/auth/signup',    // Custom signup API
        ]
        
        // Check if the current path is a public route
        const isPublicRoute = publicRoutes.includes(pathname)
        
        // Check if the current path is a public API route
        const isPublicApiRoute = publicApiRoutes.some(route => 
          pathname.startsWith(route)
        )
        
        // Allow access to public routes regardless of authentication status
        if (isPublicRoute || isPublicApiRoute) {
          return true
        }
        
        // For all other routes, require authentication
        return !!token
      },
    },
    pages: {
      signIn: '/login', // Redirect to login page when not authenticated
    },
  }
)

// Configure which routes the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files with extensions (images, etc.)
     * - API routes that don't need protection
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$).*)',
  ],
}
