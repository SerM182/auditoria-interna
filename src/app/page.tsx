import { cookies } from 'next/headers';
import DashboardClient from "./DashboardClient";
import { fetchAuditoriasList, matchesRole } from '@/lib/server-auditoria';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const cookieStore = await cookies();
  const authCookie = cookieStore.get("auth_user")?.value;
  let session: any = null;
  if (authCookie) {
    try { session = JSON.parse(authCookie); } catch {}
  }

  let registros = await fetchAuditoriasList();

  // Aplicar filtro inteligente por rol
  if (session) {
    registros = registros.filter((r) => matchesRole(r, session.role, session.email));
  }

  return (
    <DashboardClient registros={registros} session={session} />
  );
}
