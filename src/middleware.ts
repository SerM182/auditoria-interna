import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Las rutas que no necesitan protección
  const isLoginPage = request.nextUrl.pathname.startsWith("/login");
  const isApi = request.nextUrl.pathname.startsWith("/api");
  
  // Si intenta ir a login pero ya está logueado, lo mandamos al home
  const userCookie = request.cookies.get("auth_user")?.value;
  
  if (isLoginPage && userCookie) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Si no es login ni API, y no tiene cookie, redirigir al login
  if (!isLoginPage && !isApi && !userCookie) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
