"use client"

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Search,
  Plus,
  Calendar,
  Edit2,
  FileText,
  CheckCircle,
  AlertCircle,
  Clock,
  Trash2,
  Download,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  X,
  PieChart,
  AlarmClock,
  CalendarClock,
  Minus,
} from 'lucide-react';
import {
  DIAS_AVISO_VENCIMIENTO,
  VISTAS,
  coincideBusqueda,
  coincideVista,
  diasRestantes,
  situacionPlazo,
  type SituacionPlazo,
  type Vista,
} from "@/lib/auditoria";

type Registro = {
  id: number;
  codigoProyecto: string;
  fecha: string | Date;
  nHallazgos: number;
  gerenciaResponsable: string;
  responsable: string;
  estadoObservacion: string;
  fechaImplementacionCorreccion: string | Date | null;
  createdAt: string | Date;
};

type SortKey = 'codigoProyecto' | 'nHallazgos' | 'fecha' | 'gerenciaResponsable' | 'responsable' | 'estadoObservacion' | 'plazo';
type SortDir = 'asc' | 'desc';

const ESTADO_COLORS: Record<string, string> = {
  'Pendiente': '#e11d48',
  'En Proceso': '#d97706',
  'Cerrado': '#059669',
};

const SORT_LABELS: Record<SortKey, string> = {
  codigoProyecto: 'Código',
  nHallazgos: 'N° Hallazgos',
  fecha: 'Fecha',
  gerenciaResponsable: 'Gerencia',
  responsable: 'Responsable',
  estadoObservacion: 'Estado',
  plazo: 'Plazo',
};

/** Orden de urgencia para ordenar por plazo: primero lo que ya venció. */
const PRIORIDAD_PLAZO: Record<SituacionPlazo, number> = {
  vencido: 0,
  'por-vencer': 1,
  'en-plazo': 2,
  'sin-plazo': 3,
  cerrado: 4,
};

