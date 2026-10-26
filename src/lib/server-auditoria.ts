import { prisma } from './prisma';

export function extractValue(val: any): any {
  if (Array.isArray(val) && val.length > 0) {
    return extractValue(val[0]);
  }
  if (typeof val === 'object' && val !== null) {
    return val.Value ?? val.value ?? val.Title ?? "";
  }
  return val;
}

export function normalizeText(text: any): string {
  if (!text) return "";
  return String(text)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "");
}

export function matchesRole(registro: any, role?: string, userEmail?: string): boolean {
  if (!role || role === 'admin' || role === 'gerente') return true;

  const normEquipo = normalizeText(registro.equipo);
  const normGerencia = normalizeText(registro.gerenciaResponsable);
  const normResp = normalizeText(registro.responsable);
  const normEmail = String(userEmail || '').toLowerCase();

  // 1. Si el usuario logueado es el responsable directo del hallazgo (por email o por nombre), siempre lo ve
  if (normEmail) {
    const userPrefix = normEmail.split('@')[0];
    const userParts = userPrefix.split(/[._-]/).map(normalizeText).filter((p: string) => p.length >= 3);
    for (const part of userParts) {
      if (normResp.includes(part) || part.includes(normResp)) return true;
    }
  }

  const normCodigo = normalizeText(registro.codigoProyecto);

  // Integrantes reconocidos de cada departamento
  const isPersonInterna = ['monica', 'mol', 'natalia', 'daniel'].some(name => normResp.includes(name));
  const isPersonOperaciones = ['german', 'maria', 'mary', 'brullo'].some(name => normResp.includes(name));

  // 2. Departamento de Auditoría Interna (Daniel, Natalia, Mónica, etc.)
  if (role === 'auditoria_interna') {
    // Si fue cargado/asignado a Daniel, Natalia o Mónica
    if (isPersonInterna) return true;

    // Coincide por equipo
    if (normEquipo.includes('interna') || (normEquipo.includes('auditoria') && !normEquipo.includes('operacion'))) return true;
    
    // Coincide por código de proyecto (ej. DAI Nº ...)
    if (normCodigo.includes('dai') || normCodigo.includes('interna')) return true;

    // Coincide por Gerencia Responsable (ej. "Gerencia de Auditoria y Control de Gestión")
    if (
      normGerencia.includes('interna') ||
      normGerencia.includes('controldegestion') ||
      normGerencia.includes('gestion') ||
      (normGerencia.includes('auditoria') && !normGerencia.includes('operacion'))
    ) {
      return true;
    }

    // Si no tiene equipo asignado, pero fue creado por alguien del área
    if (!normEquipo) {
      if (registro.creadoPor && String(registro.creadoPor).toLowerCase().includes('interna')) return true;
    }
    return false;
  }

  // 3. Departamento de Auditoría de Operaciones (Germán, María / Brullo, etc.)
  if (role === 'auditoria_operaciones') {
    // Si fue cargado/asignado a Germán o María (Brullo)
    if (isPersonOperaciones) return true;

    // Coincide por equipo
    if (normEquipo.includes('operacion') || normEquipo.includes('operaciones')) return true;
    
    // Coincide por código de proyecto (ej. DCO, DAO, Operaciones)
    if (normCodigo.includes('dco') || normCodigo.includes('dao') || normCodigo.includes('operacion') || normCodigo.includes('obras')) return true;

    // Coincide por gerencia
    if (normGerencia.includes('operacion') || normGerencia.includes('operaciones')) return true;

    // Si no tiene equipo asignado
    if (!normEquipo) {
      if (registro.creadoPor && String(registro.creadoPor).toLowerCase().includes('operacion')) return true;
    }
    return false;
  }

  return true;
}

export async function fetchAuditoriasList(): Promise<any[]> {
  const urlPA = process.env.POWER_AUTOMATE_GET_URL;

  if (urlPA) {
    try {
      const res = await fetch(urlPA, { cache: 'no-store' });
      if (res.ok) {
        let sharepointData = await res.json();
        if (!Array.isArray(sharepointData) && sharepointData.value) {
          sharepointData = sharepointData.value;
        }

        const registros = sharepointData.map((item: any) => {
          // Búsqueda inteligente del campo equipo en caso de que SharePoint haya variado el nombre interno
          let equipoFound = "";
          for (const key of Object.keys(item)) {
            if (key.toLowerCase().includes("equipo")) {
              const val = extractValue(item[key]);
              if (val) {
                equipoFound = String(val);
                break;
              }
            }
          }

          if (!equipoFound) {
            equipoFound = extractValue(item.field_15 || item.field_16 || item.OData__x0045_quipo || "");
          }

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
            equipo: equipoFound,
            creadoPor: item.Author?.Email || item.Author?.Title || item.Editor?.Email || "",
          };
        });

        registros.sort((a: any, b: any) => b.id - a.id);
        return registros;
      }
    } catch (err) {
      console.error("Error fetching from Power Automate:", err);
    }
  }

  // Fallback a Prisma
  const fromPrisma = await prisma.auditoria.findMany({
    orderBy: { createdAt: 'desc' },
  });

  return fromPrisma.map((a: any) => ({
    ...a,
    equipo: (a as any).equipo || "",
  }));
}
