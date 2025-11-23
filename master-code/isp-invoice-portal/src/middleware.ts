import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = request.cookies.get("session")?.value;

  // Parse session data if available
  let userRole: string | null = null;
  if (session) {
    try {
      // Simple JSON parsing for now
      const sessionData = JSON.parse(session);
      userRole = sessionData?.role || null;
    } catch (error) {
      console.error('Invalid session data:', error);
    }
  }

  // Define protected routes
  const isCustomerRoute = pathname.startsWith("/customer");
  const isStaffRoute = pathname.startsWith("/staff");
  const isProtectedRoute = isCustomerRoute || isStaffRoute;

  // If accessing protected route without session, redirect to login
  if (isProtectedRoute && !session) {
    const loginUrl = new URL("/login", request.url);
    if (isCustomerRoute) {
      loginUrl.searchParams.set("role", "customer");
    } else if (isStaffRoute) {
      loginUrl.searchParams.set("role", "staff");
    }
    return NextResponse.redirect(loginUrl);
  }

  // If user has session but accessing wrong role routes
  if (session && userRole) {
    if (isCustomerRoute && userRole !== "customer") {
      return NextResponse.redirect(new URL("/staff/dashboard", request.url));
    }
    if (isStaffRoute && userRole !== "staff") {
      return NextResponse.redirect(new URL("/customer/invoices", request.url));
    }
  }

  // If logged in user tries to access login page, redirect to appropriate dashboard
  if (pathname.startsWith("/login") && session && userRole) {
    if (userRole === "customer") {
      return NextResponse.redirect(new URL("/customer/invoices", request.url));
    } else if (userRole === "staff") {
      return NextResponse.redirect(new URL("/staff/dashboard", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/customer/:path*", "/staff/:path*", "/login"],
};
