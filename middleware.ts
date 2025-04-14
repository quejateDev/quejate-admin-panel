import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getCookie, verifyToken } from '@/lib/utils'
import { UserRole } from '@prisma/client'

export async function middleware(request: NextRequest) {
  const authStorage = await getCookie('auth-storage')
  const authParsed = authStorage ? JSON.parse(authStorage) : null

  const token = authParsed?.state?.token

  const path = request.nextUrl.pathname;

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

  return NextResponse.next();
}

// Configure paths that trigger the middleware
export const config = {
  matcher: [
    '/',
    '/dashboard/:path*',
    '/:path*',
    '/api/:path*',
  ]
} 