'use client';

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { AxiosError } from 'axios';
import {
  ShoppingCart,
  Search,
  Barcode,
  Pill,
  Plus,
  Minus,
  Trash2,
  Star,
  Loader2,
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
  CreateVentaDTO,
  CreateDetalleVentaDTO,
  DocumentoConsulta,
  MetodoPago,
  TipoComprobante,
  Venta,
} from '@/types';
import { getProductos } from '@/services/productoService';
import { postVenta } from '@/services/ventaService';
import { documentoCumpleComprobante } from '@/lib/documentoIdentidad';
import { calcularTotalesVenta, precioConIgv, redondear, tasaDescuentoAmigo } from '@/lib/ventaTotales';
import { ComprobanteClientePanel } from './components/ComprobanteClientePanel';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { AppDrawer } from '@/components/common/AppDrawer';

// Ítem dentro del carrito de compras
interface CartItem {
  producto: Producto;
  cantidad: number;
}

const ETIQUETA_BOTON: Record<TipoComprobante, string> = {
  BOLETA: 'Boleta',
  FACTURA: 'Factura',
  TICKET: 'Ticket',
};

const TITULO_COMPROBANTE: Record<TipoComprobante, string> = {
  BOLETA: 'BOLETA DE VENTA ELECTRÓNICA',
  FACTURA: 'FACTURA ELECTRÓNICA',
  TICKET: 'TICKET DE VENTA',
};

// Los nombres vienen de RENIEC/SUNAT y se escriben en el iframe de impresión
const escapeHtml = (texto: string): string =>
  texto.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

