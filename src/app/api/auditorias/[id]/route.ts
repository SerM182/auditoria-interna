import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
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
    
    const parsedData = {
      ...data,
      fecha: new Date(data.fecha),
      nHallazgos: parseInt(data.nHallazgos, 10),
      fechaImplementacionCorreccion: data.fechaImplementacionCorreccion ? new Date(data.fechaImplementacionCorreccion) : null,
      fechaVerificacionImplementacion: data.fechaVerificacionImplementacion ? new Date(data.fechaVerificacionImplementacion) : null,
      fechaEvaluacionEficacia: data.fechaEvaluacionEficacia ? new Date(data.fechaEvaluacionEficacia) : null,
    };
    
    // Eliminar campos que no se deben actualizar directamente
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
    await prisma.auditoria.delete({
      where: { id: parseInt(id) },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error deleting record' }, { status: 500 });
  }
}

