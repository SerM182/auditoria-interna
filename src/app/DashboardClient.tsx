"use client";

import { useState } from "react";
import Link from "next/link";

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

  return (
    <div className="max-w-7xl mx-auto p-6 md:p-8">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Panel de Seguimiento</h1>
          <p className="text-gray-500 mt-1">Anexo II - Acciones Correctivas</p>
        </div>
        <Link href="/nuevo" className="bg-[#00a2b9] text-white px-6 py-2.5 rounded-md font-medium hover:bg-[#008b9e] transition-colors shadow-sm flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
          Nuevo Registro
        </Link>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Buscar</label>
          <input 
            type="text" 
            placeholder="Buscar por código, gerencia o responsable..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full border-gray-300 border rounded-md p-2.5 focus:ring-2 focus:ring-[#00a2b9] focus:border-[#00a2b9] outline-none transition-all text-sm"
          />
        </div>
        <div className="sm:w-64">
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Filtrar por Estado</label>
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full border-gray-300 border rounded-md p-2.5 focus:ring-2 focus:ring-[#00a2b9] focus:border-[#00a2b9] outline-none transition-all text-sm bg-white"
          >
            <option value="Todos">Todos los estados</option>
            <option value="Pendiente">Pendiente</option>
            <option value="En Proceso">En Proceso</option>
            <option value="Cerrado">Cerrado</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Código de Proyecto</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider text-center">N° Hallazgos</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Fecha</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Gerencia Responsable</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Responsable</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Estado</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {filteredRegistros.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500 bg-gray-50/50">
                    <svg className="mx-auto h-12 w-12 text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className="text-lg font-medium text-gray-900">No hay registros</p>
                    <p className="text-sm">Prueba ajustando los filtros o crea un nuevo registro.</p>
                  </td>
                </tr>
              ) : (
                filteredRegistros.map((reg) => (
                  <tr key={reg.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">{reg.codigoProyecto}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-[#00a2b9] text-center">{reg.nHallazgos}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{new Date(reg.fecha).toLocaleDateString('es-AR')}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{reg.gerenciaResponsable}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{reg.responsable}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full border
                        ${reg.estadoObservacion === 'Cerrado' ? 'bg-green-50 text-green-700 border-green-200' : 
                          reg.estadoObservacion === 'En Proceso' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                        {reg.estadoObservacion}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <Link href={`/editar/${reg.id}`} className="text-yellow-600 hover:text-yellow-800 font-bold hover:underline">
                        Modificar
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
