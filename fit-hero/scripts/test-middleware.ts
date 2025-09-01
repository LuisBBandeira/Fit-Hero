// Test script for middleware functionality
// This can be used to test route protection

interface RouteTest {
  path: string;
  shouldBeAccessible: boolean;
  description: string;
}

const testRouteAccess = async () => {
  const routes: RouteTest[] = [
    // Public routes (should be accessible without authentication)
    { path: '/', shouldBeAccessible: true, description: 'Root page' },
    { path: '/login', shouldBeAccessible: true, description: 'Login page' },
    { path: '/signup', shouldBeAccessible: true, description: 'Signup page' },
    
    // Protected routes (should redirect to login if not authenticated)
    { path: '/dashboard', shouldBeAccessible: false, description: 'Dashboard page' },
    { path: '/settings', shouldBeAccessible: false, description: 'Settings page' },
    { path: '/achievements', shouldBeAccessible: false, description: 'Achievements page' },
    { path: '/character-creation', shouldBeAccessible: false, description: 'Character creation page' },
    { path: '/view-progress', shouldBeAccessible: false, description: 'View progress page' },
  ];

  console.log('🔒 Testing Route Protection Middleware\n');

  for (const route of routes) {
    console.log(`Testing: ${route.path} (${route.description})`);
    
    try {
      const response = await fetch(`http://localhost:3000${route.path}`, {
        method: 'GET',
        credentials: 'include', // Include cookies for session
        redirect: 'manual' // Don't follow redirects automatically
      });

      const isRedirect = response.status >= 300 && response.status < 400;
      const isAccessible = response.status === 200;
      
      if (route.shouldBeAccessible) {
        if (isAccessible) {
          console.log('✅ PASS - Public route accessible');
        } else {
          console.log('❌ FAIL - Public route should be accessible');
        }
      } else {
        if (isRedirect || response.status === 401 || response.status === 403) {
          console.log('✅ PASS - Protected route properly blocked');
        } else if (isAccessible) {
          console.log('❌ FAIL - Protected route should be blocked');
        } else {
          console.log('⚠️  UNKNOWN - Unexpected response status:', response.status);
        }
      }
      
      if (isRedirect) {
        const location = response.headers.get('location');
        console.log(`   → Redirected to: ${location}`);
      }
      
    } catch (error) {
      console.error(`❌ ERROR testing ${route.path}:`, error);
    }
    
    console.log(''); // Empty line for readability
  }
};

// Test authenticated access
const testAuthenticatedAccess = async (sessionCookie: string) => {
  console.log('🔓 Testing Authenticated Access\n');
  
  const protectedRoutes = ['/dashboard', '/settings', '/achievements'];
  
  for (const route of protectedRoutes) {
    try {
      const response = await fetch(`http://localhost:3000${route}`, {
        method: 'GET',
        headers: {
          'Cookie': sessionCookie
        },
        redirect: 'manual'
      });

      if (response.status === 200) {
        console.log(`✅ ${route} - Accessible when authenticated`);
      } else {
        console.log(`❌ ${route} - Should be accessible when authenticated (Status: ${response.status})`);
      }
    } catch (error) {
      console.error(`❌ ERROR testing ${route}:`, error);
    }
  }
};

// Example usage:
// testRouteAccess();

// To test with authentication, you would need to:
// 1. Login first to get a session cookie
// 2. Use that cookie in testAuthenticatedAccess()
// testAuthenticatedAccess('next-auth.session-token=your-session-token-here');

export { testRouteAccess, testAuthenticatedAccess };
