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
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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

  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [selectedCompra, setSelectedCompra] = React.useState<Compra | null>(null);

  // Formulario de Nueva Compra
  const [proveedorId, setProveedorId] = React.useState<number | ''>('');
  const [tipoComprobante, setTipoComprobante] = React.useState('FACTURA');
  const [numeroComprobante, setNumeroComprobante] = React.useState('');
  const [observaciones, setObservaciones] = React.useState('');
  const [items, setItems] = React.useState<ItemForm[]>([]);

  // Item en edición dentro del modal
  const [selectedProdId, setSelectedProdId] = React.useState<number | ''>('');
  const [itemLote, setItemLote] = React.useState('');
  const [itemVencimiento, setItemVencimiento] = React.useState('');
  const [itemCantidad, setItemCantidad] = React.useState<number>(10);
  const [itemPrecio, setItemPrecio] = React.useState<number>(5.0);

  const loadData = React.useCallback(async () => {
    try {
      setLoading(true);
      const [comprasData, provsData, prodsData] = await Promise.all([
        getCompras(),
        getProveedores(),
        getProductos(),
      ]);
      setCompras(comprasData);
      setProveedores(provsData.filter((p) => p.activo ?? true));
      setProductos(prodsData.filter((p) => p.activo ?? true));
    } catch (error) {
      console.error('Error al cargar datos de compras:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const handleOpenModal = () => {
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
    setIsModalOpen(true);
  };

  const handleAddItem = () => {
    if (!selectedProdId) {
      alert('Debe seleccionar un producto.');
      return;
    }
    if (!itemLote.trim()) {
      alert('Debe ingresar el código de lote del producto.');
      return;
    }
    if (!itemVencimiento) {
      alert('Debe ingresar la fecha de caducidad del lote.');
      return;
    }
    if (itemCantidad <= 0 || itemPrecio <= 0) {
      alert('La cantidad y precio deben ser mayores a cero.');
      return;
    }

    setItems([
      ...items,
      {
        productoId: Number(selectedProdId),
        codigoLote: itemLote.trim(),
        fechaVencimiento: itemVencimiento,
        cantidad: Number(itemCantidad),
        precioCompraUnitario: Number(itemPrecio),
      },
    ]);

    // Reset temporal
    setItemLote(`LOT-${new Date().getFullYear()}-${items.length + 2}`);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const totalCalculado = items.reduce(
    (acc, curr) => acc + curr.cantidad * curr.precioCompraUnitario,
    0
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!proveedorId) {
      alert('Seleccione un proveedor.');
      return;
    }
    if (items.length === 0) {
      alert('Debe agregar al menos un producto a la compra.');
      return;
    }

    const payload: CreateCompraDTO = {
      proveedorId: Number(proveedorId),
      tipoComprobante,
      numeroComprobante: numeroComprobante.trim() || `FAC-${Date.now()}`,
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
      setIsModalOpen(false);
      loadData();
      alert('¡Compra registrada con éxito e inventario/lotes actualizados!');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error al procesar la compra.');
    }
  };

  const filtered = compras.filter((c) => {
    const q = search.toLowerCase();
    return (
      c.numeroCompra.toLowerCase().includes(q) ||
      (c.proveedorNombre && c.proveedorNombre.toLowerCase().includes(q)) ||
      (c.numeroComprobante && c.numeroComprobante.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-[#319795] font-semibold text-sm">
            <Truck className="size-4" />
            <span>Abastecimiento & Adquisiciones</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mt-1">
            Compras a Proveedores
          </h1>
          <p className="text-slate-400 text-sm mt-0.5">
            Ingreso de órdenes de compra, control de facturas de laboratorio y creación automática de lotes (FEFO).
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
            onClick={handleOpenModal}
            className="bg-[#319795] hover:bg-[#287e7c] text-white font-semibold shadow-md gap-2"
          >
            <Plus className="size-4" />
            Registrar Compra
          </Button>
        </div>
      </div>

      {/* Barra de búsqueda */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
          <Input
            placeholder="Buscar por N° Compra, Proveedor o Factura..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-slate-900/70 border-slate-800 text-white placeholder:text-slate-500 rounded-xl"
          />
        </div>
        <div className="text-xs text-slate-400">
          Registros: <span className="font-bold text-white">{filtered.length}</span> compras
        </div>
      </div>

      {/* Tabla de Compras */}
      <Card className="border-slate-800/80 bg-slate-900/50 shadow-xl rounded-xl overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-950/70 text-slate-400 font-semibold uppercase text-[11px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3.5">N° Compra</th>
                  <th className="px-4 py-3.5">Fecha</th>
                  <th className="px-4 py-3.5">Proveedor</th>
                  <th className="px-4 py-3.5">Comprobante</th>
                  <th className="px-4 py-3.5 text-right">Monto Total</th>
                  <th className="px-4 py-3.5 text-center">Items</th>
                  <th className="px-4 py-3.5 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="text-center py-10 text-slate-400">
                      <RefreshCw className="size-6 animate-spin mx-auto mb-2 text-[#319795]" />
                      Cargando historial de compras...
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-10 text-slate-500">
                      No se encontraron órdenes de compra registradas.
                    </td>
                  </tr>
                ) : (
                  filtered.map((compra) => (
                    <tr key={compra.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-4 py-3 font-mono font-bold text-white">
                        {compra.numeroCompra}
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-300">
                        {compra.fecha ? new Date(compra.fecha).toLocaleDateString('es-PE', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        }) : '-'}
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-200">
                        {compra.proveedorNombre || 'Proveedor'}
                      </td>
                      <td className="px-4 py-3 text-xs">
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono border border-slate-700">
                          {compra.tipoComprobante || 'FAC'}: {compra.numeroComprobante || '-'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-emerald-400 font-mono">
                        S/ {compra.montoTotal.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                          {compra.detalles?.length || 0} lotes
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setSelectedCompra(compra)}
                          className="h-8 text-[#319795] hover:text-white hover:bg-[#319795]/20 gap-1"
                        >
                          <Eye className="size-3.5" /> Ver Detalle
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Modal Ver Detalle de Compra */}
      {selectedCompra && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <FileCheck className="size-5 text-[#319795]" />
                  Detalle de Compra: {selectedCompra.numeroCompra}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Proveedor: {selectedCompra.proveedorNombre} | Factura: {selectedCompra.numeroComprobante}
                </p>
              </div>
              <button
                onClick={() => setSelectedCompra(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-xs">
                <div>
                  <span className="text-slate-500 block">Fecha Registro</span>
                  <span className="font-semibold text-white">
                    {selectedCompra.fecha ? new Date(selectedCompra.fecha).toLocaleString('es-PE') : '-'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Comprobante</span>
                  <span className="font-semibold text-white">{selectedCompra.numeroComprobante || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Registrado por</span>
                  <span className="font-semibold text-white">{selectedCompra.usuarioNombre || 'Admin'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Total Pagado</span>
                  <span className="font-bold text-emerald-400 text-sm">
                    S/ {selectedCompra.montoTotal.toFixed(2)}
                  </span>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Lotes Ingresados al Inventario
                </h4>
                <div className="border border-slate-800 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] border-b border-slate-800">
                      <tr>
                        <th className="p-2.5">Producto</th>
                        <th className="p-2.5">Código Lote</th>
                        <th className="p-2.5 text-center">Cant.</th>
                        <th className="p-2.5 text-right">P. Compra</th>
                        <th className="p-2.5 text-right">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {selectedCompra.detalles?.map((det, idx) => (
                        <tr key={idx} className="hover:bg-slate-800/30">
                          <td className="p-2.5 font-semibold text-white">{det.productoNombre}</td>
                          <td className="p-2.5 font-mono text-[#81e6d9]">{det.codigoLote}</td>
                          <td className="p-2.5 text-center font-bold text-white">{det.cantidad}</td>
                          <td className="p-2.5 text-right">S/ {det.precioCompraUnitario.toFixed(2)}</td>
                          <td className="p-2.5 text-right font-bold text-emerald-400">
                            S/ {(det.subtotal || det.cantidad * det.precioCompraUnitario).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedCompra(null)}
                className="border-slate-700 bg-slate-900 text-slate-300"
              >
                Cerrar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Registrar Nueva Compra */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Truck className="size-5 text-[#319795]" />
                  Registrar Orden de Compra & Lotes
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Ingrese la factura y los lotes que ingresarán al almacén general.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-5 max-h-[75vh] overflow-y-auto">
              {/* Datos de cabecera */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Proveedor *
                  </label>
                  <select
                    required
                    value={proveedorId}
                    onChange={(e) => setProveedorId(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-sm text-white focus:outline-none focus:border-[#319795]"
                  >
                    <option value="">Seleccione proveedor...</option>
                    {proveedores.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.razonSocial} (RUC: {p.ruc})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Tipo de Comprobante
                  </label>
                  <select
                    value={tipoComprobante}
                    onChange={(e) => setTipoComprobante(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-sm text-white focus:outline-none focus:border-[#319795]"
                  >
                    <option value="FACTURA">FACTURA ELECTRÓNICA</option>
                    <option value="BOLETA">BOLETA DE VENTA</option>
                    <option value="GUIA_REMISION">GUÍA DE REMISIÓN</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    N° de Factura / Serie
                  </label>
                  <Input
                    required
                    placeholder="F001-00045892"
                    value={numeroComprobante}
                    onChange={(e) => setNumeroComprobante(e.target.value)}
                    className="bg-slate-950 border-slate-800 text-white font-mono"
                  />
                </div>
              </div>

              {/* Agregar Items / Lotes */}
              <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#81e6d9] flex items-center gap-1.5">
                  <Layers className="size-4" /> Agregar Fármaco y Lote a la Compra
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                  <div className="sm:col-span-4">
                    <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                      Producto
                    </label>
                    <select
                      value={selectedProdId}
                      onChange={(e) => {
                        const pid = Number(e.target.value);
                        setSelectedProdId(pid);
                        const found = productos.find((p) => p.id === pid);
                        if (found?.precioCompra) setItemPrecio(found.precioCompra);
                      }}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white"
                    >
                      {productos.map((prod) => (
                        <option key={prod.id} value={prod.id}>
                          {prod.nombre} ({prod.codigo})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                      Código Lote
                    </label>
                    <Input
                      value={itemLote}
                      onChange={(e) => setItemLote(e.target.value)}
                      placeholder="LOT-2026-X"
                      className="h-8 bg-slate-900 border-slate-700 text-xs text-white font-mono"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                      F. Vencimiento
                    </label>
                    <Input
                      type="date"
                      value={itemVencimiento}
                      onChange={(e) => setItemVencimiento(e.target.value)}
                      className="h-8 bg-slate-900 border-slate-700 text-xs text-white"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                      Cantidad
                    </label>
                    <Input
                      type="number"
                      min={1}
                      value={itemCantidad}
                      onChange={(e) => setItemCantidad(Number(e.target.value))}
                      className="h-8 bg-slate-900 border-slate-700 text-xs text-white font-bold"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                      P. Compra S/
                    </label>
                    <Input
                      type="number"
                      step="0.01"
                      min={0.01}
                      value={itemPrecio}
                      onChange={(e) => setItemPrecio(Number(e.target.value))}
                      className="h-8 bg-slate-900 border-slate-700 text-xs text-white font-mono"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-1">
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleAddItem}
                    className="bg-[#319795] hover:bg-[#287e7c] text-white text-xs gap-1.5 h-8 font-semibold"
                  >
                    <Plus className="size-3.5" /> Agregar a la Lista
                  </Button>
                </div>
              </div>

              {/* Lista de productos agregados */}
              <div>
                <h4 className="text-xs font-semibold text-slate-300 mb-2">
                  Items en la Orden ({items.length})
                </h4>

                {items.length === 0 ? (
                  <div className="text-center py-6 border border-dashed border-slate-800 rounded-xl text-slate-500 text-xs">
                    No ha agregado ningún producto aún. Use el panel superior para añadir fármacos.
                  </div>
                ) : (
                  <div className="border border-slate-800 rounded-xl overflow-hidden">
                    <table className="w-full text-left text-xs text-slate-300">
                      <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] border-b border-slate-800">
                        <tr>
                          <th className="p-2.5">Producto</th>
                          <th className="p-2.5">Lote</th>
                          <th className="p-2.5">Vence</th>
                          <th className="p-2.5 text-center">Cant.</th>
                          <th className="p-2.5 text-right">P. Unitario</th>
                          <th className="p-2.5 text-right">Subtotal</th>
                          <th className="p-2.5 text-center">Quitar</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {items.map((it, idx) => {
                          const pObj = productos.find((p) => p.id === it.productoId);
                          const sub = it.cantidad * it.precioCompraUnitario;
                          return (
                            <tr key={idx} className="hover:bg-slate-800/30">
                              <td className="p-2.5 font-medium text-white">{pObj?.nombre}</td>
                              <td className="p-2.5 font-mono text-[#81e6d9]">{it.codigoLote}</td>
                              <td className="p-2.5 text-slate-400">{it.fechaVencimiento}</td>
                              <td className="p-2.5 text-center font-bold">{it.cantidad}</td>
                              <td className="p-2.5 text-right">S/ {it.precioCompraUnitario.toFixed(2)}</td>
                              <td className="p-2.5 text-right font-bold text-emerald-400">
                                S/ {sub.toFixed(2)}
                              </td>
                              <td className="p-2.5 text-center">
                                <button
                                  type="button"
                                  onClick={() => handleRemoveItem(idx)}
                                  className="text-rose-400 hover:text-rose-300 p-1"
                                >
                                  <Trash2 className="size-3.5" />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Total y Observaciones */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-slate-950/70 rounded-xl border border-slate-800">
                <div className="w-full sm:w-1/2">
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                    Observaciones / Notas
                  </label>
                  <Input
                    value={observaciones}
                    onChange={(e) => setObservaciones(e.target.value)}
                    placeholder="Entrega en almacén 2, condiciones óptimas de frío..."
                    className="bg-slate-900 border-slate-800 text-xs text-white"
                  />
                </div>

                <div className="text-right">
                  <span className="text-xs text-slate-400 block">Total a Pagar a Proveedor</span>
                  <span className="text-2xl font-bold font-mono text-emerald-400">
                    S/ {totalCalculado.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Acciones */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                  className="border-slate-700 bg-transparent text-slate-300 hover:bg-slate-800"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={items.length === 0}
                  className="bg-[#319795] hover:bg-[#287e7c] text-white font-semibold"
                >
                  Confirmar y Cargar Inventario
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
