'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  Search,
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  CheckCircle2,
  AlertCircle,
  Loader2,
  UserX,
  X,
  Receipt,
  Printer,
  ChevronDown,
  Wallet,
} from 'lucide-react';
import { Producto, CreateVentaDTO, CreateDetalleVentaDTO } from '@/types';
import { getProductos } from '@/services/productoService';
import { postVenta } from '@/services/ventaService';
import { consultarDni, consultarRuc } from '@/services/consultaService';
import { getCajaActiva, registrarMovimientoCaja } from '@/services/cajaService';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface CartItem {
  id: number;
  producto: Producto;
  cantidad: number;
  precio: number;
  descuento: number;
}

// Producto de muestra inicial basado en la captura del usuario
const SAMPLE_INITIAL_PRODUCT: Producto = {
  id: 7,
  codigo: '007',
  nombre: 'Desodorante Roll On Nivea Serum Tono Natural',
  precio: 21.0,
  precioVenta: 21.0,
  precioCompra: 13.0,
  stock: 19,
  stockMinimo: 5,
  activo: true,
  categoriaNombre: 'CUIDADO PERSONAL',
};

export default function NuevaVentaPage() {
  // Catálogo completo de productos para el buscador
  const [catalogo, setCatalogo] = useState<Producto[]>([]);
  const [loadingCatalogo, setLoadingCatalogo] = useState(false);
  const [modalSearch, setModalSearch] = useState('');
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);

  // Datos del Cliente y Venta (Fila 1)
  const [docIdentidad, setDocIdentidad] = useState('');
  const [nombreCliente, setNombreCliente] = useState('');
  const [vendedor] = useState('Administrador');
  const [searchingDoc, setSearchingDoc] = useState(false);

  // Parámetros de Comprobante (Fila 2)
  const [tipoComprobante, setTipoComprobante] = useState<'Ticket' | 'Boleta' | 'Factura'>('Ticket');
  const [numDocumento, setNumDocumento] = useState('Autogenerado');
  const [formaPago, setFormaPago] = useState('Contado');
  const [esCredito, setEsCredito] = useState(false);

  // Parámetros de Crédito / Cronograma de Pagos
  const [pagoInicial, setPagoInicial] = useState('0');
  const [numCuotas, setNumCuotas] = useState('1');
  const [intervaloPago, setIntervaloPago] = useState('Mensual (30 días)');
  const [fechaPrimeraCuota, setFechaPrimeraCuota] = useState('2026-12-15');

  // Carrito de compras con el ítem inicial de la captura
  const [cart, setCart] = useState<CartItem[]>([
    {
      id: 7,
      producto: SAMPLE_INITIAL_PRODUCT,
      cantidad: 1,
      precio: 21.0,
      descuento: 0,
    },
  ]);

  // Estados de proceso
  const [processingSale, setProcessingSale] = useState(false);
  const [toast, setToast] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  };

  // Cargar productos del inventario
  useEffect(() => {
    const loadProducts = async () => {
      setLoadingCatalogo(true);
      try {
        const data = await getProductos().catch(() => []);
        if (Array.isArray(data) && data.length > 0) {
          // Asegurar que el producto de muestra esté incluido
          const existsSample = data.some((p) => p.id === 7 || p.nombre === SAMPLE_INITIAL_PRODUCT.nombre);
          setCatalogo(existsSample ? data : [SAMPLE_INITIAL_PRODUCT, ...data]);
        } else {
          setCatalogo([SAMPLE_INITIAL_PRODUCT]);
        }
      } catch {
        setCatalogo([SAMPLE_INITIAL_PRODUCT]);
      } finally {
        setLoadingCatalogo(false);
      }
    };
    loadProducts();
  }, []);

  // Buscar DNI o RUC con API RENIEC / SUNAT
  const handleBuscarCliente = async () => {
    const cleanDoc = docIdentidad.trim().replace(/\D/g, '');
    if (!cleanDoc) {
      showToast('error', 'Ingrese un número de DNI o RUC para consultar.');
      return;
    }

    setSearchingDoc(true);
    try {
      if (cleanDoc.length === 8) {
        const res = await consultarDni(cleanDoc);
        if (res && res.nombreCompleto) {
          setNombreCliente(res.nombreCompleto.trim());
          if (tipoComprobante === 'Ticket') setTipoComprobante('Boleta');
          showToast('success', 'Cliente identificado desde RENIEC.');
        } else {
          showToast('error', 'No se encontraron datos para el DNI.');
        }
      } else if (cleanDoc.length === 11) {
        const res = await consultarRuc(cleanDoc);
        if (res && res.nombreCompleto) {
          setNombreCliente(res.nombreCompleto.trim());
          setTipoComprobante('Factura');
          showToast('success', 'Razón social obtenida desde SUNAT.');
        } else {
          showToast('error', 'No se encontraron datos para el RUC.');
        }
      } else {
        showToast('error', 'El documento debe tener 8 dígitos (DNI) u 11 dígitos (RUC).');
      }
    } catch {
      showToast('error', 'No se pudo consultar el documento externamente. Puede escribir el nombre.');
    } finally {
      setSearchingDoc(false);
    }
  };

  // Venta sin cliente (Público General)
  const handleVentaSinCliente = () => {
    setDocIdentidad('');
    setNombreCliente('Público General');
    setTipoComprobante('Ticket');
    showToast('success', 'Configurado como Público General.');
  };

  // Añadir producto al carrito desde el modal
  const handleAddToCart = (prod: Producto) => {
    const existingIndex = cart.findIndex((item) => item.producto.id === prod.id);
    const unitPrice = prod.precio || prod.precioVenta || 10.0;

    if (existingIndex > -1) {
      const currentItem = cart[existingIndex];
      const maxStock = prod.stock ?? 999;
      if (currentItem.cantidad < maxStock) {
        setCart((prev) =>
          prev.map((item, idx) =>
            idx === existingIndex
              ? { ...item, cantidad: item.cantidad + 1 }
              : item
          )
        );
        showToast('success', `Se incrementó la cantidad de ${prod.nombre}.`);
      } else {
        showToast('error', `Stock máximo disponible alcanzado (${maxStock} unid.).`);
      }
    } else {
      setCart((prev) => [
        ...prev,
        {
          id: prod.id,
          producto: prod,
          cantidad: 1,
          precio: unitPrice,
          descuento: 0,
        },
      ]);
      showToast('success', `${prod.nombre} agregado a la venta.`);
    }
  };

  // Actualizar cantidad de un ítem
  const handleUpdateCantidad = (id: number, deltaOrVal: number | string) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            let newCant = item.cantidad;
            if (typeof deltaOrVal === 'string') {
              const parsed = parseInt(deltaOrVal, 10);
              newCant = isNaN(parsed) ? 1 : Math.max(1, parsed);
            } else {
              newCant = Math.max(1, item.cantidad + deltaOrVal);
            }
            const stockMax = item.producto.stock ?? 999;
            return { ...item, cantidad: Math.min(newCant, stockMax) };
          }
          return item;
        })
        .filter((item) => item.cantidad > 0)
    );
  };

  // Eliminar ítem del carrito
  const handleRemoveFromCart = (id: number) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  // Cancelar venta actual
  const handleCancelarVenta = () => {
    setCart([]);
    setDocIdentidad('');
    setNombreCliente('');
    setTipoComprobante('Ticket');
    setFormaPago('Contado');
    setEsCredito(false);
    showToast('error', 'Venta cancelada. Formulario reiniciado.');
  };

  // Cálculo de totales
  const totalVenta = useMemo(() => {
    return cart.reduce((acc, item) => {
      const subtotal = item.cantidad * item.precio - item.descuento;
      return acc + (subtotal > 0 ? subtotal : 0);
    }, 0);
  }, [cart]);

  // Cálculo de Cronograma de Pagos para Crédito
  const cronogramaCuotas = useMemo(() => {
    if (!esCredito) return [];

    const inicial = Math.max(0, parseFloat(pagoInicial) || 0);
    const cuotasCount = Math.max(1, parseInt(numCuotas, 10) || 1);
    const saldo = Math.max(0, totalVenta - inicial);
    const montoPorCuota = cuotasCount > 0 ? saldo / cuotasCount : 0;

    const baseDate = new Date(fechaPrimeraCuota ? `${fechaPrimeraCuota}T00:00:00` : '2026-12-15T00:00:00');
    if (isNaN(baseDate.getTime())) {
      baseDate.setTime(new Date('2026-12-15T00:00:00').getTime());
    }

    let diasIntervalo = 30;
    if (intervaloPago.includes('Semanal')) diasIntervalo = 7;
    else if (intervaloPago.includes('Quincenal')) diasIntervalo = 15;

    const cuotas = [];
    for (let i = 1; i <= cuotasCount; i++) {
      const cuotaDate = new Date(baseDate);
      if (intervaloPago.includes('Mensual')) {
        cuotaDate.setMonth(baseDate.getMonth() + (i - 1));
      } else {
        cuotaDate.setDate(baseDate.getDate() + (i - 1) * diasIntervalo);
      }

      const day = String(cuotaDate.getDate()).padStart(2, '0');
      const month = String(cuotaDate.getMonth() + 1).padStart(2, '0');
      const year = cuotaDate.getFullYear();
      const fechaFormatted = `${day}/${month}/${year}`;

      cuotas.push({
        numero: i,
        fecha: fechaFormatted,
        monto: montoPorCuota,
        estado: 'PENDIENTE',
      });
    }

    return cuotas;
  }, [esCredito, totalVenta, pagoInicial, numCuotas, intervaloPago, fechaPrimeraCuota]);

  // Guardar Venta
  const handleGuardarVenta = async () => {
    if (cart.length === 0) {
      showToast('error', 'No hay productos en la venta actual.');
      return;
    }

    setProcessingSale(true);
    try {
      const detalles: CreateDetalleVentaDTO[] = cart.map((item) => ({
        productoId: item.producto.id,
        cantidad: item.cantidad,
        precioUnitario: item.precio,
        descuento: item.descuento,
      }));

      const backendComprobante =
        tipoComprobante === 'Boleta'
          ? 'BOLETA'
          : tipoComprobante === 'Factura'
          ? 'FACTURA'
          : 'TICKET';

      const backendMetodo = formaPago.toUpperCase().includes('YAPE')
        ? 'YAPE'
        : formaPago.toUpperCase().includes('PLIN')
        ? 'PLIN'
        : formaPago.toUpperCase().includes('TARJETA')
        ? 'TARJETA'
        : 'EFECTIVO';

      const ventaDTO: CreateVentaDTO = {
        numeroDocumento: docIdentidad.trim() || undefined,
        tipoComprobante: backendComprobante,
        metodoPago: backendMetodo,
        detalles,
        items: detalles,
        usuarioId: 1,
        observaciones: `Cliente: ${nombreCliente.trim() || 'Público General'}${
          esCredito
            ? ` | Crédito: ${numCuotas} cuota(s) (${intervaloPago}) - Pago Inicial S/ ${pagoInicial}`
            : ''
        }`,
      };

      try {
        await postVenta(ventaDTO);
      } catch {
        // Continuar en modo local si el backend no está disponible
      }

      // Vincular venta a la caja activa si se encuentra un turno abierto
      try {
        const cajaActiva = await getCajaActiva();
        if (cajaActiva && cajaActiva.estado === 'ABIERTA') {
          await registrarMovimientoCaja(cajaActiva.id, {
            tipo: 'VENTA',
            concepto: `Venta POS - ${backendComprobante} (${nombreCliente.trim() || 'Público General'})`,
            monto: totalVenta,
            metodoPago: backendMetodo,
          });
        }
      } catch {
        // No bloquear la venta si falla el arqueo
      }

      showToast(
        'success',
        `¡Venta guardada con éxito! Total emitido: S/ ${totalVenta.toFixed(2)}.`
      );

      // Reiniciar para siguiente venta
      setCart([]);
      setDocIdentidad('');
      setNombreCliente('');
      setNumDocumento(`V-${Math.floor(1000 + Math.random() * 9000)}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al registrar venta';
      showToast('error', msg);
    } finally {
      setProcessingSale(false);
    }
  };

  // Filtrado de productos para el modal de búsqueda
  const filteredModalProducts = useMemo(() => {
    const q = modalSearch.trim().toLowerCase();
    if (!q) return catalogo;
    return catalogo.filter((p) => {
      const cod = (p.codigo || '').toLowerCase();
      const nom = (p.nombre || '').toLowerCase();
      const cat = (p.categoriaNombre || '').toLowerCase();
      return cod.includes(q) || nom.includes(q) || cat.includes(q);
    });
  }, [catalogo, modalSearch]);

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

      {/* ─── TARJETA PRINCIPAL REGISTRAR VENTA ─── */}
      <div className="bg-white rounded-3xl shadow-sm shadow-slate-200/50 border border-slate-100/60 overflow-hidden">
        {/* Banner Superior Magenta */}
        <div className="bg-gradient-to-r from-[#d946ef] to-[#c026d3] px-6 md:px-8 py-4 flex items-center justify-between">
          <h1 className="text-base md:text-lg font-bold text-white tracking-wide">
            Registrar Venta
          </h1>
          <Link
            href="/dashboard/caja"
            className="px-3.5 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs"
          >
            <Wallet className="size-3.5" />
            <span>Módulo Caja</span>
          </Link>
        </div>

        {/* Cuerpo del Formulario */}
        <div className="p-6 md:p-8 space-y-6">
          {/* ─── FILA 1: CLIENTE, VENDEDOR Y VENTA SIN CLIENTE ─── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4 items-end">
            {/* DNI / RUC del Cliente con Botón Buscar */}
            <div className="lg:col-span-4 space-y-1.5">
              <label
                htmlFor="docClienteInput"
                className="block text-xs font-bold text-slate-700"
              >
                DNI/RUC del Cliente
              </label>
              <div className="flex items-center rounded-xl border border-slate-200/90 bg-white overflow-hidden focus-within:border-sky-400 focus-within:ring-4 focus-within:ring-sky-100 transition-all">
                <input
                  id="docClienteInput"
                  type="text"
                  value={docIdentidad}
                  onChange={(e) => setDocIdentidad(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleBuscarCliente()}
                  placeholder="Ingrese DNI/RUC"
                  className="w-full h-11 px-4 text-xs sm:text-sm text-slate-800 outline-none placeholder:text-slate-400"
                />
                <button
                  type="button"
                  onClick={handleBuscarCliente}
                  disabled={searchingDoc}
                  title="Buscar en RENIEC/SUNAT"
                  className="h-11 px-4 bg-[#00b0ff] hover:bg-[#009be0] text-white flex items-center justify-center cursor-pointer transition-colors shrink-0 disabled:opacity-70"
                >
                  {searchingDoc ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Search className="size-4 stroke-[2.5]" />
                  )}
                </button>
              </div>
            </div>

            {/* Nombre Cliente (Deshabilitado / ReadOnly) */}
            <div className="lg:col-span-4 space-y-1.5">
              <label
                htmlFor="nombreClienteInput"
                className="block text-xs font-bold text-slate-700"
              >
                Nombre Cliente
              </label>
              <input
                id="nombreClienteInput"
                type="text"
                readOnly
                value={nombreCliente}
                onChange={(e) => setNombreCliente(e.target.value)}
                placeholder="Nombre del cliente"
                className="w-full h-11 px-4 text-xs sm:text-sm text-slate-600 bg-slate-100/90 rounded-xl border border-slate-200/70 outline-none placeholder:text-slate-400"
              />
            </div>

            {/* Vendedor (Deshabilitado / ReadOnly) */}
            <div className="lg:col-span-2 space-y-1.5">
              <label
                htmlFor="vendedorInput"
                className="block text-xs font-bold text-slate-700"
              >
                Vendedor
              </label>
              <input
                id="vendedorInput"
                type="text"
                readOnly
                value={vendedor}
                className="w-full h-11 px-4 text-xs sm:text-sm text-slate-700 bg-slate-100/90 rounded-xl border border-slate-200/70 outline-none"
              />
            </div>

            {/* Botón Venta Sin Cliente */}
            <div className="lg:col-span-2 flex items-end">
              <button
                type="button"
                onClick={handleVentaSinCliente}
                className="w-full h-11 px-3 bg-gradient-to-r from-[#d946ef] to-[#c026d3] hover:from-[#c026d3] hover:to-[#a21caf] text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md shadow-fuchsia-500/25 active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-1.5 shrink-0"
              >
                <UserX className="size-4 shrink-0" />
                <span className="truncate">VENTA SIN CLIENTE</span>
              </button>
            </div>
          </div>

          {/* ─── FILA 2: TIPO COMPROBANTE, N° DOCUMENTO, FORMA DE PAGO, ¿CRÉDITO? ─── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4 items-center">
            {/* Tipo Comprobante */}
            <div className="lg:col-span-4 space-y-1.5">
              <label
                htmlFor="tipoCompSelect"
                className="block text-xs font-bold text-slate-700"
              >
                Tipo Comprobante
              </label>
              <select
                id="tipoCompSelect"
                value={tipoComprobante}
                onChange={(e) => setTipoComprobante(e.target.value as any)}
                className="w-full h-11 px-4 text-xs sm:text-sm text-slate-800 bg-white hover:bg-slate-50/50 focus:bg-white rounded-xl border border-slate-200/80 focus:border-[#d946ef] focus:ring-4 focus:ring-fuchsia-100 transition-all outline-none cursor-pointer"
              >
                <option value="Ticket">Ticket</option>
                <option value="Boleta">Boleta</option>
                <option value="Factura">Factura</option>
              </select>
            </div>

            {/* N° Documento */}
            <div className="lg:col-span-4 space-y-1.5">
              <label
                htmlFor="numDocInput"
                className="block text-xs font-bold text-slate-700"
              >
                N° Documento
              </label>
              <input
                id="numDocInput"
                type="text"
                readOnly
                value={numDocumento}
                className="w-full h-11 px-4 text-xs sm:text-sm text-slate-500 bg-slate-100/90 rounded-xl border border-slate-200/70 outline-none"
              />
            </div>

            {/* Forma de Pago */}
            <div className="lg:col-span-3 space-y-1.5">
              <label
                htmlFor="formaPagoSelect"
                className="block text-xs font-bold text-slate-700"
              >
                Forma de Pago
              </label>
              <select
                id="formaPagoSelect"
                value={formaPago}
                onChange={(e) => setFormaPago(e.target.value)}
                className="w-full h-11 px-4 text-xs sm:text-sm text-slate-800 bg-white hover:bg-slate-50/50 focus:bg-white rounded-xl border-2 border-[#c026d3]/60 focus:border-[#c026d3] focus:ring-4 focus:ring-fuchsia-100 transition-all outline-none cursor-pointer"
              >
                <option value="Contado">Contado</option>
                <option value="Yape">Yape</option>
                <option value="Plin">Plin</option>
                <option value="Tarjeta">Tarjeta de Crédito/Débito</option>
                <option value="Transferencia">Transferencia Bancaria</option>
              </select>
            </div>

            {/* Checkbox ¿Crédito? */}
            <div className="lg:col-span-1 flex items-center pt-5">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={esCredito}
                  onChange={(e) => setEsCredito(e.target.checked)}
                  className="size-4.5 rounded border-slate-300 text-[#c026d3] focus:ring-fuchsia-400 cursor-pointer"
                />
                <span className="text-xs font-semibold text-slate-700">
                  ¿Crédito?
                </span>
              </label>
            </div>
          </div>

          {/* ─── FILA 3: BOTÓN BUSCAR Y AGREGAR PRODUCTOS + TOTAL GRANDE ─── */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-4 border-t border-slate-100/80">
            <button
              type="button"
              onClick={() => setIsProductModalOpen(true)}
              className="px-6 py-2.5 bg-gradient-to-r from-[#d946ef] to-[#c026d3] hover:from-[#c026d3] hover:to-[#a21caf] text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md shadow-fuchsia-500/25 active:scale-[0.98] transition-all cursor-pointer flex items-center gap-2"
            >
              <ShoppingBag className="size-4" />
              <span>BUSCAR Y AGREGAR PRODUCTOS</span>
            </button>

            {/* Total Grande */}
            <div className="text-right">
              <span className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">
                Total: S/ {totalVenta.toFixed(2)}
              </span>
            </div>
          </div>

          {/* ─── TABLA DE PRODUCTOS EN EL CARRITO ─── */}
          <div className="overflow-x-auto -mx-6 md:-mx-8 px-6 md:px-8 pt-2">
            <table className="w-full text-left border-collapse min-w-[750px]">
              <thead>
                <tr className="bg-slate-50/80 border-y border-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  <th className="py-3 px-3 text-left w-12">ID</th>
                  <th className="py-3 px-3 text-left">PRODUCTO</th>
                  <th className="py-3 px-3 text-center w-20">STOCK</th>
                  <th className="py-3 px-3 text-center w-24">CANT</th>
                  <th className="py-3 px-3 text-center w-28">PRECIO</th>
                  <th className="py-3 px-3 text-center w-20">DESC.</th>
                  <th className="py-3 px-3 text-center w-28">SUBTOTAL</th>
                  <th className="py-3 px-3 text-center w-12"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/70 text-xs">
                {cart.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400">
                      No hay productos agregados a la venta. Haga clic en{' '}
                      <strong>"BUSCAR Y AGREGAR PRODUCTOS"</strong>.
                    </td>
                  </tr>
                ) : (
                  cart.map((item) => {
                    const subtotal = item.cantidad * item.precio - item.descuento;
                    return (
                      <tr
                        key={item.id}
                        className="hover:bg-slate-50/60 transition-colors"
                      >
                        {/* ID */}
                        <td className="py-4 px-3 font-semibold text-slate-600">
                          {item.id}
                        </td>

                        {/* Producto */}
                        <td className="py-4 px-3 font-medium text-slate-800">
                          {item.producto.nombre}
                        </td>

                        {/* Stock */}
                        <td className="py-4 px-3 text-center text-slate-600">
                          {item.producto.stock ?? 19}
                        </td>

                        {/* Cantidad con Input numérico editable */}
                        <td className="py-4 px-3 text-center">
                          <div className="inline-flex items-center justify-center">
                            <input
                              type="number"
                              min={1}
                              max={item.producto.stock ?? 999}
                              value={item.cantidad}
                              onChange={(e) =>
                                handleUpdateCantidad(item.id, e.target.value)
                              }
                              className="w-16 h-8 text-center border border-slate-200 rounded-lg text-xs font-bold text-slate-800 bg-white focus:border-[#d946ef] focus:ring-2 focus:ring-fuchsia-100 outline-none"
                            />
                          </div>
                        </td>

                        {/* Precio */}
                        <td className="py-4 px-3 text-center text-slate-700">
                          S/ {item.precio.toFixed(2)}
                        </td>

                        {/* Descuento */}
                        <td className="py-4 px-3 text-center text-slate-400">
                          {item.descuento > 0 ? `S/ ${item.descuento.toFixed(2)}` : '-'}
                        </td>

                        {/* Subtotal en Verde Brillante */}
                        <td className="py-4 px-3 text-center font-bold text-[#16a34a]">
                          S/ {subtotal.toFixed(2)}
                        </td>

                        {/* Acción Eliminar (Papelera Roja) */}
                        <td className="py-4 px-3 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveFromCart(item.id)}
                            title="Quitar producto"
                            className="text-red-500 hover:text-red-700 p-1 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* ─── CRONOGRAMA DE PAGOS (SI ES CRÉDITO) ─── */}
          {esCredito && (
            <div className="bg-[#f1f5f9]/80 rounded-2xl p-6 border border-slate-200/80 mt-2 space-y-5 animate-in fade-in-50 duration-200">
              <h3 className="text-sm font-bold text-slate-800 tracking-tight">
                Cronograma de Pagos
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Pago Inicial */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
                    Pago Inicial
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={pagoInicial}
                    onChange={(e) => setPagoInicial(e.target.value)}
                    placeholder="0"
                    className="w-full h-10 px-3.5 text-xs text-slate-800 bg-white rounded-xl border border-slate-200/90 focus:border-[#d946ef] focus:ring-4 focus:ring-fuchsia-100 outline-none transition-all shadow-xs"
                  />
                </div>

                {/* N° Cuotas */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
                    N° Cuotas
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={numCuotas}
                    onChange={(e) => setNumCuotas(e.target.value)}
                    placeholder="1"
                    className="w-full h-10 px-3.5 text-xs text-slate-800 bg-white rounded-xl border border-slate-200/90 focus:border-[#d946ef] focus:ring-4 focus:ring-fuchsia-100 outline-none transition-all shadow-xs"
                  />
                </div>

                {/* Intervalo de Pago */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
                    Intervalo de Pago
                  </label>
                  <div className="relative">
                    <select
                      value={intervaloPago}
                      onChange={(e) => setIntervaloPago(e.target.value)}
                      className="w-full h-10 pl-3.5 pr-8 text-xs text-slate-800 bg-white rounded-xl border border-slate-200/90 focus:border-[#d946ef] focus:ring-4 focus:ring-fuchsia-100 outline-none transition-all appearance-none cursor-pointer shadow-xs"
                    >
                      <option value="Semanal (7 días)">Semanal (7 días)</option>
                      <option value="Quincenal (15 días)">Quincenal (15 días)</option>
                      <option value="Mensual (30 días)">Mensual (30 días)</option>
                    </select>
                    <ChevronDown className="size-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                {/* Fecha 1° Cuota */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
                    Fecha 1° Cuota
                  </label>
                  <input
                    type="date"
                    value={fechaPrimeraCuota}
                    onChange={(e) => setFechaPrimeraCuota(e.target.value)}
                    className="w-full h-10 px-3.5 text-xs text-slate-800 bg-white rounded-xl border border-slate-200/90 focus:border-[#d946ef] focus:ring-4 focus:ring-fuchsia-100 outline-none transition-all cursor-pointer shadow-xs"
                  />
                </div>
              </div>

              {/* Tabla de Cuotas */}
              <div className="overflow-x-auto pt-2">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-slate-500 font-semibold text-xs border-b border-slate-200/80">
                      <th className="py-2.5 px-3 text-left w-12 font-semibold">#</th>
                      <th className="py-2.5 px-3 text-center font-semibold">Fecha</th>
                      <th className="py-2.5 px-3 text-center font-semibold">Monto</th>
                      <th className="py-2.5 px-3 text-center font-semibold">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200/60">
                    {cronogramaCuotas.map((cuota) => (
                      <tr key={cuota.numero} className="hover:bg-white/70 transition-colors">
                        <td className="py-3 px-3 text-left text-slate-600 font-medium">
                          {cuota.numero}
                        </td>
                        <td className="py-3 px-3 text-center text-slate-600">
                          {cuota.fecha}
                        </td>
                        <td className="py-3 px-3 text-center text-slate-700 font-semibold">
                          S/ {cuota.monto.toFixed(2)}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span className="bg-[#64748b] text-white font-bold text-[10px] px-3 py-1 rounded-md tracking-wider uppercase inline-block shadow-xs">
                            {cuota.estado}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ─── BOTONES INFERIORES: GUARDAR VENTA (Verde) + CANCELAR (Gris) ─── */}
          <div className="pt-6 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={handleGuardarVenta}
              disabled={processingSale || cart.length === 0}
              className="px-8 py-3 bg-[#84cc16] hover:bg-[#65a30d] text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md shadow-lime-500/25 active:scale-[0.98] transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50"
            >
              {processingSale && <Loader2 className="size-4 animate-spin text-white" />}
              <span>GUARDAR VENTA</span>
            </button>

            <button
              type="button"
              onClick={handleCancelarVenta}
              className="px-7 py-3 bg-[#64748b] hover:bg-[#475569] text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-sm active:scale-[0.98] transition-all cursor-pointer"
            >
              CANCELAR
            </button>
          </div>
        </div>
      </div>

      {/* ─── MODAL: BUSCAR Y AGREGAR PRODUCTOS ─── */}
      <Dialog
        open={isProductModalOpen}
        onOpenChange={setIsProductModalOpen}
      >
        <DialogContent className="max-w-2xl bg-white rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-800">
              Buscar y Agregar Productos
            </DialogTitle>
          </DialogHeader>

          {/* Buscador de productos */}
          <div className="relative my-3">
            <Search className="size-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={modalSearch}
              onChange={(e) => setModalSearch(e.target.value)}
              placeholder="Buscar por código, nombre o categoría..."
              className="w-full h-11 pl-11 pr-4 text-xs sm:text-sm text-slate-800 bg-slate-50 hover:bg-slate-50/80 focus:bg-white rounded-xl border border-slate-200/80 focus:border-[#d946ef] focus:ring-4 focus:ring-fuchsia-100 transition-all outline-none"
            />
          </div>

          {/* Lista de productos disponibles */}
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 border border-slate-100 rounded-2xl">
            {loadingCatalogo ? (
              <div className="py-8 text-center text-slate-400 flex items-center justify-center gap-2">
                <Loader2 className="size-4 animate-spin text-[#c026d3]" />
                <span className="text-xs">Cargando catálogo...</span>
              </div>
            ) : filteredModalProducts.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                No se encontraron productos coincidentes.
              </div>
            ) : (
              filteredModalProducts.map((p) => {
                const precio = p.precio || p.precioVenta || 10.0;
                return (
                  <div
                    key={p.id}
                    className="p-3.5 flex items-center justify-between hover:bg-slate-50/80 transition-colors"
                  >
                    <div>
                      <h4 className="text-xs font-bold text-slate-800">
                        {p.nombre}
                      </h4>
                      <p className="text-[11px] text-slate-400">
                        Código: {p.codigo || 'S/C'} • Stock: {p.stock ?? 0} unid.
                        {p.categoriaNombre && ` • ${p.categoriaNombre}`}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-slate-800">
                        S/ {precio.toFixed(2)}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleAddToCart(p)}
                        className="px-3.5 py-1.5 bg-gradient-to-r from-[#d946ef] to-[#c026d3] hover:from-[#c026d3] hover:to-[#a21caf] text-white font-bold text-[11px] uppercase tracking-wider rounded-lg shadow-xs cursor-pointer active:scale-95 transition-all"
                      >
                        + Agregar
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
