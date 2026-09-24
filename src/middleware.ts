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

  // La API también lleva datos de auditoría: sin sesión responde 401 en vez de
  // redirigir, para que el fetch del cliente reciba un error y no un HTML.
  if (isApi && !userCookie) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
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
