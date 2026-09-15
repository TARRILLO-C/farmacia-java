'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  FileText,
  SlidersHorizontal,
  CheckCircle2,
  AlertCircle,
  X,
} from 'lucide-react';
import { Producto } from '@/types';
import { getProductos } from '@/services/productoService';
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
const DEMO_PRODUCTOS_INVENTARIO: Producto[] = [
  {
    id: 1,
    codigo: '001',
    nombre: 'Desodorante Roll On Nivea Serum Tono Natural',
    stock: 19,
    stockMinimo: 5,
    precio: 21.00,
    activo: true,
  },
  {
    id: 2,
    codigo: '002',
    nombre: 'Mascarilla Capilar Herbal Essences Suavidad Rosa Mosqueta',
    stock: 30,
    stockMinimo: 8,
    precio: 35.00,
    activo: true,
  },
  {
    id: 3,
    codigo: '003',
    nombre: 'Pack Sensibilidad Colgate Crema Pro Alivio Blanqueador + Cepillos + Enjuague Encías',
    stock: 50,
    stockMinimo: 10,
    precio: 69.50,
    activo: true,
  },
  {
    id: 4,
    codigo: '004',
    nombre: 'Pack Sedal Luminous UV Shampoo + Acondicionador',
    stock: 32,
    stockMinimo: 10,
    precio: 29.00,
    activo: true,
  },
];

