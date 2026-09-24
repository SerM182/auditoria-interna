import { prisma } from '@/lib/prisma';
import DashboardClient from "./DashboardClient";

export const dynamic = 'force-dynamic';

export default async function Home() {
  let registros = [];

  try {
    const urlPA = process.env.POWER_AUTOMATE_GET_URL;

    if (urlPA) {
      const res = await fetch(urlPA, { cache: 'no-store' });
      
      if (res.ok) {
        let sharepointData = await res.json();
        
        if (!Array.isArray(sharepointData) && sharepointData.value) {
          sharepointData = sharepointData.value;
        }

        registros = sharepointData.map((item: any) => {
          const extractValue = (val: any) => {
            if (Array.isArray(val) && val.length > 0) return val[0].Value;
            if (typeof val === 'object' && val !== null) return val.Value;
            return val;
          };

          return {
            id: item.ID || item.Id || item.id || Math.random(),
            codigoProyecto: extractValue(item.field_1 || item.codigoProyecto) || "Sin Proyecto",
            fecha: item.field_2 || item.fecha || new Date().toISOString(),
            nHallazgos: Number(item.field_3 || item.nHallazgos || 0),
            gerenciaResponsable: item.field_4 || item.gerenciaResponsable || "-",
            descripcionHallazgo: item.field_5 || item.descripcionHallazgo || "",
            descripcionAccionCorrectiva: item.field_6 || item.descripcionAccionCorrectiva || "",
            fechaImplementacionCorreccion: item.field_7 || item.fechaImplementacionCorreccion || null,
            seguimientosAcciones: item.field_8 || item.seguimientosAcciones || "",
            observaciones: item.field_9 || item.observaciones || "",
            fechaVerificacionImplementacion: item.field_10 || item.fechaVerificacionImplementacion || null,
            fechaEvaluacionEficacia: item.field_11 || item.fechaEvaluacionEficacia || null,
            evaluacionEficacia: item.field_12 || item.evaluacionEficacia || "",
            responsable: item.field_13 || item.responsable || "-",
            estadoObservacion: extractValue(item.field_14 || item.estadoObservacion) || "Pendiente",
            createdAt: item.Created || item.fecha || new Date().toISOString(),
          };
        });

        registros.sort((a: any, b: any) => b.id - a.id);
      } else {
        console.error(`Error de fetch a PA: ${res.statusText}`);
      }
    } else {
      console.log("No hay urlPA configurada.");
    }
  } catch (error: any) {
    console.error("Error cargando registros:", error);
  }

  return (
    <DashboardClient registros={registros} />
  );
}
