'use client';

import React, { useState } from 'react';
import {
  CheckCircle2,
  AlertCircle,
  X,
  ShieldCheck,
} from 'lucide-react';

export interface UsuarioPermisos {
  id: number;
  usuario: string;
  email: string;
  rol: string;
  permisos: {
    productos: boolean;
    clientes: boolean;
    proveedores: boolean;
    usuarios: boolean;
    nuevaVenta: boolean;
    historialVentas: boolean;
  };
}

const DEMO_PERMISOS: UsuarioPermisos[] = [
  {
    id: 1,
    usuario: 'carlos',
    email: 'carlos@gmail.com',
    rol: 'VENDEDOR',
    permisos: {
      productos: true,
      clientes: false,
      proveedores: false,
      usuarios: false,
      nuevaVenta: false,
      historialVentas: false,
    },
  },
];

export default function PermisosPage() {
  const [listaPermisos, setListaPermisos] = useState<UsuarioPermisos[]>(DEMO_PERMISOS);
  const [editingUser, setEditingUser] = useState<UsuarioPermisos | null>(null);

  // Form temporal de permisos cuando se edita
  const [tempPermisos, setTempPermisos] = useState({
    productos: true,
    clientes: false,
    proveedores: false,
    usuarios: false,
    nuevaVenta: false,
    historialVentas: false,
  });

  // Toast
  const [toast, setToast] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const handleStartEdit = (user: UsuarioPermisos) => {
    setEditingUser(user);
    setTempPermisos({ ...user.permisos });
  };

  const handleTogglePermiso = (key: keyof typeof tempPermisos) => {
    setTempPermisos((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleGuardarCambios = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    setListaPermisos((prev) =>
      prev.map((u) => (u.id === editingUser.id ? { ...u, permisos: { ...tempPermisos } } : u))
    );

    showToast('success', `Permisos actualizados para "${editingUser.usuario}".`);
    setEditingUser(null);
  };

  const handleCancelar = () => {
    setEditingUser(null);
  };

  return (
    <div className="space-y-6 pb-12 font-sans">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl border text-xs font-semibold transition-all animate-in fade-in slide-in-from-top-4 ${
            toast.type === 'success'
              ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
              : 'bg-rose-50 text-rose-900 border-rose-200'
          }`}
        >
          {toast.type === 'success' ? (
            <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="size-4 text-rose-600 shrink-0" />
          )}
          <span>{toast.message}</span>
          <button onClick={() => setToast(null)} className="p-1 hover:bg-black/5 rounded-lg ml-2">
            <X className="size-3.5" />
          </button>
        </div>
      )}

      {/* Tarjeta Principal "Gestión de Permisos" */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100/80 space-y-6">
        
        {/* Cabecera */}
        <div className="flex items-center justify-between">
          <h1 className="text-base sm:text-lg font-bold text-[#1E293B]">
            Gestión de Permisos
          </h1>
        </div>

        {/* Tabla de Gestión de Permisos */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                <th className="py-3 px-3">USUARIO</th>
                <th className="py-3 px-3">EMAIL</th>
                <th className="py-3 px-3 text-center">ROL</th>
                <th className="py-3 px-3 text-center"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {listaPermisos.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                  {/* USUARIO */}
                  <td className="py-4 px-3 font-semibold text-slate-800">
                    {user.usuario}
                  </td>

                  {/* EMAIL */}
                  <td className="py-4 px-3 text-slate-500 font-normal">
                    {user.email}
                  </td>

                  {/* ROL (Badge Verde) */}
                  <td className="py-4 px-3 text-center">
                    <span className="inline-block px-3 py-1 rounded-full bg-[#10B981] text-white text-[10px] font-extrabold uppercase tracking-wider">
                      {user.rol}
                    </span>
                  </td>

                  {/* Botón EDITAR PERMISOS Magenta */}
                  <td className="py-4 px-3 text-center">
                    <button
                      type="button"
                      onClick={() => handleStartEdit(user)}
                      className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#D946EF] to-[#C026D3] hover:from-[#C026D3] hover:to-[#A21CAF] text-white font-extrabold text-[11px] uppercase tracking-wider shadow-md shadow-[#C026D3]/20 transition-all cursor-pointer active:scale-[0.98]"
                    >
                      EDITAR PERMISOS
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>

      {/* Tarjeta de Formulario de Edición de Permisos (Coincidiendo con la Imagen 2) */}
      {editingUser && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100/80 space-y-6 animate-in fade-in slide-in-from-top-3">
          
          <h2 className="text-sm font-bold text-[#1E293B]">
            Editando permisos para: <span className="font-extrabold text-slate-900">{editingUser.usuario}</span>
          </h2>

          <form onSubmit={handleGuardarCambios} className="space-y-6 text-xs text-slate-700">
            
            {/* Grid de 3 Columnas con Toggles */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-y-5 gap-x-8">
              
              {/* Columna 1 */}
              <div className="space-y-4">
                {/* Switch Productos */}
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    role="switch"
                    aria-checked={tempPermisos.productos}
                    onClick={() => handleTogglePermiso('productos')}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      tempPermisos.productos ? 'bg-[#4B5E78]' : 'bg-slate-200'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                        tempPermisos.productos ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                  <span
                    onClick={() => handleTogglePermiso('productos')}
                    className="font-medium text-slate-600 cursor-pointer select-none"
                  >
                    Productos
                  </span>
                </div>

                {/* Switch Usuarios */}
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    role="switch"
                    aria-checked={tempPermisos.usuarios}
                    onClick={() => handleTogglePermiso('usuarios')}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      tempPermisos.usuarios ? 'bg-[#4B5E78]' : 'bg-slate-200'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                        tempPermisos.usuarios ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                  <span
                    onClick={() => handleTogglePermiso('usuarios')}
                    className="font-medium text-slate-600 cursor-pointer select-none"
                  >
                    Usuarios
                  </span>
                </div>
              </div>

              {/* Columna 2 */}
              <div className="space-y-4">
                {/* Switch Clientes */}
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    role="switch"
                    aria-checked={tempPermisos.clientes}
                    onClick={() => handleTogglePermiso('clientes')}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      tempPermisos.clientes ? 'bg-[#4B5E78]' : 'bg-slate-200'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                        tempPermisos.clientes ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                  <span
                    onClick={() => handleTogglePermiso('clientes')}
                    className="font-medium text-slate-600 cursor-pointer select-none"
                  >
                    Clientes
                  </span>
                </div>

                {/* Switch Nueva Venta */}
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    role="switch"
                    aria-checked={tempPermisos.nuevaVenta}
                    onClick={() => handleTogglePermiso('nuevaVenta')}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      tempPermisos.nuevaVenta ? 'bg-[#4B5E78]' : 'bg-slate-200'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                        tempPermisos.nuevaVenta ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                  <span
                    onClick={() => handleTogglePermiso('nuevaVenta')}
                    className="font-medium text-slate-600 cursor-pointer select-none"
                  >
                    Nueva Venta
                  </span>
                </div>
              </div>

              {/* Columna 3 */}
              <div className="space-y-4">
                {/* Switch Proveedores */}
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    role="switch"
                    aria-checked={tempPermisos.proveedores}
                    onClick={() => handleTogglePermiso('proveedores')}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      tempPermisos.proveedores ? 'bg-[#4B5E78]' : 'bg-slate-200'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                        tempPermisos.proveedores ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                  <span
                    onClick={() => handleTogglePermiso('proveedores')}
                    className="font-medium text-slate-600 cursor-pointer select-none"
                  >
                    Proveedores
                  </span>
                </div>

                {/* Switch Historial de Ventas */}
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    role="switch"
                    aria-checked={tempPermisos.historialVentas}
                    onClick={() => handleTogglePermiso('historialVentas')}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      tempPermisos.historialVentas ? 'bg-[#4B5E78]' : 'bg-slate-200'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                        tempPermisos.historialVentas ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                  <span
                    onClick={() => handleTogglePermiso('historialVentas')}
                    className="font-medium text-slate-600 cursor-pointer select-none"
                  >
                    Historial de Ventas
                  </span>
                </div>
              </div>

            </div>

            {/* Botones de Acción */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-[#C026D3] hover:bg-[#A21CAF] text-white font-extrabold text-xs uppercase tracking-wider shadow-md shadow-[#C026D3]/20 transition-all cursor-pointer active:scale-[0.98]"
              >
                GUARDAR CAMBIOS
              </button>
              <button
                type="button"
                onClick={handleCancelar}
                className="px-6 py-2.5 rounded-xl bg-[#64748B] hover:bg-[#475569] text-white font-extrabold text-xs uppercase tracking-wider shadow-sm transition-all cursor-pointer active:scale-[0.98]"
              >
                CANCELAR
              </button>
            </div>

          </form>

        </div>
      )}
    </div>
  );
}
