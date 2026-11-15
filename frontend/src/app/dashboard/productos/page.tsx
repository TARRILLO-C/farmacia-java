'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Search,
  Package,
  Plus,
  Trash2,
  Edit,
  AlertCircle,
  CheckCircle2,
  Loader2,
  X,
} from 'lucide-react';
import { Producto, Categoria } from '@/types';
import {
  getProductos,
  deleteProducto,
  getCategoriasParaSelector,
} from '@/services/productoService';
import { ProductoModal } from '@/components/modules/productos/ProductoModal';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

// Productos de muestra basados en la referencia visual de Sistema AG
const SAMPLE_PRODUCTS: Producto[] = [
  {
    id: 901,
    codigo: '001',
    nombre: 'Desodorante Roll On Nivea Serum Tono Natural',
    categoriaNombre: 'CUIDADO PERSONAL',
    laboratorio: 'Beiersdorf',
    precioCompra: 13.0,
    precio: 21.0,
    stock: 19,
    stockMinimo: 5,
    activo: true,
  },
  {
    id: 902,
    codigo: '002',
    nombre: 'Mascarilla Capilar Herbal Essences Suavidad Rosa Mosqueta',
    categoriaNombre: 'CUIDADO DEL CABELLO',
    laboratorio: 'Procter & Gamble',
    precioCompra: 25.0,
    precio: 35.0,
    stock: 30,
    stockMinimo: 5,
    activo: true,
  },
  {
    id: 903,
    codigo: '003',
    nombre:
      'Pack Sensibilidad Colgate Crema Pro Alivio Blanqueador + Cepillos + Enjuague Encias',
    categoriaNombre: 'CUIDADO BUCAL',
    laboratorio: 'Colgate-Palmolive',
    precioCompra: 50.0,
    precio: 69.9,
    stock: 50,
    stockMinimo: 10,
    activo: true,
  },
  {
    id: 904,
    codigo: '004',
    nombre: 'Pack Sedal Luminous UV Shampoo + Acondicionador',
    categoriaNombre: 'SHAMPOO Y ACONDICIONADOR',
    laboratorio: 'Unilever',
    precioCompra: 20.0,
    precio: 29.0,
    stock: 32,
    stockMinimo: 5,
    activo: true,
  },
];

