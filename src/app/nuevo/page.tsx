"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

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
    <div className="max-w-4xl mx-auto p-6 md:p-8">
      
      <div className="mb-6 flex items-center gap-4">
        <Link href="/" className="text-gray-500 hover:text-[#00a2b9] transition-colors flex items-center gap-1 text-sm font-medium">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          Volver al Panel
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-gray-50 border-b border-gray-100 px-8 py-5">
          <h1 className="text-2xl font-bold text-gray-800">Nuevo Anexo II</h1>
          <p className="text-gray-500 text-sm mt-1">Completa los datos para el seguimiento de acciones correctivas.</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-700">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Código del Proyecto <span className="text-red-500">*</span></label>
            <input required name="codigoProyecto" type="text" className="w-full border-gray-300 border rounded-md p-2.5 focus:ring-2 focus:ring-[#00a2b9] focus:border-[#00a2b9] outline-none transition-all" placeholder="Ej: PROY-2024-001" />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Fecha <span className="text-red-500">*</span></label>
            <input required name="fecha" type="date" className="w-full border-gray-300 border rounded-md p-2.5 focus:ring-2 focus:ring-[#00a2b9] focus:border-[#00a2b9] outline-none transition-all" />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">N° de Hallazgos <span className="text-red-500">*</span></label>
            <input required name="nHallazgos" type="number" min="0" className="w-full border-gray-300 border rounded-md p-2.5 focus:ring-2 focus:ring-[#00a2b9] focus:border-[#00a2b9] outline-none transition-all" />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Gerencia Responsable del Hallazgo <span className="text-red-500">*</span></label>
            <input required name="gerenciaResponsable" type="text" className="w-full border-gray-300 border rounded-md p-2.5 focus:ring-2 focus:ring-[#00a2b9] focus:border-[#00a2b9] outline-none transition-all" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-bold text-gray-700 mb-1">Descripción de la Acción Correctiva <span className="text-red-500">*</span></label>
            <textarea required name="descripcionAccionCorrectiva" rows={3} className="w-full border-gray-300 border rounded-md p-2.5 focus:ring-2 focus:ring-[#00a2b9] focus:border-[#00a2b9] outline-none transition-all"></textarea>
          </div>
          
          <div className="md:col-span-2 border-t border-gray-100 pt-6 mt-2">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Seguimiento e Implementación</h3>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Fecha de Implementación</label>
            <input name="fechaImplementacionCorreccion" type="date" className="w-full border-gray-300 border rounded-md p-2.5 focus:ring-2 focus:ring-[#00a2b9] focus:border-[#00a2b9] outline-none transition-all" />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Seguimientos de las Acciones</label>
            <input name="seguimientosAcciones" type="text" className="w-full border-gray-300 border rounded-md p-2.5 focus:ring-2 focus:ring-[#00a2b9] focus:border-[#00a2b9] outline-none transition-all" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-bold text-gray-700 mb-1">Observaciones</label>
            <textarea name="observaciones" rows={2} className="w-full border-gray-300 border rounded-md p-2.5 focus:ring-2 focus:ring-[#00a2b9] focus:border-[#00a2b9] outline-none transition-all"></textarea>
          </div>

          <div className="md:col-span-2 border-t border-gray-100 pt-6 mt-2">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Verificación y Eficacia</h3>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Fecha de Verificación</label>
            <input name="fechaVerificacionImplementacion" type="date" className="w-full border-gray-300 border rounded-md p-2.5 focus:ring-2 focus:ring-[#00a2b9] focus:border-[#00a2b9] outline-none transition-all" />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Fecha de Eval. de Eficacia</label>
            <input name="fechaEvaluacionEficacia" type="date" className="w-full border-gray-300 border rounded-md p-2.5 focus:ring-2 focus:ring-[#00a2b9] focus:border-[#00a2b9] outline-none transition-all" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-bold text-gray-700 mb-1">Evaluación de la Eficacia</label>
            <textarea name="evaluacionEficacia" rows={2} className="w-full border-gray-300 border rounded-md p-2.5 focus:ring-2 focus:ring-[#00a2b9] focus:border-[#00a2b9] outline-none transition-all"></textarea>
          </div>
          
          <div className="md:col-span-2 border-t border-gray-100 pt-6 mt-2">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Cierre</h3>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Responsable <span className="text-red-500">*</span></label>
            <input required name="responsable" type="text" className="w-full border-gray-300 border rounded-md p-2.5 focus:ring-2 focus:ring-[#00a2b9] focus:border-[#00a2b9] outline-none transition-all" />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Estado de la Observación <span className="text-red-500">*</span></label>
            <select required name="estadoObservacion" className="w-full border-gray-300 border rounded-md p-2.5 focus:ring-2 focus:ring-[#00a2b9] focus:border-[#00a2b9] outline-none transition-all bg-white">
              <option value="Pendiente">Pendiente</option>
              <option value="En Proceso">En Proceso</option>
              <option value="Cerrado">Cerrado</option>
            </select>
          </div>
          
          <div className="md:col-span-2 mt-6 flex justify-end gap-3 pt-4 border-t border-gray-100">
            <Link href="/" className="px-6 py-2.5 border border-gray-300 rounded-md text-gray-700 font-medium hover:bg-gray-50 transition-colors">
              Cancelar
            </Link>
            <button type="submit" disabled={loading} className="px-6 py-2.5 bg-[#00a2b9] text-white font-medium rounded-md hover:bg-[#008b9e] transition-colors disabled:opacity-50 flex items-center gap-2 shadow-sm">
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  Guardando...
                </>
              ) : "Guardar Registro"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
