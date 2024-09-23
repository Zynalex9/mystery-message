import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
export { default } from "next-auth/middleware";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request });
  const url = request.nextUrl;

  // If the user is authenticated and trying to access sign-in, sign-up, or home, redirect to dashboard
  if (token && (url.pathname === "/sign-in" || url.pathname === "/sign-up" || url.pathname === "/")) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // If the user is not authenticated and trying to access protected routes, redirect to sign-in
  if (!token && (url.pathname.startsWith("/dashboard") || url.pathname.startsWith("/verify"))) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  // Allow the request to proceed for all other cases
  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: ["/sign-in", "/sign-up", "/", "/dashboard/:path*"],
};
