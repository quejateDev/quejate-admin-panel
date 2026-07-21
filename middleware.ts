import authConfig from "./auth.config";
import NextAuth from "next-auth"
import { NextResponse } from "next/server";
import { apiAuthPrefix, authRoutes, DEFAULT_LOGIN_REDIRECT, privateRoutes } from "./route";
const { auth } = NextAuth(authConfig)

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;

  const isApiAuthRoute = nextUrl.pathname.startsWith(apiAuthPrefix);

  const isPrivateRoute = privateRoutes.includes(nextUrl.pathname) || 
                        privateRoutes.some(route => 
                          route.endsWith('*') && 
                          nextUrl.pathname.startsWith(route.slice(0, -1))
                        );
                        
  const isAuthRoute = authRoutes.includes(nextUrl.pathname);

  if (nextUrl.pathname === "/") {
    return Response.redirect(new URL(DEFAULT_LOGIN_REDIRECT, nextUrl));
  }

  if(isApiAuthRoute) {
    return null;
  }

  // Cierra el hueco crítico: TODAS las rutas /api (salvo /api/auth, ya excluida
  // arriba) exigen sesión. El middleware solo gateaba páginas vía privateRoutes,
  // pero las API routes no estaban en esa lista y los handlers no validan sesión
  // → quedaban llamables sin autenticar, borrados incluidos (BOLA/BFLA).
  // La autorización fina por rol/entidad es aparte (migración, Tarea 12);
  // esto cierra el acceso "sin sesión", que es lo explotable hoy.
  if (nextUrl.pathname.startsWith("/api") && !isLoggedIn) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if(isAuthRoute){
    if (isLoggedIn) {
      return Response.redirect(new URL(DEFAULT_LOGIN_REDIRECT, nextUrl));
    }
    return null;
  }

  if (isPrivateRoute && !isLoggedIn) {
    return Response.redirect(new URL("/auth/login", nextUrl));
  }

  return null;
})

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
