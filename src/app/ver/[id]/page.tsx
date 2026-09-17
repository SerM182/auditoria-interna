"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { ChevronLeft, Calendar, FileText, CheckCircle, Clock, Check, AlertCircle, Edit2, User } from 'lucide-react';

function formatDate(dateString: string | null) {
  if (!dateString) return "No especificada";
  const date = new Date(dateString);
  return date.toLocaleDateString("es-AR");
}

export default function VerRegistro({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  
  const [data, setData] = useState<any>(null);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    fetch(`/api/auditorias/${id}`)
      .then(res => res.json())
      .then(data => {
        setData(data);
        setLoadingData(false);
      })
      .catch(err => {
        console.error(err);
        alert("Error cargando el registro.");
        setLoadingData(false);
      });
  }, [id]);

  if (loadingData) {
    return (
      <div className="min-h-[calc(100vh-64px)] bg-[#F8F9FA] flex items-center justify-center">
        <div className="flex flex-col items-center text-slate-500">
          <svg className="animate-spin h-8 w-8 text-[#0098B3] mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
          <span className="font-medium">Cargando datos...</span>
        </div>
      </div>
    );
  }

  if (!data || data.error) {
    return (
      <div className="min-h-[calc(100vh-64px)] bg-[#F8F9FA] flex items-center justify-center">
        <div className="text-center font-bold text-rose-500">Registro no encontrado.</div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#F8F9FA] py-8 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto mb-4 flex justify-between items-center">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-[#0098B3] transition-colors">
          <ChevronLeft size={16} />
          Volver al Panel
        </Link>
        <Link href={`/editar/${data.id}`} className="inline-flex items-center gap-2 text-sm font-bold bg-amber-50 text-amber-700 border border-amber-200 px-4 py-2 rounded-lg hover:bg-amber-100 transition-colors">
          <Edit2 size={16} />
          Modificar este registro
        </Link>
      </div>

      <div className="max-w-5xl mx-auto bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden">
        {/* Header Superior */}
        <div className="bg-[#002B49] text-white p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
            <FileText size={120} />
          </div>
          <div className="relative z-10">
            <div className="flex gap-3 mb-3">
              <span className={`px-3 py-1 inline-flex text-xs font-bold rounded-full border bg-white/10 border-white/20`}>
                ID: {data.id}
              </span>
              <span className={`px-3 py-1 inline-flex text-xs font-bold rounded-full border
                ${data.estadoObservacion === 'Cerrado' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : 
                  data.estadoObservacion === 'En Proceso' ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' : 'bg-rose-500/20 text-rose-300 border-rose-500/30'}`}>
                {data.estadoObservacion}
              </span>
            </div>
            <h1 className="text-3xl font-black mb-2">{data.codigoProyecto}</h1>
            <p className="text-[#0098B3] font-medium text-lg flex items-center gap-2">
              Anexo II • Resumen de Acción Correctiva
            </p>
          </div>
        </div>

        <div className="p-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Columna Principal - Textos Largos */}
            <div className="lg:col-span-2 space-y-8">
              <div>
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#0098B3]"></span>
                  Descripción del Hallazgo
                </h3>
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-5 text-slate-700 whitespace-pre-wrap leading-relaxed shadow-inner">
                  {data.descripcionHallazgo}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#FDB813]"></span>
                  Descripción de la Acción Correctiva
                </h3>
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-5 text-slate-700 whitespace-pre-wrap leading-relaxed shadow-inner">
                  {data.descripcionAccionCorrectiva}
                </div>
              </div>

              {(data.seguimientosAcciones || data.observaciones) && (
                <div>
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
                    Seguimientos y Observaciones
                  </h3>
                  <div className="bg-slate-50 border border-slate-100 rounded-xl p-5 text-slate-700 shadow-inner space-y-4">
                    {data.seguimientosAcciones && (
                      <div>
                        <span className="font-bold text-slate-800 block mb-1">Seguimiento:</span>
                        <p className="whitespace-pre-wrap leading-relaxed">{data.seguimientosAcciones}</p>
                      </div>
                    )}
                    {data.observaciones && (
                      <div>
                        <span className="font-bold text-slate-800 block mb-1">Observaciones:</span>
                        <p className="whitespace-pre-wrap leading-relaxed">{data.observaciones}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {data.evaluacionEficacia && (
                <div>
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    Evaluación de la Eficacia
                  </h3>
                  <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-5 text-emerald-900 whitespace-pre-wrap leading-relaxed">
                    {data.evaluacionEficacia}
                  </div>
                </div>
              )}
            </div>

            {/* Columna Lateral - Meta Datos */}
            <div className="space-y-6">
              
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Datos Clave</h4>
                
                <div className="space-y-4">
                  <div>
                    <span className="text-xs font-semibold text-slate-500 block">N° de Hallazgos</span>
                    <span className="inline-flex items-center justify-center bg-[#e6f7fa] text-[#0098B3] px-3 py-1 rounded-md text-lg font-black mt-1">
                      {data.nHallazgos}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-slate-500 block mb-1">Gerencia Responsable</span>
                    <span className="text-sm font-bold text-slate-800">{data.gerenciaResponsable}</span>
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-slate-500 block mb-1">Responsable Final</span>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-[10px] font-bold">
                        {data.responsable.substring(0, 2).toUpperCase()}
                      </div>
                      <span className="text-sm font-bold text-slate-800">{data.responsable}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Línea de Tiempo</h4>
                
                <div className="space-y-4 relative before:absolute before:inset-0 before:ml-2.5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
                  
                  <div className="relative flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-[#0098B3] flex items-center justify-center shadow z-10">
                      <Calendar size={10} className="text-white" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Fecha Inicial</span>
                      <p className="text-sm font-bold text-slate-700">{formatDate(data.fecha)}</p>
                    </div>
                  </div>

                  {data.fechaImplementacionCorreccion && (
                    <div className="relative flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full bg-[#FDB813] flex items-center justify-center shadow z-10">
                        <Clock size={10} className="text-white" />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Implementación</span>
                        <p className="text-sm font-bold text-slate-700">{formatDate(data.fechaImplementacionCorreccion)}</p>
                      </div>
                    </div>
                  )}

                  {data.fechaVerificacionImplementacion && (
                    <div className="relative flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full bg-indigo-400 flex items-center justify-center shadow z-10">
                        <CheckCircle size={10} className="text-white" />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Verificación</span>
                        <p className="text-sm font-bold text-slate-700">{formatDate(data.fechaVerificacionImplementacion)}</p>
                      </div>
                    </div>
                  )}

                  {data.fechaEvaluacionEficacia && (
                    <div className="relative flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center shadow z-10">
                        <Check size={10} className="text-white" />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Eval. Eficacia</span>
                        <p className="text-sm font-bold text-slate-700">{formatDate(data.fechaEvaluacionEficacia)}</p>
                      </div>
                    </div>
                  )}

                </div>
              </div>

            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