export default function ProductosPage() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeQuery, setActiveQuery] = useState('');

  // Modales
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [productoToEdit, setProductoToEdit] = useState<Producto | null>(null);
  const [productoToDelete, setProductoToDelete] = useState<Producto | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Toast simple
  const [toast, setToast] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [prodsData, catsData] = await Promise.all([
        getProductos().catch(() => []),
        getCategoriasParaSelector().catch(() => []),
      ]);

      const backendProds = Array.isArray(prodsData) ? prodsData : [];
      setCategorias(Array.isArray(catsData) ? catsData : []);

      // Si el backend tiene productos, los combinamos de manera limpia con los de muestra
      if (backendProds.length > 0) {
        // Filtrar muestras que ya existan por código o id
        const existingCodes = new Set(backendProds.map((p) => p.codigo));
        const nonDuplicateSamples = SAMPLE_PRODUCTS.filter(
          (sp) => !existingCodes.has(sp.codigo)
        );
        setProductos([...backendProds, ...nonDuplicateSamples]);
      } else {
        setProductos(SAMPLE_PRODUCTS);
      }
    } catch {
      setProductos(SAMPLE_PRODUCTS);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Filtrado de productos por término de búsqueda
  const filteredProductos = useMemo(() => {
    const q = (activeQuery || searchTerm).trim().toLowerCase();
    if (!q) return productos;

    return productos.filter((p) => {
      const cod = (p.codigo || '').toLowerCase();
      const nom = (p.nombre || '').toLowerCase();
      const cat = (p.categoriaNombre || '').toLowerCase();
      const prov = (p.laboratorio || '').toLowerCase();
      return (
        cod.includes(q) || nom.includes(q) || cat.includes(q) || prov.includes(q)
      );
    });
  }, [productos, searchTerm, activeQuery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveQuery(searchTerm);
  };

  const handleOpenCreateModal = () => {
    setProductoToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (prod: Producto) => {
    setProductoToEdit(prod);
    setIsModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!productoToDelete) return;
    setIsDeleting(true);
    try {
      if (productoToDelete.id < 900) {
        await deleteProducto(productoToDelete.id);
      }
      setProductos((prev) => prev.filter((p) => p.id !== productoToDelete.id));
      showToast('success', 'Producto eliminado exitosamente');
      setProductoToDelete(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al eliminar producto';
      showToast('error', msg);
    } finally {
      setIsDeleting(false);
    }
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

      {/* ─── TARJETA PRINCIPAL: LISTA DE PRODUCTOS ─── */}
      <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm shadow-slate-200/50 border border-slate-100/60">
        {/* Cabecera: Título + Botón NUEVO PRODUCTO */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-100/60">
          <h1 className="text-base md:text-lg font-bold text-slate-800 tracking-tight">
            Lista de Productos
          </h1>
          <button
            type="button"
            onClick={handleOpenCreateModal}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-gradient-to-r from-[#d946ef] to-[#c026d3] hover:from-[#c026d3] hover:to-[#a21caf] text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md shadow-fuchsia-500/25 active:scale-[0.98] transition-all cursor-pointer"
          >
            NUEVO PRODUCTO
          </button>
        </div>

        {/* Buscador + Botón BUSCAR */}
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-3 my-6">
          <div className="relative flex-1">
            <Search className="size-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por código, nombre, proveedor..."
              className="w-full h-11 pl-11 pr-4 text-xs font-normal text-slate-800 bg-slate-50/80 hover:bg-slate-50 focus:bg-white rounded-xl border border-slate-200/80 focus:border-[#d946ef] focus:ring-4 focus:ring-fuchsia-100 transition-all outline-none placeholder:text-slate-400"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm('');
                  setActiveQuery('');
                }}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>
          <button
            type="submit"
            className="h-11 px-7 bg-gradient-to-r from-[#d946ef] to-[#c026d3] hover:from-[#c026d3] hover:to-[#a21caf] text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md shadow-fuchsia-500/20 active:scale-[0.98] transition-all cursor-pointer shrink-0"
          >
            BUSCAR
          </button>
        </form>

        {/* ─── TABLA DE PRODUCTOS ─── */}
        <div className="overflow-x-auto -mx-6 md:-mx-8 px-6 md:px-8">
          <table className="w-full text-left border-collapse min-w-[850px]">
            <thead>
              <tr className="border-b border-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                <th className="py-3 px-3 text-left w-16">IMAGEN</th>
                <th className="py-3 px-3 text-left w-20">CÓDIGO</th>
                <th className="py-3 px-3 text-left">NOMBRE</th>
                <th className="py-3 px-3 text-left">CATEGORÍA</th>
                <th className="py-3 px-3 text-left">PROVEEDOR</th>
                <th className="py-3 px-3 text-left whitespace-nowrap">PRECIO COMPRA</th>
                <th className="py-3 px-3 text-left whitespace-nowrap">PRECIO VENTA</th>
                <th className="py-3 px-3 text-center w-20">STOCK</th>
                <th className="py-3 px-3 text-right pr-4">ACCIONES</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/70">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-xs text-slate-400">
                    <Loader2 className="size-6 animate-spin text-[#d946ef] mx-auto mb-2" />
                    Cargando catálogo de productos...
                  </td>
                </tr>
              ) : filteredProductos.length > 0 ? (
                filteredProductos.map((prod) => (
                  <tr
                    key={prod.id}
                    className="hover:bg-slate-50/70 transition-colors group"
                  >
                    {/* Imagen / Miniatura */}
                    <td className="py-3 px-3">
                      <div className="size-11 rounded-xl bg-slate-50 border border-slate-200/60 overflow-hidden flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform">
                        {prod.imagenUrl ? (
                          <img
                            src={prod.imagenUrl}
                            alt={prod.nombre}
                            className="size-full object-cover"
                          />
                        ) : (
                          <div className="size-full flex items-center justify-center bg-gradient-to-tr from-pink-50 to-purple-50 text-[#d946ef]">
                            <Package className="size-5 stroke-[1.8]" />
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Código */}
                    <td className="py-3 px-3 text-xs font-semibold text-slate-700 font-mono">
                      {prod.codigo || '—'}
                    </td>

                    {/* Nombre */}
                    <td className="py-3 px-3 text-xs font-medium text-slate-800 max-w-xs">
                      <span className="line-clamp-2">{prod.nombre}</span>
                    </td>

                    {/* Categoría Badge Azul Brillante */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className="inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide bg-[#0095ff] text-white shadow-xs">
                        {prod.categoriaNombre || prod.categoria?.nombre || 'GENERAL'}
                      </span>
                    </td>

                    {/* Proveedor / Laboratorio */}
                    <td className="py-3 px-3 text-xs text-slate-500 whitespace-nowrap">
                      {prod.laboratorio || '—'}
                    </td>

                    {/* Precio Compra */}
                    <td className="py-3 px-3 text-xs font-medium text-slate-600 whitespace-nowrap">
                      {Number(prod.precioCompra || 0).toFixed(2)}
                    </td>

                    {/* Precio Venta */}
                    <td className="py-3 px-3 text-xs font-semibold text-slate-800 whitespace-nowrap">
                      {Number(prod.precio || 0).toFixed(2)}
                    </td>

                    {/* Stock Badge */}
                    <td className="py-3 px-3 text-center whitespace-nowrap">
                      <span
                        className={`inline-flex items-center justify-center min-w-[32px] px-2 py-0.5 rounded-md text-xs font-bold text-white shadow-2xs ${
                          Number(prod.stock || 0) <= 0
                            ? 'bg-rose-500'
                            : Number(prod.stock || 0) <= 5
                            ? 'bg-amber-500'
                            : 'bg-[#22c55e]'
                        }`}
                      >
                        {prod.stock || 0}
                      </span>
                    </td>

                    {/* Acciones */}
                    <td className="py-3 px-3 text-right whitespace-nowrap pr-4">
                      <button
                        type="button"
                        onClick={() => handleOpenEditModal(prod)}
                        className="text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors cursor-pointer mr-3"
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        onClick={() => setProductoToDelete(prod)}
                        className="text-xs font-medium text-rose-500 hover:text-rose-700 transition-colors cursor-pointer"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-xs text-slate-400">
                    No se encontraron productos que coincidan con la búsqueda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── MODAL CREAR / EDITAR PRODUCTO ─── */}
      <ProductoModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmitSuccess={() => {
          setIsModalOpen(false);
          fetchData();
          showToast(
            'success',
            productoToEdit ? 'Producto actualizado' : 'Producto creado con éxito'
          );
        }}
        productoToEdit={productoToEdit}
        categoriasDisponibles={categorias}
      />

      {/* ─── MODAL CONFIRMAR ELIMINACIÓN ─── */}
      <Dialog
        open={Boolean(productoToDelete)}
        onOpenChange={(open) => !open && setProductoToDelete(null)}
      >
        <DialogContent className="max-w-md rounded-3xl bg-white p-6">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-800">
              ¿Eliminar producto?
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500 mt-1">
              Esta acción eliminará permanentemente{' '}
              <strong className="text-slate-800">{productoToDelete?.nombre}</strong>{' '}
              del inventario.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-6 flex items-center justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setProductoToDelete(null)}
              disabled={isDeleting}
              className="rounded-xl text-xs h-9"
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="rounded-xl text-xs h-9 bg-rose-600 hover:bg-rose-700 font-bold"
            >
              {isDeleting ? 'Eliminando...' : 'Sí, eliminar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
