import { prisma } from '@/lib/prisma';
import DashboardClient from "./DashboardClient";

export const dynamic = 'force-dynamic';

export default async function Home() {
  let registros = [];

  try {
    if (process.env.POWER_AUTOMATE_GET_URL) {
      const res = await fetch(process.env.POWER_AUTOMATE_GET_URL, { cache: 'no-store' });
      let sharepointData = await res.json();
      
      if (!Array.isArray(sharepointData) && sharepointData.value) {
        sharepointData = sharepointData.value;
      }

      registros = sharepointData.map((item: any) => ({
        ...item,
        id: item.ID || item.Id || item.id,
        estadoObservacion: typeof item.estadoObservacion === 'object' ? item.estadoObservacion.Value : item.estadoObservacion,
        codigoProyecto: typeof item.codigoProyecto === 'object' ? item.codigoProyecto.Value : item.codigoProyecto,
      }));

      registros.sort((a: any, b: any) => b.id - a.id);
    } else {
      registros = await prisma.auditoria.findMany({
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
    }
  } catch (error) {
    console.error("Error cargando registros:", error);
  }

  return <DashboardClient registros={registros} />;
}