export default function PosPage() {
  // Catálogo y Búsqueda
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loadingProds, setLoadingProds] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoria, setSelectedCategoria] = useState<string>('ALL');

  // Carrito de compras
  const [cart, setCart] = useState<CartItem[]>([]);

  // Cliente (DNI para boleta, RUC para factura) y Programa ClienteAmigo
  const [cliente, setCliente] = useState<DocumentoConsulta | null>(null);

  // Validación de Receta Médica
  const [requiereReceta, setRequiereReceta] = useState(false);

  // Parámetros de Pago y Comprobante
  const [tipoComprobante, setTipoComprobante] = useState<TipoComprobante>('BOLETA');
  const [metodoPago, setMetodoPago] = useState<MetodoPago>('EFECTIVO');
  const [montoPagado, setMontoPagado] = useState<string>('');

  // Proceso de Finalización de Venta
  const [isProcessingSale, setIsProcessingSale] = useState(false);
  const [saleError, setSaleError] = useState<string | null>(null);
  const [completedVenta, setCompletedVenta] = useState<Venta | null>(null);
  // Copia del cliente y comprobante al momento de emitir (para el ticket impreso)
  const [completedCliente, setCompletedCliente] = useState<DocumentoConsulta | null>(null);
  const [completedTipo, setCompletedTipo] = useState<TipoComprobante>('BOLETA');
  const [completedVuelto, setCompletedVuelto] = useState<number>(0);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);

  // Cargar catálogo de productos real al montar
  useEffect(() => {
    const load = async () => {
      setLoadingProds(true);
      try {
        const data = await getProductos();
        setProductos(Array.isArray(data) ? data : []);
      } catch {
        setProductos([]);
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

  // 2. Cliente: cualquier cambio de cliente o comprobante descarta el último error de venta
  const handleClienteChange = useCallback((nuevo: DocumentoConsulta | null) => {
    setCliente(nuevo);
    setSaleError(null);
  }, []);

  const handleTipoComprobanteChange = (tipo: TipoComprobante) => {
    setTipoComprobante(tipo);
    setSaleError(null);
  };

  // Cálculos Financieros del Carrito: mismo cálculo que el backend (precio sin IGV + 18%)
  const totals = useMemo(() => {
    const isClienteAmigo = cliente?.esClienteAmigo === true;
    const t = calcularTotalesVenta(
      cart.map((item) => ({ precio: item.producto.precio, cantidad: item.cantidad })),
      isClienteAmigo ? tasaDescuentoAmigo(cliente?.porcentajeDescuento) : 0
    );

    return {
      rawSubtotal: t.subtotal,
      isClienteAmigo,
      discountRate: t.tasaDescuento,
      discountAmount: t.descuento,
      baseImponible: t.base,
      igvAmount: t.igv,
      totalFinal: t.total,
    };
  }, [cart, cliente]);

  // Cálculo de vuelto para pago en efectivo
  const vueltoCalculado = useMemo(() => {
    if (metodoPago !== 'EFECTIVO' || !montoPagado) return 0;
    const pago = parseFloat(montoPagado);
    if (isNaN(pago) || pago < totals.totalFinal) return 0;
    return redondear(pago - totals.totalFinal);
  }, [metodoPago, montoPagado, totals.totalFinal]);

  // Validación para permitir venta: boleta exige DNI, factura exige RUC y la receta exige cliente
  const isPrescriptionBlocked = requiereReceta && !cliente;
  const isCartEmpty = cart.length === 0;
  const documentoOk =
    tipoComprobante === 'TICKET' ||
    (!!cliente && documentoCumpleComprobante(tipoComprobante, cliente.numeroDocumento));
  const pagoInsuficiente =
    metodoPago === 'EFECTIVO' && montoPagado !== '' && parseFloat(montoPagado) < totals.totalFinal;

  const pendientes: string[] = [];
  if (isCartEmpty) pendientes.push('Agregue al menos un producto');
  if (!documentoOk) pendientes.push(tipoComprobante === 'FACTURA' ? 'Ingrese el RUC del cliente' : 'Ingrese el DNI del cliente');
  if (isPrescriptionBlocked && documentoOk) pendientes.push('Asigne un cliente para la receta médica');
  if (pagoInsuficiente) pendientes.push('El monto recibido no cubre el total');

  const canFinalize = pendientes.length === 0 && !isProcessingSale;

  // 4. Finalizar Venta: Formatear JSON y enviar a postVenta()
  const handleFinalizarVenta = async () => {
    if (!canFinalize) return;

    setIsProcessingSale(true);
    setSaleError(null);

    try {
      const payload: CreateVentaDTO = {
        clienteId: cliente?.clienteId,
        numeroDocumento: cliente?.numeroDocumento,
        numeroClienteAmigo: cliente?.codigoClienteAmigo,
        requiereReceta: Boolean(requiereReceta || cartHasControlledMeds),
        usuarioId: 1, // ID del cajero/usuario actual
        metodoPago,
        tipoComprobante,
        items: cart.map((item) => ({
          productoId: item.producto.id,
          cantidad: item.cantidad,
        })),
        detalles: cart.map(
          (item): CreateDetalleVentaDTO => ({
            productoId: item.producto.id,
            cantidad: item.cantidad,
            precioUnitario: item.producto.precio,
            descuento: redondear(item.producto.precio * item.cantidad * totals.discountRate),
          })
        ),
        observaciones: (requiereReceta || cartHasControlledMeds)
          ? `Dispensación bajo receta médica verificada para ${cliente?.nombreCompleto || 'Cliente'}`
          : undefined,
      };

      const resultVenta = await postVenta(payload);
      if (metodoPago) resultVenta.metodoPago = metodoPago;
      if (tipoComprobante) resultVenta.tipoComprobante = tipoComprobante;

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
      setCompletedCliente(cliente);
      setCompletedTipo(tipoComprobante);
      setCompletedVuelto(vueltoCalculado);
      setIsSuccessModalOpen(true);

      // Limpiar carrito, monto y cliente para la siguiente venta
      setCart([]);
      setMontoPagado('');
      setCliente(null);
    } catch (error) {
      // Sin comprobante simulado: si el backend rechaza la venta, el cajero debe ver el motivo real
      const err = error as AxiosError<{ message?: string }>;
      setSaleError(
        err.response?.data?.message ||
          (err.response
            ? 'No se pudo emitir el comprobante. Inténtelo nuevamente.'
            : 'No hay conexión con el servidor. La venta no se registró.')
      );
    } finally {
      setIsProcessingSale(false);
    }
  };

  const handlePrintReceipt = () => {
    if (!completedVenta) return;

    const clienteName = escapeHtml(completedCliente?.nombreCompleto || completedVenta.clienteNombre || 'PÚBLICO GENERAL');
    const clienteDocRaw = completedCliente?.numeroDocumento || completedVenta.clienteDocumento || '';
    const clienteDoc = clienteDocRaw === '00000000' ? '' : escapeHtml(clienteDocRaw);
    const clienteDocLabel = completedCliente?.tipoDocumento || (clienteDocRaw.length === 11 ? 'RUC' : 'DNI');
    const clienteDir = completedTipo === 'FACTURA' && completedCliente?.direccion ? escapeHtml(completedCliente.direccion) : '';
    const tituloComprobante = TITULO_COMPROBANTE[completedTipo];
    const numComprobante = completedVenta.codigoComprobante || completedVenta.numeroVenta || `VTA-${completedVenta.id}`;
    const metodo = completedVenta.metodoPago || 'EFECTIVO';
    const fechaHora = new Date().toLocaleString('es-PE');

    const itemsHtml = (completedVenta.detalles || []).map((d: any) => {
      const cant = d.cantidad || 1;
      const nombre = escapeHtml(d.productoNombre || d.producto?.nombre || `Fármaco #${d.productoId}`);
      const precioUnit = Number(d.precioUnitario || 0).toFixed(2);
      const sub = Number(d.subtotal ?? d.subtotalItem ?? (d.precioUnitario * d.cantidad || 0)).toFixed(2);
      return `
        <div style="display: flex; justify-content: space-between; font-size: 11px; margin-bottom: 3px;">
          <span style="max-width: 65%; word-break: break-word;">${cant}x ${nombre} <span style="font-size: 9px; color: #555;">(S/. ${precioUnit})</span></span>
          <span style="font-weight: 700; white-space: nowrap;">S/. ${sub}</span>
        </div>
      `;
    }).join('');

    const descTotal = Number(completedVenta.descuentoTotal || 0);
    const igvCalc = Number(completedVenta.impuesto ?? completedVenta.igv ?? 0);
    const subtotalCalc = Number(completedVenta.subtotal || (completedVenta.total - igvCalc + descTotal));
    const opGravadaCalc = redondear(subtotalCalc - descTotal);
    const totalCalc = Number(completedVenta.total || 0);
    const vueltoCalc = Number(completedVuelto || 0);

    const printHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Ticket - ${numComprobante}</title>
          <style>
            @page {
              size: 80mm auto;
              margin: 0;
            }
            * {
              box-sizing: border-box;
              margin: 0;
              padding: 0;
            }
            body {
              font-family: 'Courier New', Courier, monospace, system-ui, sans-serif;
              width: 76mm;
              max-width: 80mm;
              margin: 0 auto;
              padding: 8px 6px;
              color: #000;
              background: #fff;
              font-size: 11px;
              line-height: 1.3;
            }
            .text-center { text-align: center; }
            .divider {
              border-bottom: 1px dashed #000;
              margin: 6px 0;
            }
            .header h1 {
              font-size: 13px;
              font-weight: 900;
              letter-spacing: 0.5px;
            }
            .header p {
              font-size: 10px;
              color: #222;
            }
            .ticket-title {
              font-size: 12px;
              font-weight: 800;
              margin: 4px 0 2px;
            }
            .info-table {
              width: 100%;
              font-size: 10.5px;
              margin: 4px 0;
            }
            .info-table td {
              vertical-align: top;
              padding: 1px 0;
            }
            .totals-row {
              display: flex;
              justify-content: space-between;
              font-size: 11px;
              margin-bottom: 2px;
            }
            .grand-total {
              font-size: 13px;
              font-weight: 900;
              border-top: 1px dashed #000;
              padding-top: 4px;
              margin-top: 4px;
            }
            .footer {
              text-align: center;
              font-size: 9.5px;
              color: #333;
              margin-top: 8px;
              padding-top: 4px;
            }
          </style>
        </head>
        <body>
          <div class="header text-center">
            <h1>BOTICA & FARMACIA CENTRAL</h1>
            <p>RUC: 20489123891</p>
            <p>Av. Balta 1045 - Chiclayo, Lambayeque</p>
            <p>Tel: (074) 234567 • Cel: 974839201</p>
            <div class="divider"></div>
            <div class="ticket-title">${tituloComprobante}</div>
            <div style="font-weight: bold; font-size: 12px;">${numComprobante}</div>
          </div>

          <div class="divider"></div>

          <table class="info-table">
            <tr>
              <td style="width: 70px; font-weight: bold;">Fecha:</td>
              <td>${fechaHora}</td>
            </tr>
            <tr>
              <td style="font-weight: bold;">${clienteDocLabel === 'RUC' ? 'Razón Soc.:' : 'Cliente:'}</td>
              <td>${clienteName}</td>
            </tr>
            ${clienteDoc ? `<tr><td style="font-weight: bold;">${clienteDocLabel}:</td><td>${clienteDoc}</td></tr>` : ''}
            ${clienteDir ? `<tr><td style="font-weight: bold;">Dirección:</td><td>${clienteDir}</td></tr>` : ''}
            <tr>
              <td style="font-weight: bold;">Med. Pago:</td>
              <td>${metodo}</td>
            </tr>
            <tr>
              <td style="font-weight: bold;">Caja:</td>
              <td>Caja 01 - Principal</td>
            </tr>
          </table>

          <div class="divider"></div>

          <div style="font-weight: bold; font-size: 10px; margin-bottom: 4px; display: flex; justify-content: space-between;">
            <span>DESCRIPCIÓN / CANT.</span>
            <span>TOTAL</span>
          </div>

          <div style="margin: 4px 0;">
            ${itemsHtml}
          </div>

          <div class="divider"></div>

          <div>
            ${descTotal > 0 ? `
              <div class="totals-row">
                <span>Subtotal:</span>
                <span>S/. ${subtotalCalc.toFixed(2)}</span>
              </div>
              <div class="totals-row" style="font-weight: 600;">
                <span>Descuento ClienteAmigo:</span>
                <span>-S/. ${descTotal.toFixed(2)}</span>
              </div>
            ` : ''}
            <div class="totals-row">
              <span>Op. Gravada:</span>
              <span>S/. ${opGravadaCalc.toFixed(2)}</span>
            </div>
            <div class="totals-row">
              <span>IGV (18%):</span>
              <span>S/. ${igvCalc.toFixed(2)}</span>
            </div>
            <div class="totals-row grand-total">
              <span>TOTAL PAGADO:</span>
              <span>S/. ${totalCalc.toFixed(2)}</span>
            </div>
            ${vueltoCalc > 0 ? `
              <div class="totals-row" style="font-weight: bold; margin-top: 3px;">
                <span>Vuelto:</span>
                <span>S/. ${vueltoCalc.toFixed(2)}</span>
              </div>
            ` : ''}
          </div>

          <div class="divider"></div>

          <div class="footer text-center">
            <p style="font-weight: bold;">¡GRACIAS POR SU PREFERENCIA!</p>
            <p>Conserve este ticket ante cualquier reclamo.</p>
            <p style="font-size: 8.5px; margin-top: 3px;">Representación impresa de Comprobante Electrónico</p>
          </div>
        </body>
      </html>
    `;

    let iframe = document.getElementById('pos-thermal-print-frame') as HTMLIFrameElement;
    if (!iframe) {
      iframe = document.createElement('iframe');
      iframe.id = 'pos-thermal-print-frame';
      iframe.style.position = 'fixed';
      iframe.style.right = '0';
      iframe.style.bottom = '0';
      iframe.style.width = '0';
      iframe.style.height = '0';
      iframe.style.border = '0';
      document.body.appendChild(iframe);
    }

    const doc = iframe.contentWindow?.document || iframe.contentDocument;
    if (doc) {
      doc.open();
      doc.write(printHtml);
      doc.close();
      setTimeout(() => {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      }, 250);
    } else {
      window.print();
    }
  };

  return (
    <div className="space-y-4 pb-12">
      {/* Encabezado POS */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-[#319795] font-semibold text-sm">
            <ShoppingCart className="w-4 h-4" />
            <span>Terminal Punto de Venta (POS)</span>
            <Badge variant="teal" className="text-[10px] font-bold ml-2">
              Caja 01 - Turno Abierto
            </Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1a365d] mt-1">
            Caja Registradora
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            Emisión de boletas, facturas y dispensación rápida de fármacos.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1.5 text-xs font-semibold px-3 py-2 bg-slate-100/90 rounded-xl text-slate-700 border border-slate-200">
            <Barcode className="w-3.5 h-3.5 text-[#319795]" />
            <span>Escáner Activo</span>
          </div>
          {cart.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearCart}
              className="h-8 sm:h-9 gap-1.5 text-xs text-rose-600 border-rose-200 hover:bg-rose-50 rounded-xl cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Vaciar Orden</span>
            </Button>
          )}
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
                <p className="text-sm font-bold text-slate-700">
                  {searchTerm || selectedCategoria !== 'ALL' ? 'No se encontraron fármacos' : 'Sin datos'}
                </p>
                <p className="text-xs text-slate-400">
                  {searchTerm || selectedCategoria !== 'ALL'
                    ? 'Pruebe ajustando el término de búsqueda o categoría.'
                    : 'No hay fármacos disponibles en inventario para venta.'}
                </p>
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
                        <span className="text-sm font-black text-[#1a365d]" title="Precio final con IGV">
                          S/. {precioConIgv(prod.precio).toFixed(2)}
                        </span>
                        <span className="text-[9.5px] text-slate-400 font-mono">
                          {prod.precio.toFixed(2)} + IGV
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
            </div>

            {/* SECCIÓN 2: COMPROBANTE Y CLIENTE (DNI → boleta, RUC → factura) */}
            <ComprobanteClientePanel
              tipoComprobante={tipoComprobante}
              onTipoComprobanteChange={handleTipoComprobanteChange}
              cliente={cliente}
              onClienteChange={handleClienteChange}
            />

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
                    !cliente
                      ? 'bg-rose-50 border-rose-200 text-rose-800'
                      : 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  }`}
                >
                  <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    {!cliente ? (
                      <span>
                        <b>Acción obligatoria:</b> Ingrese el DNI o RUC del paciente para autorizar fármacos bajo receta.
                      </span>
                    ) : (
                      <span>
                        Receta médica autorizada para <b>{cliente.nombreCompleto}</b>.
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
                  const itemSubtotal = redondear(item.producto.precio * item.cantidad);

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
                          <span>S/. {item.producto.precio.toFixed(2)} c/u sin IGV</span>
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
                  <span>Subtotal (sin IGV):</span>
                  <span className="font-mono">S/. {totals.rawSubtotal.toFixed(2)}</span>
                </div>

                {totals.isClienteAmigo && (
                  <>
                    <div className="flex justify-between text-amber-700 font-semibold">
                      <span className="flex items-center gap-1">
                        <Star className="w-3 h-3 fill-amber-500" />
                        Descuento ClienteAmigo ({Math.round(totals.discountRate * 100)}%):
                      </span>
                      <span className="font-mono">-S/. {totals.discountAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Op. gravada:</span>
                      <span className="font-mono">S/. {totals.baseImponible.toFixed(2)}</span>
                    </div>
                  </>
                )}

                <div className="flex justify-between">
                  <span>IGV (18%):</span>
                  <span className="font-mono">+S/. {totals.igvAmount.toFixed(2)}</span>
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
              <div className="pt-2 space-y-2">
                {saleError && (
                  <div
                    role="alert"
                    className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-[11px] text-rose-800 flex items-start gap-2"
                  >
                    <AlertCircle className="w-4 h-4 shrink-0 mt-px" />
                    <div className="flex-1">
                      <b className="block">La venta no se registró</b>
                      <span>{saleError}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSaleError(null)}
                      aria-label="Cerrar aviso"
                      className="text-rose-400 hover:text-rose-700 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                <Button
                  onClick={handleFinalizarVenta}
                  disabled={!canFinalize}
                  className={`w-full h-11 text-xs font-bold rounded-xl shadow-md transition-all active:scale-[0.99] flex items-center justify-center gap-2 ${
                    !canFinalize
                      ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-[#319795] to-[#287e7c] hover:from-[#287e7c] hover:to-[#236c6b] text-white'
                  }`}
                >
                  {isProcessingSale ? <Loader2 className="w-4 h-4 animate-spin" /> : <Receipt className="w-4 h-4" />}
                  <span>
                    {isProcessingSale
                      ? 'Emitiendo comprobante...'
                      : `Emitir ${ETIQUETA_BOTON[tipoComprobante]} • S/. ${totals.totalFinal.toFixed(2)}`}
                  </span>
                </Button>

                {pendientes.length > 0 && !isCartEmpty && (
                  <ul className="space-y-0.5" aria-live="polite">
                    {pendientes.map((p) => (
                      <li key={p} className="text-[11px] text-slate-500 flex items-center gap-1.5 justify-center">
                        <Info className="w-3 h-3 text-amber-500 shrink-0" />
                        {p}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* DRAWER DE COMPROBANTE DE PAGO / ÉXITO DE VENTA EMITIDA               */}
      {/* ==================================================================== */}
      <AppDrawer
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
        title="¡Venta Registrada Exitosamente!"
        description="Comprobante emitido e inventario descontado en tiempo real."
        icon={CheckCircle2}
        maxWidth="max-w-md"
        cancelText="Cerrar"
        footer={
          <>
            <Button
              type="button"
              variant="outline"
              onClick={handlePrintReceipt}
              className="h-9 gap-1.5 text-xs rounded-xl border-slate-200 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir Ticket</span>
            </Button>
            <Button
              type="button"
              onClick={() => setIsSuccessModalOpen(false)}
              className="h-9 gap-1.5 text-xs font-bold rounded-xl bg-[#319795] hover:bg-[#287e7c] text-white shadow-xs cursor-pointer active:scale-[0.98] transition-transform"
            >
              <span>Nueva Venta</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </>
        }
      >
        {completedVenta && (
          <div
            id="pos-ticket-imprimible"
            className="p-4 bg-white border border-slate-200 rounded-2xl space-y-3 font-mono text-xs shadow-xs text-slate-800"
          >
            <div className="text-center pb-2 border-b border-dashed border-slate-300">
              <span className="font-bold text-sm text-slate-900 block font-sans">
                BOTICA & FARMACIA CENTRAL
              </span>
              <span className="text-[10px] text-slate-500 block">RUC: 20489123891 • Chiclayo, Perú</span>
              <span className="text-xs font-bold text-[#1a365d] mt-1 block">
                {TITULO_COMPROBANTE[completedTipo]}
              </span>
              <span className="text-xs font-bold text-slate-900 block">
                {completedVenta.codigoComprobante || completedVenta.numeroVenta || `VTA-${completedVenta.id}`}
              </span>
            </div>

            <div className="text-[11px] space-y-0.5 text-slate-600">
              <div>
                <b>{completedCliente?.tipoDocumento === 'RUC' ? 'Razón social:' : 'Cliente:'}</b>{' '}
                {completedCliente?.nombreCompleto || completedVenta.clienteNombre || 'PÚBLICO GENERAL'}
              </div>
              {completedCliente && (
                <div>
                  <b>{completedCliente.tipoDocumento}:</b> {completedCliente.numeroDocumento}
                </div>
              )}
              {completedTipo === 'FACTURA' && completedCliente?.direccion && (
                <div>
                  <b>Dirección:</b> {completedCliente.direccion}
                </div>
              )}
              <div>
                <b>Fecha:</b> {new Date().toLocaleString('es-PE')}
              </div>
              <div>
                <b>Pago:</b> {completedVenta.metodoPago || 'EFECTIVO'}
              </div>
            </div>

            <Separator className="bg-slate-300 border-dashed" />

            {/* Detalle de Ítems */}
            <div className="space-y-1 text-[11px]">
              {(completedVenta.detalles || []).map((d: any, i: number) => (
                <div key={i} className="flex justify-between">
                  <span className="truncate max-w-[200px]">
                    {d.cantidad}x {d.productoNombre || d.producto?.nombre || `Fármaco #${d.productoId}`}
                  </span>
                  <span>
                    S/. {Number(d.subtotal ?? d.subtotalItem ?? (d.precioUnitario * d.cantidad || 0)).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <Separator className="bg-slate-300 border-dashed" />

            {/* Totales */}
            <div className="space-y-1 text-xs">
              {Number(completedVenta.descuentoTotal || 0) > 0 && (
                <div className="flex justify-between text-amber-700">
                  <span>Descuento ClienteAmigo:</span>
                  <span>-S/. {Number(completedVenta.descuentoTotal || 0).toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-500 text-[11px]">
                <span>Op. gravada:</span>
                <span>
                  S/. {redondear(Number(completedVenta.subtotal || 0) - Number(completedVenta.descuentoTotal || 0)).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-slate-500 text-[11px]">
                <span>IGV (18%):</span>
                <span>S/. {Number(completedVenta.impuesto ?? completedVenta.igv ?? 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-black text-sm text-slate-900 pt-1">
                <span>TOTAL PAGADO:</span>
                <span>S/. {Number(completedVenta.total || 0).toFixed(2)}</span>
              </div>
              {Number(completedVuelto || 0) > 0 && (
                <div className="flex justify-between text-emerald-700 font-bold">
                  <span>Vuelto entregado:</span>
                  <span>S/. {Number(completedVuelto || 0).toFixed(2)}</span>
                </div>
              )}
            </div>

            <Separator className="bg-slate-300 border-dashed" />

            <div className="text-center text-[10px] text-slate-500 pt-0.5 space-y-0.5 font-sans">
              <p className="font-bold text-slate-700">¡GRACIAS POR SU PREFERENCIA!</p>
              <p className="text-[9px] text-slate-400">Conserve este comprobante para cualquier cambio o reclamo.</p>
            </div>
          </div>
        )}
      </AppDrawer>
    </div>
  );
}
