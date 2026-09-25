import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const isLoginPage = request.nextUrl.pathname.startsWith("/login");
  const isApi = request.nextUrl.pathname.startsWith("/api");
  const userCookie = request.cookies.get("auth_user")?.value;

  if (isApi && !userCookie) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  if (userCookie) {
    try {
      const session = JSON.parse(userCookie);
      const isChangePasswordPage = request.nextUrl.pathname.startsWith("/cambiar-password");
      
      if (isLoginPage) {
        return NextResponse.redirect(new URL("/", request.url));
      }

      if (session.mustChangePassword && !isChangePasswordPage && !isApi) {
        return NextResponse.redirect(new URL("/cambiar-password", request.url));
      }
      
      if (!session.mustChangePassword && isChangePasswordPage) {
        return NextResponse.redirect(new URL("/", request.url));
      }
      
      return NextResponse.next();
    } catch {
      // Cookie corrupta
      if (!isLoginPage && !isApi) {
        const response = NextResponse.redirect(new URL("/login", request.url));
        response.cookies.delete("auth_user");
        return response;
      }
    }
  } else {
    // No hay cookie
    if (!isLoginPage && !isApi) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