export default function InventarioPage() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);

  // Modales interactivos
  const [selectedProductKardex, setSelectedProductKardex] = useState<Producto | null>(null);
  const [selectedProductAjuste, setSelectedProductAjuste] = useState<Producto | null>(null);
  const [nuevoStockInput, setNuevoStockInput] = useState<number>(0);
  const [motivoAjuste, setMotivoAjuste] = useState<string>('RECONCILIACION');

  // Toast
  const [toast, setToast] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchProductos = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getProductos();
      if (data && data.length > 0) {
        setProductos(data);
      } else {
        setProductos(DEMO_PRODUCTOS_INVENTARIO);
      }
    } catch {
      setProductos(DEMO_PRODUCTOS_INVENTARIO);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProductos();
  }, [fetchProductos]);

  // Handler de Ajuste de Stock
  const handleGuardarAjuste = () => {
    if (!selectedProductAjuste) return;
    setProductos((prev) =>
      prev.map((p) =>
        p.id === selectedProductAjuste.id ? { ...p, stock: Number(nuevoStockInput) } : p
      )
    );
    showToast('success', `Stock de "${selectedProductAjuste.nombre}" actualizado a ${nuevoStockInput} unidades.`);
    setSelectedProductAjuste(null);
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

      {/* Tarjeta Principal "Inventario de Productos" */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100/80 space-y-6">
        
        {/* Cabecera de la Tarjeta */}
        <div className="flex items-center justify-between">
          <h1 className="text-base sm:text-lg font-bold text-[#1E293B]">
            Inventario de Productos
          </h1>
        </div>

        {/* Tabla de Inventario */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                <th className="py-3 px-3">PRODUCTO</th>
                <th className="py-3 px-3 text-center">STOCK ACTUAL</th>
                <th className="py-3 px-3 text-right">ACCIONES</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={3} className="py-10 text-center text-slate-400 font-medium">
                    Cargando inventario...
                  </td>
                </tr>
              ) : productos.length === 0 ? (
                <tr>
                  <td colSpan={3} className="py-10 text-center text-slate-400 font-medium">
                    No hay productos en inventario.
                  </td>
                </tr>
              ) : (
                productos.map((prod) => (
                  <tr key={prod.id} className="hover:bg-slate-50/50 transition-colors">
                    {/* PRODUCTO (Nombre + Código) */}
                    <td className="py-4 px-3">
                      <div className="space-y-0.5">
                        <span className="font-semibold text-slate-800 block text-xs">
                          {prod.nombre}
                        </span>
                        <span className="font-mono text-[11px] text-slate-400 block">
                          {prod.codigo}
                        </span>
                      </div>
                    </td>

                    {/* STOCK ACTUAL (Badge Verde) */}
                    <td className="py-4 px-3 text-center">
                      <span className="inline-flex items-center justify-center size-7 rounded-lg bg-[#10B981] text-white font-extrabold text-xs shadow-xs">
                        {prod.stock}
                      </span>
                    </td>

                    {/* ACCIONES (Botones Kardex y Ajustar) */}
                    <td className="py-4 px-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* Botón KARDEX Cyan */}
                        <button
                          type="button"
                          onClick={() => setSelectedProductKardex(prod)}
                          className="px-4 py-1.5 rounded-xl bg-[#00C6FF] hover:bg-[#00B4F0] text-white font-extrabold text-[11px] uppercase tracking-wider shadow-xs transition-all cursor-pointer active:scale-[0.98] flex items-center gap-1"
                        >
                          <FileText className="size-3" />
                          <span>KARDEX</span>
                        </button>

                        {/* Botón AJUSTAR Amarillo */}
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedProductAjuste(prod);
                            setNuevoStockInput(prod.stock);
                          }}
                          className="px-4 py-1.5 rounded-xl bg-[#FACC15] hover:bg-[#EAB308] text-white font-extrabold text-[11px] uppercase tracking-wider shadow-xs transition-all cursor-pointer active:scale-[0.98] flex items-center gap-1"
                        >
                          <SlidersHorizontal className="size-3" />
                          <span>AJUSTAR</span>
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

      {/* Modal Kardex de Movimientos */}
      <Dialog open={!!selectedProductKardex} onOpenChange={() => setSelectedProductKardex(null)}>
        <DialogContent className="sm:max-w-lg rounded-3xl bg-white border-slate-200">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <FileText className="size-5 text-[#00C6FF]" />
              Kardex de Movimientos
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Historial de entradas, salidas y ventas de{' '}
              <strong className="text-slate-800">{selectedProductKardex?.nombre}</strong> (Cód: {selectedProductKardex?.codigo})
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2 text-xs">
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
              <span className="text-slate-600 font-medium">Stock Físico Actual:</span>
              <span className="font-extrabold text-sm text-[#10B981]">
                {selectedProductKardex?.stock} unidades
              </span>
            </div>

            <div className="space-y-2 border-t border-slate-100 pt-3">
              <span className="font-bold text-slate-700 text-xs block">Últimos Movimientos:</span>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50/60 border border-emerald-100 text-[11px]">
                  <div>
                    <span className="font-bold text-emerald-800">ENTRADA (Compra)</span>
                    <span className="text-slate-400 block text-[10px]">Factura #F001-2839 • Hoy</span>
                  </div>
                  <span className="font-bold text-emerald-700">+20 uds.</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-blue-50/60 border border-blue-100 text-[11px]">
                  <div>
                    <span className="font-bold text-blue-800">SALIDA (Venta Mostrador)</span>
                    <span className="text-slate-400 block text-[10px]">Ticket #REC-00104 • Ayer</span>
                  </div>
                  <span className="font-bold text-blue-700">-1 ud.</span>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedProductKardex(null)}
              className="rounded-xl text-xs w-full"
            >
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Ajustar Stock */}
      <Dialog open={!!selectedProductAjuste} onOpenChange={() => setSelectedProductAjuste(null)}>
        <DialogContent className="sm:max-w-md rounded-3xl bg-white border-slate-200">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <SlidersHorizontal className="size-5 text-[#FACC15]" />
              Ajustar Stock de Inventario
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Modifica directamente el inventario para{' '}
              <strong className="text-slate-800">{selectedProductAjuste?.nombre}</strong>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2 text-xs">
            <div className="space-y-1.5">
              <label className="block font-bold text-slate-700">Nuevo Stock Disponible</label>
              <input
                type="number"
                min="0"
                value={nuevoStockInput}
                onChange={(e) => setNuevoStockInput(Number(e.target.value))}
                className="w-full h-10 px-3.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 outline-none focus:border-[#0095FF]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block font-bold text-slate-700">Motivo de Ajuste</label>
              <select
                value={motivoAjuste}
                onChange={(e) => setMotivoAjuste(e.target.value)}
                className="w-full h-10 px-3.5 rounded-xl border border-slate-200 text-xs text-slate-800 outline-none focus:border-[#0095FF]"
              >
                <option value="RECONCILIACION">Reconciliación de inventario (Conteo físico)</option>
                <option value="DANADO">Producto dañado / vencido</option>
                <option value="INGRESOMANUAL">Ingreso manual de stock</option>
              </select>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedProductAjuste(null)}
              className="rounded-xl text-xs"
            >
              Cancelar
            </Button>
            <Button
              size="sm"
              onClick={handleGuardarAjuste}
              className="rounded-xl text-xs font-bold bg-[#FACC15] hover:bg-[#EAB308] text-white"
            >
              Guardar Ajuste
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
