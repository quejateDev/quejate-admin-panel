import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getCookie, verifyToken } from "./lib/utils";
import { UserRole } from "@prisma/client";
// import { getCookie, verifyToken } from '@/lib/utils'
// import { UserRole } from '@prisma/client'

export async function middleware(request: NextRequest) {
  // const authStorage = await getCookie('auth-storage')
  // const authParsed = authStorage ? JSON.parse(authStorage) : null

  if (request.nextUrl.pathname === "/login") return NextResponse.next();

  const token = await getCookie("token");

  if (!token) return NextResponse.redirect(new URL("/login", request.url));

  let decoded: any;

  try {
    decoded = await verifyToken(token);

    console.log("decoded", decoded);
  } catch (error) {
    console.error("Error verifying token:", error);
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (!decoded) return NextResponse.redirect(new URL("/login", request.url));

  if (decoded?.role === UserRole.CLIENT)
    return NextResponse.redirect(new URL("/login", request.url));

  return NextResponse.next();

  // const path = request.nextUrl.pathname;

  // // any multimdia extension
  // if (path.includes(".")) {
  //   return NextResponse.next();
  // }

  // if (path === "/") {
  //   return NextResponse.redirect(new URL('/pqr', request.url))
  // }

  // if (path !== "/login") {
  //   if (!token) {
  //     return NextResponse.redirect(new URL('/login', request.url))
  //   }

  //   const decodedToken = await verifyToken(token)

  //   if (!decodedToken) {
  //     return NextResponse.redirect(new URL('/login', request.url))
  //   }

  //   if (decodedToken?.role === UserRole.CLIENT) {
  //     return NextResponse.redirect(new URL('/login', request.url))
  //   }
  // }

  return NextResponse.next();
}

// Configure paths that trigger the middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    {
      source:
        "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
      // missing: [
      // { type: "header", key: "next-router-prefetch" },
      // { type: "header", key: "purpose", value: "prefetch" },
      // ],
    },
  ],
};
