'use client';

import React, { useState, useMemo } from 'react';
import {
  CheckCircle2,
  AlertCircle,
  X,
  UserCheck,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

export interface UsuarioItem {
  id: number;
  nombre: string;
  email: string;
  rol: 'ADMIN' | 'VENDEDOR' | 'CAJERO';
  activo?: boolean;
}

const DEMO_USUARIOS: UsuarioItem[] = [
  {
    id: 1,
    nombre: 'Administrador',
    email: 'tarrillo@gmail.com',
    rol: 'ADMIN',
    activo: true,
  },
  {
    id: 2,
    nombre: 'carlos',
    email: 'carlos@gmail.com',
    rol: 'VENDEDOR',
    activo: true,
  },
];

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<UsuarioItem[]>(DEMO_USUARIOS);
  const [loading, setLoading] = useState(false);

  // Modales
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [usuarioToEdit, setUsuarioToEdit] = useState<UsuarioItem | null>(null);
  const [usuarioToDelete, setUsuarioToDelete] = useState<UsuarioItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form State
  const [formNombre, setFormNombre] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formRol, setFormRol] = useState<'ADMIN' | 'VENDEDOR' | 'CAJERO'>('VENDEDOR');

  // Toast
  const [toast, setToast] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const handleOpenModal = (user?: UsuarioItem) => {
    if (user) {
      setUsuarioToEdit(user);
      setFormNombre(user.nombre);
      setFormEmail(user.email);
      setFormRol(user.rol);
    } else {
      setUsuarioToEdit(null);
      setFormNombre('');
      setFormEmail('');
      setFormRol('VENDEDOR');
    }
    setIsModalOpen(true);
  };

  const handleSaveUsuario = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formNombre.trim() || !formEmail.trim()) return;

    if (usuarioToEdit) {
      setUsuarios((prev) =>
        prev.map((u) =>
          u.id === usuarioToEdit.id
            ? { ...u, nombre: formNombre.trim(), email: formEmail.trim(), rol: formRol }
            : u
        )
      );
      showToast('success', `Usuario "${formNombre}" actualizado.`);
    } else {
      const newU: UsuarioItem = {
        id: Date.now(),
        nombre: formNombre.trim(),
        email: formEmail.trim(),
        rol: formRol,
        activo: true,
      };
      setUsuarios((prev) => [...prev, newU]);
      showToast('success', `Usuario "${formNombre}" registrado.`);
    }

    setIsModalOpen(false);
  };

  const handleDeleteConfirm = () => {
    if (!usuarioToDelete) return;
    setIsDeleting(true);
    setUsuarios((prev) => prev.filter((u) => u.id !== usuarioToDelete.id));
    showToast('success', `Usuario "${usuarioToDelete.nombre}" eliminado.`);
    setUsuarioToDelete(null);
    setIsDeleting(false);
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

      {/* Tarjeta Principal "Lista de Usuarios" */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100/80 space-y-6">
        
        {/* Cabecera de la Tarjeta */}
        <div className="flex items-center justify-between">
          <h1 className="text-base sm:text-lg font-bold text-[#1E293B]">
            Lista de Usuarios
          </h1>
          <button
            type="button"
            onClick={() => handleOpenModal()}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#D946EF] to-[#C026D3] hover:from-[#C026D3] hover:to-[#A21CAF] text-white font-extrabold text-xs uppercase tracking-wider shadow-md shadow-[#C026D3]/20 transition-all cursor-pointer active:scale-[0.98]"
          >
            NUEVO USUARIO
          </button>
        </div>

        {/* Tabla de Usuarios */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                <th className="py-3 px-3">NOMBRE</th>
                <th className="py-3 px-3">EMAIL</th>
                <th className="py-3 px-3 text-center">ROL</th>
                <th className="py-3 px-3 text-right">ACCIONES</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {usuarios.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-10 text-center text-slate-400 font-medium">
                    No se encontraron usuarios registrados.
                  </td>
                </tr>
              ) : (
                usuarios.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                    {/* NOMBRE */}
                    <td className="py-4 px-3 font-semibold text-slate-800">
                      {user.nombre}
                    </td>

                    {/* EMAIL */}
                    <td className="py-4 px-3 text-slate-500 font-normal">
                      {user.email}
                    </td>

                    {/* ROL (Badges estilizados) */}
                    <td className="py-4 px-3 text-center">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider text-white ${
                          user.rol === 'ADMIN'
                            ? 'bg-[#10B981]'
                            : 'bg-[#64748B]'
                        }`}
                      >
                        {user.rol}
                      </span>
                    </td>

                    {/* ACCIONES */}
                    <td className="py-4 px-3 text-right">
                      <div className="flex items-center justify-end gap-3 font-semibold text-xs">
                        <button
                          type="button"
                          onClick={() => handleOpenModal(user)}
                          className="text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => setUsuarioToDelete(user)}
                          className="text-rose-500 hover:text-rose-700 transition-colors cursor-pointer"
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>

      {/* Modal Formulario Usuario */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md rounded-3xl bg-white border-slate-200">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-900">
              {usuarioToEdit ? 'Editar Usuario' : 'Nuevo Usuario'}
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Complete los datos del operador del sistema.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveUsuario} className="space-y-4 py-2 text-xs">
            <div className="space-y-1.5">
              <label className="block font-bold text-slate-800">Nombre de Usuario</label>
              <input
                type="text"
                required
                value={formNombre}
                onChange={(e) => setFormNombre(e.target.value)}
                placeholder="Nombre o alias"
                className="w-full h-10 px-3.5 rounded-xl border border-slate-200 text-xs text-slate-800 outline-none focus:border-[#0095FF]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block font-bold text-slate-800">Email / Correo</label>
              <input
                type="email"
                required
                value={formEmail}
                onChange={(e) => setFormEmail(e.target.value)}
                placeholder="usuario@correo.com"
                className="w-full h-10 px-3.5 rounded-xl border border-slate-200 text-xs text-slate-800 outline-none focus:border-[#0095FF]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block font-bold text-slate-800">Rol de Sistema</label>
              <select
                value={formRol}
                onChange={(e) => setFormRol(e.target.value as 'ADMIN' | 'VENDEDOR' | 'CAJERO')}
                className="w-full h-10 px-3.5 rounded-xl border border-slate-200 text-xs text-slate-800 outline-none focus:border-[#0095FF]"
              >
                <option value="ADMIN">ADMIN</option>
                <option value="VENDEDOR">VENDEDOR</option>
                <option value="CAJERO">CAJERO</option>
              </select>
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsModalOpen(false)}
                className="rounded-xl text-xs"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                size="sm"
                className="rounded-xl text-xs font-bold bg-[#C026D3] hover:bg-[#A21CAF] text-white"
              >
                {usuarioToEdit ? 'GUARDAR CAMBIOS' : 'REGISTRAR'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal Confirmación Eliminación */}
      <Dialog open={!!usuarioToDelete} onOpenChange={() => setUsuarioToDelete(null)}>
        <DialogContent className="sm:max-w-md rounded-3xl bg-white border-slate-200">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-900">
              ¿Eliminar usuario?
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Esta acción eliminará el acceso para{' '}
              <strong className="text-slate-700">{usuarioToDelete?.nombre}</strong>.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setUsuarioToDelete(null)}
              className="rounded-xl text-xs"
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              size="sm"
              disabled={isDeleting}
              onClick={handleDeleteConfirm}
              className="rounded-xl text-xs font-bold"
            >
              {isDeleting ? 'Eliminando...' : 'Sí, eliminar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