export default function DashboardClient({ registros }: { registros: Registro[] }) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [vista, setVista] = useState<Vista>("Todos");
  const [sortKey, setSortKey] = useState<SortKey>('fecha');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [deleteTarget, setDeleteTarget] = useState<Registro | null>(null);
  const [deleting, setDeleting] = useState(false);

  const filteredRegistros = useMemo(() => {
    const filtered = registros.filter(
      (reg) => coincideBusqueda(reg, searchTerm) && coincideVista(reg, vista),
    );

    const sorted = [...filtered].sort((a, b) => {
      let cmp = 0;
      if (sortKey === 'nHallazgos') {
        cmp = a.nHallazgos - b.nHallazgos;
      } else if (sortKey === 'fecha') {
        cmp = new Date(a.fecha).getTime() - new Date(b.fecha).getTime();
      } else if (sortKey === 'plazo') {
        const pa = PRIORIDAD_PLAZO[situacionPlazo(a.estadoObservacion, a.fechaImplementacionCorreccion)];
        const pb = PRIORIDAD_PLAZO[situacionPlazo(b.estadoObservacion, b.fechaImplementacionCorreccion)];
        // Dentro de la misma situación, el vencimiento más próximo va primero.
        cmp =
          pa - pb ||
          (diasRestantes(a.fechaImplementacionCorreccion) ?? Infinity) -
            (diasRestantes(b.fechaImplementacionCorreccion) ?? Infinity);
      } else {
        cmp = String(a[sortKey]).localeCompare(String(b[sortKey]), 'es');
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });

    return sorted;
  }, [registros, searchTerm, vista, sortKey, sortDir]);

  const total = registros.length;
  const pendientes = registros.filter(r => r.estadoObservacion === 'Pendiente').length;
  const enProceso = registros.filter(r => r.estadoObservacion === 'En Proceso').length;
  const cerrados = registros.filter(r => r.estadoObservacion === 'Cerrado').length;

  const situaciones = useMemo(
    () => registros.map((r) => situacionPlazo(r.estadoObservacion, r.fechaImplementacionCorreccion)),
    [registros],
  );
  const vencidos = situaciones.filter((s) => s === 'vencido').length;
  const porVencer = situaciones.filter((s) => s === 'por-vencer').length;

  // La exportación arrastra los filtros activos: se descarga lo que se ve.
  const exportHref = useMemo(() => {
    const params = new URLSearchParams();
    if (searchTerm.trim()) params.set('q', searchTerm.trim());
    if (vista !== 'Todos') params.set('vista', vista);
    const qs = params.toString();
    return qs ? `/api/auditorias/export?${qs}` : '/api/auditorias/export';
  }, [searchTerm, vista]);

  const hayFiltros = searchTerm.trim() !== '' || vista !== 'Todos';

  const limpiarFiltros = () => {
    setSearchTerm('');
    setVista('Todos');
  };

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/auditorias/${deleteTarget.id}`, { method: 'DELETE' });
      if (res.ok) {
        setDeleteTarget(null);
        router.refresh();
      } else {
        alert('Error al eliminar el registro.');
      }
    } catch (error) {
      console.error(error);
      alert('Error en el servidor.');
    } finally {
      setDeleting(false);
    }
  };

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (sortKey !== col) return <ArrowUpDown size={12} className="text-slate-300" />;
    return sortDir === 'asc'
      ? <ArrowUp size={12} className="text-[#0098B3]" />
      : <ArrowDown size={12} className="text-[#0098B3]" />;
  };

  const Th = ({ col, children, center }: { col: SortKey; children: React.ReactNode; center?: boolean }) => (
    <th className={`px-5 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider ${center ? 'text-center' : 'text-left'}`}>
      <button
        onClick={() => handleSort(col)}
        className={`inline-flex items-center gap-1.5 hover:text-[#0098B3] transition-colors ${center ? 'justify-center' : ''}`}
      >
        {children}
        <SortIcon col={col} />
      </button>
    </th>
  );

  /** Tarjeta de KPI que además funciona como filtro rápido. */
  const KpiCard = ({
    icon, label, value, filtro, tone,
  }: {
    icon: React.ReactNode;
    label: string;
    value: number;
    filtro: Vista;
    tone: { card: string; iconBox: string; label: string; value: string; ring: string };
  }) => {
    const activo = vista === filtro;
    return (
      <button
        type="button"
        onClick={() => setVista(activo ? 'Todos' : filtro)}
        aria-pressed={activo}
        title={activo ? 'Quitar filtro' : `Filtrar por ${label}`}
        className={`${tone.card} rounded-xl border shadow-xs p-5 flex items-center gap-4 text-left transition-all hover:shadow-md hover:-translate-y-0.5 ${activo ? `ring-2 ${tone.ring}` : ''}`}
      >
        <div className={`p-3 rounded-lg ${tone.iconBox}`}>{icon}</div>
        <div>
          <p className={`text-xs font-bold uppercase tracking-wider ${tone.label}`}>{label}</p>
          <p className={`text-2xl font-black ${tone.value}`}>{value}</p>
        </div>
      </button>
    );
  };

  /** Celda de plazo: convierte la fecha de implementación en una señal accionable. */
  const CeldaPlazo = ({ reg }: { reg: Registro }) => {
    const situacion = situacionPlazo(reg.estadoObservacion, reg.fechaImplementacionCorreccion);
    const dias = diasRestantes(reg.fechaImplementacionCorreccion);
    const fechaTexto = reg.fechaImplementacionCorreccion
      ? new Date(reg.fechaImplementacionCorreccion).toLocaleDateString('es-AR', { timeZone: 'UTC' })
      : null;

    if (situacion === 'sin-plazo') {
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400">
          <Minus size={12} />
          Sin plazo
        </span>
      );
    }

    if (situacion === 'cerrado') {
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500">
          <CheckCircle size={12} className="text-emerald-500" />
          {fechaTexto ?? 'Cerrado'}
        </span>
      );
    }

    if (situacion === 'vencido') {
      const atraso = Math.abs(dias ?? 0);
      return (
        <div className="flex flex-col gap-0.5">
          <span className="inline-flex items-center gap-1.5 bg-rose-100 text-rose-700 border border-rose-200 px-2 py-0.5 rounded-md text-[11px] font-bold w-fit">
            <AlarmClock size={12} />
            Vencido hace {atraso} {atraso === 1 ? 'día' : 'días'}
          </span>
          <span className="text-[10px] text-slate-400 font-medium">{fechaTexto}</span>
        </div>
      );
    }

    if (situacion === 'por-vencer') {
      return (
        <div className="flex flex-col gap-0.5">
          <span className="inline-flex items-center gap-1.5 bg-amber-100 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-md text-[11px] font-bold w-fit">
            <CalendarClock size={12} />
            {dias === 0 ? 'Vence hoy' : `Vence en ${dias} ${dias === 1 ? 'día' : 'días'}`}
          </span>
          <span className="text-[10px] text-slate-400 font-medium">{fechaTexto}</span>
        </div>
      );
    }

    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600">
        <Calendar size={12} className="text-slate-400" />
        {fechaTexto}
      </span>
    );
  };

  const chartData = [
    { label: 'Pendiente', value: pendientes, color: ESTADO_COLORS['Pendiente'] },
    { label: 'En Proceso', value: enProceso, color: ESTADO_COLORS['En Proceso'] },
    { label: 'Cerrado', value: cerrados, color: ESTADO_COLORS['Cerrado'] },
  ];
  const totalChart = total || 1;
  let acc = 0;
  const gradientStops = chartData
    .map((d) => {
      const start = (acc / totalChart) * 100;
      acc += d.value;
      const end = (acc / totalChart) * 100;
      return `${d.color} ${start}% ${end}%`;
    })
    .join(', ');

  return (
    <div className="max-w-7xl mx-auto p-6 md:p-8 bg-[#F8F9FA] min-h-[calc(100vh-64px)]">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-[#002B49]">Panel de Seguimiento</h1>
            <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              En vivo
            </span>
          </div>
          <p className="text-slate-500 mt-1 font-medium">Anexo II • Acciones Correctivas de Auditoría</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <a
            href={exportHref}
            className="bg-white border border-slate-200 hover:border-[#0098B3]/50 hover:bg-[#e6f7fa] text-slate-700 hover:text-[#0098B3] px-4 py-2.5 rounded-lg shadow-sm font-semibold transition-colors flex items-center gap-2"
            title={hayFiltros ? 'Exporta únicamente los registros que estás viendo' : 'Exporta todos los registros'}
          >
            <Download size={18} />
            Exportar Excel
            {hayFiltros && (
              <span className="bg-[#0098B3] text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                {filteredRegistros.length}
              </span>
            )}
          </a>
          <Link href="/nuevo" className="bg-[#0098B3] hover:bg-[#00839a] text-white px-4 py-2.5 rounded-lg shadow-sm font-semibold transition-colors flex items-center gap-2">
            <Plus size={18} />
            Nuevo Registro
          </Link>
        </div>
      </div>

      {/* Alerta de vencimientos: lo primero que tiene que ver un auditor al entrar */}
      {vencidos > 0 && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 mb-6 flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="p-2 bg-white text-rose-600 rounded-lg shadow-sm shrink-0 w-fit">
            <AlarmClock size={20} />
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-rose-800">
              {vencidos === 1
                ? 'Hay 1 acción correctiva con el plazo vencido'
                : `Hay ${vencidos} acciones correctivas con el plazo vencido`}
            </p>
            <p className="text-xs text-rose-600/90 font-medium mt-0.5">
              La fecha de implementación ya pasó y la observación sigue abierta.
              {porVencer > 0 && ` Otras ${porVencer} vencen en los próximos ${DIAS_AVISO_VENCIMIENTO} días.`}
            </p>
          </div>
          <button
            onClick={() => setVista('Vencidos')}
            className="bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm transition-colors shrink-0 w-fit"
          >
            Ver vencidas
          </button>
        </div>
      )}

      {/* Tarjetas de Resumen KPI (funcionan como filtro rápido) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-6">
        <KpiCard
          icon={<FileText size={24} />}
          label="Total Registros"
          value={total}
          filtro="Todos"
          tone={{ card: 'bg-white border-slate-200', iconBox: 'bg-slate-50 text-slate-600 border border-slate-100', label: 'text-slate-500', value: 'text-slate-800', ring: 'ring-slate-300' }}
        />
        <KpiCard
          icon={<AlertCircle size={24} />}
          label="Pendientes"
          value={pendientes}
          filtro="Pendiente"
          tone={{ card: 'bg-rose-50 border-rose-100', iconBox: 'bg-white text-rose-600 shadow-sm', label: 'text-rose-600/80', value: 'text-rose-600', ring: 'ring-rose-300' }}
        />
        <KpiCard
          icon={<Clock size={24} />}
          label="En Proceso"
          value={enProceso}
          filtro="En Proceso"
          tone={{ card: 'bg-amber-50 border-amber-100', iconBox: 'bg-white text-amber-600 shadow-sm', label: 'text-amber-600/80', value: 'text-amber-600', ring: 'ring-amber-300' }}
        />
        <KpiCard
          icon={<CheckCircle size={24} />}
          label="Cerrados / Resueltos"
          value={cerrados}
          filtro="Cerrado"
          tone={{ card: 'bg-emerald-50 border-emerald-100', iconBox: 'bg-white text-emerald-600 shadow-sm', label: 'text-emerald-600/80', value: 'text-emerald-600', ring: 'ring-emerald-300' }}
        />
        <KpiCard
          icon={<AlarmClock size={24} />}
          label="Plazo Vencido"
          value={vencidos}
          filtro="Vencidos"
          tone={{
            card: vencidos > 0 ? 'bg-[#002B49] border-[#002B49]' : 'bg-white border-slate-200',
            iconBox: vencidos > 0 ? 'bg-white/10 text-rose-300' : 'bg-slate-50 text-slate-400 border border-slate-100',
            label: vencidos > 0 ? 'text-white/70' : 'text-slate-500',
            value: vencidos > 0 ? 'text-rose-300' : 'text-slate-800',
            ring: 'ring-[#0098B3]',
          }}
        />
      </div>

      {total > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 mb-6">
          <div className="flex items-center gap-2 mb-5">
            <PieChart size={18} className="text-[#0098B3]" />
            <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Distribución por Estado</h2>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-8">
            <div
              className="w-40 h-40 rounded-full shrink-0 relative"
              style={{ background: `conic-gradient(${gradientStops})` }}
            >
              <div className="absolute inset-[18%] rounded-full bg-white flex flex-col items-center justify-center shadow-inner">
                <span className="text-2xl font-black text-slate-800">{total}</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total</span>
              </div>
            </div>
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
              {chartData.map((d) => (
                <div key={d.label} className="flex items-center gap-3 bg-slate-50 rounded-lg border border-slate-100 p-3">
                  <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: d.color }}></span>
                  <div>
                    <p className="text-xs font-semibold text-slate-500">{d.label}</p>
                    <p className="text-lg font-black text-slate-800">
                      {d.value}
                      <span className="text-xs font-semibold text-slate-400 ml-1">
                        ({Math.round((d.value / totalChart) * 100)}%)
                      </span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="bg-white p-4 rounded-xl shadow-xs border border-slate-200 mb-6 flex flex-col sm:flex-row gap-4 items-center">
        <div className="flex-1 w-full relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por código, gerencia o responsable..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full border-slate-200 border rounded-lg pl-10 py-2.5 focus:ring-2 focus:ring-[#0098B3]/30 focus:border-[#0098B3] outline-none transition-all text-sm bg-slate-50 hover:bg-white"
          />
        </div>
        <div className="w-full sm:w-72">
          <select
            value={vista}
            onChange={(e) => setVista(e.target.value as Vista)}
            className="w-full border-slate-200 border rounded-lg p-2.5 focus:ring-2 focus:ring-[#0098B3]/30 focus:border-[#0098B3] outline-none transition-all text-sm bg-slate-50 hover:bg-white cursor-pointer"
          >
            <option value="Todos">Todos los registros</option>
            <optgroup label="Estado de la observación">
              {VISTAS.filter((v) => v.grupo === 'Estado').map((v) => (
                <option key={v.value} value={v.value}>{v.label}</option>
              ))}
            </optgroup>
            <optgroup label="Vencimiento del plazo">
              {VISTAS.filter((v) => v.grupo === 'Vencimiento').map((v) => (
                <option key={v.value} value={v.value}>{v.label}</option>
              ))}
            </optgroup>
          </select>
        </div>
        {hayFiltros && (
          <button
            onClick={limpiarFiltros}
            className="w-full sm:w-auto shrink-0 inline-flex items-center justify-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-[#0098B3] border border-slate-200 hover:border-[#0098B3]/50 rounded-lg px-3 py-2.5 transition-colors"
          >
            <X size={14} />
            Limpiar
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100">
            <thead>
              <tr className="bg-slate-50/75">
                <Th col="codigoProyecto">Código de Proyecto</Th>
                <Th col="nHallazgos" center>N° Hallazgos</Th>
                <Th col="fecha">Fecha</Th>
                <Th col="gerenciaResponsable">Gerencia Responsable</Th>
                <Th col="responsable">Responsable</Th>
                <Th col="plazo">Plazo</Th>
                <Th col="estadoObservacion">Estado</Th>
                <th className="px-5 py-3 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-100">
              {filteredRegistros.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-16 text-center text-slate-500">
                    <Search className="mx-auto h-10 w-10 text-slate-300 mb-3" />
                    <p className="text-lg font-medium text-slate-700">No hay registros</p>
                    <p className="text-sm mt-1">Prueba ajustando los filtros o crea un nuevo registro.</p>
                  </td>
                </tr>
              ) : (
                filteredRegistros.map((reg) => {
                  const vencido =
                    situacionPlazo(reg.estadoObservacion, reg.fechaImplementacionCorreccion) === 'vencido';
                  return (
                    <tr
                      key={reg.id}
                      className={`transition-colors group ${vencido ? 'bg-rose-50/40 hover:bg-rose-50/70' : 'hover:bg-slate-50/50'}`}
                    >
                      <td className={`px-5 py-4 whitespace-nowrap ${vencido ? 'border-l-2 border-l-rose-400' : ''}`}>
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${
                            reg.estadoObservacion === 'Cerrado' ? 'bg-emerald-500' :
                            reg.estadoObservacion === 'En Proceso' ? 'bg-amber-500' : 'bg-rose-500'
                          }`}></span>
                          <div>
                            <p className="text-sm font-bold text-slate-800">{reg.codigoProyecto}</p>
                            <p className="text-[10px] text-slate-400 uppercase tracking-wider">ID: {reg.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap text-center">
                        <span className="inline-flex items-center justify-center bg-[#e6f7fa] text-[#0098B3] px-2.5 py-1 rounded-md text-sm font-bold border border-[#0098B3]/20">
                          {reg.nHallazgos}
                        </span>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2 text-sm text-slate-600 font-medium">
                          <Calendar size={14} className="text-slate-400" />
                          {new Date(reg.fecha).toLocaleDateString('es-AR')}
                        </div>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap text-sm text-slate-600 font-medium">{reg.gerenciaResponsable}</td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-[10px] font-bold">
                            {reg.responsable.substring(0, 2).toUpperCase()}
                          </div>
                          <span className="text-sm text-slate-700 font-medium">{reg.responsable}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <CeldaPlazo reg={reg} />
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 inline-flex text-xs font-semibold rounded-full border
                          ${reg.estadoObservacion === 'Cerrado' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                            reg.estadoObservacion === 'En Proceso' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-rose-50 text-rose-600 border-rose-200'}`}>
                          {reg.estadoObservacion}
                        </span>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap text-sm">
                        <div className="flex gap-2">
                          <Link href={`/ver/${reg.id}`} className="inline-flex items-center gap-1.5 border border-[#0098B3]/30 bg-[#e6f7fa] text-[#0098B3] hover:bg-[#0098B3]/20 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors">
                            <FileText size={12} />
                            Ver
                          </Link>
                          <Link href={`/editar/${reg.id}`} className="inline-flex items-center gap-1.5 border border-amber-300 bg-amber-50/60 text-amber-800 hover:bg-amber-100 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors">
                            <Edit2 size={12} />
                            Modificar
                          </Link>
                          <button
                            onClick={() => setDeleteTarget(reg)}
                            className="inline-flex items-center gap-1.5 border border-rose-300 bg-rose-50/60 text-rose-700 hover:bg-rose-100 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors"
                          >
                            <Trash2 size={12} />
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        <div className="bg-slate-50 px-5 py-3 border-t border-slate-100 flex justify-between items-center text-xs text-slate-500 font-medium">
          <span>Mostrando {filteredRegistros.length} de {registros.length} registros</span>
          <span className="text-slate-400">
            Ordenado por {SORT_LABELS[sortKey]} ({sortDir === 'asc' ? '↑' : '↓'})
          </span>
        </div>
      </div>

      {deleteTarget && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border-t-4 border-t-rose-500">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-rose-50 text-rose-600 rounded-lg">
                  <Trash2 size={22} />
                </div>
                <h3 className="text-lg font-bold text-slate-800">Eliminar registro</h3>
              </div>
              <button
                onClick={() => setDeleteTarget(null)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <p className="text-slate-600 text-sm mb-1">
              ¿Estás seguro de que querés eliminar el registro del proyecto
            </p>
            <p className="text-slate-800 font-bold mb-4">
              {deleteTarget.codigoProyecto} <span className="text-slate-400 font-normal">(ID: {deleteTarget.id})</span>?
            </p>
            <p className="text-rose-600 text-xs font-semibold bg-rose-50 border border-rose-100 rounded-lg p-3 mb-6">
              ⚠️ Esta acción no se puede deshacer.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
                className="px-5 py-2.5 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-colors text-sm disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="bg-rose-600 hover:bg-rose-700 text-white px-5 py-2.5 rounded-lg font-semibold shadow-sm flex items-center gap-2 text-sm transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {deleting ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    Eliminando...
                  </>
                ) : (
                  <>
                    <Trash2 size={16} />
                    Sí, eliminar
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
