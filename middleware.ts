import { NextResponse, type NextRequest } from "next/server";
import { verifySession, getSessionCookieName } from "./src/lib/auth";

const PUBLIC_PATHS = ["/", "/api/auth/login"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow Next internals and static assets
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/api/auth")
  ) {
    return NextResponse.next();
  }

  // Root (login) is always public
  if (pathname === "/") {
    return NextResponse.next();
  }

  const token = request.cookies.get(getSessionCookieName())?.value;
  const session = verifySession(token);

  if (!session) {
    const loginUrl = new URL("/", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"]
};

