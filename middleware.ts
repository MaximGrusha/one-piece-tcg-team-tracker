import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { pathname } = req.nextUrl;

  // NextAuth handles its own /api/auth/* routes — always allow
  if (pathname.startsWith("/api/auth")) return NextResponse.next();

  // API routes: auth is handled per-route, middleware just passes through
  if (pathname.startsWith("/api")) return NextResponse.next();

  // Login page: redirect to dashboard if already authenticated
  if (pathname === "/login") {
    if (req.auth) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
    return NextResponse.next();
  }

  // Root: redirect to dashboard or login
  if (pathname === "/") {
    return NextResponse.redirect(
      new URL(req.auth ? "/dashboard" : "/login", req.url)
    );
  }

  // Admin-only routes
  if (pathname.startsWith("/admin")) {
    if (!req.auth) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    if (req.auth.user.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
    return NextResponse.next();
  }

  // All other routes require authentication
  if (!req.auth) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
