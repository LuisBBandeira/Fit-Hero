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
          '/forgot-password',    // Forgot password page
          '/reset-password',     // Reset password page
          '/auth/callback',      // Auth callback page for smart redirection
          // Note: /character-creation requires authentication (accessed after login)
          // Note: /dashboard, /settings, /achievements, /view-progress require authentication
        ]
        
        // Public API routes that don't require authentication
        const publicApiRoutes = [
          '/api/auth',           // NextAuth API routes (for login/signup functionality)
          '/api/auth/signin',    // Custom signin API
          '/api/auth/signup',    // Custom signup API
          '/api/auth/forgot-password',     // Forgot password API
          '/api/auth/reset-password',      // Reset password API
          '/api/auth/validate-reset-token', // Validate reset token API
        ]

        // Semi-protected API routes (require authentication but are used in auth flow)
        const authFlowApiRoutes = [
          '/api/user/character-status', // Used in auth callback to determine redirect
        ]
        
        // Check if the current path is a public route
        const isPublicRoute = publicRoutes.includes(pathname)
        
        // Check if the current path is a public API route
        const isPublicApiRoute = publicApiRoutes.some(route => 
          pathname.startsWith(route)
        )

        // Check if the current path is an auth flow API route (requires auth but allowed in callback)
        const isAuthFlowApiRoute = authFlowApiRoutes.some(route =>
          pathname.startsWith(route)
        )
        
        // Allow access to public routes regardless of authentication status
        if (isPublicRoute || isPublicApiRoute) {
          return true
        }

        // Allow auth flow API routes if user has a token
        if (isAuthFlowApiRoute && !!token) {
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
