import { prisma } from '@/lib/prisma';
import DashboardClient from "./DashboardClient";

export const dynamic = 'force-dynamic';

export default async function Home() {
  // Sólo los campos que la tabla necesita: las descripciones largas viajarían
  // al navegador sin que nadie las muestre.
  const registros = await prisma.auditoria.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      codigoProyecto: true,
      fecha: true,
      nHallazgos: true,
      gerenciaResponsable: true,
      responsable: true,
      estadoObservacion: true,
      fechaImplementacionCorreccion: true,
      createdAt: true,
    },
  });

  return <DashboardClient registros={registros} />;
}
