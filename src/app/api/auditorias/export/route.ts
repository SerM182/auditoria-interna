import { cookies } from 'next/headers';
import { esVista, filtrarRegistros, situacionPlazo, type Vista } from '@/lib/auditoria';
import { fetchAuditoriasList, matchesRole } from '@/lib/server-auditoria';

function formatDate(date: string | Date | null | undefined): string {
  if (!date) return '';
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return String(date);
  // Usar UTC para evitar el desfase de 1 día por zona horaria
  const day = String(d.getUTCDate()).padStart(2, '0');
  const month = String(d.getUTCMonth() + 1).padStart(2, '0');
  const year = d.getUTCFullYear();
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
  if (value === null || value === undefined) return '""';
  const str = String(value).replace(/"/g, '""');
  return `"${str}"`;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const busqueda = searchParams.get('q') ?? '';
    const vistaParam = searchParams.get('vista');
    const vista: Vista = esVista(vistaParam) ? vistaParam : 'Todos';

    // Obtener sesión del usuario para filtrar estrictamente según su rol
    const cookieStore = await cookies();
    const authCookie = cookieStore.get("auth_user")?.value;
    let session: any = null;
    if (authCookie) {
      try { session = JSON.parse(authCookie); } catch {}
    }

    // Traer todos los registros desde SharePoint
    let auditorias = await fetchAuditoriasList();

    // 1. Filtrar por rol (Seguridad y Privacidad: cada equipo solo descarga lo suyo)
    if (session) {
      auditorias = auditorias.filter((a) => matchesRole(a, session.role, session.email));
    }

    // 2. Mismos filtros que el dashboard (búsqueda y estado)
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
      ETIQUETA_PLAZO[situacionPlazo(a.estadoObservacion, a.fechaImplementacionCorreccion)] || a.estadoObservacion,
      a.seguimientosAcciones,
      a.observaciones,
      formatDate(a.fechaVerificacionImplementacion),
      formatDate(a.fechaEvaluacionEficacia),
      a.evaluacionEficacia,
      a.responsable,
      a.estadoObservacion,
    ]);

    // Separador por punto y coma (;) para compatibilidad total con Excel en español
    const csvRows = [headers, ...rows]
      .map((row) => row.map(escapeCsv).join(';'))
      .join('\r\n');

    // BOM UTF-8 (\uFEFF) + directiva sep=; para que Excel separe las columnas automáticamente al hacer doble clic
    const BOM = '\uFEFF';
    const csvContent = `${BOM}sep=;\r\n${csvRows}`;

    const fecha = new Date().toISOString().split('T')[0];
    const sufijo = vista === 'Todos' ? '' : `-${vista.toLowerCase().replace(/\s+/g, '-')}`;

    return new Response(csvContent, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="auditorias${sufijo}-${fecha}.csv"`,
      },
    });
  } catch (error) {
    console.error("Error en exportación:", error);
    return new Response(JSON.stringify({ error: 'Error exportando registros' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
