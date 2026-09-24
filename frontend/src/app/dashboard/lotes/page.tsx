'use client';

import * as React from 'react';
import {
  CalendarClock,
  Plus,
  Search,
  AlertTriangle,
  CheckCircle,
  Clock,
  SlidersHorizontal,
  RefreshCw,
  Package,
  Layers,
  ArrowDownRight,
  ArrowUpRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoteInventario, Producto, CreateLoteDTO, AjusteStockDTO } from '@/types';
import { getLotes, createLote, ajustarStockLote, deleteLote } from '@/services/loteService';
import { getProductos } from '@/services/productoService';

export default function LotesPage() {
  const [lotes, setLotes] = React.useState<LoteInventario[]>([]);
  const [productos, setProductos] = React.useState<Producto[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState('');
  const [filtroCaducidad, setFiltroCaducidad] = React.useState<'todos' | 'proximos' | 'vencidos'>('todos');

  // Modal nuevo lote
  const [isNewModalOpen, setIsNewModalOpen] = React.useState(false);
  const [newProductoId, setNewProductoId] = React.useState<number | ''>('');
  const [newCodigoLote, setNewCodigoLote] = React.useState('');
  const [newVencimiento, setNewVencimiento] = React.useState('');
  const [newStock, setNewStock] = React.useState<number>(50);
  const [newPrecio, setNewPrecio] = React.useState<number>(5.0);

  // Modal ajuste de stock
  const [adjustLote, setAdjustLote] = React.useState<LoteInventario | null>(null);
  const [adjustTipo, setAdjustTipo] = React.useState<'ENTRADA' | 'SALIDA' | 'AJUSTE'>('ENTRADA');
  const [adjustCantidad, setAdjustCantidad] = React.useState<number>(10);
  const [adjustMotivo, setAdjustMotivo] = React.useState('');

  const loadData = React.useCallback(async () => {
    try {
      setLoading(true);
      const [lotesData, prodsData] = await Promise.all([
        getLotes(),
        getProductos(),
      ]);
      setLotes(lotesData);
      setProductos(prodsData);
    } catch (error) {
      console.error('Error al cargar lotes:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const handleOpenNewModal = () => {
    setNewProductoId(productos[0]?.id || '');
    setNewCodigoLote(`LOT-${new Date().getFullYear()}-${lotes.length + 1}`);
    const nextYear = new Date();
    nextYear.setFullYear(nextYear.getFullYear() + 1);
    setNewVencimiento(nextYear.toISOString().split('T')[0]);
    setNewStock(50);
    setNewPrecio(5.0);
    setIsNewModalOpen(true);
  };

  const handleCreateLote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProductoId || !newCodigoLote.trim() || !newVencimiento) {
      alert('Todos los campos son requeridos.');
      return;
    }

    const payload: CreateLoteDTO = {
      productoId: Number(newProductoId),
      codigoLote: newCodigoLote.trim(),
      fechaVencimiento: newVencimiento,
      stockActual: Number(newStock),
      stockMinimo: 5,
      precioCompra: Number(newPrecio),
      activo: true,
    };

    try {
      await createLote(payload);
      setIsNewModalOpen(false);
      loadData();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error al crear el lote.');
    }
  };

  const handleAdjustSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustLote) return;
    if (adjustCantidad <= 0 && adjustTipo !== 'AJUSTE') {
      alert('La cantidad debe ser mayor a cero.');
      return;
    }

    const payload: AjusteStockDTO = {
      cantidad: Number(adjustCantidad),
      tipo: adjustTipo,
      motivo: adjustMotivo.trim() || undefined,
    };

    try {
      await ajustarStockLote(adjustLote.id, payload);
      setAdjustLote(null);
      loadData();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error al ajustar el stock.');
    }
  };

  const today = new Date();

  const getExpiryStatus = (fechaStr: string) => {
    const expDate = new Date(fechaStr);
    const diffTime = expDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { label: 'VENCIDO', color: 'bg-rose-500/20 text-rose-300 border-rose-500/40', days: diffDays };
    }
    if (diffDays <= 45) {
      return { label: `Por vencer (${diffDays}d)`, color: 'bg-amber-500/20 text-amber-300 border-amber-500/40', days: diffDays };
    }
    return { label: 'Vigente', color: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30', days: diffDays };
  };

  const filtered = lotes
    .filter((l) => {
      const q = search.toLowerCase();
      const pName = l.productoNombre?.toLowerCase() || '';
      const pCod = l.productoCodigo?.toLowerCase() || '';
      const lCod = l.codigoLote?.toLowerCase() || '';
      return pName.includes(q) || pCod.includes(q) || lCod.includes(q);
    })
    .filter((l) => {
      if (filtroCaducidad === 'todos') return true;
      const status = getExpiryStatus(l.fechaVencimiento);
      if (filtroCaducidad === 'proximos') return status.days >= 0 && status.days <= 45;
      if (filtroCaducidad === 'vencidos') return status.days < 0;
      return true;
    });

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-[#319795] font-semibold text-sm">
            <CalendarClock className="size-4" />
            <span>Estrategia de Caducidad FEFO</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mt-1">
            Control de Lotes & Inventario
          </h1>
          <p className="text-slate-400 text-sm mt-0.5">
            Monitoreo de fechas de vencimiento, rotación secuencial (First-Expired, First-Out) y trazabilidad por serie.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadData}
            className="border-slate-700 bg-slate-900/60 hover:bg-slate-800 text-slate-300"
          >
            <RefreshCw className={`size-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>

          <Button
            onClick={handleOpenNewModal}
            className="bg-[#319795] hover:bg-[#287e7c] text-white font-semibold shadow-md gap-2"
          >
            <Plus className="size-4" />
            Nuevo Lote
          </Button>
        </div>
      </div>

      {/* Filtros rápidos */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
          <Input
            placeholder="Buscar por lote, producto o código..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-slate-900/70 border-slate-800 text-white placeholder:text-slate-500 rounded-xl"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setFiltroCaducidad('todos')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              filtroCaducidad === 'todos'
                ? 'bg-[#319795] text-white'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            Todos ({lotes.length})
          </button>
          <button
            onClick={() => setFiltroCaducidad('proximos')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              filtroCaducidad === 'proximos'
                ? 'bg-amber-600 text-white'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            Por Vencer (≤45d)
          </button>
          <button
            onClick={() => setFiltroCaducidad('vencidos')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              filtroCaducidad === 'vencidos'
                ? 'bg-rose-600 text-white'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            Vencidos
          </button>
        </div>
      </div>

      {/* Tabla de Lotes */}
      <Card className="border-slate-800/80 bg-slate-900/50 shadow-xl rounded-xl overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-950/70 text-slate-400 font-semibold uppercase text-[11px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3.5">Fármaco / Producto</th>
                  <th className="px-4 py-3.5">N° Lote</th>
                  <th className="px-4 py-3.5">Caducidad</th>
                  <th className="px-4 py-3.5 text-center">Estado FEFO</th>
                  <th className="px-4 py-3.5 text-center">Stock Actual</th>
                  <th className="px-4 py-3.5 text-right">P. Compra</th>
                  <th className="px-4 py-3.5 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="text-center py-10 text-slate-400">
                      <RefreshCw className="size-6 animate-spin mx-auto mb-2 text-[#319795]" />
                      Cargando lotes de inventario...
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-10 text-slate-500">
                      No se encontraron lotes que coincidan con el criterio seleccionado.
                    </td>
                  </tr>
                ) : (
                  filtered.map((lote) => {
                    const status = getExpiryStatus(lote.fechaVencimiento);
                    return (
                      <tr key={lote.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="px-4 py-3">
                          <div className="font-semibold text-white">{lote.productoNombre || 'Producto'}</div>
                          <div className="text-[11px] font-mono text-slate-400">{lote.productoCodigo}</div>
                        </td>
                        <td className="px-4 py-3 font-mono font-bold text-[#81e6d9]">
                          {lote.codigoLote}
                        </td>
                        <td className="px-4 py-3 text-xs font-mono text-slate-300">
                          {lote.fechaVencimiento}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span
                            className={`inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full font-semibold border ${status.color}`}
                          >
                            {status.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center font-bold text-white font-mono">
                          {lote.stockActual} u.
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-slate-300">
                          S/ {(lote.precioCompra || 0).toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setAdjustLote(lote);
                              setAdjustTipo('ENTRADA');
                              setAdjustCantidad(10);
                              setAdjustMotivo('');
                            }}
                            className="h-8 text-[#319795] hover:text-white hover:bg-[#319795]/20 gap-1"
                          >
                            <SlidersHorizontal className="size-3.5" /> Ajustar Stock
                          </Button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Modal Ajustar Stock */}
      {adjustLote && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in-95">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <SlidersHorizontal className="size-5 text-[#319795]" />
                  Ajuste de Stock: {adjustLote.codigoLote}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Fármaco: {adjustLote.productoNombre} | Stock actual: <strong className="text-white">{adjustLote.stockActual} u.</strong>
                </p>
              </div>
              <button
                onClick={() => setAdjustLote(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAdjustSubmit} className="p-5 space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Tipo de Movimiento *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setAdjustTipo('ENTRADA')}
                    className={`py-2 text-xs font-bold rounded-lg border flex items-center justify-center gap-1 ${
                      adjustTipo === 'ENTRADA'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500'
                        : 'bg-slate-950 text-slate-400 border-slate-800'
                    }`}
                  >
                    <ArrowUpRight className="size-3.5" /> Entrada (+)
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdjustTipo('SALIDA')}
                    className={`py-2 text-xs font-bold rounded-lg border flex items-center justify-center gap-1 ${
                      adjustTipo === 'SALIDA'
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500'
                        : 'bg-slate-950 text-slate-400 border-slate-800'
                    }`}
                  >
                    <ArrowDownRight className="size-3.5" /> Salida (-)
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdjustTipo('AJUSTE')}
                    className={`py-2 text-xs font-bold rounded-lg border flex items-center justify-center gap-1 ${
                      adjustTipo === 'AJUSTE'
                        ? 'bg-blue-500/20 text-blue-300 border-blue-500'
                        : 'bg-slate-950 text-slate-400 border-slate-800'
                    }`}
                  >
                    Fijar (=)
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  {adjustTipo === 'AJUSTE' ? 'Nuevo Stock Absoluto' : 'Cantidad a Mover'} *
                </label>
                <Input
                  type="number"
                  min={adjustTipo === 'AJUSTE' ? 0 : 1}
                  required
                  value={adjustCantidad}
                  onChange={(e) => setAdjustCantidad(Number(e.target.value))}
                  className="bg-slate-950 border-slate-800 text-white font-bold"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Motivo de Ajuste
                </label>
                <Input
                  value={adjustMotivo}
                  onChange={(e) => setAdjustMotivo(e.target.value)}
                  placeholder="Ej: Devolución de cliente, rotura, merma..."
                  className="bg-slate-950 border-slate-800 text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setAdjustLote(null)}
                  className="border-slate-700 bg-transparent text-slate-300 hover:bg-slate-800"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="bg-[#319795] hover:bg-[#287e7c] text-white font-semibold"
                >
                  Aplicar Ajuste
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Nuevo Lote */}
      {isNewModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in-95">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Plus className="size-5 text-[#319795]" />
                  Añadir Lote de Inventario
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Ingrese un nuevo lote para un fármaco existente.
                </p>
              </div>
              <button
                onClick={() => setIsNewModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateLote} className="p-5 space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Producto / Medicamento *
                </label>
                <select
                  required
                  value={newProductoId}
                  onChange={(e) => setNewProductoId(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-sm text-white"
                >
                  {productos.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nombre} ({p.codigo})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Código de Lote *
                  </label>
                  <Input
                    required
                    value={newCodigoLote}
                    onChange={(e) => setNewCodigoLote(e.target.value)}
                    placeholder="LOT-2026-05"
                    className="bg-slate-950 border-slate-800 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Fecha de Vencimiento *
                  </label>
                  <Input
                    type="date"
                    required
                    value={newVencimiento}
                    onChange={(e) => setNewVencimiento(e.target.value)}
                    className="bg-slate-950 border-slate-800 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Stock Inicial *
                  </label>
                  <Input
                    type="number"
                    min={1}
                    required
                    value={newStock}
                    onChange={(e) => setNewStock(Number(e.target.value))}
                    className="bg-slate-950 border-slate-800 text-white font-bold"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Precio Compra Unitario S/
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    min={0.01}
                    value={newPrecio}
                    onChange={(e) => setNewPrecio(Number(e.target.value))}
                    className="bg-slate-950 border-slate-800 text-white font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsNewModalOpen(false)}
                  className="border-slate-700 bg-transparent text-slate-300 hover:bg-slate-800"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="bg-[#319795] hover:bg-[#287e7c] text-white font-semibold"
                >
                  Guardar Lote
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
