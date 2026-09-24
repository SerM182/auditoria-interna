import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Si tenemos la URL de Power Automate configurada, leemos desde SharePoint
    if (process.env.POWER_AUTOMATE_GET_URL) {
      const res = await fetch(process.env.POWER_AUTOMATE_GET_URL, { cache: 'no-store' });
      let sharepointData = await res.json();
      
      // Si Power Automate devolvió un objeto con 'value', extraemos el array
      if (!Array.isArray(sharepointData) && sharepointData.value) {
        sharepointData = sharepointData.value;
      }

      // Mapeamos los datos para que coincidan con lo que espera la app
      const auditorias = sharepointData.map((item: any) => {
        const extractValue = (val: any) => {
          if (Array.isArray(val) && val.length > 0) return val[0].Value;
          if (typeof val === 'object' && val !== null) return val.Value;
          return val;
        };

        return {
          ...item,
          id: item.ID || item.Id || item.id,
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
        };
      });

      // Ordenar por ID descendente (los más nuevos primero)
      auditorias.sort((a: any, b: any) => b.id - a.id);

      return NextResponse.json(auditorias);
    }

    // Fallback temporal a Postgres si no está la variable configurada
    const auditorias = await prisma.auditoria.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(auditorias);
  } catch (error) {
    console.error("Error GET:", error);
    return NextResponse.json({ error: 'Error fetching records' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();

    // Si tenemos la URL de Power Automate configurada para Crear (POST)
    if (process.env.POWER_AUTOMATE_POST_URL) {
      // Formateamos las fechas a string YYYY-MM-DD para que SharePoint / Power Automate las entienda fácil
      const payload = {
        ...data,
        nHallazgos: parseInt(data.nHallazgos, 10),
      };

      const res = await fetch(process.env.POWER_AUTOMATE_POST_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error(`Error en Power Automate POST: ${res.statusText}`);
      }

      const result = await res.json().catch(() => ({}));
      return NextResponse.json(result);
    }

    // Fallback a Prisma Postgres
    const parsedData = {
      ...data,
      fecha: new Date(data.fecha),
      nHallazgos: parseInt(data.nHallazgos, 10),
      fechaImplementacionCorreccion: data.fechaImplementacionCorreccion ? new Date(data.fechaImplementacionCorreccion) : null,
      fechaVerificacionImplementacion: data.fechaVerificacionImplementacion ? new Date(data.fechaVerificacionImplementacion) : null,
      fechaEvaluacionEficacia: data.fechaEvaluacionEficacia ? new Date(data.fechaEvaluacionEficacia) : null,
    };

    const newAuditoria = await prisma.auditoria.create({
      data: parsedData,
    });
    return NextResponse.json(newAuditoria);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error creating record' }, { status: 500 });
  }
}
