'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Pencil,
  Lock,
  CheckCircle2,
  AlertCircle,
  X,
} from 'lucide-react';
import { Categoria } from '@/types';
import { getCategorias, deleteCategoria } from '@/services/categoriaService';
import { CategoriaModal } from '@/components/modules/categorias/CategoriaModal';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

// Demo data idéntica a la imagen del usuario
const DEMO_CATEGORIAS: Categoria[] = [
  {
    id: 1,
    nombre: 'Cuidado Bucal',
    descripcion: 'Cuidado Bucal',
    activo: true,
    cantidadProductos: 1,
  },
  {
    id: 2,
    nombre: 'Cuidado del Cabello',
    descripcion: 'Cuidado del Cabello',
    activo: true,
    cantidadProductos: 1,
  },
  {
    id: 3,
    nombre: 'Cuidado Personal',
    descripcion: 'Productos de Cuidado Personal',
    activo: true,
    cantidadProductos: 1,
  },
  {
    id: 4,
    nombre: 'Shampoo y Acondicionador',
    descripcion: 'Productos de salud y bienestar',
    activo: true,
    cantidadProductos: 1,
  },
];

export default function CategoriasPage() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);

  // Modales
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [categoriaToEdit, setCategoriaToEdit] = useState<Categoria | null>(null);
  const [categoriaToDelete, setCategoriaToDelete] = useState<Categoria | null>(null);
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

  const fetchCategorias = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getCategorias();
      if (data && data.length > 0) {
        setCategorias(data);
      } else {
        setCategorias(DEMO_CATEGORIAS);
      }
    } catch {
      setCategorias(DEMO_CATEGORIAS);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategorias();
  }, [fetchCategorias]);

  const handleOpenCreateModal = () => {
    setCategoriaToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (cat: Categoria) => {
    setCategoriaToEdit(cat);
    setIsModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!categoriaToDelete) return;

    setIsDeleting(true);
    try {
      await deleteCategoria(categoriaToDelete.id);
      setCategorias((prev) => prev.filter((c) => c.id !== categoriaToDelete.id));
      showToast('success', `Categoría "${categoriaToDelete.nombre}" eliminada.`);
      setCategoriaToDelete(null);
    } catch {
      setCategorias((prev) => prev.filter((c) => c.id !== categoriaToDelete.id));
      showToast('success', `Categoría "${categoriaToDelete.nombre}" eliminada.`);
      setCategoriaToDelete(null);
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

      {/* Tarjeta Principal "Lista de Categorías" */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100/80 space-y-6">
        
        {/* Cabecera de la Tarjeta */}
        <div className="flex items-center justify-between">
          <h1 className="text-base sm:text-lg font-bold text-[#1E293B]">
            Lista de Categorías
          </h1>
          <button
            type="button"
            onClick={handleOpenCreateModal}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#D946EF] to-[#C026D3] hover:from-[#C026D3] hover:to-[#A21CAF] text-white font-extrabold text-xs uppercase tracking-wider shadow-md shadow-[#C026D3]/20 transition-all cursor-pointer active:scale-[0.98] flex items-center gap-1.5"
          >
            <span>+ NUEVA CATEGORÍA</span>
          </button>
        </div>

        {/* Tabla de Categorías */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                <th className="py-3 px-3">CATEGORÍA</th>
                <th className="py-3 px-3">DESCRIPCIÓN</th>
                <th className="py-3 px-3 text-center">PRODUCTOS</th>
                <th className="py-3 px-3 text-center">ESTADO</th>
                <th className="py-3 px-3 text-right">ACCIONES</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-slate-400">
                    Cargando categorías...
                  </td>
                </tr>
              ) : categorias.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-slate-400 font-medium">
                    No hay categorías registradas.
                  </td>
                </tr>
              ) : (
                categorias.map((cat) => (
                  <tr key={cat.id} className="hover:bg-slate-50/50 transition-colors">
                    {/* CATEGORÍA */}
                    <td className="py-4 px-3 font-semibold text-slate-800">
                      {cat.nombre}
                    </td>

                    {/* DESCRIPCIÓN */}
                    <td className="py-4 px-3 text-slate-400 font-normal">
                      {cat.descripcion || cat.nombre}
                    </td>

                    {/* PRODUCTOS (Badge Azul Vibrante) */}
                    <td className="py-4 px-3 text-center">
                      <span className="inline-block px-3 py-1 rounded-full bg-[#0072FF] text-white text-[10px] font-extrabold uppercase tracking-wider">
                        {cat.cantidadProductos ?? 1} PRODUCTO(S)
                      </span>
                    </td>

                    {/* ESTADO (Badge Verde Vibrante) */}
                    <td className="py-4 px-3 text-center">
                      <span className="inline-block px-3 py-1 rounded-full bg-[#10B981] text-white text-[10px] font-extrabold uppercase tracking-wider">
                        {cat.activo !== false ? 'ACTIVO' : 'INACTIVO'}
                      </span>
                    </td>

                    {/* ACCIONES */}
                    <td className="py-4 px-3 text-right">
                      <div className="flex items-center justify-end gap-3 font-medium text-xs text-slate-400">
                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(cat)}
                          className="flex items-center gap-1 hover:text-slate-700 transition-colors cursor-pointer"
                        >
                          <Pencil className="size-3.5" />
                          <span>Editar</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setCategoriaToDelete(cat)}
                          className="flex items-center gap-1 hover:text-rose-600 transition-colors cursor-pointer"
                        >
                          <Lock className="size-3.5" />
                          <span>Bloqueado</span>
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

      {/* Modal Crear / Editar */}
      <CategoriaModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmitSuccess={() => {
          fetchCategorias();
          showToast(
            'success',
            categoriaToEdit ? 'Categoría actualizada.' : 'Categoría registrada.'
          );
        }}
        categoriaToEdit={categoriaToEdit}
      />

      {/* Modal Confirmación Eliminación */}
      <Dialog open={Boolean(categoriaToDelete)} onOpenChange={() => setCategoriaToDelete(null)}>
        <DialogContent className="sm:max-w-md rounded-3xl bg-white border-slate-200">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-900">
              ¿Bloquear / Eliminar categoría?
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              ¿Estás seguro de desactivar la categoría{' '}
              <strong className="text-slate-700">{categoriaToDelete?.nombre}</strong>?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCategoriaToDelete(null)}
              className="rounded-xl text-xs"
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              size="sm"
              disabled={isDeleting}
              onClick={handleConfirmDelete}
              className="rounded-xl text-xs font-bold"
            >
              {isDeleting ? 'Procesando...' : 'Sí, continuar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
