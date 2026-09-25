"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, Plus, Trash2, KeyRound, ShieldCheck } from "lucide-react";
import { getUsersAction, createUserAction, deleteUserAction, resetPasswordAction } from "@/app/actions";

export default function UsuariosAdmin() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadUsers = async () => {
    const res = await getUsersAction();
    if (res.success) {
      setUsers(res.users || []);
    } else {
      setError(res.error || "Error al cargar usuarios");
    }
    setLoading(false);
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    
    const formData = new FormData(e.currentTarget);
    const res = await createUserAction(formData);
    
    if (res.success) {
      setSuccess("Usuario creado correctamente. La contraseña por defecto es: aubasa123");
      (e.target as HTMLFormElement).reset();
      loadUsers();
    } else {
      setError(res.error || "Error al crear");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("¿Seguro que deseas eliminar este usuario?")) return;
    setError("");
    const res = await deleteUserAction(id);
    if (res.success) loadUsers();
    else setError(res.error || "Error al eliminar");
  };

  const handleReset = async (id: number) => {
    if (!confirm("¿Resetear la contraseña a 'aubasa123'? El usuario deberá cambiarla al ingresar.")) return;
    setError("");
    setSuccess("");
    const res = await resetPasswordAction(id);
    if (res.success) {
      setSuccess("Contraseña reseteada correctamente a aubasa123");
      loadUsers();
    }
    else setError(res.error || "Error al resetear");
  };

  if (loading) return <div className="p-8 text-center text-slate-500">Cargando usuarios...</div>;

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#F8F9FA] py-8 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto mb-4 flex justify-between items-center">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-[#0098B3] transition-colors">
          <ChevronLeft size={16} />
          Volver al Panel
        </Link>
      </div>

      <div className="max-w-5xl mx-auto bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden">
        <div className="bg-[#002B49] text-white p-8">
          <div className="flex items-center gap-3 mb-2">
            <ShieldCheck size={32} className="text-[#0098B3]" />
            <h1 className="text-3xl font-black">Gestión de Usuarios</h1>
          </div>
          <p className="text-slate-300 font-medium text-sm">
            Crea accesos y asigna roles (Auditoría Interna, Operaciones o Gerencia).
          </p>
        </div>

        <div className="p-8">
          {error && <div className="bg-rose-50 text-rose-700 p-4 rounded-lg mb-6 text-sm font-medium border border-rose-200">{error}</div>}
          {success && <div className="bg-emerald-50 text-emerald-700 p-4 rounded-lg mb-6 text-sm font-medium border border-emerald-200">{success}</div>}

          <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 mb-8">
            <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
              <Plus size={18} /> Crear Nuevo Usuario
            </h3>
            <form onSubmit={handleCreate} className="flex flex-col md:flex-row gap-4 items-end">
              <div className="flex-1 w-full">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Correo Electrónico</label>
                <input type="email" name="email" required placeholder="ejemplo@aubasa.com.ar" className="w-full border-slate-300 rounded-lg p-2.5 text-sm" />
              </div>
              <div className="flex-1 w-full">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Rol en el sistema</label>
                <select name="role" required className="w-full border-slate-300 rounded-lg p-2.5 text-sm">
                  <option value="auditoria_interna">Auditoría Interna</option>
                  <option value="auditoria_operaciones">Auditoría de Operaciones</option>
                  <option value="gerente">Gerencia / Jefatura</option>
                  <option value="admin">Administrador del Sistema</option>
                </select>
              </div>
              <button type="submit" className="bg-[#0098B3] hover:bg-[#00839a] text-white px-6 py-2.5 rounded-lg font-bold shadow-sm transition-colors w-full md:w-auto">
                Crear Usuario
              </button>
            </form>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-lg">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">Correo</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">Rol</th>
                  <th className="px-6 py-3 text-center text-xs font-bold text-slate-500 uppercase">Estado Contraseña</th>
                  <th className="px-6 py-3 text-right text-xs font-bold text-slate-500 uppercase">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {users.map(user => (
                  <tr key={user.id} className="hover:bg-slate-50/50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-800">{user.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${
                        user.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                        user.role === 'gerente' ? 'bg-amber-100 text-amber-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                      {user.mustChangePassword ? (
                        <span className="text-amber-600 font-medium text-xs bg-amber-50 px-2 py-1 rounded border border-amber-200">Pendiente cambio</span>
                      ) : (
                        <span className="text-emerald-600 font-medium text-xs bg-emerald-50 px-2 py-1 rounded border border-emerald-200">Al día</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => handleReset(user.id)} className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded transition-colors" title="Resetear a aubasa123">
                          <KeyRound size={16} />
                        </button>
                        {user.email !== 'sgiaubasa@gmail.com' && (
                          <button onClick={() => handleDelete(user.id)} className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors" title="Eliminar">
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr><td colSpan={4} className="px-6 py-4 text-center text-sm text-slate-500">No hay usuarios</td></tr>
                )}
              </tbody>
            </table>
          </div>

        </div>
      </div>
    </div>
  );
}
