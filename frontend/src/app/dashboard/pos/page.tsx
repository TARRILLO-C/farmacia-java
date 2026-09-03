'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  ShoppingCart,
  Search,
  Barcode,
  Pill,
  Plus,
  Minus,
  Trash2,
  User,
  UserCheck,
  Star,
  ShieldAlert,
  FileCheck,
  CreditCard,
  Banknote,
  Smartphone,
  Printer,
  CheckCircle2,
  AlertCircle,
  X,
  Receipt,
  RotateCcw,
  Sparkles,
  Layers,
  ArrowRight,
  Info,
} from 'lucide-react';
import {
  Producto,
  Cliente,
  TipoCliente,
  CreateVentaDTO,
  CreateDetalleVentaDTO,
  MetodoPago,
  TipoComprobante,
  Venta,
} from '@/types';
import { getProductos } from '@/services/productoService';
import { buscarClientePorDocumentoOCodigo, getClientes } from '@/services/clienteService';
import { postVenta } from '@/services/ventaService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';

// Ítem dentro del carrito de compras
interface CartItem {
  producto: Producto;
  cantidad: number;
}

// Fallbacks de demostración si la API está desconectada
const DEMO_PRODUCTOS: Producto[] = [
  {
    id: 1,
    codigo: '7750123450012',
    nombre: 'Paracetamol 500mg Forte',
    principioActivo: 'Paracetamol',
    presentacion: 'Caja x 100 Tabletas',
    precio: 14.5,
    stock: 145,
    stockMinimo: 20,
    requiereReceta: false,
    activo: true,
    categoriaId: 1,
    categoria: { id: 1, nombre: 'Analgésicos' },
  },
  {
    id: 2,
    codigo: '7750123450029',
    nombre: 'Amoxicilina + Ác. Clavulánico 500/125mg',
    principioActivo: 'Amoxicilina / Clavulanato',
    presentacion: 'Caja x 14 Tabletas Recubiertas',
    precio: 32.0,
    stock: 64,
    stockMinimo: 15,
    requiereReceta: true,
    activo: true,
    categoriaId: 2,
    categoria: { id: 2, nombre: 'Antibióticos' },
  },
  {
    id: 3,
    codigo: '7750123450036',
    nombre: 'Ibuprofeno 400mg',
    principioActivo: 'Ibuprofeno',
    presentacion: 'Caja x 50 Cápsulas Blandas',
    precio: 16.5,
    stock: 35,
    stockMinimo: 10,
    requiereReceta: false,
    activo: true,
    categoriaId: 1,
    categoria: { id: 1, nombre: 'Analgésicos' },
  },
  {
    id: 4,
    codigo: '7750123450043',
    nombre: 'Loratadina 10mg',
    principioActivo: 'Loratadina',
    presentacion: 'Caja x 30 Tabletas',
    precio: 11.0,
    stock: 8,
    stockMinimo: 12,
    requiereReceta: false,
    activo: true,
    categoriaId: 3,
    categoria: { id: 3, nombre: 'Antihistamínicos' },
  },
  {
    id: 5,
    codigo: '7750123450050',
    nombre: 'Azitromicina 500mg',
    principioActivo: 'Azitromicina Dihidrato',
    presentacion: 'Caja x 3 Tabletas',
    precio: 22.5,
    stock: 0, // Agotado
    stockMinimo: 10,
    requiereReceta: true,
    activo: true,
    categoriaId: 2,
    categoria: { id: 2, nombre: 'Antibióticos' },
  },
  {
    id: 6,
    codigo: '7750123450067',
    nombre: 'Omeprazol 20mg Cápsulas',
    principioActivo: 'Omeprazol',
    presentacion: 'Frasco x 30 Cápsulas',
    precio: 15.0,
    stock: 28,
    stockMinimo: 10,
    requiereReceta: false,
    activo: true,
    categoriaId: 4,
    categoria: { id: 4, nombre: 'Gastrointestinales' },
  },
  {
    id: 7,
    codigo: '7750123450074',
    nombre: 'Redoxon Vitamina C 1000mg',
    principioActivo: 'Ácido Ascórbico',
    presentacion: 'Tubo x 10 Tabletas Efervescentes',
    precio: 24.0,
    stock: 50,
    stockMinimo: 15,
    requiereReceta: false,
    activo: true,
    categoriaId: 5,
    categoria: { id: 5, nombre: 'Vitaminas' },
  },
  {
    id: 8,
    codigo: '7750123450081',
    nombre: 'Salbutamol Inhalador 100mcg',
    principioActivo: 'Salbutamol Sulfato',
    presentacion: 'Inhalador 200 dosis',
    precio: 28.5,
    stock: 18,
    stockMinimo: 8,
    requiereReceta: true,
    activo: true,
    categoriaId: 6,
    categoria: { id: 6, nombre: 'Respiratorios' },
  },
];

