'use client';

import * as React from 'react';
import {
  CalendarClock,
  Plus,
  Search,
  AlertTriangle,
  CheckCircle2,
  Clock,
  SlidersHorizontal,
  RefreshCw,
  Package,
  Layers,
  ArrowDownRight,
  ArrowUpRight,
  Pencil,
  Trash2,
  Barcode,
  Calendar,
  DollarSign,
  X,
  Archive,
  XCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { AppDrawer } from '@/components/common/AppDrawer';
import { LoteInventario, Producto, CreateLoteDTO, AjusteStockDTO } from '@/types';
import { getLotes, createLote, ajustarStockLote, deleteLote } from '@/services/loteService';
import { getProductos } from '@/services/productoService';

export default function LotesPage() {
  const [lotes, setLotes] = React.useState<LoteInventario[]>([]);
  const [productos, setProductos] = React.useState<Producto[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState('');
  const [filtroCaducidad, setFiltroCaducidad] = React.useState<'todos' | 'proximos' | 'vencidos'>('todos');

  // Drawer nuevo lote
  const [isNewDrawerOpen, setIsNewDrawerOpen] = React.useState(false);
  const [isSubmittingNew, setIsSubmittingNew] = React.useState(false);
  const [newProductoId, setNewProductoId] = React.useState<number | ''>('');
  const [newCodigoLote, setNewCodigoLote] = React.useState('');
  const [newVencimiento, setNewVencimiento] = React.useState('');
  const [newStock, setNewStock] = React.useState<number>(50);
  const [newPrecio, setNewPrecio] = React.useState<number>(5.0);

  // Drawer ajuste de stock
  const [adjustLote, setAdjustLote] = React.useState<LoteInventario | null>(null);
  const [isSubmittingAdjust, setIsSubmittingAdjust] = React.useState(false);
  const [adjustTipo, setAdjustTipo] = React.useState<'ENTRADA' | 'SALIDA' | 'AJUSTE'>('ENTRADA');
  const [adjustCantidad, setAdjustCantidad] = React.useState<number>(10);
  const [adjustMotivo, setAdjustMotivo] = React.useState('');

  // Delete dialog
  const [loteToDelete, setLoteToDelete] = React.useState<LoteInventario | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);

  // Toast
  const [toast, setToast] = React.useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const loadData = React.useCallback(async () => {
    try {
      setLoading(true);
      const [lotesData, prodsData] = await Promise.all([
        getLotes().catch(() => []),
        getProductos().catch(() => []),
      ]);
      setLotes(Array.isArray(lotesData) ? lotesData : []);
      setProductos(Array.isArray(prodsData) ? prodsData : []);
    } catch (error) {
      console.error('Error al cargar lotes:', error);
      showToast('error', 'No se pudieron sincronizar los lotes.');
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const handleOpenNewDrawer = () => {
    setNewProductoId(productos[0]?.id || '');
    setNewCodigoLote(`LOT-${new Date().getFullYear()}-${lotes.length + 1}`);
    const nextYear = new Date();
    nextYear.setFullYear(nextYear.getFullYear() + 1);
    setNewVencimiento(nextYear.toISOString().split('T')[0]);
    setNewStock(50);
    setNewPrecio(5.0);
    setIsNewDrawerOpen(true);
  };

  const handleCreateLote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProductoId || !newCodigoLote.trim() || !newVencimiento) {
      showToast('error', 'Todos los campos son obligatorios.');
      return;
    }

    setIsSubmittingNew(true);
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
      showToast('success', `Lote "${newCodigoLote}" creado exitosamente.`);
      setIsNewDrawerOpen(false);
      loadData();
    } catch (error: any) {
      showToast('error', error.response?.data?.message || 'Error al crear el lote.');
    } finally {
      setIsSubmittingNew(false);
    }
  };

  const handleOpenAdjust = (lote: LoteInventario) => {
    setAdjustLote(lote);
    setAdjustTipo('ENTRADA');
    setAdjustCantidad(10);
    setAdjustMotivo('Ajuste de inventario físico');
  };

  const handleApplyAdjust = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustLote) return;
    if (adjustCantidad <= 0) {
      showToast('error', 'La cantidad debe ser mayor a cero.');
      return;
    }

    setIsSubmittingAdjust(true);
    const payload: AjusteStockDTO = {
      tipo: adjustTipo,
      cantidad: Number(adjustCantidad),
      motivo: adjustMotivo.trim() || 'Ajuste manual de stock',
    };

    try {
      await ajustarStockLote(adjustLote.id, payload);
      showToast('success', `Stock del lote "${adjustLote.codigoLote}" ajustado correctamente.`);
      setAdjustLote(null);
      loadData();
    } catch (error: any) {
      showToast('error', error.response?.data?.message || 'Error al ajustar el stock.');
    } finally {
      setIsSubmittingAdjust(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!loteToDelete) return;
    setIsDeleting(true);
    try {
      await deleteLote(loteToDelete.id);
      showToast('success', `Lote "${loteToDelete.codigoLote}" eliminado/desactivado.`);
      setLoteToDelete(null);
      loadData();
    } catch (error) {
      showToast('error', 'Error al desactivar el lote.');
    } finally {
      setIsDeleting(false);
    }
  };

  const getExpiryStatus = (dateStr: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expiry = new Date(dateStr);
    const diffDays = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return {
        label: `Vencido hace ${Math.abs(diffDays)}d`,
        variant: 'destructive' as const,
        statusType: 'vencido',
      };
    }
    if (diffDays <= 45) {
      return {
        label: `Vence en ${diffDays}d`,
        variant: 'amber' as const,
        statusType: 'proximo',
      };
    }
    return {
      label: 'Óptimo (FEFO)',
      variant: 'emerald' as const,
      statusType: 'optimo',
    };
  };

  // Filtrado reactivo
  const filtered = React.useMemo(() => {
    const q = search.toLowerCase().trim();
    return lotes.filter((l) => {
      const matchSearch =
        !q ||
        l.codigoLote.toLowerCase().includes(q) ||
        (l.productoNombre && l.productoNombre.toLowerCase().includes(q)) ||
        (l.productoCodigo && l.productoCodigo.toLowerCase().includes(q));

      if (!matchSearch) return false;

      const status = getExpiryStatus(l.fechaVencimiento);
      if (filtroCaducidad === 'proximos') return status.statusType === 'proximo';
      if (filtroCaducidad === 'vencidos') return status.statusType === 'vencido';
      return true;
    });
  }, [lotes, search, filtroCaducidad]);

  // Estadísticas KPI
  const stats = React.useMemo(() => {
    let optimos = 0;
    let proximos = 0;
    let vencidos = 0;
    let stockTotal = 0;

    lotes.forEach((l) => {
      const status = getExpiryStatus(l.fechaVencimiento);
      if (status.statusType === 'optimo') optimos++;
      if (status.statusType === 'proximo') proximos++;
      if (status.statusType === 'vencido') vencidos++;
      stockTotal += l.stockActual || 0;
    });

    return {
      total: lotes.length,
      optimos,
      proximos,
      vencidos,
      stockTotal,
    };
  }, [lotes]);

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl border text-sm font-medium transition-all animate-in fade-in slide-in-from-top-4 ${
            toast.type === 'success'
              ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
              : 'bg-rose-50 text-rose-900 border-rose-200'
          }`}
        >
          {toast.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : (
            <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
          )}
          <span>{toast.message}</span>
          <button onClick={() => setToast(null)} className="p-1 hover:bg-black/5 rounded-lg ml-2">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-[#319795] font-semibold text-sm">
            <CalendarClock className="w-4 h-4" />
            <span>Control de Caducidad y Trazabilidad (FEFO)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1a365d] mt-1">
            Lotes de Inventario
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            Gestión de series de fabricación, rotación First-Expire-First-Out y ajustes de existencias.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadData}
            disabled={loading}
            className="h-8 sm:h-9 gap-1.5 text-xs font-semibold rounded-xl border-slate-200 text-slate-700 hover:bg-slate-100 shadow-2xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refrescar</span>
          </Button>

          <Button
            size="sm"
            onClick={handleOpenNewDrawer}
            className="h-8 sm:h-9 gap-1.5 text-xs font-bold rounded-xl bg-[#319795] hover:bg-[#287e7c] text-white shadow-xs active:scale-[0.98] cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Nuevo Lote</span>
          </Button>
        </div>
      </div>

      {/* Tarjetas Resumen / KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-white border border-slate-200/80 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Total Lotes</span>
            <div className="p-2 rounded-xl bg-slate-100 text-[#1a365d]">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-[#1a365d]">{stats.total}</span>
            <span className="text-[11px] text-slate-400">series activas</span>
          </div>
        </Card>

        <Card className="p-4 bg-white border border-emerald-100 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-800">Lotes Óptimos</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-700">{stats.optimos}</span>
            <span className="text-[11px] text-emerald-600/80">&gt; 45 días</span>
          </div>
        </Card>

        <Card className="p-4 bg-white border border-amber-100 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-800">Por Vencer (≤45d)</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-amber-700">{stats.proximos}</span>
            <span className="text-[11px] text-amber-700/80">rotación urgente</span>
          </div>
        </Card>

        <Card className="p-4 bg-white border border-rose-100 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-rose-800">Lotes Vencidos</span>
            <div className="p-2 rounded-xl bg-rose-50 text-rose-600">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-rose-700">{stats.vencidos}</span>
            <span className="text-[11px] text-rose-600/80">bloqueados</span>
          </div>
        </Card>
      </div>

      {/* Contenedor Principal: Filtros y Tabla */}
      <Card className="bg-white border border-slate-200/80 shadow-xs rounded-2xl overflow-hidden">
        {/* Barra de Filtros */}
        <div className="p-4 border-b border-slate-100 bg-slate-50/40 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Buscar por lote, fármaco o código..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-8 h-9 text-xs bg-white rounded-xl border-slate-200 shadow-none focus-visible:ring-[#319795]/20 focus-visible:border-[#319795]"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant={filtroCaducidad === 'todos' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFiltroCaducidad('todos')}
              className={`h-8 text-xs font-semibold rounded-xl ${
                filtroCaducidad === 'todos'
                  ? 'bg-[#319795] hover:bg-[#287e7c] text-white'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              Todos ({lotes.length})
            </Button>
            <Button
              variant={filtroCaducidad === 'proximos' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFiltroCaducidad('proximos')}
              className={`h-8 text-xs font-semibold rounded-xl ${
                filtroCaducidad === 'proximos'
                  ? 'bg-amber-600 hover:bg-amber-700 text-white'
                  : 'border-amber-200 text-amber-800 bg-amber-50 hover:bg-amber-100'
              }`}
            >
              Por Vencer (≤45d)
            </Button>
            <Button
              variant={filtroCaducidad === 'vencidos' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFiltroCaducidad('vencidos')}
              className={`h-8 text-xs font-semibold rounded-xl ${
                filtroCaducidad === 'vencidos'
                  ? 'bg-rose-600 hover:bg-rose-700 text-white'
                  : 'border-rose-200 text-rose-800 bg-rose-50 hover:bg-rose-100'
              }`}
            >
              Vencidos ({stats.vencidos})
            </Button>
          </div>
        </div>

        {/* Tabla */}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-48">Fármaco / Producto</TableHead>
              <TableHead className="w-36">N° Lote</TableHead>
              <TableHead className="w-36">Fecha Caducidad</TableHead>
              <TableHead className="text-center">Estado FEFO</TableHead>
              <TableHead className="text-center">Stock Actual</TableHead>
              <TableHead className="text-right">P. Compra</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, idx) => (
                <TableRow key={idx} className="animate-pulse">
                  <TableCell><div className="h-4 w-40 bg-slate-200 rounded-md"></div></TableCell>
                  <TableCell><div className="h-4 w-24 bg-slate-200 rounded-md"></div></TableCell>
                  <TableCell><div className="h-4 w-24 bg-slate-200 rounded-md"></div></TableCell>
                  <TableCell className="text-center"><div className="h-5 w-20 bg-slate-200 rounded-full mx-auto"></div></TableCell>
                  <TableCell className="text-center"><div className="h-4 w-12 bg-slate-200 rounded-md mx-auto"></div></TableCell>
                  <TableCell className="text-right"><div className="h-4 w-16 bg-slate-200 rounded-md ml-auto"></div></TableCell>
                  <TableCell className="text-right"><div className="h-6 w-20 bg-slate-200 rounded-md ml-auto"></div></TableCell>
                </TableRow>
              ))
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-14 text-center">
                  <div className="flex flex-col items-center justify-center max-w-sm mx-auto space-y-3">
                    <div className="p-3.5 rounded-2xl bg-slate-100 text-slate-400">
                      <Archive className="w-8 h-8" />
                    </div>
                    <p className="text-sm font-bold text-slate-700">
                      {search || filtroCaducidad !== 'todos'
                        ? 'No hay lotes con ese criterio'
                        : 'No hay lotes registrados'}
                    </p>
                    <p className="text-xs text-slate-400">
                      {search || filtroCaducidad !== 'todos'
                        ? 'Pruebe ajustando o limpiando los filtros seleccionados.'
                        : 'Haga clic en "Nuevo Lote" para dar ingreso a un lote farmacológico.'}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((lote) => {
                const status = getExpiryStatus(lote.fechaVencimiento);

                return (
                  <TableRow key={lote.id} className="group hover:bg-slate-50/70 transition-colors">
                    {/* Producto */}
                    <TableCell>
                      <div className="flex flex-col min-w-[170px]">
                        <span className="font-bold text-slate-900 text-sm group-hover:text-[#319795] transition-colors">
                          {lote.productoNombre || 'Producto'}
                        </span>
                        {lote.productoCodigo && (
                          <span className="font-mono text-[10px] text-slate-400">
                            Cód: {lote.productoCodigo}
                          </span>
                        )}
                      </div>
                    </TableCell>

                    {/* N° Lote */}
                    <TableCell>
                      <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-[#1a365d] bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200 w-fit">
                        <Barcode className="w-3 h-3 text-slate-400" />
                        <span>{lote.codigoLote}</span>
                      </div>
                    </TableCell>

                    {/* Caducidad */}
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-xs font-medium text-slate-700">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{lote.fechaVencimiento}</span>
                      </div>
                    </TableCell>

                    {/* Estado FEFO */}
                    <TableCell className="text-center">
                      <Badge variant={status.variant} className="text-[11px] px-2.5 py-0.5">
                        {status.label}
                      </Badge>
                    </TableCell>

                    {/* Stock Actual */}
                    <TableCell className="text-center">
                      <div className="inline-flex flex-col items-center">
                        <span
                          className={`font-mono text-sm font-extrabold ${
                            lote.stockActual <= 0
                              ? 'text-rose-600'
                              : lote.stockActual <= 10
                              ? 'text-amber-600'
                              : 'text-slate-800'
                          }`}
                        >
                          {lote.stockActual} u.
                        </span>
                      </div>
                    </TableCell>

                    {/* P. Compra */}
                    <TableCell className="text-right font-mono text-xs text-slate-600">
                      S/ {(lote.precioCompra || 0).toFixed(2)}
                    </TableCell>

                    {/* Acciones */}
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Ajustar existencias"
                          onClick={() => handleOpenAdjust(lote)}
                          className="h-8 w-8 text-slate-500 hover:text-[#319795] hover:bg-teal-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <SlidersHorizontal className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Dar de baja o eliminar lote"
                          onClick={() => setLoteToDelete(lote)}
                          className="h-8 w-8 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Drawer: Alta de Nuevo Lote */}
      <AppDrawer
        isOpen={isNewDrawerOpen}
        onClose={() => setIsNewDrawerOpen(false)}
        title="Ingreso de Nuevo Lote"
        description="Vincule una serie de producción al fármaco correspondiente con fecha de caducidad."
        icon={Package}
        onSubmit={handleCreateLote}
        isSubmitting={isSubmittingNew}
        submitText="Crear Lote"
        cancelText="Cancelar"
        maxWidth="max-w-md"
      >
        <div className="space-y-4 py-2">
          {/* Fármaco / Producto */}
          <div className="space-y-1.5">
            <Label htmlFor="producto" className="text-xs font-bold text-slate-700">
              Fármaco del Catálogo <span className="text-rose-500">*</span>
            </Label>
            <select
              id="producto"
              value={newProductoId}
              onChange={(e) => setNewProductoId(Number(e.target.value))}
              className="flex h-9 w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-[#319795]/20 focus:border-[#319795]"
              required
            >
              <option value="">Seleccione un fármaco...</option>
              {productos.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nombre} ({p.codigo})
                </option>
              ))}
            </select>
          </div>

          {/* Código de Lote */}
          <div className="space-y-1.5">
            <Label htmlFor="codigoLote" className="text-xs font-bold text-slate-700">
              Código / Serie de Lote <span className="text-rose-500">*</span>
            </Label>
            <Input
              id="codigoLote"
              value={newCodigoLote}
              onChange={(e) => setNewCodigoLote(e.target.value.toUpperCase())}
              placeholder="Ej: LOT-2026-99"
              className="font-mono text-xs h-9 rounded-xl border-slate-200 focus-visible:ring-[#319795]/20 focus-visible:border-[#319795]"
              required
            />
          </div>

          {/* Fecha Vencimiento */}
          <div className="space-y-1.5">
            <Label htmlFor="vencimiento" className="text-xs font-bold text-slate-700">
              Fecha de Caducidad (Expiración) <span className="text-rose-500">*</span>
            </Label>
            <Input
              id="vencimiento"
              type="date"
              value={newVencimiento}
              onChange={(e) => setNewVencimiento(e.target.value)}
              className="text-xs h-9 rounded-xl border-slate-200 focus-visible:ring-[#319795]/20 focus-visible:border-[#319795]"
              required
            />
          </div>

          {/* Stock y Precio */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="stock" className="text-xs font-bold text-slate-700">
                Stock Inicial (Unidades)
              </Label>
              <Input
                id="stock"
                type="number"
                min={1}
                value={newStock}
                onChange={(e) => setNewStock(Number(e.target.value))}
                className="font-mono text-xs h-9 rounded-xl border-slate-200 focus-visible:ring-[#319795]/20 focus-visible:border-[#319795]"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="precio" className="text-xs font-bold text-slate-700">
                Precio Compra (S/.)
              </Label>
              <Input
                id="precio"
                type="number"
                step="0.01"
                min={0}
                value={newPrecio}
                onChange={(e) => setNewPrecio(Number(e.target.value))}
                className="font-mono text-xs h-9 rounded-xl border-slate-200 focus-visible:ring-[#319795]/20 focus-visible:border-[#319795]"
                required
              />
            </div>
          </div>
        </div>
      </AppDrawer>

      {/* Drawer: Ajuste de Existencias */}
      <AppDrawer
        isOpen={!!adjustLote}
        onClose={() => setAdjustLote(null)}
        title="Ajuste de Existencias"
        description="Registre un movimiento o conciliación manual de inventario para este lote."
        icon={SlidersHorizontal}
        onSubmit={handleApplyAdjust}
        isSubmitting={isSubmittingAdjust}
        submitText="Aplicar Ajuste"
        cancelText="Cancelar"
        maxWidth="max-w-md"
      >
        {adjustLote && (
          <div className="space-y-4 py-2">
            {/* Resumen del Lote */}
            <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl space-y-1 text-xs">
              <div className="font-bold text-[#1a365d]">{adjustLote.productoNombre}</div>
              <div className="flex items-center justify-between text-slate-600">
                <span>Lote: <strong className="font-mono">{adjustLote.codigoLote}</strong></span>
                <span>Stock Actual: <strong className="font-mono text-emerald-700">{adjustLote.stockActual} u.</strong></span>
              </div>
            </div>

            {/* Tipo de Ajuste */}
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-700">Tipo de Movimiento</Label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setAdjustTipo('ENTRADA')}
                  className={`py-2 px-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                    adjustTipo === 'ENTRADA'
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <ArrowDownRight className="w-3.5 h-3.5 mx-auto mb-1 text-emerald-600" />
                  + Entrada
                </button>
                <button
                  type="button"
                  onClick={() => setAdjustTipo('SALIDA')}
                  className={`py-2 px-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                    adjustTipo === 'SALIDA'
                      ? 'bg-rose-50 border-rose-300 text-rose-700'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <ArrowUpRight className="w-3.5 h-3.5 mx-auto mb-1 text-rose-600" />
                  - Salida
                </button>
                <button
                  type="button"
                  onClick={() => setAdjustTipo('AJUSTE')}
                  className={`py-2 px-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                    adjustTipo === 'AJUSTE'
                      ? 'bg-teal-50 border-teal-300 text-[#319795]'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <SlidersHorizontal className="w-3.5 h-3.5 mx-auto mb-1 text-[#319795]" />
                  Fijar Total
                </button>
              </div>
            </div>

            {/* Cantidad */}
            <div className="space-y-1.5">
              <Label htmlFor="adjustCantidad" className="text-xs font-bold text-slate-700">
                {adjustTipo === 'AJUSTE' ? 'Nuevo Stock Total Absoluto' : 'Cantidad a Mover'}
              </Label>
              <Input
                id="adjustCantidad"
                type="number"
                min={0}
                value={adjustCantidad}
                onChange={(e) => setAdjustCantidad(Number(e.target.value))}
                className="font-mono text-xs h-9 rounded-xl border-slate-200 focus-visible:ring-[#319795]/20 focus-visible:border-[#319795]"
                required
              />
            </div>

            {/* Motivo */}
            <div className="space-y-1.5">
              <Label htmlFor="adjustMotivo" className="text-xs font-bold text-slate-700">
                Motivo / Justificación
              </Label>
              <Input
                id="adjustMotivo"
                value={adjustMotivo}
                onChange={(e) => setAdjustMotivo(e.target.value)}
                placeholder="Ej: Merma, rotura, donación o corrección de conteo..."
                className="text-xs h-9 rounded-xl border-slate-200 focus-visible:ring-[#319795]/20 focus-visible:border-[#319795]"
              />
            </div>
          </div>
        )}
      </AppDrawer>

      {/* Diálogo Confirmación Eliminar */}
      <Dialog open={!!loteToDelete} onOpenChange={(open) => !open && setLoteToDelete(null)}>
        <DialogContent className="sm:max-w-md bg-white rounded-2xl border border-slate-200 shadow-xl">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-rose-50 text-rose-600 border border-rose-100">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold text-slate-900">
                  Desactivar Lote de Inventario
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-500 mt-0.5">
                  El lote no podrá ser seleccionado para dispensación en ventas.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <p className="text-xs text-slate-600 my-2">
            ¿Confirma que desea retirar el lote{' '}
            <strong className="text-slate-900 font-mono">&quot;{loteToDelete?.codigoLote}&quot;</strong> del producto{' '}
            <strong className="text-slate-900">{loteToDelete?.productoNombre}</strong>?
          </p>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isDeleting}
              onClick={() => setLoteToDelete(null)}
              className="rounded-xl text-xs font-semibold border-slate-200 text-slate-600 hover:bg-slate-100"
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              disabled={isDeleting}
              onClick={handleDeleteConfirm}
              className="rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-xs"
            >
              {isDeleting ? 'Procesando...' : 'Confirmar Baja'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
