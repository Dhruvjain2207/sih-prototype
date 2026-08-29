import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const { pathname } = req.nextUrl;

  // Securing /dashboard and its sub-routes for unauthenticated users
  if (pathname.startsWith("/dashboard")) {
    if (!isLoggedIn) {
      const loginUrl = new URL("/login", req.nextUrl.origin);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Redirecting authenticated users away from /login and /register
  if (pathname === "/login" || pathname === "/register") {
    if (isLoggedIn) {
      return NextResponse.redirect(new URL("/dashboard", req.nextUrl.origin));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/dashboard", "/dashboard/:path*", "/login", "/register"],
};
