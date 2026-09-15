'use client';

import React, { useState, useMemo } from 'react';
import {
  Search,
  CheckCircle2,
  AlertCircle,
  X,
  Truck,
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

export interface Proveedor {
  id: number;
  nombre: string;
  email: string;
  telefono: string;
  direccion: string;
  ruc?: string;
  activo?: boolean;
}

const DEMO_PROVEEDORES: Proveedor[] = [
  {
    id: 1,
    nombre: 'Laboratorios Genfar S.A.',
    email: 'contacto@genfar.com.pe',
    telefono: '01-4112000',
    direccion: 'Av. Las Industrial 450, Lima',
    ruc: '20100128491',
    activo: true,
  },
  {
    id: 2,
    nombre: 'Medifarma S.A.',
    email: 'ventas@medifarma.com.pe',
    telefono: '01-3172000',
    direccion: 'Av. Alfredo Mendiola 5600, Los Olivos',
    ruc: '20100039201',
    activo: true,
  },
  {
    id: 3,
    nombre: 'Bayer S.A. Perú',
    email: 'pedidos@bayer.com.pe',
    telefono: '01-2113800',
    direccion: 'Av. Paseo de la República 3074, San Isidro',
    ruc: '20100394812',
    activo: true,
  },
  {
    id: 4,
    nombre: 'Colgate-Palmolive Perú S.A.',
    email: 'atencion@colgate.com.pe',
    telefono: '01-2134000',
    direccion: 'Av. Ejército 790, Miraflores',
    ruc: '20100238491',
    activo: true,
  },
];

export default function ProveedoresPage() {
  const [proveedores, setProveedores] = useState<Proveedor[]>(DEMO_PROVEEDORES);
  const [loading, setLoading] = useState(false);

  // Filtro de búsqueda
  const [searchTerm, setSearchTerm] = useState('');

  // Modales
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [proveedorToEdit, setProveedorToEdit] = useState<Proveedor | null>(null);
  const [proveedorToDelete, setProveedorToDelete] = useState<Proveedor | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form State para Nuevo/Editar Proveedor
  const [formNombre, setFormNombre] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formTelefono, setFormTelefono] = useState('');
  const [formDireccion, setFormDireccion] = useState('');

  // Toast
  const [toast, setToast] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  // Filtrado reactivo de proveedores
  const filteredProveedores = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return proveedores;
    return proveedores.filter(
      (prov) =>
        prov.nombre.toLowerCase().includes(term) ||
        (prov.email && prov.email.toLowerCase().includes(term)) ||
        (prov.telefono && prov.telefono.includes(term))
    );
  }, [proveedores, searchTerm]);

  const handleOpenModal = (prov?: Proveedor) => {
    if (prov) {
      setProveedorToEdit(prov);
      setFormNombre(prov.nombre);
      setFormEmail(prov.email || '');
      setFormTelefono(prov.telefono || '');
      setFormDireccion(prov.direccion || '');
    } else {
      setProveedorToEdit(null);
      setFormNombre('');
      setFormEmail('');
      setFormTelefono('');
      setFormDireccion('');
    }
    setIsModalOpen(true);
  };

  const handleSaveProveedor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formNombre.trim()) return;

    if (proveedorToEdit) {
      setProveedores((prev) =>
        prev.map((p) =>
          p.id === proveedorToEdit.id
            ? {
                ...p,
                nombre: formNombre.trim(),
                email: formEmail.trim(),
                telefono: formTelefono.trim(),
                direccion: formDireccion.trim(),
              }
            : p
        )
      );
      showToast('success', `Proveedor "${formNombre}" actualizado.`);
    } else {
      const newProv: Proveedor = {
        id: Date.now(),
        nombre: formNombre.trim(),
        email: formEmail.trim(),
        telefono: formTelefono.trim(),
        direccion: formDireccion.trim(),
        activo: true,
      };
      setProveedores((prev) => [...prev, newProv]);
      showToast('success', `Proveedor "${formNombre}" registrado.`);
    }

    setIsModalOpen(false);
  };

  const handleDeleteConfirm = () => {
    if (!proveedorToDelete) return;
    setIsDeleting(true);
    setProveedores((prev) => prev.filter((p) => p.id !== proveedorToDelete.id));
    showToast('success', `Proveedor "${proveedorToDelete.nombre}" eliminado.`);
    setProveedorToDelete(null);
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

      {/* Tarjeta Principal "Lista de Proveedores" */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100/80 space-y-6">
        
        {/* Cabecera de la Tarjeta */}
        <div className="flex items-center justify-between">
          <h1 className="text-base sm:text-lg font-bold text-[#1E293B]">
            Lista de Proveedores
          </h1>
          <button
            type="button"
            onClick={() => handleOpenModal()}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#D946EF] to-[#C026D3] hover:from-[#C026D3] hover:to-[#A21CAF] text-white font-extrabold text-xs uppercase tracking-wider shadow-md shadow-[#C026D3]/20 transition-all cursor-pointer active:scale-[0.98]"
          >
            NUEVO PROVEEDOR
          </button>
        </div>

        {/* Buscador + Botón Buscar */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="size-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por nombre, email..."
              className="w-full h-11 pl-11 pr-4 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 placeholder:text-slate-400 outline-none focus:border-[#0095FF] focus:ring-2 focus:ring-[#0095FF]/10 transition-all"
            />
          </div>
          <button
            type="button"
            className="px-6 h-11 rounded-xl bg-[#C026D3] hover:bg-[#A21CAF] text-white font-extrabold text-xs uppercase tracking-wider shadow-sm transition-all cursor-pointer"
          >
            BUSCAR
          </button>
        </div>

        {/* Tabla de Proveedores */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                <th className="py-3 px-3">NOMBRE</th>
                <th className="py-3 px-3">EMAIL</th>
                <th className="py-3 px-3">TELÉFONO</th>
                <th className="py-3 px-3">DIRECCIÓN</th>
                <th className="py-3 px-3 text-right">ACCIONES</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredProveedores.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-slate-400 font-medium">
                    No se encontraron proveedores registrados.
                  </td>
                </tr>
              ) : (
                filteredProveedores.map((prov) => (
                  <tr key={prov.id} className="hover:bg-slate-50/50 transition-colors">
                    {/* NOMBRE */}
                    <td className="py-4 px-3 font-semibold text-slate-800">
                      {prov.nombre}
                    </td>

                    {/* EMAIL */}
                    <td className="py-4 px-3 text-slate-500 font-normal">
                      {prov.email || '-'}
                    </td>

                    {/* TELÉFONO */}
                    <td className="py-4 px-3 text-slate-500 font-normal">
                      {prov.telefono || '-'}
                    </td>

                    {/* DIRECCIÓN */}
                    <td className="py-4 px-3 text-slate-500 font-normal">
                      {prov.direccion || '-'}
                    </td>

                    {/* ACCIONES */}
                    <td className="py-4 px-3 text-right">
                      <div className="flex items-center justify-end gap-3 font-semibold text-xs">
                        <button
                          type="button"
                          onClick={() => handleOpenModal(prov)}
                          className="text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => setProveedorToDelete(prov)}
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

      {/* Modal Formulario Proveedor */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md rounded-3xl bg-white border-slate-200">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-900">
              {proveedorToEdit ? 'Editar Proveedor' : 'Nuevo Proveedor'}
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Ingrese los datos de contacto del laboratorio o distribuidora.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveProveedor} className="space-y-4 py-2 text-xs">
            <div className="space-y-1.5">
              <label className="block font-bold text-slate-800">Nombre / Razón Social</label>
              <input
                type="text"
                required
                value={formNombre}
                onChange={(e) => setFormNombre(e.target.value)}
                placeholder="Ej. Laboratorios Genfar S.A."
                className="w-full h-10 px-3.5 rounded-xl border border-slate-200 text-xs text-slate-800 outline-none focus:border-[#0095FF]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block font-bold text-slate-800">Email de Contacto</label>
              <input
                type="email"
                value={formEmail}
                onChange={(e) => setFormEmail(e.target.value)}
                placeholder="contacto@proveedor.com"
                className="w-full h-10 px-3.5 rounded-xl border border-slate-200 text-xs text-slate-800 outline-none focus:border-[#0095FF]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="block font-bold text-slate-800">Teléfono</label>
                <input
                  type="text"
                  value={formTelefono}
                  onChange={(e) => setFormTelefono(e.target.value)}
                  placeholder="01-4112000"
                  className="w-full h-10 px-3.5 rounded-xl border border-slate-200 text-xs text-slate-800 outline-none focus:border-[#0095FF]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block font-bold text-slate-800">Dirección</label>
                <input
                  type="text"
                  value={formDireccion}
                  onChange={(e) => setFormDireccion(e.target.value)}
                  placeholder="Av. Industrial 123"
                  className="w-full h-10 px-3.5 rounded-xl border border-slate-200 text-xs text-slate-800 outline-none focus:border-[#0095FF]"
                />
              </div>
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
                {proveedorToEdit ? 'GUARDAR CAMBIOS' : 'REGISTRAR'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal Confirmación Eliminación */}
      <Dialog open={!!proveedorToDelete} onOpenChange={() => setProveedorToDelete(null)}>
        <DialogContent className="sm:max-w-md rounded-3xl bg-white border-slate-200">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-900">
              ¿Eliminar proveedor?
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Esta acción eliminará el proveedor{' '}
              <strong className="text-slate-700">{proveedorToDelete?.nombre}</strong>.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setProveedorToDelete(null)}
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
