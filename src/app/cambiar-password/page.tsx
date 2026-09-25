"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { changePasswordAction, logoutAction } from "../actions";

export default function CambiarPassword() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const pwd1 = formData.get("newPassword")?.toString();
    const pwd2 = formData.get("confirmPassword")?.toString();

    if (pwd1 !== pwd2) {
      setError("Las contraseñas no coinciden.");
      setLoading(false);
      return;
    }

    if (!pwd1 || pwd1.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      setLoading(false);
      return;
    }

    const result = await changePasswordAction(formData);

    if (result.success) {
      router.push("/");
    } else {
      setError(result.error || "Error al cambiar la contraseña.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 absolute inset-0 z-50">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center text-[#00a2b9] font-black text-5xl tracking-tighter">
          AUBASA
        </div>
        <h2 className="mt-4 text-center text-2xl font-bold text-gray-900">
          Bienvenido al Sistema
        </h2>
        <p className="mt-2 text-center text-sm text-amber-600 bg-amber-50 p-2 rounded border border-amber-200 font-medium">
          Por seguridad, debes cambiar tu contraseña antes de continuar.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl border border-gray-100 sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded text-sm text-center border border-red-200">
                {error}
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Nueva Contraseña
              </label>
              <div className="mt-1">
                <input
                  name="newPassword"
                  type="password"
                  required
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#00a2b9] focus:border-[#00a2b9] sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Confirmar Contraseña
              </label>
              <div className="mt-1">
                <input
                  name="confirmPassword"
                  type="password"
                  required
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#00a2b9] focus:border-[#00a2b9] sm:text-sm"
                />
              </div>
            </div>

            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => logoutAction()}
                disabled={loading}
                className="w-full flex justify-center py-2.5 px-4 border border-slate-300 rounded-md shadow-sm text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00a2b9] transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#00a2b9] hover:bg-[#008b9e] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00a2b9] disabled:opacity-70 transition-colors"
              >
                {loading ? "Guardando..." : "Guardar y Entrar"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
