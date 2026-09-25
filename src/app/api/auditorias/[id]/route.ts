import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    
    if (process.env.POWER_AUTOMATE_GET_URL) {
      // Reutilizamos la URL de GET general y filtramos por ID
      const res = await fetch(process.env.POWER_AUTOMATE_GET_URL, { cache: 'no-store' });
      let sharepointData = await res.json();
      if (!Array.isArray(sharepointData) && sharepointData.value) sharepointData = sharepointData.value;
      
      const item = sharepointData.find((x: any) => String(x.ID) === id || String(x.Id) === id || String(x.id) === id);
      if (!item) return NextResponse.json({ error: 'Not found in SharePoint' }, { status: 404 });

      const extractValue = (val: any) => {
        if (Array.isArray(val) && val.length > 0) return val[0].Value;
        if (typeof val === 'object' && val !== null) return val.Value;
        return val;
      };

      const mapped = {
        ...item,
        id: item.ID || item.Id || item.id,
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
      
      return NextResponse.json(mapped);
    }

    const auditoria = await prisma.auditoria.findUnique({
      where: { id: parseInt(id) },
    });
    if (!auditoria) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(auditoria);
  } catch (error) {
    return NextResponse.json({ error: 'Error fetching record' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const data = await request.json();

    if (process.env.POWER_AUTOMATE_PUT_URL) {
      let equipo = "Sin equipo";
      try {
        const { cookies } = await import("next/headers");
        const cookieStore = await cookies();
        const authCookie = cookieStore.get("auth_user")?.value;
        if (authCookie) {
          const session = JSON.parse(authCookie);
          equipo = session.role;
        }
      } catch (e) {
        console.log("Error leyendo cookie en PUT", e);
      }

      const payload = {
        ...data,
        id: id,
        nHallazgos: parseInt(data.nHallazgos, 10),
        equipo: equipo
      };

      const res = await fetch(process.env.POWER_AUTOMATE_PUT_URL, {
        method: 'POST', // Power Automate HTTP trigger usually accepts POST for all incoming payloads
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error(`Error en Power Automate PUT: ${res.statusText}`);
      const result = await res.json().catch(() => ({}));
      return NextResponse.json(result);
    }
    
    const parsedData = {
      ...data,
      fecha: new Date(data.fecha),
      nHallazgos: parseInt(data.nHallazgos, 10),
      fechaImplementacionCorreccion: data.fechaImplementacionCorreccion ? new Date(data.fechaImplementacionCorreccion) : null,
      fechaVerificacionImplementacion: data.fechaVerificacionImplementacion ? new Date(data.fechaVerificacionImplementacion) : null,
      fechaEvaluacionEficacia: data.fechaEvaluacionEficacia ? new Date(data.fechaEvaluacionEficacia) : null,
    };
    
    delete parsedData.id;
    delete parsedData.createdAt;
    delete parsedData.updatedAt;

    const updatedAuditoria = await prisma.auditoria.update({
      where: { id: parseInt(id) },
      data: parsedData,
    });
    return NextResponse.json(updatedAuditoria);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error updating record' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    
    if (process.env.POWER_AUTOMATE_DELETE_URL) {
      const res = await fetch(process.env.POWER_AUTOMATE_DELETE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: id }),
      });
      if (!res.ok) throw new Error(`Error en Power Automate DELETE: ${res.statusText}`);
      return NextResponse.json({ success: true });
    }

    await prisma.auditoria.delete({
      where: { id: parseInt(id) },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error deleting record' }, { status: 500 });
  }
}