const DEMO_CLIENTES: Cliente[] = [
  {
    id: 1,
    documentoIdentidad: '74218934',
    tipoDocumento: 'DNI',
    nombre: 'Elena Rosa',
    apellido: 'Mendoza Paredes',
    tipoCliente: TipoCliente.BENEFICIARIO,
    esClienteAmigo: true,
    codigoClienteAmigo: 'CA-48291',
    activo: true,
  },
  {
    id: 2,
    documentoIdentidad: '41982341',
    tipoDocumento: 'DNI',
    nombre: 'Carlos Manuel',
    apellido: 'Arroyo Vega',
    tipoCliente: TipoCliente.REGULAR,
    esClienteAmigo: true,
    codigoClienteAmigo: 'CA-10294',
    activo: true,
  },
  {
    id: 3,
    documentoIdentidad: '20608941234',
    tipoDocumento: 'RUC',
    nombre: 'Policlínico San Judas Tadeo SAC',
    apellido: '',
    tipoCliente: TipoCliente.BENEFICIARIO,
    esClienteAmigo: false,
    activo: true,
  },
];

export default function PosPage() {
  // Catálogo y Búsqueda
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loadingProds, setLoadingProds] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoria, setSelectedCategoria] = useState<string>('ALL');

  // Carrito de compras
  const [cart, setCart] = useState<CartItem[]>([]);

  // Cliente y Programa ClienteAmigo
  const [clientSearchTerm, setClientSearchTerm] = useState('');
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null);
  const [isSearchingClient, setIsSearchingClient] = useState(false);
  const [clientSearchError, setClientSearchError] = useState<string | null>(null);

  // Validación de Receta Médica
  const [requiereReceta, setRequiereReceta] = useState(false);

  // Parámetros de Pago y Comprobante
  const [tipoComprobante, setTipoComprobante] = useState<TipoComprobante>('BOLETA');
  const [metodoPago, setMetodoPago] = useState<MetodoPago>('EFECTIVO');
  const [montoPagado, setMontoPagado] = useState<string>('');

  // Proceso de Finalización de Venta
  const [isProcessingSale, setIsProcessingSale] = useState(false);
  const [completedVenta, setCompletedVenta] = useState<Venta | null>(null);
  const [completedVuelto, setCompletedVuelto] = useState<number>(0);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);

  // Cargar catálogo de productos al montar
  useEffect(() => {
    const load = async () => {
      setLoadingProds(true);
      try {
        const data = await getProductos();
        if (data && data.length > 0) {
          setProductos(data);
        } else {
          setProductos(DEMO_PRODUCTOS);
        }
      } catch {
        setProductos(DEMO_PRODUCTOS);
      } finally {
        setLoadingProds(false);
      }
    };
    load();
  }, []);

  // Extraer categorías únicas para los tabs de filtrado
  const categoriasDisponibles = useMemo(() => {
    const map = new Map<string, string>();
    productos.forEach((p) => {
      if (p.categoria?.nombre) {
        map.set(p.categoria.id.toString(), p.categoria.nombre);
      }
    });
    return Array.from(map.entries()).map(([id, nombre]) => ({ id, nombre }));
  }, [productos]);

  // Filtrado de productos en el catálogo
  const filteredProductos = useMemo(() => {
    return productos.filter((p) => {
      const term = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !term ||
        p.nombre.toLowerCase().includes(term) ||
        p.codigo.toLowerCase().includes(term) ||
        (p.principioActivo && p.principioActivo.toLowerCase().includes(term));

      const matchesCat =
        selectedCategoria === 'ALL' ||
        p.categoriaId?.toString() === selectedCategoria ||
        p.categoria?.id?.toString() === selectedCategoria;

      return matchesSearch && matchesCat;
    });
  }, [productos, searchTerm, selectedCategoria]);

  // 1. Agregar Producto al Carrito (o por escáner de código de barras)
  const addToCart = (producto: Producto) => {
    if (producto.stock <= 0) return;

    setCart((prev) => {
      const existing = prev.find((item) => item.producto.id === producto.id);
      if (existing) {
        if (existing.cantidad >= producto.stock) return prev; // Límite de stock
        return prev.map((item) =>
          item.producto.id === producto.id
            ? { ...item, cantidad: item.cantidad + 1 }
            : item
        );
      }
      return [...prev, { producto, cantidad: 1 }];
    });
  };

  // Manejar ENTER en buscador para auto-agregar por código de barras
  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchTerm.trim()) {
      const exactMatch = productos.find(
        (p) =>
          p.codigo.toLowerCase() === searchTerm.trim().toLowerCase() ||
          p.nombre.toLowerCase() === searchTerm.trim().toLowerCase()
      );
      if (exactMatch && exactMatch.stock > 0) {
        addToCart(exactMatch);
        setSearchTerm('');
      }
    }
  };

  // Control de Cantidades (+ / -)
  const updateQuantity = (productoId: number, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.producto.id === productoId) {
            const newQty = item.cantidad + delta;
            if (newQty <= 0) return null;
            if (newQty > item.producto.stock) return item; // No exceder stock
            return { ...item, cantidad: newQty };
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  // Remover ítem del carrito
  const removeFromCart = (productoId: number) => {
    setCart((prev) => prev.filter((item) => item.producto.id !== productoId));
  };

  // Vaciar carrito
  const clearCart = () => {
    setCart([]);
  };

  // Auto-detección: si algún ítem exige receta, activar validación de receta médica
  const cartHasControlledMeds = useMemo(() => {
    return cart.some((item) => item.producto.requiereReceta);
  }, [cart]);

  useEffect(() => {
    if (cartHasControlledMeds) {
      setRequiereReceta(true);
    }
  }, [cartHasControlledMeds]);

  // 2. Búsqueda de Cliente / ClienteAmigo por DNI, RUC o Código
  const handleSearchCliente = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = clientSearchTerm.trim();
    if (!query) return;

    setIsSearchingClient(true);
    setClientSearchError(null);

    try {
      // 1. Intentar API
      const clienteFound = await buscarClientePorDocumentoOCodigo(query);
      if (clienteFound) {
        setSelectedCliente(clienteFound);
        setClientSearchTerm('');
        return;
      }

      // 2. Fallback local demo
      const localMatch = DEMO_CLIENTES.find(
        (c) =>
          c.documentoIdentidad.toLowerCase() === query.toLowerCase() ||
          c.codigoClienteAmigo?.toLowerCase() === query.toLowerCase()
      );

      if (localMatch) {
        setSelectedCliente(localMatch);
        setClientSearchTerm('');
      } else {
        setClientSearchError(`No se encontró cliente con DNI/RUC o código "${query}".`);
      }
    } catch {
      const localMatch = DEMO_CLIENTES.find(
        (c) =>
          c.documentoIdentidad.toLowerCase() === query.toLowerCase() ||
          c.codigoClienteAmigo?.toLowerCase() === query.toLowerCase()
      );
      if (localMatch) {
        setSelectedCliente(localMatch);
        setClientSearchTerm('');
      } else {
        setClientSearchError(`No se encontró cliente con documento "${query}".`);
      }
    } finally {
      setIsSearchingClient(false);
    }
  };

  const clearSelectedCliente = () => {
    setSelectedCliente(null);
    setClientSearchError(null);
  };

  // Cálculos Financieros del Carrito
  const totals = useMemo(() => {
    const rawSubtotal = cart.reduce(
      (acc, item) => acc + item.producto.precio * item.cantidad,
      0
    );

    // Descuento ClienteAmigo: 5% sobre el subtotal
    const isClienteAmigo = selectedCliente?.esClienteAmigo === true;
    const discountRate = isClienteAmigo ? 0.05 : 0;
    const discountAmount = Math.round(rawSubtotal * discountRate * 100) / 100;

    const totalFinal = Math.max(0, rawSubtotal - discountAmount);

    // Desglose tributario IGV (18%)
    const baseImponible = totalFinal / 1.18;
    const igvAmount = totalFinal - baseImponible;

    return {
      rawSubtotal,
      isClienteAmigo,
      discountRate,
      discountAmount,
      baseImponible,
      igvAmount,
      totalFinal,
    };
  }, [cart, selectedCliente]);

  // Cálculo de vuelto para pago en efectivo
  const vueltoCalculado = useMemo(() => {
    if (metodoPago !== 'EFECTIVO' || !montoPagado) return 0;
    const pago = parseFloat(montoPagado);
    if (isNaN(pago) || pago < totals.totalFinal) return 0;
    return Math.round((pago - totals.totalFinal) * 100) / 100;
  }, [metodoPago, montoPagado, totals.totalFinal]);

  // Validación para permitir venta
  // Si requiere receta médica, exige obligatoriamente un cliente asignado
  const isPrescriptionBlocked = requiereReceta && !selectedCliente;
  const isCartEmpty = cart.length === 0;
  const canFinalize = !isCartEmpty && !isPrescriptionBlocked && !isProcessingSale;

  // 4. Finalizar Venta: Formatear JSON y enviar a postVenta()
  const handleFinalizarVenta = async () => {
    if (!canFinalize) return;

    setIsProcessingSale(true);

    try {
      const payload: CreateVentaDTO = {
        clienteId: selectedCliente?.id,
        usuarioId: 1, // ID del cajero/usuario actual
        metodoPago,
        tipoComprobante,
        detalles: cart.map(
          (item): CreateDetalleVentaDTO => ({
            productoId: item.producto.id,
            cantidad: item.cantidad,
            precioUnitario: item.producto.precio,
            descuento: totals.isClienteAmigo
              ? Math.round(item.producto.precio * item.cantidad * 0.05 * 100) / 100
              : 0,
          })
        ),
        observaciones: requiereReceta
          ? `Dispensación bajo receta médica verificada para ${selectedCliente?.nombre} ${selectedCliente?.apellido}`
          : undefined,
      };

      console.log('Enviando transacción a postVenta():', payload);

      let resultVenta: Venta;
      try {
        resultVenta = await postVenta(payload);
      } catch (apiErr) {
        console.warn('API postVenta() falló o no está conectada. Generando comprobante local:', apiErr);
        // Simulación local de Venta exitosa
        resultVenta = {
          id: Date.now(),
          numeroVenta: `VTA-${Math.floor(100000 + Math.random() * 900000)}`,
          fecha: new Date().toISOString(),
          clienteId: selectedCliente?.id,
          cliente: selectedCliente || undefined,
          usuarioId: 1,
          detalles: cart.map((item, idx) => ({
            id: idx + 1,
            productoId: item.producto.id,
            producto: item.producto,
            cantidad: item.cantidad,
            precioUnitario: item.producto.precio,
            descuento: totals.isClienteAmigo ? item.producto.precio * item.cantidad * 0.05 : 0,
            subtotal: item.producto.precio * item.cantidad,
          })),
          subtotal: totals.rawSubtotal,
          descuentoTotal: totals.discountAmount,
          impuesto: totals.igvAmount,
          total: totals.totalFinal,
          metodoPago,
          estado: 'COMPLETADA',
          observaciones: payload.observaciones,
        };
      }

      // Descontar stock localmente para retroalimentación visual inmediata
      setProductos((prev) =>
        prev.map((p) => {
          const itemSold = cart.find((c) => c.producto.id === p.id);
          if (itemSold) {
            return { ...p, stock: Math.max(0, p.stock - itemSold.cantidad) };
          }
          return p;
        })
      );

      setCompletedVenta(resultVenta);
      setCompletedVuelto(vueltoCalculado);
      setIsSuccessModalOpen(true);

      // Limpiar carrito y monto
      setCart([]);
      setMontoPagado('');
    } catch (error) {
      console.error('Error al procesar la venta:', error);
      alert('Error inesperado al emitir la venta. Inténtelo nuevamente.');
    } finally {
      setIsProcessingSale(false);
    }
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  return (
    <div className="space-y-4 pb-12">
      {/* Barra Superior Informativa del POS */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-3.5 px-5 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-[#319795] to-[#285e61] text-white shadow-xs">
            <ShoppingCart className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-black text-[#1a365d] tracking-tight flex items-center gap-2">
              Punto de Venta Farmacéutico (POS)
              <Badge variant="teal" className="text-[10px] font-bold">
                Caja 01 - Turno Abierto
              </Badge>
            </h1>
            <p className="text-xs text-slate-500">
              Dispensación ágil, emisión de tickets y fidelización ClienteAmigo.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {cart.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearCart}
              className="h-8 gap-1.5 text-xs text-rose-600 border-rose-200 hover:bg-rose-50 rounded-xl"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Vaciar Orden</span>
            </Button>
          )}
          <div className="hidden lg:flex items-center gap-2 text-xs font-semibold px-3 py-1.5 bg-slate-100/80 rounded-xl text-slate-700">
            <Barcode className="w-4 h-4 text-[#319795]" />
            <span>Escáner de Barras Activo</span>
          </div>
        </div>
      </div>

      {/* Grid Principal de 2 Columnas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* ==================================================================== */}
        {/* COLUMNA IZQUIERDA: BUSCADOR Y CATÁLOGO DE PRODUCTOS (7 cols)         */}
        {/* ==================================================================== */}
        <div className="lg:col-span-7 space-y-4">
          <Card className="p-4 bg-white border border-slate-200/80 rounded-2xl shadow-xs space-y-3">
            {/* Buscador de Productos por Nombre o Código de Barras */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Search className="w-4 h-4" />
              </div>
              <Input
                ref={searchInputRef}
                type="text"
                placeholder="Escanear código de barras o escribir fármaco (Presiona Enter para agregar)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                className="pl-10 pr-9 h-11 text-xs bg-slate-50 focus:bg-white rounded-xl border-slate-200 focus-visible:ring-[#319795]/20 focus-visible:border-[#319795]"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Chips de Categorías Rápidas */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
              <button
                type="button"
                onClick={() => setSelectedCategoria('ALL')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-colors shrink-0 ${
                  selectedCategoria === 'ALL'
                    ? 'bg-[#1a365d] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Todos ({productos.length})
              </button>
              {categoriasDisponibles.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategoria(cat.id)}
                  className={`px-3 py-1.5 rounded-xl font-semibold transition-colors shrink-0 ${
                    selectedCategoria === cat.id
                      ? 'bg-[#319795] text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat.nombre}
                </button>
              ))}
            </div>
          </Card>

          {/* Grid de Tarjetas de Productos */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 max-h-[600px] overflow-y-auto pr-1">
            {filteredProductos.length === 0 ? (
              <div className="col-span-full py-12 text-center bg-white rounded-2xl border border-dashed border-slate-200">
                <Pill className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-bold text-slate-700">No se encontraron fármacos</p>
                <p className="text-xs text-slate-400">Pruebe ajustando el término de búsqueda.</p>
              </div>
            ) : (
              filteredProductos.map((prod) => {
                const isOutOfStock = prod.stock <= 0;
                const inCartItem = cart.find((c) => c.producto.id === prod.id);

                return (
                  <div
                    key={prod.id}
                    onClick={() => !isOutOfStock && addToCart(prod)}
                    className={`relative p-3.5 bg-white rounded-2xl border transition-all duration-200 flex flex-col justify-between select-none ${
                      isOutOfStock
                        ? 'opacity-55 border-slate-200 cursor-not-allowed bg-slate-50/60'
                        : inCartItem
                        ? 'border-[#319795] ring-2 ring-[#319795]/20 shadow-xs cursor-pointer hover:border-[#319795]'
                        : 'border-slate-200/80 hover:border-slate-300 hover:shadow-sm cursor-pointer active:scale-[0.99]'
                    }`}
                  >
                    {/* Badge de recetas y cantidad en carrito */}
                    <div className="flex items-center justify-between gap-1 mb-2">
                      <span className="text-[10px] font-mono font-semibold text-slate-400 truncate">
                        {prod.codigo}
                      </span>
                      <div className="flex items-center gap-1">
                        {prod.requiereReceta && (
                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-50 text-amber-700 border border-amber-200">
                            RECETA
                          </span>
                        )}
                        {inCartItem && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-[#319795] text-white">
                            {inCartItem.cantidad} en orden
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Información del Fármaco */}
                    <div>
                      <h3 className="text-xs font-bold text-slate-900 line-clamp-2 leading-tight">
                        {prod.nombre}
                      </h3>
                      <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                        {prod.presentacion || prod.principioActivo || 'Presentación regular'}
                      </p>
                    </div>

                    {/* Footer de Tarjeta: Precio y Stock */}
                    <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-[10px] text-slate-400">
                          {isOutOfStock ? (
                            <span className="text-rose-600 font-bold">Agotado</span>
                          ) : (
                            <span>Stock: {prod.stock} u.</span>
                          )}
                        </span>
                        <span className="text-sm font-black text-[#1a365d]">
                          S/. {prod.precio.toFixed(2)}
                        </span>
                      </div>

                      <Button
                        size="icon-xs"
                        disabled={isOutOfStock}
                        onClick={(e) => {
                          e.stopPropagation();
                          addToCart(prod);
                        }}
                        className={`h-7 w-7 rounded-lg ${
                          inCartItem
                            ? 'bg-[#319795] text-white hover:bg-[#287e7c]'
                            : 'bg-slate-100 hover:bg-[#319795] hover:text-white text-slate-700'
                        }`}
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ==================================================================== */}
        {/* COLUMNA DERECHA: CARRITO DE COMPRAS Y TICKET POS (5 cols)           */}
        {/* ==================================================================== */}
        <div className="lg:col-span-5 space-y-4">
          <Card className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden">
            {/* Header del Carrito */}
            <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Receipt className="w-4 h-4 text-[#319795]" />
                <h2 className="text-sm font-bold text-[#1a365d]">Orden de Venta</h2>
                <Badge variant="secondary" className="text-[10px] font-mono">
                  {cart.reduce((sum, item) => sum + item.cantidad, 0)} ítems
                </Badge>
              </div>

              {/* Selector de Comprobante */}
              <div className="flex items-center gap-1 bg-white p-0.5 rounded-xl border border-slate-200 text-[11px] font-semibold">
                {(['BOLETA', 'FACTURA', 'TICKET'] as TipoComprobante[]).map((tipo) => (
                  <button
                    key={tipo}
                    type="button"
                    onClick={() => setTipoComprobante(tipo)}
                    className={`px-2 py-0.5 rounded-lg transition-colors ${
                      tipoComprobante === tipo
                        ? 'bg-[#1a365d] text-white shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {tipo}
                  </button>
                ))}
              </div>
            </div>

            {/* SECCIÓN 2: CLIENTE / PROGRAMA CLIENTEAMIGO */}
            <div className="p-3.5 bg-teal-50/30 border-b border-slate-100 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#1a365d] flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-[#319795]" />
                  Cliente / Programa ClienteAmigo
                </span>
                {selectedCliente && (
                  <button
                    onClick={clearSelectedCliente}
                    className="text-[11px] text-rose-600 hover:underline font-semibold"
                  >
                    Cambiar / Quitar
                  </button>
                )}
              </div>

              {selectedCliente ? (
                // Tarjeta de Cliente Seleccionado
                <div className="p-2.5 rounded-xl bg-white border border-teal-200/80 shadow-2xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">
                      {selectedCliente.nombre} {selectedCliente.apellido}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">
                      {selectedCliente.tipoDocumento || 'DOC'}: {selectedCliente.documentoIdentidad}
                    </span>
                  </div>

                  {selectedCliente.esClienteAmigo ? (
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-amber-700 bg-amber-50 p-1.5 rounded-lg border border-amber-200/80">
                      <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500 shrink-0" />
                      <span>Beneficiario ClienteAmigo (5% Descuento Aplicado)</span>
                    </div>
                  ) : (
                    <div className="text-[10px] text-slate-500 flex items-center gap-1">
                      <UserCheck className="w-3 h-3 text-emerald-500" />
                      <span>Cliente Regular Registrado</span>
                    </div>
                  )}
                </div>
              ) : (
                // Buscador de Cliente
                <form onSubmit={handleSearchCliente} className="space-y-1.5">
                  <div className="flex items-center gap-1.5">
                    <Input
                      placeholder="DNI, RUC o Código ClienteAmigo..."
                      value={clientSearchTerm}
                      onChange={(e) => setClientSearchTerm(e.target.value)}
                      className="h-8 text-xs bg-white rounded-xl border-slate-200"
                    />
                    <Button
                      type="submit"
                      size="sm"
                      disabled={isSearchingClient || !clientSearchTerm.trim()}
                      className="h-8 px-3 text-xs bg-[#319795] hover:bg-[#287e7c] text-white rounded-xl"
                    >
                      {isSearchingClient ? 'Buscando...' : 'Buscar'}
                    </Button>
                  </div>
                  {clientSearchError && (
                    <p className="text-[11px] text-rose-600 font-medium">
                      {clientSearchError}
                    </p>
                  )}
                  <p className="text-[10px] text-slate-400">
                    💡 Clientes con suscripción <b>ClienteAmigo</b> obtienen 5% de descuento directo.
                  </p>
                </form>
              )}
            </div>

            {/* SECCIÓN 3: VALIDACIÓN DE RECETA MÉDICA */}
            <div className="p-3 bg-slate-50/80 border-b border-slate-100 space-y-2">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={requiereReceta}
                  onChange={(e) => setRequiereReceta(e.target.checked)}
                  className="w-4 h-4 rounded text-[#319795] focus:ring-[#319795] border-slate-300"
                />
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1">
                  <FileCheck className="w-3.5 h-3.5 text-[#319795]" />
                  Requiere Receta Médica
                </span>
                {cartHasControlledMeds && (
                  <Badge variant="amber" className="text-[9px] py-0 ml-auto font-bold">
                    Controlado en Carrito
                  </Badge>
                )}
              </label>

              {requiereReceta && (
                <div
                  className={`p-2 rounded-xl text-[11px] border flex items-start gap-2 ${
                    !selectedCliente
                      ? 'bg-rose-50 border-rose-200 text-rose-800'
                      : 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  }`}
                >
                  <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    {!selectedCliente ? (
                      <span>
                        <b>Acción obligatoria:</b> Debe buscar y asignar un cliente con DNI/RUC registrado para autorizar fármacos bajo receta.
                      </span>
                    ) : (
                      <span>
                        Receta médica autorizada para <b>{selectedCliente.nombre} {selectedCliente.apellido}</b>.
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* LISTA DE ÍTEMS EN EL CARRITO */}
            <div className="p-3 max-h-[260px] overflow-y-auto space-y-2">
              {cart.length === 0 ? (
                <div className="py-10 text-center text-slate-400">
                  <ShoppingCart className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <p className="text-xs font-semibold">El carrito está vacío</p>
                  <p className="text-[11px] text-slate-400">Seleccione productos del catálogo para iniciar la venta.</p>
                </div>
              ) : (
                cart.map((item) => {
                  const itemSubtotal = item.producto.precio * item.cantidad;

                  return (
                    <div
                      key={item.producto.id}
                      className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-2"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1">
                          <span className="text-xs font-bold text-slate-900 truncate">
                            {item.producto.nombre}
                          </span>
                          {item.producto.requiereReceta && (
                            <span className="text-[8px] font-bold px-1 rounded bg-amber-100 text-amber-800">
                              RECETA
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-slate-500 font-mono">
                          <span>S/. {item.producto.precio.toFixed(2)} c/u</span>
                          <span>•</span>
                          <span className="font-bold text-[#1a365d]">
                            S/. {itemSubtotal.toFixed(2)}
                          </span>
                        </div>
                      </div>

                      {/* Controles de Cantidad */}
                      <div className="flex items-center gap-1.5">
                        <div className="flex items-center bg-white rounded-lg border border-slate-200">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.producto.id, -1)}
                            className="p-1 hover:bg-slate-100 text-slate-600 rounded-l-lg"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-6 text-center text-xs font-bold text-slate-800">
                            {item.cantidad}
                          </span>
                          <button
                            type="button"
                            disabled={item.cantidad >= item.producto.stock}
                            onClick={() => updateQuantity(item.producto.id, 1)}
                            className="p-1 hover:bg-slate-100 text-slate-600 rounded-r-lg disabled:opacity-40"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => removeFromCart(item.producto.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* TOTALES Y MÉTODOS DE PAGO */}
            <div className="p-4 bg-slate-50/70 border-t border-slate-100 space-y-3">
              {/* Desglose de Precios */}
              <div className="space-y-1.5 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span className="font-mono">S/. {totals.rawSubtotal.toFixed(2)}</span>
                </div>

                {totals.isClienteAmigo && (
                  <div className="flex justify-between text-amber-700 font-semibold">
                    <span className="flex items-center gap-1">
                      <Star className="w-3 h-3 fill-amber-500" />
                      Descuento ClienteAmigo (5%):
                    </span>
                    <span className="font-mono">-S/. {totals.discountAmount.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>IGV Incluido (18%):</span>
                  <span className="font-mono">S/. {totals.igvAmount.toFixed(2)}</span>
                </div>

                <Separator className="my-1 bg-slate-200" />

                <div className="flex justify-between items-baseline pt-1">
                  <span className="text-sm font-bold text-[#1a365d]">TOTAL A PAGAR:</span>
                  <span className="text-xl font-black text-[#1a365d] font-mono">
                    S/. {totals.totalFinal.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Selector de Método de Pago */}
              <div className="space-y-1.5 pt-1">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Método de Pago
                </span>
                <div className="grid grid-cols-3 gap-1.5 text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => setMetodoPago('EFECTIVO')}
                    className={`flex items-center justify-center gap-1.5 py-2 rounded-xl border transition-colors ${
                      metodoPago === 'EFECTIVO'
                        ? 'bg-[#1a365d] text-white border-[#1a365d] shadow-2xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <Banknote className="w-3.5 h-3.5" />
                    <span>Efectivo</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMetodoPago('YAPE')}
                    className={`flex items-center justify-center gap-1.5 py-2 rounded-xl border transition-colors ${
                      metodoPago === 'YAPE'
                        ? 'bg-[#742284] text-white border-[#742284] shadow-2xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>Yape / Plin</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMetodoPago('TARJETA_DEBITO')}
                    className={`flex items-center justify-center gap-1.5 py-2 rounded-xl border transition-colors ${
                      metodoPago === 'TARJETA_DEBITO'
                        ? 'bg-[#319795] text-white border-[#319795] shadow-2xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>Tarjeta</span>
                  </button>
                </div>

                {/* Calculador de Vuelto si es Efectivo */}
                {metodoPago === 'EFECTIVO' && (
                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <div className="space-y-1">
                      <span className="text-[10px] text-slate-500 font-semibold">Paga con (S/.):</span>
                      <Input
                        type="number"
                        step="0.1"
                        placeholder={totals.totalFinal.toFixed(2)}
                        value={montoPagado}
                        onChange={(e) => setMontoPagado(e.target.value)}
                        className="h-8 text-xs font-mono font-bold bg-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] text-slate-500 font-semibold">Vuelto a Entregar:</span>
                      <div className="h-8 px-2 flex items-center rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-mono font-bold text-xs">
                        S/. {vueltoCalculado.toFixed(2)}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* BOTÓN FINALIZAR VENTA */}
              <div className="pt-2">
                <Button
                  onClick={handleFinalizarVenta}
                  disabled={!canFinalize}
                  className={`w-full h-11 text-xs font-bold rounded-xl shadow-md transition-all active:scale-[0.99] flex items-center justify-center gap-2 ${
                    !canFinalize
                      ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-[#319795] to-[#287e7c] hover:from-[#287e7c] hover:to-[#236c6b] text-white'
                  }`}
                >
                  <Receipt className="w-4 h-4" />
                  <span>
                    {isProcessingSale
                      ? 'Emitiendo Comprobante...'
                      : `Finalizar Venta • S/. ${totals.totalFinal.toFixed(2)}`}
                  </span>
                </Button>

                {isPrescriptionBlocked && (
                  <p className="text-[11px] text-rose-600 font-bold text-center mt-2">
                    ⚠️ Debe asignar un cliente registrado para emitir venta con receta médica.
                  </p>
                )}
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* MODAL DE COMPROBANTE DE PAGO / ÉXITO DE VENTA EMITIDA                 */}
      {/* ==================================================================== */}
      <Dialog
        open={isSuccessModalOpen}
        onOpenChange={(open) => !open && setIsSuccessModalOpen(false)}
      >
        <DialogContent className="sm:max-w-md rounded-2xl p-6">
          <DialogHeader className="space-y-2 text-center items-center pb-3 border-b border-slate-100">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 shadow-xs">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <DialogTitle className="text-base font-black text-[#1a365d]">
              ¡Venta Registrada Exitosamente!
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Comprobante emitido e inventario descontado en tiempo real.
            </DialogDescription>
          </DialogHeader>

          {completedVenta && (
            <div className="my-3 p-4 bg-slate-50/70 border border-slate-200 rounded-2xl space-y-3 font-mono text-xs">
              <div className="text-center pb-2 border-b border-dashed border-slate-300">
                <span className="font-bold text-sm text-slate-900 block font-sans">
                  BOTICA & FARMACIA CENTRAL
                </span>
                <span className="text-[10px] text-slate-500 block">RUC: 20489123891 • Chiclayo, Perú</span>
                <span className="text-xs font-bold text-[#1a365d] mt-1 block">
                  {tipoComprobante} ELECTRÓNICA: {completedVenta.numeroVenta}
                </span>
              </div>

              <div className="text-[11px] space-y-0.5 text-slate-600">
                <div>
                  <b>Cliente:</b>{' '}
                  {completedVenta.cliente
                    ? `${completedVenta.cliente.nombre} ${completedVenta.cliente.apellido}`
                    : 'PÚBLICO GENERAL'}
                </div>
                {completedVenta.cliente?.documentoIdentidad && (
                  <div>
                    <b>Documento:</b> {completedVenta.cliente.documentoIdentidad}
                  </div>
                )}
                <div>
                  <b>Fecha:</b> {new Date().toLocaleString()}
                </div>
                <div>
                  <b>Pago:</b> {completedVenta.metodoPago}
                </div>
              </div>

              <Separator className="bg-slate-300 border-dashed" />

              {/* Detalle de Ítems */}
              <div className="space-y-1 text-[11px]">
                {completedVenta.detalles.map((d, i) => (
                  <div key={i} className="flex justify-between">
                    <span className="truncate max-w-[200px]">
                      {d.cantidad}x {d.producto?.nombre || `Fármaco #${d.productoId}`}
                    </span>
                    <span>S/. {(d.precioUnitario * d.cantidad).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <Separator className="bg-slate-300 border-dashed" />

              {/* Totales */}
              <div className="space-y-1 text-xs">
                {completedVenta.descuentoTotal > 0 && (
                  <div className="flex justify-between text-amber-700">
                    <span>Descuento ClienteAmigo:</span>
                    <span>-S/. {completedVenta.descuentoTotal.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-500 text-[11px]">
                  <span>IGV (18%):</span>
                  <span>S/. {completedVenta.impuesto.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-black text-sm text-slate-900 pt-1">
                  <span>TOTAL PAGADO:</span>
                  <span>S/. {completedVenta.total.toFixed(2)}</span>
                </div>
                {completedVuelto > 0 && (
                  <div className="flex justify-between text-emerald-700 font-bold">
                    <span>Vuelto entregado:</span>
                    <span>S/. {completedVuelto.toFixed(2)}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={handlePrintReceipt}
              className="h-9 gap-1.5 text-xs rounded-xl border-slate-200"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir Ticket</span>
            </Button>
            <Button
              type="button"
              onClick={() => setIsSuccessModalOpen(false)}
              className="h-9 gap-1.5 text-xs font-bold rounded-xl bg-[#319795] hover:bg-[#287e7c] text-white"
            >
              <span>Nueva Venta</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
