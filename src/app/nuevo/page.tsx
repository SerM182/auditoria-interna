"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Calendar, Save } from 'lucide-react';

export default function NuevoRegistro() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    try {
      const res = await fetch("/api/auditorias", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        router.push("/");
      } else {
        alert("Error al guardar el registro.");
      }
    } catch (error) {
      console.error(error);
      alert("Error en el servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#F8F9FA] py-8 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto mb-4">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-[#0098B3] transition-colors">
          <ChevronLeft size={16} />
          Volver al Panel
        </Link>
      </div>

      <div className="max-w-4xl mx-auto bg-white rounded-2xl border border-slate-200 shadow-lg p-6 sm:p-8 border-t-4 border-t-[#0098B3]">
        <div className="mb-8 border-b border-slate-100 pb-5 flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-[#002B49]">Nuevo Anexo II</h1>
            <p className="text-slate-500 text-sm mt-1 font-medium">Completa los datos para el seguimiento de acciones correctivas.</p>
          </div>
          <span className="bg-slate-100 text-slate-600 text-xs font-bold px-3 py-1 rounded-full border border-slate-200">
            Borrador
          </span>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
          {/* Fila 1 */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">Código del Proyecto <span className="text-rose-500">*</span></label>
            <input required name="codigoProyecto" type="text" className="w-full bg-slate-50 border-slate-200 border rounded-lg p-2.5 focus:ring-2 focus:ring-[#0098B3]/30 focus:border-[#0098B3] outline-none transition-all text-sm font-medium hover:bg-white" placeholder="Ej: PROY-2024-001" />
          </div>
          <div className="relative">
            <label className="block text-sm font-bold text-slate-700 mb-1.5">Fecha <span className="text-rose-500">*</span></label>
            <div className="relative">
              <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input required name="fecha" type="date" className="w-full bg-slate-50 border-slate-200 border rounded-lg pl-10 pr-3 py-2.5 focus:ring-2 focus:ring-[#0098B3]/30 focus:border-[#0098B3] outline-none transition-all text-sm font-medium hover:bg-white" />
            </div>
          </div>

          {/* Fila 2 */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">N° de Hallazgos <span className="text-rose-500">*</span></label>
            <input required name="nHallazgos" type="number" min="0" className="w-full bg-slate-50 border-slate-200 border rounded-lg p-2.5 focus:ring-2 focus:ring-[#0098B3]/30 focus:border-[#0098B3] outline-none transition-all text-sm font-medium hover:bg-white" placeholder="0" />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">Gerencia Responsable del Hallazgo <span className="text-rose-500">*</span></label>
            <input required name="gerenciaResponsable" type="text" className="w-full bg-slate-50 border-slate-200 border rounded-lg p-2.5 focus:ring-2 focus:ring-[#0098B3]/30 focus:border-[#0098B3] outline-none transition-all text-sm font-medium hover:bg-white" placeholder="Ej: Comercial" />
          </div>

          {/* Fila 3 */}
          <div className="md:col-span-2">
            <label className="block text-sm font-bold text-slate-700 mb-1.5">Descripción del Hallazgo <span className="text-rose-500">*</span></label>
            <textarea required name="descripcionHallazgo" rows={3} className="w-full bg-slate-50 border-slate-200 border rounded-lg p-3 focus:ring-2 focus:ring-[#0098B3]/30 focus:border-[#0098B3] outline-none transition-all text-sm font-medium hover:bg-white resize-y" placeholder="Describe detalladamente el hallazgo..."></textarea>
          </div>

          {/* Fila 4 */}
          <div className="md:col-span-2">
            <label className="block text-sm font-bold text-slate-700 mb-1.5">Descripción de la Acción Correctiva <span className="text-rose-500">*</span></label>
            <textarea required name="descripcionAccionCorrectiva" rows={3} className="w-full bg-slate-50 border-slate-200 border rounded-lg p-3 focus:ring-2 focus:ring-[#0098B3]/30 focus:border-[#0098B3] outline-none transition-all text-sm font-medium hover:bg-white resize-y" placeholder="Medidas tomadas para la corrección..."></textarea>
          </div>
          
          <div className="md:col-span-2 border-t border-slate-100 pt-6 mt-2">
            <h3 className="text-base font-bold text-[#002B49] mb-4 flex items-center gap-2">
              <span className="w-1.5 h-4 bg-[#FDB813] rounded-full"></span>
              Seguimiento e Implementación
            </h3>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">Fecha de Implementación</label>
            <input name="fechaImplementacionCorreccion" type="date" className="w-full bg-slate-50 border-slate-200 border rounded-lg p-2.5 focus:ring-2 focus:ring-[#0098B3]/30 focus:border-[#0098B3] outline-none transition-all text-sm font-medium hover:bg-white" />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">Seguimientos de las Acciones</label>
            <input name="seguimientosAcciones" type="text" className="w-full bg-slate-50 border-slate-200 border rounded-lg p-2.5 focus:ring-2 focus:ring-[#0098B3]/30 focus:border-[#0098B3] outline-none transition-all text-sm font-medium hover:bg-white" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-bold text-slate-700 mb-1.5">Observaciones</label>
            <textarea name="observaciones" rows={2} className="w-full bg-slate-50 border-slate-200 border rounded-lg p-3 focus:ring-2 focus:ring-[#0098B3]/30 focus:border-[#0098B3] outline-none transition-all text-sm font-medium hover:bg-white resize-y"></textarea>
          </div>

          <div className="md:col-span-2 border-t border-slate-100 pt-6 mt-2">
            <h3 className="text-base font-bold text-[#002B49] mb-4 flex items-center gap-2">
              <span className="w-1.5 h-4 bg-[#0098B3] rounded-full"></span>
              Verificación y Eficacia
            </h3>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">Fecha de Verificación</label>
            <input name="fechaVerificacionImplementacion" type="date" className="w-full bg-slate-50 border-slate-200 border rounded-lg p-2.5 focus:ring-2 focus:ring-[#0098B3]/30 focus:border-[#0098B3] outline-none transition-all text-sm font-medium hover:bg-white" />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">Fecha de Eval. de Eficacia</label>
            <input name="fechaEvaluacionEficacia" type="date" className="w-full bg-slate-50 border-slate-200 border rounded-lg p-2.5 focus:ring-2 focus:ring-[#0098B3]/30 focus:border-[#0098B3] outline-none transition-all text-sm font-medium hover:bg-white" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-bold text-slate-700 mb-1.5">Evaluación de la Eficacia</label>
            <textarea name="evaluacionEficacia" rows={2} className="w-full bg-slate-50 border-slate-200 border rounded-lg p-3 focus:ring-2 focus:ring-[#0098B3]/30 focus:border-[#0098B3] outline-none transition-all text-sm font-medium hover:bg-white resize-y"></textarea>
          </div>
          
          <div className="md:col-span-2 border-t border-slate-100 pt-6 mt-2">
            <h3 className="text-base font-bold text-[#002B49] mb-4 flex items-center gap-2">
              <span className="w-1.5 h-4 bg-emerald-500 rounded-full"></span>
              Cierre
            </h3>
          </div>

          {/* Fila 5: Responsable y Estado */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">Responsable <span className="text-rose-500">*</span></label>
            <input required name="responsable" type="text" className="w-full bg-slate-50 border-slate-200 border rounded-lg p-2.5 focus:ring-2 focus:ring-[#0098B3]/30 focus:border-[#0098B3] outline-none transition-all text-sm font-medium hover:bg-white" />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">Estado de la Observación <span className="text-rose-500">*</span></label>
            <select required name="estadoObservacion" className="w-full bg-slate-50 border-slate-200 border rounded-lg p-2.5 focus:ring-2 focus:ring-[#0098B3]/30 focus:border-[#0098B3] outline-none transition-all text-sm font-medium hover:bg-white cursor-pointer">
              <option value="Pendiente">Pendiente</option>
              <option value="En Proceso">En Proceso</option>
              <option value="Cerrado">Cerrado</option>
            </select>
          </div>
          
          <div className="md:col-span-2 mt-4 flex justify-end gap-3 pt-6 border-t border-slate-100">
            <Link href="/" className="px-5 py-2.5 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-colors text-sm">
              Cancelar
            </Link>
            <button type="submit" disabled={loading} className="bg-[#0098B3] hover:bg-[#00839a] text-white px-6 py-2.5 rounded-lg font-semibold shadow-sm flex items-center gap-2 text-sm transition-colors disabled:opacity-70 disabled:cursor-not-allowed">
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  Guardando...
                </>
              ) : (
                <>
                  <Save size={16} />
                  Guardar Registro
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
