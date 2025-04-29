import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getCookie, verifyToken } from '@/lib/utils'
import { UserRole } from '@prisma/client'

export async function middleware(request: NextRequest) {
  const authStorage = await getCookie('auth-storage')
  const authParsed = authStorage ? JSON.parse(authStorage) : null

  const token = authParsed?.state?.token

  const headers = new Headers(request.headers);
  headers.set("x-current-path", request.nextUrl.pathname);
  const path = request.nextUrl.pathname;

  // any multimdia extension
  if (path.includes(".")) {
    return NextResponse.next();
  }

  if (path === "/") {
    return NextResponse.redirect(new URL('/pqr', request.url))
  }

  if (path !== "/login") {    
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    const decodedToken = await verifyToken(token)

    if (!decodedToken) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    if (decodedToken?.role === UserRole.CLIENT) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  } 

  return NextResponse.next({ headers });
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
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    }
  ],
};
