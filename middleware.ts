import createMiddleware from 'next-intl/middleware';
import { type NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { locales, defaultLocale } from '@/i18n/config';
import type { UserRole } from '@/types/database';

// Security headers to apply to all responses
const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
};

// Route configuration: path prefix -> allowed roles
const ROUTE_PERMISSIONS: Record<string, UserRole[]> = {
  '/admin': ['smp_admin'],
  '/security': ['smp_admin', 'security_officer'],
  '/portal': ['driver'],
  '/dashboard': ['smp_admin', 'smp_agent', 'partner'],
};

// Default dashboard for each role
const ROLE_DEFAULT_DASHBOARD: Record<UserRole, string> = {
  smp_admin: '/admin',
  security_officer: '/security',
  smp_agent: '/dashboard',
  partner: '/dashboard',
  driver: '/portal',
};

// Public routes that don't require authentication
const PUBLIC_ROUTES = [
  '/',
  '/login',
  '/register',
  '/forgot-password',
  '/api/contact',
  '/api/applications',
];

// Create the next-intl middleware with 'always' prefix to redirect paths without locale
const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always',
});

// Helper to add security headers to response
function applySecurityHeaders(response: NextResponse): NextResponse {
  Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  return response;
}

// Helper to strip locale prefix from pathname
function getPathnameWithoutLocale(pathname: string): string {
  for (const locale of locales) {
    if (pathname.startsWith(`/${locale}/`)) {
      return pathname.slice(locale.length + 1);
    }
    if (pathname === `/${locale}`) {
      return '/';
    }
  }
  return pathname;
}

// Helper function to handle auth and headers
async function handleAuthAndHeaders(
  request: NextRequest,
  response: NextResponse,
  pathnameWithoutLocale: string
): Promise<NextResponse> {
  // Skip auth for API routes
  if (pathnameWithoutLocale.startsWith('/api/')) {
    return applySecurityHeaders(response);
  }

  // Create Supabase client
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Check if route is public
  const isPublicRoute = PUBLIC_ROUTES.some(
    (route) => pathnameWithoutLocale === route || pathnameWithoutLocale.startsWith(`${route}/`)
  );

  // Get authenticated user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Handle logout route - always allow
  if (pathnameWithoutLocale === '/logout') {
    return applySecurityHeaders(response);
  }

  // Handle public routes
  if (isPublicRoute) {
    // If user is authenticated and trying to access login/register, redirect to their dashboard
    if (user && (pathnameWithoutLocale === '/login' || pathnameWithoutLocale === '/register')) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (profile?.role) {
        const dashboardPath = ROLE_DEFAULT_DASHBOARD[profile.role as UserRole];
        return applySecurityHeaders(NextResponse.redirect(new URL(dashboardPath, request.url)));
      }
    }
    return applySecurityHeaders(response);
  }

  // All non-public routes require authentication
  if (!user) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathnameWithoutLocale);
    return applySecurityHeaders(NextResponse.redirect(loginUrl));
  }

  // Get user's role from profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile?.role) {
    return applySecurityHeaders(NextResponse.redirect(new URL('/login', request.url)));
  }

  const userRole = profile.role as UserRole;

  // Check if user has permission to access the route
  for (const [routePrefix, allowedRoles] of Object.entries(ROUTE_PERMISSIONS)) {
    if (pathnameWithoutLocale.startsWith(routePrefix)) {
      if (!allowedRoles.includes(userRole)) {
        const roleDashboard = ROLE_DEFAULT_DASHBOARD[userRole];
        const redirectUrl = new URL(roleDashboard, request.url);
        redirectUrl.searchParams.set('error', 'unauthorized');
        return applySecurityHeaders(NextResponse.redirect(redirectUrl));
      }
      return applySecurityHeaders(response);
    }
  }

  return applySecurityHeaders(response);
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Skip middleware for static files and Next.js internals
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.match(/\.(svg|png|jpg|jpeg|gif|webp|ico|json|xml|txt)$/)
  ) {
    return NextResponse.next();
  }

  // Skip i18n for API routes - just apply security headers
  if (pathname.startsWith('/api/')) {
    return applySecurityHeaders(NextResponse.next());
  }

  // Check if path has a locale prefix
  const pathnameHasLocale = locales.some(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`)
  );

  // Manually redirect paths without locale prefix to include default locale
  if (!pathnameHasLocale) {
    const url = request.nextUrl.clone();
    url.pathname = `/${defaultLocale}${pathname}`;
    return applySecurityHeaders(NextResponse.redirect(url));
  }

  // Let intlMiddleware handle locale-prefixed requests
  const response = intlMiddleware(request);

  // If intlMiddleware returned a redirect (e.g., /login -> /en/login), return it
  if (response.status >= 300 && response.status < 400) {
    return applySecurityHeaders(response);
  }

  // Get the pathname without locale prefix for auth checks
  const pathnameWithoutLocale = getPathnameWithoutLocale(pathname);

  // Handle authentication and apply security headers
  return handleAuthAndHeaders(request, response, pathnameWithoutLocale);
}

export const config = {
  // Match all paths except static files
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|json|xml|txt)$).*)'],
};
