'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Loader2,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
} from 'lucide-react';
import { Usuario } from '@/types';
import { getUsuarios, updateUsuario } from '@/services/usuarioService';

// Módulos conmutables del sistema (Foto 2)
interface PermisosModulo {
  productos: boolean;
  clientes: boolean;
  proveedores: boolean;
  usuarios: boolean;
  nuevaVenta: boolean;
  historialVentas: boolean;
}

// Usuarios de muestra para el módulo de permisos basados en Sistema AG (Foto 1)
const SAMPLE_PERMISOS_USERS: (Usuario & { permisos: PermisosModulo })[] = [
  {
    id: 902,
    username: 'carlos',
    nombre: 'carlos',
    apellido: '',
    email: 'carlos@gmail.com',
    rol: 'VENDEDOR',
    activo: true,
    permisos: {
      productos: true,
      clientes: false,
      proveedores: false,
      usuarios: false,
      nuevaVenta: false,
      historialVentas: false,
    },
  },
  {
    id: 903,
    username: 'farmaceutica',
    nombre: 'Valeria Bendezú',
    apellido: '',
    email: 'valeria@farmacia.com',
    rol: 'FARMACEUTICO',
    activo: true,
    permisos: {
      productos: true,
      clientes: true,
      proveedores: false,
      usuarios: false,
      nuevaVenta: true,
      historialVentas: true,
    },
  },
  {
    id: 904,
    username: 'cajero',
    nombre: 'Luis Morales',
    apellido: '',
    email: 'cajero@farmacia.com',
    rol: 'CAJERO',
    activo: true,
    permisos: {
      productos: false,
      clientes: true,
      proveedores: false,
      usuarios: false,
      nuevaVenta: true,
      historialVentas: true,
    },
  },
];

