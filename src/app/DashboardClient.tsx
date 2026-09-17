"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, Plus, Calendar, Edit2, FileText, CheckCircle, AlertCircle, Clock } from 'lucide-react';

export default function DashboardClient({ registros }: { registros: any[] }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("Todos");

  const filteredRegistros = registros.filter((reg) => {
    const matchesSearch = 
      reg.codigoProyecto.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reg.gerenciaResponsable.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reg.responsable.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesStatus = statusFilter === "Todos" || reg.estadoObservacion === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const total = registros.length;
  const pendientes = registros.filter(r => r.estadoObservacion === 'Pendiente').length;
  const enProceso = registros.filter(r => r.estadoObservacion === 'En Proceso').length;
  const cerrados = registros.filter(r => r.estadoObservacion === 'Cerrado').length;

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
        <Link href="/nuevo" className="bg-[#0098B3] hover:bg-[#00839a] text-white px-4 py-2.5 rounded-lg shadow-sm font-semibold transition-colors flex items-center gap-2">
          <Plus size={18} />
          Nuevo Registro
        </Link>
      </div>

      {/* Tarjetas de Resumen KPI */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 flex items-center gap-4">
          <div className="p-3 bg-slate-50 text-slate-600 rounded-lg border border-slate-100">
            <FileText size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Registros</p>
            <p className="text-2xl font-black text-slate-800">{total}</p>
          </div>
        </div>
        <div className="bg-rose-50 rounded-xl border border-rose-100 shadow-xs p-5 flex items-center gap-4">
          <div className="p-3 bg-white text-rose-600 rounded-lg shadow-sm">
            <AlertCircle size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-rose-600/80 uppercase tracking-wider">Pendientes</p>
            <p className="text-2xl font-black text-rose-600">{pendientes}</p>
          </div>
        </div>
        <div className="bg-amber-50 rounded-xl border border-amber-100 shadow-xs p-5 flex items-center gap-4">
          <div className="p-3 bg-white text-amber-600 rounded-lg shadow-sm">
            <Clock size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-amber-600/80 uppercase tracking-wider">En Proceso</p>
            <p className="text-2xl font-black text-amber-600">{enProceso}</p>
          </div>
        </div>
        <div className="bg-emerald-50 rounded-xl border border-emerald-100 shadow-xs p-5 flex items-center gap-4">
          <div className="p-3 bg-white text-emerald-600 rounded-lg shadow-sm">
            <CheckCircle size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-emerald-600/80 uppercase tracking-wider">Cerrados / Resueltos</p>
            <p className="text-2xl font-black text-emerald-600">{cerrados}</p>
          </div>
        </div>
      </div>

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
        <div className="w-full sm:w-64">
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full border-slate-200 border rounded-lg p-2.5 focus:ring-2 focus:ring-[#0098B3]/30 focus:border-[#0098B3] outline-none transition-all text-sm bg-slate-50 hover:bg-white cursor-pointer"
          >
            <option value="Todos">Filtrar por estado...</option>
            <option value="Pendiente">Pendiente</option>
            <option value="En Proceso">En Proceso</option>
            <option value="Cerrado">Cerrado</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100">
            <thead>
              <tr className="bg-slate-50/75">
                <th className="px-5 py-3 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider">Código de Proyecto</th>
                <th className="px-5 py-3 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider text-center">N° Hallazgos</th>
                <th className="px-5 py-3 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider">Fecha</th>
                <th className="px-5 py-3 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider">Gerencia Responsable</th>
                <th className="px-5 py-3 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider">Responsable</th>
                <th className="px-5 py-3 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider">Estado</th>
                <th className="px-5 py-3 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-100">
              {filteredRegistros.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center text-slate-500">
                    <Search className="mx-auto h-10 w-10 text-slate-300 mb-3" />
                    <p className="text-lg font-medium text-slate-700">No hay registros</p>
                    <p className="text-sm mt-1">Prueba ajustando los filtros o crea un nuevo registro.</p>
                  </td>
                </tr>
              ) : (
                filteredRegistros.map((reg) => (
                  <tr key={reg.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-5 py-4 whitespace-nowrap">
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
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="bg-slate-50 px-5 py-3 border-t border-slate-100 flex justify-between items-center text-xs text-slate-500 font-medium">
          <span>Mostrando 1 a {filteredRegistros.length} de {registros.length} registros</span>
          <div className="flex gap-2">
            <button className="px-3 py-1.5 border border-slate-200 rounded-md bg-white hover:bg-slate-50 disabled:opacity-50" disabled>Anterior</button>
            <button className="px-3 py-1.5 border border-slate-200 rounded-md bg-white hover:bg-slate-50 disabled:opacity-50" disabled>Siguiente</button>
          </div>
        </div>
      </div>
    </div>
  );
}
