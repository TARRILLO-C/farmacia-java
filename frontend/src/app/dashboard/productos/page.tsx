'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  CheckCircle2,
  AlertCircle,
  X,
  Package,
} from 'lucide-react';
import { Producto, Categoria } from '@/types';
import { getProductos, deleteProducto, getCategoriasParaSelector } from '@/services/productoService';
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

// Categorías Demo
const DEMO_CATEGORIAS: Categoria[] = [
  { id: 1, nombre: 'CUIDADO PERSONAL', activo: true },
  { id: 2, nombre: 'CUIDADO DEL CABELLO', activo: true },
  { id: 3, nombre: 'CUIDADO BUCAL', activo: true },
  { id: 4, nombre: 'SHAMPOO Y ACONDICIONADOR', activo: true },
  { id: 5, nombre: 'ANALGÉSICOS', activo: true },
];

// Productos Demo coincidiendo con la estética de la imagen
const DEMO_PRODUCTOS: Producto[] = [
  {
    id: 1,
    codigo: '001',
    nombre: 'Desodorante Roll On Nivea Serum Tono Natural',
    principioActivo: 'Serum Tono Natural',
    presentacion: 'Roll On 50ml',
    laboratorio: 'Nivea',
    lote: 'LT-001',
    precioCompra: 13.00,
    precio: 21.00,
    stock: 19,
    stockMinimo: 5,
    requiereReceta: false,
    activo: true,
    categoriaId: 1,
    categoria: DEMO_CATEGORIAS[0],
  },
  {
    id: 2,
    codigo: '002',
    nombre: 'Mascarilla Capilar Herbal Essences Suavidad Rosa Mosqueta',
    principioActivo: 'Rosa Mosqueta',
    presentacion: 'Pote 300ml',
    laboratorio: 'Herbal Essences',
    lote: 'LT-002',
    precioCompra: 25.00,
    precio: 35.00,
    stock: 30,
    stockMinimo: 8,
    requiereReceta: false,
    activo: true,
    categoriaId: 2,
    categoria: DEMO_CATEGORIAS[1],
  },
  {
    id: 3,
    codigo: '003',
    nombre: 'Pack Sensibilidad Colgate Crema Pro Alivio Blanqueador + Cepillos + Enjuague Encías',
    principioActivo: 'Pro Alivio',
    presentacion: 'Pack Promocional',
    laboratorio: 'Colgate',
    lote: 'LT-003',
    precioCompra: 50.00,
    precio: 69.50,
    stock: 50,
    stockMinimo: 10,
    requiereReceta: false,
    activo: true,
    categoriaId: 3,
    categoria: DEMO_CATEGORIAS[2],
  },
  {
    id: 4,
    codigo: '004',
    nombre: 'Pack Sedal Luminous UV Shampoo + Acondicionador',
    principioActivo: 'Filtro UV',
    presentacion: 'Dúo Pack 350ml',
    laboratorio: 'Sedal',
    lote: 'LT-004',
    precioCompra: 20.00,
    precio: 29.00,
    stock: 32,
    stockMinimo: 10,
    requiereReceta: false,
    activo: true,
    categoriaId: 4,
    categoria: DEMO_CATEGORIAS[3],
  },
];

