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

        registros = sharepointData.map((item: any) => {
          // SharePoint a veces devuelve Choice fields como Array [{ Value: "Algo" }] o Object { Value: "Algo" }
          const extractValue = (val: any) => {
            if (Array.isArray(val) && val.length > 0) return val[0].Value;
            if (typeof val === 'object' && val !== null) return val.Value;
            return val;
          };

          return {
            ...item,
            id: item.ID || item.Id || item.id || Math.random(),
            codigoProyecto: extractValue(item.field_1 || item.codigoProyecto),
            fecha: item.field_2 || item.fecha,
            nHallazgos: item.field_3 || item.nHallazgos,
            gerenciaResponsable: item.field_4 || item.gerenciaResponsable,
            descripcionHallazgo: item.field_5 || item.descripcionHallazgo,
            descripcionAccionCorrectiva: item.field_6 || item.descripcionAccionCorrectiva,
            fechaImplementacionCorreccion: item.field_7 || item.fechaImplementacionCorreccion,
            seguimientosAcciones: item.field_8 || item.seguimientosAcciones,
            observaciones: item.field_9 || item.observaciones,
            fechaVerificacionImplementacion: item.field_10 || item.fechaVerificacionImplementacion,
            fechaEvaluacionEficacia: item.field_11 || item.fechaEvaluacionEficacia,
            evaluacionEficacia: item.field_12 || item.evaluacionEficacia,
            responsable: item.field_13 || item.responsable,
            estadoObservacion: extractValue(item.field_14 || item.estadoObservacion),
            createdAt: item.Created || item.fecha || new Date().toISOString(),
          };
        });

        registros.sort((a: any, b: any) => b.id - a.id);
        console.log(`Se cargaron ${registros.length} registros desde SharePoint.`);
      }
    } 
    // Eliminamos el fallback a Postgres temporalmente para forzar ver qué devuelve SharePoint
    if (!urlPA) {
      console.log("No hay URL de Power Automate configurada.");
    }
  } catch (error) {
    console.error("Error cargando registros:", error);
  }

  return <DashboardClient registros={registros} />;
}
