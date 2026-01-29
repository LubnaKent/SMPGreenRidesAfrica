import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import type { UserRole } from "@/types/database";

// Route configuration: path prefix -> allowed roles
const ROUTE_PERMISSIONS: Record<string, UserRole[]> = {
  "/admin": ["smp_admin"],
  "/security": ["smp_admin", "security_officer"],
  "/portal": ["driver"],
  "/dashboard": ["smp_admin", "smp_agent", "partner"],
};

// Default dashboard for each role
const ROLE_DEFAULT_DASHBOARD: Record<UserRole, string> = {
  smp_admin: "/admin",
  security_officer: "/security",
  smp_agent: "/dashboard",
  partner: "/dashboard",
  driver: "/portal",
};

// Public routes that don't require authentication
const PUBLIC_ROUTES = [
  "/",
  "/login",
  "/register",
  "/forgot-password",
  "/api/contact",
  "/api/applications", // For driver self-registration
];

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const pathname = request.nextUrl.pathname;

  // Skip middleware for static files and Next.js internals
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.match(/\.(svg|png|jpg|jpeg|gif|webp|ico)$/)
  ) {
    return supabaseResponse;
  }

  // Check if route is public
  const isPublicRoute = PUBLIC_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  // Get authenticated user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Handle logout route - always allow
  if (pathname === "/logout") {
    return supabaseResponse;
  }

  // Handle public routes
  if (isPublicRoute) {
    // If user is authenticated and trying to access login/register, redirect to their dashboard
    if (user && (pathname === "/login" || pathname === "/register")) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (profile?.role) {
        const defaultDashboard = ROLE_DEFAULT_DASHBOARD[profile.role as UserRole];
        return NextResponse.redirect(new URL(defaultDashboard, request.url));
      }
    }
    return supabaseResponse;
  }

  // All non-public routes require authentication
  if (!user) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Get user's role from profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile?.role) {
    // User has no profile/role - redirect to login
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const userRole = profile.role as UserRole;

  // Check if user has permission to access the route
  for (const [routePrefix, allowedRoles] of Object.entries(ROUTE_PERMISSIONS)) {
    if (pathname.startsWith(routePrefix)) {
      if (!allowedRoles.includes(userRole)) {
        // User doesn't have permission - redirect to their default dashboard
        const defaultDashboard = ROLE_DEFAULT_DASHBOARD[userRole];
        const redirectUrl = new URL(defaultDashboard, request.url);
        redirectUrl.searchParams.set("error", "unauthorized");
        return NextResponse.redirect(redirectUrl);
      }
      // User has permission - continue
      return supabaseResponse;
    }
  }

  // For any other authenticated route, allow access
  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
