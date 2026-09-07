import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AUBASA - Auditoría Interna",
  description: "Sistema de Seguimiento de Auditoría Interna",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${inter.className} bg-gray-50 text-gray-900`}>
        <nav className="bg-[#00a2b9] text-white shadow-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16 items-center">
              <div className="flex-shrink-0 flex items-center gap-3">
                {/* Simulated Logo */}
                <div className="font-black text-2xl tracking-tighter">AUBASA</div>
                <div className="hidden md:block h-6 w-px bg-white/30 mx-2"></div>
                <div className="hidden md:block font-medium">Auditoría Interna</div>
              </div>
              <div>
                <span className="text-sm bg-white/20 px-3 py-1 rounded-full">Usuario logueado</span>
              </div>
            </div>
          </div>
        </nav>
        <main className="min-h-[calc(100vh-4rem)]">
          {children}
        </main>
      </body>
    </html>
  );
}
