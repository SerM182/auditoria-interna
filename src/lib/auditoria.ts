// Lógica de negocio compartida entre el dashboard (cliente) y la exportación
// (servidor), para que lo que se ve en pantalla y lo que se descarga coincidan.

/** Días de anticipación con los que un plazo se considera "por vencer". */
export const DIAS_AVISO_VENCIMIENTO = 15;

export const ESTADOS = ['Pendiente', 'En Proceso', 'Cerrado'] as const;

export type SituacionPlazo =
  | 'vencido'    // el plazo de implementación ya pasó y la observación sigue abierta
  | 'por-vencer' // vence dentro de los próximos DIAS_AVISO_VENCIMIENTO días
  | 'en-plazo'
  | 'sin-plazo'  // no se cargó fecha de implementación
  | 'cerrado';

export type Vista = 'Todos' | 'Pendiente' | 'En Proceso' | 'Cerrado' | 'Vencidos' | 'Por Vencer';

export const VISTAS: { value: Vista; label: string; grupo: 'Estado' | 'Vencimiento' }[] = [
  { value: 'Pendiente', label: 'Pendiente', grupo: 'Estado' },
  { value: 'En Proceso', label: 'En Proceso', grupo: 'Estado' },
  { value: 'Cerrado', label: 'Cerrado', grupo: 'Estado' },
  { value: 'Vencidos', label: 'Plazo vencido', grupo: 'Vencimiento' },
  { value: 'Por Vencer', label: `Vence en ${DIAS_AVISO_VENCIMIENTO} días o menos`, grupo: 'Vencimiento' },
];

export function esVista(valor: string | null | undefined): valor is Vista {
  return valor === 'Todos' || VISTAS.some((v) => v.value === valor);
}

type FechaEntrada = Date | string | null | undefined;

function aMedianoche(fecha: Date): Date {
  const copia = new Date(fecha);
  copia.setHours(0, 0, 0, 0);
  return copia;
}

/**
 * Días entre hoy y la fecha límite. Negativo si ya pasó, 0 si vence hoy.
 * Compara a medianoche para que "vence hoy" no dependa de la hora.
 */
export function diasRestantes(fechaLimite: FechaEntrada): number | null {
  if (!fechaLimite) return null;
  const limite = new Date(fechaLimite);
  if (Number.isNaN(limite.getTime())) return null;
  const msPorDia = 1000 * 60 * 60 * 24;
  return Math.round((aMedianoche(limite).getTime() - aMedianoche(new Date()).getTime()) / msPorDia);
}

/** Un hallazgo cerrado nunca se marca como vencido: la acción ya se completó. */
export function situacionPlazo(
  estadoObservacion: string,
  fechaImplementacionCorreccion: FechaEntrada,
): SituacionPlazo {
  if (estadoObservacion === 'Cerrado') return 'cerrado';
  const dias = diasRestantes(fechaImplementacionCorreccion);
  if (dias === null) return 'sin-plazo';
  if (dias < 0) return 'vencido';
  if (dias <= DIAS_AVISO_VENCIMIENTO) return 'por-vencer';
  return 'en-plazo';
}

export type RegistroFiltrable = {
  codigoProyecto: string;
  gerenciaResponsable: string;
  responsable: string;
  estadoObservacion: string;
  fechaImplementacionCorreccion: FechaEntrada;
};

export function coincideBusqueda(registro: RegistroFiltrable, termino: string): boolean {
  const t = termino.trim().toLowerCase();
  if (!t) return true;
  return [registro.codigoProyecto, registro.gerenciaResponsable, registro.responsable].some((campo) =>
    campo.toLowerCase().includes(t),
  );
}

export function coincideVista(registro: RegistroFiltrable, vista: Vista): boolean {
  if (vista === 'Todos') return true;
  if (vista === 'Vencidos' || vista === 'Por Vencer') {
    const situacion = situacionPlazo(registro.estadoObservacion, registro.fechaImplementacionCorreccion);
    return vista === 'Vencidos' ? situacion === 'vencido' : situacion === 'por-vencer';
  }
  return registro.estadoObservacion === vista;
}

export function filtrarRegistros<T extends RegistroFiltrable>(
  registros: T[],
  { busqueda = '', vista = 'Todos' as Vista }: { busqueda?: string; vista?: Vista },
): T[] {
  return registros.filter((r) => coincideBusqueda(r, busqueda) && coincideVista(r, vista));
}
