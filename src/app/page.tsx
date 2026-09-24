import { prisma } from '@/lib/prisma';
import DashboardClient from "./DashboardClient";

export const dynamic = 'force-dynamic';

export default async function Home() {
  let registros = [];

  try {
    const urlPA = process.env.POWER_AUTOMATE_GET_URL;
    console.log("URL de Power Automate configurada:", urlPA ? "SI" : "NO");

    if (urlPA) {
      console.log("Obteniendo registros desde SharePoint/Power Automate...");
      const res = await fetch(urlPA, { cache: 'no-store' });
      
      if (!res.ok) {
        console.error("Error en fetch a Power Automate:", res.status, res.statusText);
      } else {
        let sharepointData = await res.json();
        
        if (!Array.isArray(sharepointData) && sharepointData.value) {
          sharepointData = sharepointData.value;
        }

        registros = sharepointData.map((item: any) => ({
          ...item,
          id: item.ID || item.Id || item.id || Math.random(),
          estadoObservacion: typeof item.estadoObservacion === 'object' ? item.estadoObservacion?.Value : item.estadoObservacion,
          codigoProyecto: typeof item.codigoProyecto === 'object' ? item.codigoProyecto?.Value : item.codigoProyecto,
          createdAt: item.Created || item.fecha || new Date().toISOString(),
        }));

        registros.sort((a: any, b: any) => b.id - a.id);
        console.log(`Se cargaron ${registros.length} registros desde SharePoint.`);
      }
    } 
    
    // Si la URL no estaba o hubo un error y registros sigue vacío, usamos Postgres
    if (!urlPA || registros.length === 0) {
      console.log("Usando fallback a base de datos Postgres (Prisma)...");
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
