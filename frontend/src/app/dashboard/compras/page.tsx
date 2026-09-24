'use client';

import * as React from 'react';
import {
  Truck,
  Plus,
  Search,
  Calendar,
  DollarSign,
  Package,
  Eye,
  Trash2,
  RefreshCw,
  FileCheck,
  Building2,
  CalendarClock,
  Layers,
  X,
  Archive,
  CheckCircle2,
  XCircle,
  Barcode,
  Receipt,
  FileText,
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
import { AppDrawer } from '@/components/common/AppDrawer';
import {
  Compra,
  CreateCompraDTO,
  CreateDetalleCompraDTO,
  Proveedor,
  Producto,
} from '@/types';
import { getCompras, registrarCompra } from '@/services/compraService';
import { getProveedores } from '@/services/proveedorService';
import { getProductos } from '@/services/productoService';

interface ItemForm {
  productoId: number;
  codigoLote: string;
  fechaVencimiento: string;
  cantidad: number;
  precioCompraUnitario: number;
}

export default function ComprasPage() {
  const [compras, setCompras] = React.useState<Compra[]>([]);
  const [proveedores, setProveedores] = React.useState<Proveedor[]>([]);
  const [productos, setProductos] = React.useState<Producto[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState('');

  // Drawers
  const [isNewDrawerOpen, setIsNewDrawerOpen] = React.useState(false);
  const [selectedCompra, setSelectedCompra] = React.useState<Compra | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Formulario de Nueva Compra
  const [proveedorId, setProveedorId] = React.useState<number | ''>('');
  const [tipoComprobante, setTipoComprobante] = React.useState('FACTURA');
  const [numeroComprobante, setNumeroComprobante] = React.useState('');
  const [observaciones, setObservaciones] = React.useState('');
  const [items, setItems] = React.useState<ItemForm[]>([]);

  // Item en edición dentro del drawer
  const [selectedProdId, setSelectedProdId] = React.useState<number | ''>('');
  const [itemLote, setItemLote] = React.useState('');
  const [itemVencimiento, setItemVencimiento] = React.useState('');
  const [itemCantidad, setItemCantidad] = React.useState<number>(10);
  const [itemPrecio, setItemPrecio] = React.useState<number>(5.0);

  // Toast
  const [toast, setToast] = React.useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const loadData = React.useCallback(async () => {
    try {
      setLoading(true);
      const [comprasData, provsData, prodsData] = await Promise.all([
        getCompras().catch(() => []),
        getProveedores().catch(() => []),
        getProductos().catch(() => []),
      ]);
      setCompras(Array.isArray(comprasData) ? comprasData : []);
      setProveedores(Array.isArray(provsData) ? provsData.filter((p) => p.activo ?? true) : []);
      setProductos(Array.isArray(prodsData) ? prodsData.filter((p) => p.activo ?? true) : []);
    } catch (error) {
      console.error('Error al cargar datos de compras:', error);
      showToast('error', 'No se pudieron sincronizar las órdenes de compra.');
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const handleOpenNewDrawer = () => {
    setProveedorId(proveedores[0]?.id || '');
    setTipoComprobante('FACTURA');
    setNumeroComprobante('');
    setObservaciones('');
    setItems([]);
    setSelectedProdId(productos[0]?.id || '');
    setItemLote(`LOT-${new Date().getFullYear()}-01`);
    const defaultExp = new Date();
    defaultExp.setFullYear(defaultExp.getFullYear() + 1);
    setItemVencimiento(defaultExp.toISOString().split('T')[0]);
    setItemCantidad(50);
    setItemPrecio(productos[0]?.precioCompra || 5.0);
    setIsNewDrawerOpen(true);
  };

  const handleProductSelectChange = (prodId: number) => {
    setSelectedProdId(prodId);
    const prod = productos.find((p) => p.id === prodId);
    if (prod && prod.precioCompra) {
      setItemPrecio(prod.precioCompra);
    }
  };

  const handleAddItem = () => {
    if (!selectedProdId) {
      showToast('error', 'Seleccione un fármaco válido.');
      return;
    }
    if (!itemLote.trim()) {
      showToast('error', 'Ingrese el número de lote para trazabilidad.');
      return;
    }
    if (!itemVencimiento) {
      showToast('error', 'Indique la fecha de caducidad del lote.');
      return;
    }
    if (itemCantidad <= 0 || itemPrecio <= 0) {
      showToast('error', 'Cantidad y precio deben ser mayores a cero.');
      return;
    }

    const newItem: ItemForm = {
      productoId: Number(selectedProdId),
      codigoLote: itemLote.trim(),
      fechaVencimiento: itemVencimiento,
      cantidad: Number(itemCantidad),
      precioCompraUnitario: Number(itemPrecio),
    };

    setItems((prev) => [...prev, newItem]);

    // Reset para el siguiente item
    setItemLote(`LOT-${new Date().getFullYear()}-${items.length + 2}`);
    setItemCantidad(50);
  };

  const handleRemoveItem = (index: number) => {
    setItems((prev) => prev.filter((_, idx) => idx !== index));
  };

  const totalCalculado = React.useMemo(() => {
    return items.reduce((acc, it) => acc + it.cantidad * it.precioCompraUnitario, 0);
  }, [items]);

  const handleRegistrarCompra = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!proveedorId) {
      showToast('error', 'Seleccione el proveedor autorizado.');
      return;
    }
    if (items.length === 0) {
      showToast('error', 'Debe agregar al menos un fármaco a la orden de compra.');
      return;
    }

    setIsSubmitting(true);
    const payload: CreateCompraDTO = {
      proveedorId: Number(proveedorId),
      tipoComprobante,
      numeroComprobante: numeroComprobante.trim() || undefined,
      observaciones: observaciones.trim() || undefined,
      detalles: items.map((it) => ({
        productoId: it.productoId,
        codigoLote: it.codigoLote,
        fechaVencimiento: it.fechaVencimiento,
        cantidad: it.cantidad,
        precioCompraUnitario: it.precioCompraUnitario,
      })),
    };

    try {
      await registrarCompra(payload);
      showToast('success', '¡Orden de compra y lotes ingresados al inventario exitosamente!');
      setIsNewDrawerOpen(false);
      loadData();
    } catch (error: any) {
      showToast('error', error.response?.data?.message || 'Error al registrar la compra.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filtered = React.useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return compras;
    return compras.filter(
      (c) =>
        (c.numeroCompra && c.numeroCompra.toLowerCase().includes(q)) ||
        (c.numeroFactura && c.numeroFactura.toLowerCase().includes(q)) ||
        (c.proveedorRazonSocial && c.proveedorRazonSocial.toLowerCase().includes(q)) ||
        (c.proveedorNombre && c.proveedorNombre.toLowerCase().includes(q)) ||
        (c.numeroComprobante && c.numeroComprobante.toLowerCase().includes(q))
    );
  }, [compras, search]);

  const stats = React.useMemo(() => {
    const total = compras.length;
    const inversionTotal = compras.reduce((acc, c) => acc + (c.total ?? c.montoTotal ?? 0), 0);
    const proveedoresSet = new Set(compras.map((c) => c.proveedorId));
    return {
      total,
      inversionTotal,
      proveedoresCount: proveedoresSet.size,
    };
  }, [compras]);

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
            <Truck className="w-4 h-4" />
            <span>Abastecimiento & Control de Compras</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1a365d] mt-1">
            Órdenes de Compra
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            Ingreso de órdenes de compra, control de facturas de laboratorios y creación automática de lotes (FEFO).
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
            <span>Registrar Compra</span>
          </Button>
        </div>
      </div>

      {/* Tarjetas KPI */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Card className="p-4 bg-white border border-slate-200/80 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Total Órdenes</span>
            <div className="p-2 rounded-xl bg-slate-100 text-[#1a365d]">
              <FileCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-[#1a365d]">{stats.total}</span>
            <span className="text-[11px] text-slate-400">compras registradas</span>
          </div>
        </Card>

        <Card className="p-4 bg-white border border-emerald-100 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-800">Inversión Total Acumulada</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-700 font-mono">
              S/ {stats.inversionTotal.toFixed(2)}
            </span>
            <span className="text-[11px] text-emerald-600/80">en mercadería</span>
          </div>
        </Card>

        <Card className="p-4 bg-white border border-slate-200/80 rounded-2xl shadow-xs col-span-2 md:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Proveedores Abastecedores</span>
            <div className="p-2 rounded-xl bg-teal-50 text-[#319795]">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-[#1a365d]">{stats.proveedoresCount}</span>
            <span className="text-[11px] text-slate-400">distribuidores distintos</span>
          </div>
        </Card>
      </div>

      {/* Contenedor Principal: Filtros y Tabla */}
      <Card className="bg-white border border-slate-200/80 shadow-xs rounded-2xl overflow-hidden">
        {/* Barra de Filtro */}
        <div className="p-4 border-b border-slate-100 bg-slate-50/40 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Buscar por N° Compra, Proveedor o Factura..."
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

          <div className="text-xs text-slate-500 font-medium self-end sm:self-center">
            Mostrando <span className="font-bold text-slate-800">{filtered.length}</span> compras
          </div>
        </div>

        {/* Tabla */}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-36">N° Compra</TableHead>
              <TableHead className="w-32">Fecha</TableHead>
              <TableHead>Proveedor Distribuidor</TableHead>
              <TableHead>Comprobante Fiscal</TableHead>
              <TableHead className="text-right">Monto Total</TableHead>
              <TableHead className="text-center">Ítems / Lotes</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, idx) => (
                <TableRow key={idx} className="animate-pulse">
                  <TableCell><div className="h-4 w-24 bg-slate-200 rounded-md"></div></TableCell>
                  <TableCell><div className="h-4 w-20 bg-slate-200 rounded-md"></div></TableCell>
                  <TableCell><div className="h-4 w-44 bg-slate-200 rounded-md"></div></TableCell>
                  <TableCell><div className="h-4 w-28 bg-slate-200 rounded-md"></div></TableCell>
                  <TableCell className="text-right"><div className="h-4 w-20 bg-slate-200 rounded-md ml-auto"></div></TableCell>
                  <TableCell className="text-center"><div className="h-5 w-16 bg-slate-200 rounded-full mx-auto"></div></TableCell>
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
                      {search ? 'Sin compras para este criterio' : 'No hay órdenes de compra registradas'}
                    </p>
                    <p className="text-xs text-slate-400">
                      {search
                        ? 'Verifique los términos de búsqueda o limpie el filtro.'
                        : 'Pulse "Registrar Compra" para ingresar mercadería con lotes automáticos.'}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((compra) => (
                <TableRow key={compra.id} className="group hover:bg-slate-50/70 transition-colors">
                  {/* N° Compra */}
                  <TableCell>
                    <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-[#1a365d] bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200 w-fit">
                      <Receipt className="w-3.5 h-3.5 text-slate-400" />
                      <span>{compra.numeroCompra || compra.numeroFactura || `COM-${compra.id}`}</span>
                    </div>
                  </TableCell>

                  {/* Fecha */}
                  <TableCell>
                    <div className="flex items-center gap-1 text-xs text-slate-600">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>
                        {(compra.fechaCompra || compra.fecha || compra.createdAt)
                          ? new Date(compra.fechaCompra || compra.fecha || compra.createdAt!).toLocaleDateString('es-PE', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            })
                          : '-'}
                      </span>
                    </div>
                  </TableCell>

                  {/* Proveedor */}
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-900 text-sm group-hover:text-[#319795] transition-colors">
                        {compra.proveedorRazonSocial || compra.proveedorNombre || 'Proveedor'}
                      </span>
                    </div>
                  </TableCell>

                  {/* Comprobante */}
                  <TableCell>
                    <span className="font-mono text-xs px-2 py-0.5 rounded-md bg-slate-50 text-slate-700 border border-slate-200">
                      {compra.tipoComprobante || 'FAC'}: {compra.numeroFactura || compra.numeroComprobante || '-'}
                    </span>
                  </TableCell>

                  {/* Total */}
                  <TableCell className="text-right font-mono font-bold text-sm text-slate-900">
                    S/ {(compra.total ?? compra.montoTotal ?? 0).toFixed(2)}
                  </TableCell>

                  {/* Lotes / Ítems */}
                  <TableCell className="text-center">
                    <Badge variant="teal" className="text-[11px] px-2.5 py-0.5 font-semibold">
                      {compra.detalles?.length || 0} lotes
                    </Badge>
                  </TableCell>

                  {/* Acciones */}
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedCompra(compra)}
                      className="h-8 text-xs font-semibold text-[#319795] hover:text-[#287e7c] hover:bg-teal-50 gap-1 rounded-xl cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Ver Detalle</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Drawer: Registro de Nueva Compra */}
      <AppDrawer
        isOpen={isNewDrawerOpen}
        onClose={() => setIsNewDrawerOpen(false)}
        title="Registrar Orden de Compra"
        description="Ingreso de fármacos por compra con generación automática de lotes (FEFO)."
        icon={Truck}
        onSubmit={handleRegistrarCompra}
        isSubmitting={isSubmitting}
        submitText={`Emitir Orden (S/ ${totalCalculado.toFixed(2)})`}
        cancelText="Cancelar"
        maxWidth="max-w-2xl"
      >
        <div className="space-y-5 py-2">
          {/* Cabecera de Compra */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl">
            {/* Proveedor */}
            <div className="space-y-1 sm:col-span-3">
              <Label htmlFor="proveedor" className="text-xs font-bold text-slate-700">
                Proveedor Mayorista <span className="text-rose-500">*</span>
              </Label>
              <select
                id="proveedor"
                value={proveedorId}
                onChange={(e) => setProveedorId(Number(e.target.value))}
                className="flex h-9 w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-[#319795]/20 focus:border-[#319795]"
                required
              >
                <option value="">Seleccione el proveedor...</option>
                {proveedores.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.razonSocial} (RUC: {p.ruc})
                  </option>
                ))}
              </select>
            </div>

            {/* Tipo de Comprobante */}
            <div className="space-y-1">
              <Label htmlFor="tipoComp" className="text-xs font-bold text-slate-700">
                Tipo Comprobante
              </Label>
              <select
                id="tipoComp"
                value={tipoComprobante}
                onChange={(e) => setTipoComprobante(e.target.value)}
                className="flex h-9 w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-[#319795]/20 focus:border-[#319795]"
              >
                <option value="FACTURA">Factura Electrónica</option>
                <option value="BOLETA">Boleta</option>
                <option value="GUIA_REMISION">Guía de Remisión</option>
              </select>
            </div>

            {/* N° Comprobante */}
            <div className="space-y-1 sm:col-span-2">
              <Label htmlFor="numComp" className="text-xs font-bold text-slate-700">
                N° de Serie / Factura
              </Label>
              <Input
                id="numComp"
                value={numeroComprobante}
                onChange={(e) => setNumeroComprobante(e.target.value.toUpperCase())}
                placeholder="Ej: F001-0004589"
                className="font-mono text-xs h-9 rounded-xl border-slate-200 focus-visible:ring-[#319795]/20 focus-visible:border-[#319795]"
              />
            </div>

            {/* Observaciones */}
            <div className="space-y-1 sm:col-span-3">
              <Label htmlFor="obs" className="text-xs font-bold text-slate-700">
                Observaciones / Condiciones de Entrega
              </Label>
              <Input
                id="obs"
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
                placeholder="Condiciones de pago, guía de transporte, etc."
                className="text-xs h-9 rounded-xl border-slate-200 focus-visible:ring-[#319795]/20 focus-visible:border-[#319795]"
              />
            </div>
          </div>

          {/* Formulario para Añadir Ítem */}
          <div className="p-3.5 bg-teal-50/50 border border-teal-100 rounded-2xl space-y-3">
            <div className="flex items-center gap-2 text-[#319795] font-bold text-xs">
              <Package className="w-4 h-4" />
              <span>Añadir Fármaco y Lote al Pedido</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Producto */}
              <div className="space-y-1 sm:col-span-2">
                <Label className="text-xs font-semibold text-slate-700">Fármaco a ingresar</Label>
                <select
                  value={selectedProdId}
                  onChange={(e) => handleProductSelectChange(Number(e.target.value))}
                  className="flex h-9 w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-[#319795]/20 focus:border-[#319795]"
                >
                  {productos.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nombre} ({p.codigo})
                    </option>
                  ))}
                </select>
              </div>

              {/* Lote */}
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-slate-700">Lote Asignado</Label>
                <Input
                  value={itemLote}
                  onChange={(e) => setItemLote(e.target.value.toUpperCase())}
                  placeholder="Ej: LOT-2026-01"
                  className="font-mono text-xs h-9 rounded-xl border-slate-200 bg-white"
                />
              </div>

              {/* Vencimiento */}
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-slate-700">Fecha de Caducidad</Label>
                <Input
                  type="date"
                  value={itemVencimiento}
                  onChange={(e) => setItemVencimiento(e.target.value)}
                  className="text-xs h-9 rounded-xl border-slate-200 bg-white"
                />
              </div>

              {/* Cantidad */}
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-slate-700">Cantidad (u.)</Label>
                <Input
                  type="number"
                  min={1}
                  value={itemCantidad}
                  onChange={(e) => setItemCantidad(Number(e.target.value))}
                  className="font-mono text-xs h-9 rounded-xl border-slate-200 bg-white"
                />
              </div>

              {/* Precio Compra */}
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-slate-700">P. Unitario Compra (S/.)</Label>
                <Input
                  type="number"
                  step="0.01"
                  min={0.01}
                  value={itemPrecio}
                  onChange={(e) => setItemPrecio(Number(e.target.value))}
                  className="font-mono text-xs h-9 rounded-xl border-slate-200 bg-white"
                />
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddItem}
              className="w-full text-xs font-bold rounded-xl border-teal-200 text-[#319795] hover:bg-teal-100/70"
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              + Agregar Fármaco a la Lista
            </Button>
          </div>

          {/* Tabla de Ítems Agregados */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700">
              <span>Lotes a Recepcionar ({items.length})</span>
              <span className="text-[#319795] font-mono">
                Total Acumulado: S/ {totalCalculado.toFixed(2)}
              </span>
            </div>

            {items.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-xl">
                Aún no ha agregado ítems a la orden de compra.
              </div>
            ) : (
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50/70 text-[11px]">
                      <TableHead>Producto</TableHead>
                      <TableHead>Lote</TableHead>
                      <TableHead>Vencimiento</TableHead>
                      <TableHead className="text-center">Cant.</TableHead>
                      <TableHead className="text-right">P. Unit</TableHead>
                      <TableHead className="text-right">Subtotal</TableHead>
                      <TableHead className="w-10"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((it, idx) => {
                      const prod = productos.find((p) => p.id === it.productoId);
                      const sub = it.cantidad * it.precioCompraUnitario;
                      return (
                        <TableRow key={idx} className="text-xs">
                          <TableCell className="font-semibold text-slate-800">
                            {prod?.nombre || `Producto #${it.productoId}`}
                          </TableCell>
                          <TableCell className="font-mono text-[11px] text-slate-600">
                            {it.codigoLote}
                          </TableCell>
                          <TableCell className="text-slate-500 text-[11px]">
                            {it.fechaVencimiento}
                          </TableCell>
                          <TableCell className="text-center font-bold">
                            {it.cantidad}
                          </TableCell>
                          <TableCell className="text-right font-mono">
                            S/ {it.precioCompraUnitario.toFixed(2)}
                          </TableCell>
                          <TableCell className="text-right font-mono font-bold text-slate-900">
                            S/ {sub.toFixed(2)}
                          </TableCell>
                          <TableCell className="text-right p-1">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRemoveItem(idx)}
                              className="h-7 w-7 text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </div>
      </AppDrawer>

      {/* Drawer: Detalle de Orden de Compra */}
      <AppDrawer
        isOpen={!!selectedCompra}
        onClose={() => setSelectedCompra(null)}
        title={`Orden de Compra ${selectedCompra?.numeroCompra || ''}`}
        description="Auditoría de recepción y lotes ingresados al sistema."
        icon={Receipt}
        maxWidth="max-w-xl"
        footer={
          <Button
            type="button"
            variant="outline"
            onClick={() => setSelectedCompra(null)}
            className="rounded-xl text-xs font-semibold border-slate-200 text-slate-700 hover:bg-slate-100"
          >
            Cerrar Detalle
          </Button>
        }
      >
        {selectedCompra && (
          <div className="space-y-4 py-2 text-xs">
            {/* Cabecera Resumen */}
            <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl grid grid-cols-2 gap-2 text-slate-700">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Proveedor</span>
                <span className="font-bold text-slate-900 text-sm">
                  {selectedCompra.proveedorRazonSocial || selectedCompra.proveedorNombre || 'Proveedor'}
                </span>
              </div>
              <div className="text-right">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Fecha Emisión</span>
                <span className="font-medium text-slate-700">
                  {(selectedCompra.fechaCompra || selectedCompra.fecha || selectedCompra.createdAt)
                    ? new Date(selectedCompra.fechaCompra || selectedCompra.fecha || selectedCompra.createdAt!).toLocaleString('es-PE', {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })
                    : '-'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Comprobante</span>
                <span className="font-mono text-slate-800">
                  {selectedCompra.tipoComprobante || 'FAC'}: {selectedCompra.numeroFactura || selectedCompra.numeroComprobante || 'S/N'}
                </span>
              </div>
              <div className="text-right">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Monto Total</span>
                <span className="text-sm font-extrabold text-[#319795] font-mono">
                  S/ {(selectedCompra.total ?? selectedCompra.montoTotal ?? 0).toFixed(2)}
                </span>
              </div>
              {selectedCompra.observaciones && (
                <div className="col-span-2 pt-1 border-t border-slate-200/60 text-slate-500">
                  <span className="font-semibold text-slate-600">Obs:</span> {selectedCompra.observaciones}
                </div>
              )}
            </div>

            {/* Tabla de Lotes Recibidos */}
            <div className="space-y-1.5">
              <span className="font-bold text-slate-800 text-xs">
                Lotes Ingresados al Inventario ({selectedCompra.detalles?.length || 0})
              </span>
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50 text-[11px]">
                      <TableHead>Producto</TableHead>
                      <TableHead>Lote</TableHead>
                      <TableHead>Vencimiento</TableHead>
                      <TableHead className="text-center">Cant.</TableHead>
                      <TableHead className="text-right">P. Unit</TableHead>
                      <TableHead className="text-right">Subtotal</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedCompra.detalles?.map((det, idx) => (
                      <TableRow key={det.id || idx} className="text-xs">
                        <TableCell className="font-semibold text-slate-800">
                          {det.productoNombre || `Producto #${det.productoId}`}
                        </TableCell>
                        <TableCell className="font-mono text-[11px] text-slate-600">
                          {det.codigoLote || '-'}
                        </TableCell>
                        <TableCell className="text-slate-500 text-[11px]">
                          {det.fechaVencimiento}
                        </TableCell>
                        <TableCell className="text-center font-bold">
                          {det.cantidad}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          S/ {(det.precioCompraUnitario || 0).toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right font-mono font-bold text-slate-900">
                          S/ {(det.subtotal || det.cantidad * (det.precioCompraUnitario || 0)).toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        )}
      </AppDrawer>
    </div>
  );
}
