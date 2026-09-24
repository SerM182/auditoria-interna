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
      const auditorias = sharepointData.map((item: any) => ({
        ...item,
        id: item.ID || item.Id || item.id,
        // Los campos de Elección (Choice) en SharePoint a veces vienen como un objeto { Value: "Texto" }
        estadoObservacion: typeof item.estadoObservacion === 'object' ? item.estadoObservacion.Value : item.estadoObservacion,
        codigoProyecto: typeof item.codigoProyecto === 'object' ? item.codigoProyecto.Value : item.codigoProyecto,
      }));

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
    
    // Convert string dates to Date objects if they exist
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