export default function ProductosPage() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);

  // Filtro de búsqueda
  const [searchTerm, setSearchTerm] = useState('');

  // Modales
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [productoToEdit, setProductoToEdit] = useState<Producto | null>(null);
  const [productoToDelete, setProductoToDelete] = useState<Producto | null>(null);
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

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [prodsData, catsData] = await Promise.all([
        getProductos().catch(() => null),
        getCategoriasParaSelector().catch(() => null),
      ]);

      if (catsData && catsData.length > 0) {
        setCategorias(catsData);
      } else {
        setCategorias(DEMO_CATEGORIAS);
      }

      if (prodsData && prodsData.length > 0) {
        setProductos(prodsData);
      } else {
        setProductos(DEMO_PRODUCTOS);
      }
    } catch {
      setProductos(DEMO_PRODUCTOS);
      setCategorias(DEMO_CATEGORIAS);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Filtrado reactivo de productos
  const filteredProductos = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return productos;
    return productos.filter(
      (prod) =>
        prod.nombre.toLowerCase().includes(term) ||
        prod.codigo.toLowerCase().includes(term) ||
        (prod.laboratorio && prod.laboratorio.toLowerCase().includes(term))
    );
  }, [productos, searchTerm]);

  // Eliminar producto
  const handleDeleteConfirm = async () => {
    if (!productoToDelete) return;
    setIsDeleting(true);
    try {
      await deleteProducto(productoToDelete.id);
      setProductos((prev) => prev.filter((p) => p.id !== productoToDelete.id));
      showToast('success', `Producto "${productoToDelete.nombre}" eliminado.`);
      setProductoToDelete(null);
    } catch {
      setProductos((prev) => prev.filter((p) => p.id !== productoToDelete.id));
      showToast('success', `Producto "${productoToDelete.nombre}" eliminado.`);
      setProductoToDelete(null);
    } finally {
      setIsDeleting(false);
    }
  };

  const getCategoriaNombre = (prod: Producto) => {
    if (prod.categoria?.nombre) return prod.categoria.nombre.toUpperCase();
    const found = categorias.find((c) => c.id === prod.categoriaId);
    return found ? found.nombre.toUpperCase() : 'GENERAL';
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

      {/* Tarjeta Principal "Lista de Productos" */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100/80 space-y-6">
        
        {/* Cabecera de la Tarjeta */}
        <div className="flex items-center justify-between">
          <h1 className="text-base sm:text-lg font-bold text-[#1E293B]">
            Lista de Productos
          </h1>
          <button
            type="button"
            onClick={() => {
              setProductoToEdit(null);
              setIsModalOpen(true);
            }}
            className="px-5 py-2.5 rounded-xl bg-[#C026D3] hover:bg-[#A21CAF] text-white font-extrabold text-xs uppercase tracking-wider shadow-md shadow-[#C026D3]/20 transition-all cursor-pointer active:scale-[0.98]"
          >
            NUEVO PRODUCTO
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
              placeholder="Buscar por código, nombre, proveedor..."
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

        {/* Tabla de Productos */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                <th className="py-3 px-3">IMAGEN</th>
                <th className="py-3 px-3">CÓDIGO</th>
                <th className="py-3 px-3">NOMBRE</th>
                <th className="py-3 px-3">CATEGORÍA</th>
                <th className="py-3 px-3">PROVEEDOR</th>
                <th className="py-3 px-3 text-right">PRECIO COMPRA</th>
                <th className="py-3 px-3 text-right">PRECIO VENTA</th>
                <th className="py-3 px-3 text-center">STOCK</th>
                <th className="py-3 px-3 text-right">ACCIONES</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredProductos.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-10 text-center text-slate-400 font-medium">
                    No se encontraron productos registrados.
                  </td>
                </tr>
              ) : (
                filteredProductos.map((prod) => (
                  <tr key={prod.id} className="hover:bg-slate-50/50 transition-colors">
                    {/* IMAGEN */}
                    <td className="py-3 px-3">
                      <div className="size-9 rounded-xl bg-slate-100 border border-slate-200/80 flex items-center justify-center overflow-hidden shrink-0">
                        <Package className="size-4 text-slate-400" />
                      </div>
                    </td>

                    {/* CÓDIGO */}
                    <td className="py-3 px-3 font-mono font-medium text-slate-600">
                      {prod.codigo}
                    </td>

                    {/* NOMBRE */}
                    <td className="py-3 px-3 font-semibold text-slate-800 max-w-xs truncate">
                      {prod.nombre}
                    </td>

                    {/* CATEGORÍA (Badge Azul Vibrante) */}
                    <td className="py-3 px-3">
                      <span className="inline-block px-3 py-1 rounded-full bg-[#0072FF] text-white text-[10px] font-extrabold uppercase tracking-wider">
                        {getCategoriaNombre(prod)}
                      </span>
                    </td>

                    {/* PROVEEDOR */}
                    <td className="py-3 px-3 text-slate-500">
                      {prod.laboratorio || '-'}
                    </td>

                    {/* PRECIO COMPRA */}
                    <td className="py-3 px-3 text-right font-medium text-slate-600">
                      {prod.precioCompra ? prod.precioCompra.toFixed(2) : '-'}
                    </td>

                    {/* PRECIO VENTA */}
                    <td className="py-3 px-3 text-right font-medium text-slate-600">
                      {prod.precio.toFixed(2)}
                    </td>

                    {/* STOCK (Badge Verde Vibrante) */}
                    <td className="py-3 px-3 text-center">
                      <span className="inline-flex items-center justify-center size-7 rounded-lg bg-[#10B981] text-white font-extrabold text-xs">
                        {prod.stock}
                      </span>
                    </td>

                    {/* ACCIONES */}
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-3 font-semibold text-xs">
                        <button
                          type="button"
                          onClick={() => {
                            setProductoToEdit(prod);
                            setIsModalOpen(true);
                          }}
                          className="text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => setProductoToDelete(prod)}
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

      {/* Modal de Formulario Producto */}
      <ProductoModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setProductoToEdit(null);
        }}
        onSubmitSuccess={() => {
          fetchData();
          showToast('success', productoToEdit ? 'Producto actualizado.' : 'Producto registrado.');
        }}
        productoToEdit={productoToEdit}
      />

      {/* Modal de Confirmación de Eliminación */}
      <Dialog open={!!productoToDelete} onOpenChange={() => setProductoToDelete(null)}>
        <DialogContent className="sm:max-w-md rounded-3xl bg-white border-slate-200">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-900">
              ¿Eliminar producto?
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Esta acción eliminará permanentemente{' '}
              <strong className="text-slate-700">{productoToDelete?.nombre}</strong> del sistema.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setProductoToDelete(null)}
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
