import { prisma } from '@/lib/prisma';
import { esVista, filtrarRegistros, situacionPlazo, type Vista } from '@/lib/auditoria';

function formatDate(date: Date | null): string {
  if (!date) return '';
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

const ETIQUETA_PLAZO: Record<string, string> = {
  vencido: 'VENCIDO',
  'por-vencer': 'Por vencer',
  'en-plazo': 'En plazo',
  'sin-plazo': 'Sin plazo definido',
  cerrado: 'Cerrado',
};

function escapeCsv(value: unknown): string {
  if (value === null || value === undefined) return '';
  const str = String(value).replace(/"/g, '""');
  return `"${str}"`;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const busqueda = searchParams.get('q') ?? '';
    const vistaParam = searchParams.get('vista');
    const vista: Vista = esVista(vistaParam) ? vistaParam : 'Todos';

    const auditorias = await prisma.auditoria.findMany({
      orderBy: { createdAt: 'desc' },
    });

    // Mismos filtros que el dashboard: lo que se descarga es lo que se ve.
    const filtradas = filtrarRegistros(auditorias, { busqueda, vista });

    const headers = [
      'ID',
      'Código del Proyecto',
      'Fecha',
      'N° Hallazgos',
      'Gerencia Responsable',
      'Descripción del Hallazgo',
      'Descripción de la Acción Correctiva',
      'Fecha Implementación',
      'Situación del Plazo',
      'Seguimientos de las Acciones',
      'Observaciones',
      'Fecha Verificación',
      'Fecha Eval. Eficacia',
      'Evaluación de la Eficacia',
      'Responsable',
      'Estado de la Observación',
    ];

    const rows = filtradas.map((a) => [
      a.id,
      a.codigoProyecto,
      formatDate(a.fecha),
      a.nHallazgos,
      a.gerenciaResponsable,
      a.descripcionHallazgo,
      a.descripcionAccionCorrectiva,
      formatDate(a.fechaImplementacionCorreccion),
      ETIQUETA_PLAZO[situacionPlazo(a.estadoObservacion, a.fechaImplementacionCorreccion)],
      a.seguimientosAcciones,
      a.observaciones,
      formatDate(a.fechaVerificacionImplementacion),
      formatDate(a.fechaEvaluacionEficacia),
      a.evaluacionEficacia,
      a.responsable,
      a.estadoObservacion,
    ]);

    const csv = [headers, ...rows]
      .map((row) => row.map(escapeCsv).join(','))
      .join('\r\n');

    // BOM para que Excel reconozca los acentos correctamente
    const BOM = '\uFEFF';

    const fecha = new Date().toISOString().split('T')[0];
    const sufijo = vista === 'Todos' ? '' : `-${vista.toLowerCase().replace(/\s+/g, '-')}`;

    return new Response(BOM + csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="auditorias${sufijo}-${fecha}.csv"`,
      },
    });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: 'Error exporting records' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
