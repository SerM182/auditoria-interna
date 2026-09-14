import { PrismaClient } from "@prisma/client";
import DashboardClient from "./DashboardClient";

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';

export default async function Home() {
  const registros = await prisma.auditoria.findMany({
    orderBy: { createdAt: "desc" },
  });

  return <DashboardClient registros={registros} />;
}