export default function PermisosPage() {
  const [viewMode, setViewMode] = useState<'list' | 'form'>('list');
  const [users, setUsers] = useState<(Usuario & { permisos?: PermisosModulo })[]>([]);
  const [loading, setLoading] = useState(true);

  // Usuario seleccionado para editar permisos
  const [selectedUser, setSelectedUser] = useState<(Usuario & { permisos?: PermisosModulo }) | null>(null);
  const [permisos, setPermisos] = useState<PermisosModulo>({
    productos: true,
    clientes: false,
    proveedores: false,
    usuarios: false,
    nuevaVenta: false,
    historialVentas: false,
  });
  const [saving, setSaving] = useState(false);

  // Toast
  const [toast, setToast] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  };

  // Cargar usuarios
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getUsuarios().catch(() => []);
      const backendList = Array.isArray(data) ? data : [];

      if (backendList.length > 0) {
        // Excluir administradores de la lista de edición de permisos o incluirlos con permisos completos
        const nonAdminList = backendList.filter(
          (u) =>
            !((typeof u.rol === 'object' && u.rol !== null ? (u.rol as any).nombre : u.rol) || '')
              .toUpperCase()
              .includes('ADMIN')
        );

        if (nonAdminList.length > 0) {
          const listWithPermisos = nonAdminList.map((u) => {
            const mods = u.modulosPermitidos || [];
            return {
              ...u,
              permisos: {
                productos: mods.includes('productos') || true,
                clientes: mods.includes('clientes'),
                proveedores: mods.includes('proveedores'),
                usuarios: mods.includes('usuarios'),
                nuevaVenta: mods.includes('pos') || mods.includes('nuevaVenta'),
                historialVentas: mods.includes('ventas') || mods.includes('historialVentas'),
              },
            };
          });
          setUsers(listWithPermisos);
        } else {
          setUsers(SAMPLE_PERMISOS_USERS);
        }
      } else {
        setUsers(SAMPLE_PERMISOS_USERS);
      }
    } catch {
      setUsers(SAMPLE_PERMISOS_USERS);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Abrir vista de edición de permisos para un usuario
  const handleEditPermisos = (user: Usuario & { permisos?: PermisosModulo }) => {
    setSelectedUser(user);
    if (user.permisos) {
      setPermisos(user.permisos);
    } else {
      setPermisos({
        productos: true,
        clientes: false,
        proveedores: false,
        usuarios: false,
        nuevaVenta: false,
        historialVentas: false,
      });
    }
    setViewMode('form');
  };

  // Conmutar un permiso
  const togglePermiso = (key: keyof PermisosModulo) => {
    setPermisos((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // Guardar cambios de permisos
  const handleGuardarCambios = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    setSaving(true);
    const modulosArray: string[] = [];
    if (permisos.productos) modulosArray.push('productos');
    if (permisos.clientes) modulosArray.push('clientes');
    if (permisos.proveedores) modulosArray.push('proveedores');
    if (permisos.usuarios) modulosArray.push('usuarios');
    if (permisos.nuevaVenta) modulosArray.push('pos');
    if (permisos.historialVentas) modulosArray.push('ventas');

    try {
      if (selectedUser.id < 900) {
        await updateUsuario(selectedUser.id, {
          modulosPermitidos: modulosArray,
        });
      }

      // Actualizar estado local
      setUsers((prev) =>
        prev.map((u) =>
          u.id === selectedUser.id
            ? {
                ...u,
                modulosPermitidos: modulosArray,
                permisos: { ...permisos },
              }
            : u
        )
      );

      showToast(
        'success',
        `Permisos actualizados correctamente para ${selectedUser.nombre || selectedUser.username}.`
      );
      setViewMode('list');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al guardar permisos';
      showToast('error', msg);
    } finally {
      setSaving(false);
    }
  };

  // Renderizar badge de Rol idéntico a Foto 1
  const renderRolBadge = (rolValue: any) => {
    const rolStr = (
      typeof rolValue === 'object' && rolValue !== null
        ? rolValue.nombre
        : rolValue || ''
    ).toUpperCase();

    if (rolStr.includes('VENDEDOR') || rolStr.includes('CAJERO')) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wide bg-[#22c55e] text-white">
          VENDEDOR
        </span>
      );
    }

    if (rolStr.includes('FARMA')) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wide bg-[#06b6d4] text-white">
          FARMACÉUTICO
        </span>
      );
    }

    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wide bg-[#64748b] text-white">
        {rolStr}
      </span>
    );
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Notificación */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 text-xs font-semibold text-white transition-all animate-in slide-in-from-bottom-2 ${
            toast.type === 'success' ? 'bg-emerald-600' : 'bg-rose-600'
          }`}
        >
          {toast.type === 'success' ? (
            <CheckCircle2 className="size-4 shrink-0" />
          ) : (
            <AlertCircle className="size-4 shrink-0" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* VISTA 1: LISTA / GESTIÓN DE PERMISOS (FOTO 1)                           */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {viewMode === 'list' && (
        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm shadow-slate-200/50 border border-slate-100/60">
          {/* Cabecera: Título */}
          <div className="pb-6 border-b border-slate-100/60">
            <h1 className="text-base md:text-lg font-bold text-slate-800 tracking-tight">
              Gestión de Permisos
            </h1>
          </div>

          {/* Tabla de Usuarios para Permisos */}
          <div className="overflow-x-auto -mx-6 md:-mx-8 px-6 md:px-8 mt-2">
            <table className="w-full text-left border-collapse min-w-[650px]">
              <thead>
                <tr className="border-b border-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  <th className="py-3 px-3 text-left">USUARIO</th>
                  <th className="py-3 px-3 text-left">EMAIL</th>
                  <th className="py-3 px-3 text-left">ROL</th>
                  <th className="py-3 px-3 text-right pr-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/70 text-xs">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="py-12 text-center text-slate-400">
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="size-4 animate-spin text-[#c026d3]" />
                        <span>Cargando matriz de permisos...</span>
                      </div>
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-12 text-center text-slate-400">
                      No hay usuarios para configurar permisos.
                    </td>
                  </tr>
                ) : (
                  users.map((u) => {
                    const nombreUsuario = u.nombre || u.username || 'Usuario';

                    return (
                      <tr
                        key={u.id}
                        className="hover:bg-slate-50/70 transition-colors group"
                      >
                        {/* Usuario */}
                        <td className="py-4 px-3 font-medium text-slate-800">
                          {nombreUsuario}
                        </td>

                        {/* Email */}
                        <td className="py-4 px-3 text-slate-600">
                          {u.email || '-'}
                        </td>

                        {/* Rol */}
                        <td className="py-4 px-3">
                          {renderRolBadge(u.rol)}
                        </td>

                        {/* Botón Acción EDITAR PERMISOS */}
                        <td className="py-4 px-3 text-right pr-4 whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => handleEditPermisos(u)}
                            className="inline-flex items-center justify-center px-5 py-2 bg-gradient-to-r from-[#d946ef] to-[#c026d3] hover:from-[#c026d3] hover:to-[#a21caf] text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md shadow-fuchsia-500/25 active:scale-[0.98] transition-all cursor-pointer"
                          >
                            EDITAR PERMISOS
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* VISTA 2: EDITANDO PERMISOS PARA: [USUARIO] (FOTO 2)                     */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {viewMode === 'form' && (
        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm shadow-slate-200/50 border border-slate-100/60 max-w-4xl mx-auto">
          {/* Cabecera del formulario */}
          <div className="flex items-center justify-between pb-6 border-b border-slate-100/60 mb-8">
            <h1 className="text-base md:text-lg font-bold text-slate-800 tracking-tight">
              Editando permisos para: {selectedUser?.nombre || selectedUser?.username}
            </h1>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 cursor-pointer transition-colors"
            >
              <ArrowLeft className="size-4" />
              <span>Volver</span>
            </button>
          </div>

          <form onSubmit={handleGuardarCambios} className="space-y-8">
            {/* ─── CUADRÍCULA DE CONMUTADORES (3 COLUMNAS X 2 FILAS) ─── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-7 py-2">
              {/* 1. Productos */}
              <div
                onClick={() => togglePermiso('productos')}
                className="flex items-center gap-3.5 cursor-pointer select-none group"
              >
                <button
                  type="button"
                  aria-pressed={permisos.productos}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none ${
                    permisos.productos ? 'bg-[#334155]' : 'bg-slate-200'
                  }`}
                >
                  <span
                    className={`inline-block size-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out mt-0.5 ${
                      permisos.productos ? 'translate-x-5' : 'translate-x-0.5'
                    }`}
                  />
                </button>
                <span className="text-xs sm:text-sm font-semibold text-slate-700 group-hover:text-slate-900 transition-colors">
                  Productos
                </span>
              </div>

              {/* 2. Clientes */}
              <div
                onClick={() => togglePermiso('clientes')}
                className="flex items-center gap-3.5 cursor-pointer select-none group"
              >
                <button
                  type="button"
                  aria-pressed={permisos.clientes}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none ${
                    permisos.clientes ? 'bg-[#334155]' : 'bg-slate-200'
                  }`}
                >
                  <span
                    className={`inline-block size-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out mt-0.5 ${
                      permisos.clientes ? 'translate-x-5' : 'translate-x-0.5'
                    }`}
                  />
                </button>
                <span className="text-xs sm:text-sm font-semibold text-slate-700 group-hover:text-slate-900 transition-colors">
                  Clientes
                </span>
              </div>

              {/* 3. Proveedores */}
              <div
                onClick={() => togglePermiso('proveedores')}
                className="flex items-center gap-3.5 cursor-pointer select-none group"
              >
                <button
                  type="button"
                  aria-pressed={permisos.proveedores}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none ${
                    permisos.proveedores ? 'bg-[#334155]' : 'bg-slate-200'
                  }`}
                >
                  <span
                    className={`inline-block size-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out mt-0.5 ${
                      permisos.proveedores ? 'translate-x-5' : 'translate-x-0.5'
                    }`}
                  />
                </button>
                <span className="text-xs sm:text-sm font-semibold text-slate-700 group-hover:text-slate-900 transition-colors">
                  Proveedores
                </span>
              </div>

              {/* 4. Usuarios */}
              <div
                onClick={() => togglePermiso('usuarios')}
                className="flex items-center gap-3.5 cursor-pointer select-none group"
              >
                <button
                  type="button"
                  aria-pressed={permisos.usuarios}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none ${
                    permisos.usuarios ? 'bg-[#334155]' : 'bg-slate-200'
                  }`}
                >
                  <span
                    className={`inline-block size-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out mt-0.5 ${
                      permisos.usuarios ? 'translate-x-5' : 'translate-x-0.5'
                    }`}
                  />
                </button>
                <span className="text-xs sm:text-sm font-semibold text-slate-700 group-hover:text-slate-900 transition-colors">
                  Usuarios
                </span>
              </div>

              {/* 5. Nueva Venta */}
              <div
                onClick={() => togglePermiso('nuevaVenta')}
                className="flex items-center gap-3.5 cursor-pointer select-none group"
              >
                <button
                  type="button"
                  aria-pressed={permisos.nuevaVenta}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none ${
                    permisos.nuevaVenta ? 'bg-[#334155]' : 'bg-slate-200'
                  }`}
                >
                  <span
                    className={`inline-block size-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out mt-0.5 ${
                      permisos.nuevaVenta ? 'translate-x-5' : 'translate-x-0.5'
                    }`}
                  />
                </button>
                <span className="text-xs sm:text-sm font-semibold text-slate-700 group-hover:text-slate-900 transition-colors">
                  Nueva Venta
                </span>
              </div>

              {/* 6. Historial de Ventas */}
              <div
                onClick={() => togglePermiso('historialVentas')}
                className="flex items-center gap-3.5 cursor-pointer select-none group"
              >
                <button
                  type="button"
                  aria-pressed={permisos.historialVentas}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none ${
                    permisos.historialVentas ? 'bg-[#334155]' : 'bg-slate-200'
                  }`}
                >
                  <span
                    className={`inline-block size-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out mt-0.5 ${
                      permisos.historialVentas ? 'translate-x-5' : 'translate-x-0.5'
                    }`}
                  />
                </button>
                <span className="text-xs sm:text-sm font-semibold text-slate-700 group-hover:text-slate-900 transition-colors">
                  Historial de Ventas
                </span>
              </div>
            </div>

            {/* ─── BOTONES INFERIORES: GUARDAR CAMBIOS + CANCELAR ─── */}
            <div className="pt-4 flex items-center gap-3">
              <button
                type="submit"
                disabled={saving}
                className="px-7 py-2.5 bg-gradient-to-r from-[#d946ef] to-[#c026d3] hover:from-[#c026d3] hover:to-[#a21caf] text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md shadow-fuchsia-500/25 active:scale-[0.98] transition-all cursor-pointer flex items-center gap-2 disabled:opacity-70"
              >
                {saving && <Loader2 className="size-4 animate-spin text-white" />}
                <span>GUARDAR CAMBIOS</span>
              </button>

              <button
                type="button"
                onClick={() => setViewMode('list')}
                className="px-6 py-2.5 bg-[#64748b] hover:bg-[#475569] text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer"
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

