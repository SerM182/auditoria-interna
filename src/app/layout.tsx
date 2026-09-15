import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cookies } from "next/headers";
import { logoutAction } from "./actions";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AUBASA - Auditoría Interna",
  description: "Sistema de Seguimiento de Auditoría Interna",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const user = cookieStore.get("auth_user")?.value;

  return (
    <html lang="es">
      <body className={`${inter.className} bg-gray-50 text-gray-900`}>
        {/* Solo mostrar la navbar si hay un usuario (no estamos en el login) */}
        {user && (
          <nav className="bg-[#0098B3] text-white shadow-md relative z-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between h-16 items-center">
                <div className="flex-shrink-0 flex items-center gap-3">
                  <div className="font-black tracking-wider text-xl">AUBASA</div>
                  <div className="hidden md:block h-5 w-px bg-white/30 mx-1"></div>
                  <div className="hidden md:block font-medium">Auditoría Interna</div>
                  <span className="bg-white/20 text-white text-[10px] font-bold px-2 py-0.5 rounded tracking-wide ml-2">SGI</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="hidden sm:flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-3 py-1">
                    <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                    <span className="text-sm font-medium">{user}</span>
                  </div>
                  <form action={logoutAction}>
                    <button type="submit" className="flex items-center gap-2 text-sm font-bold hover:bg-white/20 px-3 py-1.5 rounded-lg transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>
                      Salir
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </nav>
        )}
        <main className="min-h-screen">
          {children}
        </main>
      </body>
    </html>
  );
}
