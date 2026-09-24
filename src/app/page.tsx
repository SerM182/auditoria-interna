import { prisma } from '@/lib/prisma';
import DashboardClient from "./DashboardClient";

export const dynamic = 'force-dynamic';

export default async function Home() {
  let registros = [];
  let debugInfo = "";

  try {
    const urlPA = process.env.POWER_AUTOMATE_GET_URL;
    debugInfo += `URL config: ${urlPA ? 'SI' : 'NO'} | `;

    if (urlPA) {
      const res = await fetch(urlPA, { cache: 'no-store' });
      debugInfo += `Fetch status: ${res.status} | `;
      
      if (res.ok) {
        let sharepointData = await res.json();
        debugInfo += `Raw isArray: ${Array.isArray(sharepointData)} | `;
        
        if (!Array.isArray(sharepointData) && sharepointData.value) {
          sharepointData = sharepointData.value;
        }

        debugInfo += `Data length: ${sharepointData?.length} | `;

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

        debugInfo += `Mapped records: ${registros.length}`;
        registros.sort((a: any, b: any) => b.id - a.id);
      } else {
        debugInfo += `Error msg: ${res.statusText}`;
      }
    } else {
      debugInfo += "No urlPA configured.";
    }
  } catch (error: any) {
    debugInfo += `EXCEPTION: ${error.message}`;
    console.error("Error cargando registros:", error);
  }

  return (
    <>
      <div className="bg-slate-800 text-green-400 p-2 font-mono text-xs text-center break-all w-full">
        DEBUG VERCEL: {debugInfo}
      </div>
      <DashboardClient registros={registros} />
    </>
  );
}
