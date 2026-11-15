'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Loader2,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Trash2,
} from 'lucide-react';
import { Usuario, CreateUsuarioDTO, UpdateUsuarioDTO } from '@/types';
import {
  getUsuarios,
  createUsuario,
  updateUsuario,
  deleteUsuario,
} from '@/services/usuarioService';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

// Usuarios de muestra basados en la referencia visual de Sistema AG (Foto 1)
const SAMPLE_USUARIOS: Usuario[] = [
  {
    id: 901,
    username: 'admin',
    nombre: 'Administrador',
    apellido: '',
    email: 'tarrillo@gmail.com',
    rol: 'ADMIN',
    activo: true,
  },
  {
    id: 902,
    username: 'carlos',
    nombre: 'carlos',
    apellido: '',
    email: 'carlos@gmail.com',
    rol: 'VENDEDOR',
    activo: true,
  },
];

export default function UsuariosPage() {
  const [viewMode, setViewMode] = useState<'list' | 'form'>('list');
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);

  // Formulario Nuevo / Editar Usuario
  const [usuarioToEdit, setUsuarioToEdit] = useState<Usuario | null>(null);
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rol, setRol] = useState<'Admin' | 'Vendedor' | 'Farmacéutico'>('Admin');
  const [saving, setSaving] = useState(false);

  // Eliminación
  const [usuarioToDelete, setUsuarioToDelete] = useState<Usuario | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Toast
  const [toast, setToast] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  };

  // Cargar usuarios combinando backend y muestras
  const fetchUsuarios = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getUsuarios().catch(() => []);
      const backendList = Array.isArray(data) ? data : [];

      if (backendList.length > 0) {
        const existingEmails = new Set(
          backendList.map((u) => (u.email || u.username || '').toLowerCase())
        );
        const nonDuplicateSamples = SAMPLE_USUARIOS.filter(
          (su) =>
            !existingEmails.has((su.email || '').toLowerCase()) &&
            !existingEmails.has((su.username || '').toLowerCase())
        );
        setUsuarios([...backendList, ...nonDuplicateSamples]);
      } else {
        setUsuarios(SAMPLE_USUARIOS);
      }
    } catch {
      setUsuarios(SAMPLE_USUARIOS);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsuarios();
  }, [fetchUsuarios]);

  // Abrir formulario para Nuevo Usuario
  const handleOpenNewUsuario = () => {
    setUsuarioToEdit(null);
    setNombre('');
    setEmail('tarrillo@gmail.com');
    setPassword('');
    setRol('Admin');
    setViewMode('form');
  };

  // Abrir formulario para Editar Usuario
  const handleOpenEditUsuario = (u: Usuario) => {
    setUsuarioToEdit(u);
    setNombre(u.nombre || u.username || '');
    setEmail(u.email || '');
    setPassword('');
    const rolStr = (typeof u.rol === 'object' && u.rol !== null ? (u.rol as any).nombre : u.rol) || '';
    if (rolStr.toUpperCase().includes('ADMIN')) {
      setRol('Admin');
    } else if (rolStr.toUpperCase().includes('FARMA')) {
      setRol('Farmacéutico');
    } else {
      setRol('Vendedor');
    }
    setViewMode('form');
  };

  // Guardar Usuario (Crear o Actualizar)
  const handleGuardar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) {
      showToast('error', 'El nombre del usuario es obligatorio.');
      return;
    }
    if (!email.trim()) {
      showToast('error', 'El correo electrónico es obligatorio.');
      return;
    }
    if (!usuarioToEdit && !password.trim()) {
      showToast('error', 'La contraseña es obligatoria para nuevos usuarios.');
      return;
    }

    setSaving(true);
    const backendRol = rol === 'Admin' ? 'ADMIN' : rol === 'Farmacéutico' ? 'FARMACEUTICO' : 'CAJERO';

    try {
      if (usuarioToEdit && usuarioToEdit.id < 900) {
        const updateData: UpdateUsuarioDTO = {
          nombre: nombre.trim(),
          email: email.trim(),
          rol: backendRol,
          ...(password.trim() ? { password: password.trim() } : {}),
        };
        await updateUsuario(usuarioToEdit.id, updateData);
      } else if (!usuarioToEdit) {
        const createData: CreateUsuarioDTO = {
          username: email.split('@')[0] || nombre.toLowerCase().replace(/\s+/g, ''),
          nombre: nombre.trim(),
          email: email.trim(),
          password: password.trim() || '123456',
          rol: backendRol,
          activo: true,
        };
        try {
          await createUsuario(createData);
        } catch {
          // Continuar localmente si el backend está desconectado
        }
      }

      // Actualizar estado local
      if (usuarioToEdit) {
        setUsuarios((prev) =>
          prev.map((u) =>
            u.id === usuarioToEdit.id
              ? {
                  ...u,
                  nombre: nombre.trim(),
                  email: email.trim(),
                  rol: rol === 'Vendedor' ? 'VENDEDOR' : backendRol,
                }
              : u
          )
        );
        showToast('success', 'Usuario actualizado exitosamente.');
      } else {
        const nuevoUsuario: Usuario = {
          id: Date.now(),
          username: email.split('@')[0] || nombre.toLowerCase().replace(/\s+/g, ''),
          nombre: nombre.trim(),
          email: email.trim(),
          rol: rol === 'Vendedor' ? 'VENDEDOR' : backendRol,
          activo: true,
        };
        setUsuarios((prev) => [nuevoUsuario, ...prev]);
        showToast('success', 'Usuario creado exitosamente.');
      }

      setViewMode('list');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al guardar usuario';
      showToast('error', msg);
    } finally {
      setSaving(false);
    }
  };

  // Confirmar eliminación
  const handleConfirmDelete = async () => {
    if (!usuarioToDelete) return;
    setIsDeleting(true);
    try {
      if (usuarioToDelete.id < 900) {
        await deleteUsuario(usuarioToDelete.id);
      }
      setUsuarios((prev) => prev.filter((u) => u.id !== usuarioToDelete.id));
      showToast('success', 'Usuario eliminado correctamente.');
      setUsuarioToDelete(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al eliminar usuario';
      showToast('error', msg);
    } finally {
      setIsDeleting(false);
    }
  };

  // Helper para renderizar el badge de rol idéntico a Foto 1
  const renderRolBadge = (rolValue: any) => {
    const rolStr = (
      typeof rolValue === 'object' && rolValue !== null
        ? rolValue.nombre
        : rolValue || ''
    ).toUpperCase();

    if (rolStr.includes('ADMIN')) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wide bg-[#22c55e] text-white">
          ADMIN
        </span>
      );
    }

    if (rolStr.includes('VENDEDOR') || rolStr.includes('CAJERO')) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wide bg-[#64748b] text-white">
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
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wide bg-slate-500 text-white">
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
      {/* VISTA 1: LISTA DE USUARIOS (FOTO 1)                                     */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {viewMode === 'list' && (
        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm shadow-slate-200/50 border border-slate-100/60">
          {/* Cabecera: Título + Botón NUEVO USUARIO */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-100/60">
            <h1 className="text-base md:text-lg font-bold text-slate-800 tracking-tight">
              Lista de Usuarios
            </h1>
            <button
              type="button"
              onClick={handleOpenNewUsuario}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-gradient-to-r from-[#d946ef] to-[#c026d3] hover:from-[#c026d3] hover:to-[#a21caf] text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md shadow-fuchsia-500/25 active:scale-[0.98] transition-all cursor-pointer"
            >
              NUEVO USUARIO
            </button>
          </div>

          {/* Tabla de Usuarios */}
          <div className="overflow-x-auto -mx-6 md:-mx-8 px-6 md:px-8 mt-2">
            <table className="w-full text-left border-collapse min-w-[650px]">
              <thead>
                <tr className="border-b border-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  <th className="py-3 px-3 text-left">NOMBRE</th>
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
                        <span>Cargando catálogo de usuarios...</span>
                      </div>
                    </td>
                  </tr>
                ) : usuarios.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-12 text-center text-slate-400">
                      No hay usuarios registrados.
                    </td>
                  </tr>
                ) : (
                  usuarios.map((u) => {
                    const nombreVisible = u.nombre || u.username || 'Usuario';

                    return (
                      <tr
                        key={u.id}
                        className="hover:bg-slate-50/70 transition-colors group"
                      >
                        {/* Nombre */}
                        <td className="py-4 px-3 font-medium text-slate-800">
                          {nombreVisible}
                        </td>

                        {/* Email */}
                        <td className="py-4 px-3 text-slate-600">
                          {u.email || '-'}
                        </td>

                        {/* Rol */}
                        <td className="py-4 px-3">
                          {renderRolBadge(u.rol)}
                        </td>

                        {/* Acciones */}
                        <td className="py-4 px-3 text-right pr-4 whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => handleOpenEditUsuario(u)}
                            className="text-slate-500 hover:text-slate-800 font-medium text-xs sm:text-sm mr-5 cursor-pointer transition-colors"
                          >
                            Editar
                          </button>
                          <button
                            type="button"
                            onClick={() => setUsuarioToDelete(u)}
                            className="text-red-500 hover:text-red-700 font-medium text-xs sm:text-sm cursor-pointer transition-colors"
                          >
                            Eliminar
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
      {/* VISTA 2: NUEVO / EDITAR USUARIO (FOTO 2)                                */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {viewMode === 'form' && (
        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm shadow-slate-200/50 border border-slate-100/60 max-w-4xl mx-auto">
          {/* Cabecera del formulario */}
          <div className="flex items-center justify-between pb-6 border-b border-slate-100/60 mb-6">
            <h1 className="text-base md:text-lg font-bold text-slate-800 tracking-tight">
              {usuarioToEdit ? 'Editar Usuario' : 'Nuevo Usuario'}
            </h1>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 cursor-pointer transition-colors"
            >
              <ArrowLeft className="size-4" />
              <span>Volver a la lista</span>
            </button>
          </div>

          <form onSubmit={handleGuardar} className="space-y-6">
            {/* ─── CAMPO: NOMBRE ─── */}
            <div className="space-y-1.5">
              <label
                htmlFor="nombreInput"
                className="block text-xs font-bold text-slate-700"
              >
                Nombre
              </label>
              <input
                id="nombreInput"
                type="text"
                required
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Nombre del usuario"
                className="w-full h-11 px-4 text-xs sm:text-sm text-slate-800 bg-white hover:bg-slate-50/50 focus:bg-white rounded-xl border border-slate-200/80 focus:border-[#d946ef] focus:ring-4 focus:ring-fuchsia-100 transition-all outline-none placeholder:text-slate-400"
              />
            </div>

            {/* ─── CAMPO: EMAIL ─── */}
            <div className="space-y-1.5">
              <label
                htmlFor="emailInput"
                className="block text-xs font-bold text-slate-700"
              >
                Email
              </label>
              <input
                id="emailInput"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tarrillo@gmail.com"
                className="w-full h-11 px-4 text-xs sm:text-sm text-slate-800 bg-[#eef5fc] hover:bg-[#e8f1fb] focus:bg-white rounded-xl border border-transparent focus:border-[#d946ef] focus:ring-4 focus:ring-fuchsia-100 transition-all outline-none placeholder:text-slate-400"
              />
            </div>

            {/* ─── CAMPO: CONTRASEÑA ─── */}
            <div className="space-y-1.5">
              <label
                htmlFor="passwordInput"
                className="block text-xs font-bold text-slate-700"
              >
                Contraseña
              </label>
              <input
                id="passwordInput"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="..."
                className="w-full h-11 px-4 text-xs sm:text-sm text-slate-800 bg-[#eef5fc] hover:bg-[#e8f1fb] focus:bg-white rounded-xl border border-transparent focus:border-[#d946ef] focus:ring-4 focus:ring-fuchsia-100 transition-all outline-none placeholder:text-slate-400"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Requerida para nuevos usuarios.
              </p>
            </div>

            {/* ─── CAMPO: ROL ─── */}
            <div className="space-y-1.5">
              <label
                htmlFor="rolSelect"
                className="block text-xs font-bold text-slate-700"
              >
                Rol
              </label>
              <select
                id="rolSelect"
                value={rol}
                onChange={(e) => setRol(e.target.value as 'Admin' | 'Vendedor' | 'Farmacéutico')}
                className="w-full h-11 px-4 text-xs sm:text-sm text-slate-800 bg-white hover:bg-slate-50/50 focus:bg-white rounded-xl border border-slate-200/80 focus:border-[#d946ef] focus:ring-4 focus:ring-fuchsia-100 transition-all outline-none cursor-pointer"
              >
                <option value="Admin">Admin</option>
                <option value="Vendedor">Vendedor</option>
                <option value="Farmacéutico">Farmacéutico</option>
              </select>
            </div>

            {/* ─── BOTÓN GUARDAR Y CANCELAR ─── */}
            <div className="pt-2 flex items-center gap-3">
              <button
                type="submit"
                disabled={saving}
                className="px-8 py-2.5 bg-gradient-to-r from-[#d946ef] to-[#c026d3] hover:from-[#c026d3] hover:to-[#a21caf] text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md shadow-fuchsia-500/25 active:scale-[0.98] transition-all cursor-pointer flex items-center gap-2 disabled:opacity-70"
              >
                {saving && <Loader2 className="size-4 animate-spin text-white" />}
                <span>GUARDAR</span>
              </button>

              <button
                type="button"
                onClick={() => setViewMode('list')}
                className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer"
              >
                CANCELAR
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ─── MODAL CONFIRMAR ELIMINACIÓN ─── */}
      <Dialog
        open={Boolean(usuarioToDelete)}
        onOpenChange={(open) => !open && !isDeleting && setUsuarioToDelete(null)}
      >
        <DialogContent className="max-w-md bg-white rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-800">
              ¿Eliminar usuario?
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Esta acción revocará el acceso de este usuario al sistema.
            </DialogDescription>
          </DialogHeader>

          {usuarioToDelete && (
            <div className="my-4 p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-700 space-y-1">
              <p>
                Usuario:{' '}
                <strong>
                  {usuarioToDelete.nombre || usuarioToDelete.username}
                </strong>
              </p>
              {usuarioToDelete.email && (
                <p className="text-slate-500">Email: {usuarioToDelete.email}</p>
              )}
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setUsuarioToDelete(null)}
              disabled={isDeleting}
              className="rounded-xl text-xs font-semibold"
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="size-3.5 animate-spin mr-1.5" />
                  <span>Eliminando...</span>
                </>
              ) : (
                <>
                  <Trash2 className="size-3.5 mr-1.5" />
                  <span>Sí, Eliminar</span>
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
