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
          <nav className="bg-[#00a2b9] text-white shadow-md relative z-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between h-16 items-center">
                <div className="flex-shrink-0 flex items-center gap-3">
                  <div className="font-black text-2xl tracking-tighter">AUBASA</div>
                  <div className="hidden md:block h-6 w-px bg-white/30 mx-2"></div>
                  <div className="hidden md:block font-medium">Auditoría Interna</div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm bg-white/20 px-3 py-1 rounded-full hidden sm:block">
                    {user}
                  </span>
                  <form action={logoutAction}>
                    <button type="submit" className="text-sm font-bold hover:text-gray-200 transition-colors">
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
