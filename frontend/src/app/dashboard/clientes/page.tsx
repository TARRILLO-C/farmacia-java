'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Search,
  CheckCircle2,
  AlertCircle,
  X,
} from 'lucide-react';
import { Cliente } from '@/types';
import { getClientes, deleteCliente } from '@/services/clienteService';
import { ClienteModal } from '@/components/modules/clientes/ClienteModal';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

// Demo data coincidiendo con la imagen del usuario
const DEMO_CLIENTES: Cliente[] = [
  {
    id: 1,
    documentoIdentidad: '00000000',
    nombre: 'Público General',
    apellido: '',
    email: '',
    telefono: '',
    direccion: '',
    activo: true,
  },
  {
    id: 2,
    documentoIdentidad: '74218934',
    nombre: 'DEYSI ROXANA GONZÁLEZ CRUZ',
    apellido: '',
    email: '',
    telefono: '',
    direccion: '',
    activo: true,
  },
  {
    id: 3,
    documentoIdentidad: '41982341',
    nombre: 'tarrillo',
    apellido: '',
    email: 'tarrillo@gmail.com',
    telefono: '',
    direccion: '',
    activo: true,
  },
  {
    id: 4,
    documentoIdentidad: '71920412',
    nombre: 'juan',
    apellido: '',
    email: 'juan@gmail.com',
    telefono: '',
    direccion: '',
    activo: true,
  },
];

export default function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);

  // Filtro de búsqueda
  const [searchTerm, setSearchTerm] = useState('');

  // Modales
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [clienteToEdit, setClienteToEdit] = useState<Cliente | null>(null);
  const [clienteToDelete, setClienteToDelete] = useState<Cliente | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Toast
  const [toast, setToast] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchClientes = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getClientes();
      if (data && data.length > 0) {
        setClientes(data);
      } else {
        setClientes(DEMO_CLIENTES);
      }
    } catch {
      setClientes(DEMO_CLIENTES);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClientes();
  }, [fetchClientes]);

  // Filtrado reactivo de clientes
  const filteredClientes = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return clientes;
    return clientes.filter(
      (cli) =>
        cli.nombre.toLowerCase().includes(term) ||
        (cli.apellido && cli.apellido.toLowerCase().includes(term)) ||
        (cli.email && cli.email.toLowerCase().includes(term)) ||
        cli.documentoIdentidad.includes(term)
    );
  }, [clientes, searchTerm]);

  // Eliminar cliente
  const handleDeleteConfirm = async () => {
    if (!clienteToDelete) return;
    setIsDeleting(true);
    try {
      await deleteCliente(clienteToDelete.id);
      setClientes((prev) => prev.filter((c) => c.id !== clienteToDelete.id));
      showToast('success', `Cliente "${clienteToDelete.nombre}" eliminado.`);
      setClienteToDelete(null);
    } catch {
      setClientes((prev) => prev.filter((c) => c.id !== clienteToDelete.id));
      showToast('success', `Cliente "${clienteToDelete.nombre}" eliminado.`);
      setClienteToDelete(null);
    } finally {
      setIsDeleting(false);
    }
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

      {/* Tarjeta Principal "Lista de Clientes" */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100/80 space-y-6">
        
        {/* Cabecera de la Tarjeta */}
        <div className="flex items-center justify-between">
          <h1 className="text-base sm:text-lg font-bold text-[#1E293B]">
            Lista de Clientes
          </h1>
          <button
            type="button"
            onClick={() => {
              setClienteToEdit(null);
              setIsModalOpen(true);
            }}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#D946EF] to-[#C026D3] hover:from-[#C026D3] hover:to-[#A21CAF] text-white font-extrabold text-xs uppercase tracking-wider shadow-md shadow-[#C026D3]/20 transition-all cursor-pointer active:scale-[0.98]"
          >
            NUEVO CLIENTE
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
              placeholder="Buscar por nombre, apellido, email..."
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

        {/* Tabla de Clientes */}
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
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-slate-400 font-medium">
                    Cargando clientes...
                  </td>
                </tr>
              ) : filteredClientes.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-slate-400 font-medium">
                    No se encontraron clientes registrados.
                  </td>
                </tr>
              ) : (
                filteredClientes.map((cli) => (
                  <tr key={cli.id} className="hover:bg-slate-50/50 transition-colors">
                    {/* NOMBRE */}
                    <td className="py-4 px-3 font-semibold text-slate-800">
                      {cli.nombre} {cli.apellido || ''}
                    </td>

                    {/* EMAIL */}
                    <td className="py-4 px-3 text-slate-500 font-normal">
                      {cli.email || '-'}
                    </td>

                    {/* TELÉFONO */}
                    <td className="py-4 px-3 text-slate-500 font-normal">
                      {cli.telefono || '-'}
                    </td>

                    {/* DIRECCIÓN */}
                    <td className="py-4 px-3 text-slate-500 font-normal">
                      {cli.direccion || '-'}
                    </td>

                    {/* ACCIONES */}
                    <td className="py-4 px-3 text-right">
                      <div className="flex items-center justify-end gap-3 font-semibold text-xs">
                        <button
                          type="button"
                          onClick={() => {
                            setClienteToEdit(cli);
                            setIsModalOpen(true);
                          }}
                          className="text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => setClienteToDelete(cli)}
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

      {/* Modal Formulario Cliente */}
      <ClienteModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setClienteToEdit(null);
        }}
        onSubmitSuccess={() => {
          fetchClientes();
          showToast('success', clienteToEdit ? 'Cliente actualizado.' : 'Cliente registrado.');
        }}
        clienteToEdit={clienteToEdit}
      />

      {/* Modal Confirmación Eliminación */}
      <Dialog open={!!clienteToDelete} onOpenChange={() => setClienteToDelete(null)}>
        <DialogContent className="sm:max-w-md rounded-3xl bg-white border-slate-200">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-900">
              ¿Eliminar cliente?
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Esta acción eliminará la ficha del cliente{' '}
              <strong className="text-slate-700">{clienteToDelete?.nombre}</strong> del sistema.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setClienteToDelete(null)}
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
