import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const auditorias = await prisma.auditoria.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(auditorias);
  } catch (error) {
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
