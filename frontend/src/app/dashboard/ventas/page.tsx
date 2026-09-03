'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import {
  FileText,
  Search,
  Calendar,
  Filter,
  Eye,
  RefreshCw,
  PlusCircle,
  TrendingUp,
  Receipt,
  CreditCard,
  Banknote,
  Smartphone,
  Star,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Ban,
  X,
  User,
  ArrowUpRight,
} from 'lucide-react';
import {
  Venta,
  EstadoVenta,
  MetodoPago,
  TipoComprobante,
  Cliente,
  TipoCliente,
} from '@/types';
import { getVentas } from '@/services/ventaService';
import { ReciboModal } from '@/components/modules/ventas/ReciboModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import {
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from '@/components/ui/table';

// Datos de demostración enriquecidos
const DEMO_VENTAS: Venta[] = [
  {
    id: 104,
    numeroVenta: 'REC-00104',
    fecha: new Date(Date.now() - 1000 * 60 * 35).toISOString(), // Hace 35 min
    clienteId: 1,
    cliente: {
      id: 1,
      documentoIdentidad: '74218934',
      nombre: 'Maria',
      apellido: 'Condori Quispe',
      tipoCliente: TipoCliente.BENEFICIARIO,
      esClienteAmigo: true,
      codigoClienteAmigo: 'CA-48291',
      activo: true,
    },
    usuarioId: 1,
    subtotal: 68.95,
    descuentoTotal: 3.45,
    impuesto: 9.99,
    total: 65.5,
    metodoPago: 'YAPE',
    estado: 'COMPLETADA',
    recibo: {
      id: 104,
      numeroRecibo: 'B001-0004812',
      tipoComprobante: 'BOLETA',
      fechaEmision: new Date().toISOString(),
      montoSubtotal: 68.95,
      montoDescuento: 3.45,
      montoImpuesto: 9.99,
      montoTotal: 65.5,
      metodoPago: 'YAPE',
      ventaId: 104,
      clienteNombre: 'Maria Condori Quispe',
      clienteDocumento: '74218934',
    },
    detalles: [
      {
        id: 1,
        productoId: 1,
        producto: { id: 1, nombre: 'Paracetamol 500mg Forte', precio: 14.5 } as any,
        cantidad: 2,
        precioUnitario: 14.5,
        descuento: 1.45,
        subtotal: 27.55,
      },
      {
        id: 2,
        productoId: 3,
        producto: { id: 3, nombre: 'Ibuprofeno 400mg', precio: 16.5 } as any,
        cantidad: 2,
        precioUnitario: 16.5,
        descuento: 1.65,
        subtotal: 31.35,
      },
      {
        id: 3,
        productoId: 4,
        producto: { id: 4, nombre: 'Loratadina 10mg', precio: 11.0 } as any,
        cantidad: 1,
        precioUnitario: 11.0,
        descuento: 0.55,
        subtotal: 10.45,
      },
    ],
  },
  {
    id: 103,
    numeroVenta: 'REC-00103',
    fecha: new Date(Date.now() - 1000 * 60 * 75).toISOString(),
    clienteId: 2,
    cliente: {
      id: 2,
      documentoIdentidad: '41982341',
      nombre: 'Juan Carlos',
      apellido: 'Mendoza',
      tipoCliente: TipoCliente.REGULAR,
      esClienteAmigo: true,
      codigoClienteAmigo: 'CA-10294',
      activo: true,
    },
    usuarioId: 1,
    subtotal: 130.5,
    descuentoTotal: 6.5,
    impuesto: 18.91,
    total: 124.0,
    metodoPago: 'TARJETA_DEBITO',
    estado: 'COMPLETADA',
    recibo: {
      id: 103,
      numeroRecibo: 'B001-0004811',
      tipoComprobante: 'BOLETA',
      fechaEmision: new Date().toISOString(),
      montoSubtotal: 130.5,
      montoDescuento: 6.5,
      montoImpuesto: 18.91,
      montoTotal: 124.0,
      metodoPago: 'TARJETA_DEBITO',
      ventaId: 103,
      clienteNombre: 'Juan Carlos Mendoza',
      clienteDocumento: '41982341',
    },
    detalles: [
      {
        id: 4,
        productoId: 2,
        producto: { id: 2, nombre: 'Amoxicilina + Ác. Clavulánico 500/125mg', precio: 32.0 } as any,
        cantidad: 3,
        precioUnitario: 32.0,
        descuento: 4.8,
        subtotal: 91.2,
      },
      {
        id: 5,
        productoId: 7,
        producto: { id: 7, nombre: 'Redoxon Vitamina C 1000mg', precio: 24.0 } as any,
        cantidad: 1,
        precioUnitario: 24.0,
        descuento: 1.2,
        subtotal: 22.8,
      },
    ],
  },
  {
    id: 102,
    numeroVenta: 'REC-00102',
    fecha: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    clienteId: 4,
    cliente: {
      id: 4,
      documentoIdentidad: '71920412',
      nombre: 'Lucia',
      apellido: 'Sanchez R.',
      tipoCliente: TipoCliente.NUEVO,
      esClienteAmigo: false,
      activo: true,
    },
    usuarioId: 1,
    subtotal: 18.2,
    descuentoTotal: 0,
    impuesto: 2.78,
    total: 18.2,
    metodoPago: 'EFECTIVO',
    estado: 'COMPLETADA',
    recibo: {
      id: 102,
      numeroRecibo: 'T001-0008412',
      tipoComprobante: 'TICKET',
      fechaEmision: new Date().toISOString(),
      montoSubtotal: 18.2,
      montoDescuento: 0,
      montoImpuesto: 2.78,
      montoTotal: 18.2,
      metodoPago: 'EFECTIVO',
      ventaId: 102,
      clienteNombre: 'Lucia Sanchez R.',
      clienteDocumento: '71920412',
    },
    detalles: [
      {
        id: 6,
        productoId: 3,
        producto: { id: 3, nombre: 'Ibuprofeno 400mg', precio: 16.5 } as any,
        cantidad: 1,
        precioUnitario: 16.5,
        descuento: 0,
        subtotal: 16.5,
      },
    ],
  },
  {
    id: 101,
    numeroVenta: 'REC-00101',
    fecha: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    clienteId: 5,
    cliente: {
      id: 5,
      documentoIdentidad: '40192834',
      nombre: 'Pedro',
      apellido: 'Torres Gomez',
      tipoCliente: TipoCliente.BENEFICIARIO,
      esClienteAmigo: true,
      codigoClienteAmigo: 'CA-20184',
      activo: true,
    },
    usuarioId: 1,
    subtotal: 94.63,
    descuentoTotal: 4.73,
    impuesto: 13.71,
    total: 89.9,
    metodoPago: 'EFECTIVO',
    estado: 'COMPLETADA',
    recibo: {
      id: 101,
      numeroRecibo: 'B001-0004810',
      tipoComprobante: 'BOLETA',
      fechaEmision: new Date().toISOString(),
      montoSubtotal: 94.63,
      montoDescuento: 4.73,
      montoImpuesto: 13.71,
      montoTotal: 89.9,
      metodoPago: 'EFECTIVO',
      ventaId: 101,
      clienteNombre: 'Pedro Torres Gomez',
      clienteDocumento: '40192834',
    },
    detalles: [
      {
        id: 7,
        productoId: 8,
        producto: { id: 8, nombre: 'Salbutamol Inhalador 100mcg', precio: 28.5 } as any,
        cantidad: 2,
        precioUnitario: 28.5,
        descuento: 2.85,
        subtotal: 54.15,
      },
      {
        id: 8,
        productoId: 6,
        producto: { id: 6, nombre: 'Omeprazol 20mg Cápsulas', precio: 15.0 } as any,
        cantidad: 2,
        precioUnitario: 15.0,
        descuento: 1.5,
        subtotal: 28.5,
      },
    ],
  },
  {
    id: 100,
    numeroVenta: 'REC-00100',
    fecha: new Date(Date.now() - 1000 * 60 * 300).toISOString(),
    clienteId: 3,
    cliente: {
      id: 3,
      documentoIdentidad: '20608941234',
      nombre: 'Policlínico San Judas Tadeo SAC',
      apellido: '',
      tipoCliente: TipoCliente.BENEFICIARIO,
      esClienteAmigo: false,
      activo: true,
    },
    usuarioId: 1,
    subtotal: 450.0,
    descuentoTotal: 0,
    impuesto: 68.64,
    total: 450.0,
    metodoPago: 'TRANSFERENCIA',
    estado: 'COMPLETADA',
    recibo: {
      id: 100,
      numeroRecibo: 'F001-0000941',
      tipoComprobante: 'FACTURA',
      fechaEmision: new Date().toISOString(),
      montoSubtotal: 450.0,
      montoDescuento: 0,
      montoImpuesto: 68.64,
      montoTotal: 450.0,
      metodoPago: 'TRANSFERENCIA',
      ventaId: 100,
      clienteNombre: 'Policlínico San Judas Tadeo SAC',
      clienteDocumento: '20608941234',
    },
    detalles: [
      {
        id: 9,
        productoId: 1,
        producto: { id: 1, nombre: 'Paracetamol 500mg Forte', precio: 14.5 } as any,
        cantidad: 20,
        precioUnitario: 14.5,
        descuento: 0,
        subtotal: 290.0,
      },
      {
        id: 10,
        productoId: 3,
        producto: { id: 3, nombre: 'Ibuprofeno 400mg', precio: 16.5 } as any,
        cantidad: 10,
        precioUnitario: 16.5,
        descuento: 0,
        subtotal: 165.0,
      },
    ],
  },
  {
    id: 99,
    numeroVenta: 'REC-00099',
    fecha: new Date(Date.now() - 1000 * 60 * 420).toISOString(),
    clienteId: 2,
    cliente: {
      id: 2,
      documentoIdentidad: '41982341',
      nombre: 'Carlos Manuel',
      apellido: 'Arroyo Vega',
      tipoCliente: TipoCliente.REGULAR,
      esClienteAmigo: true,
      activo: true,
    },
    usuarioId: 1,
    subtotal: 42.0,
    descuentoTotal: 2.1,
    impuesto: 6.41,
    total: 42.0,
    metodoPago: 'YAPE',
    estado: 'ANULADA',
    recibo: {
      id: 99,
      numeroRecibo: 'B001-0004809',
      tipoComprobante: 'BOLETA',
      fechaEmision: new Date().toISOString(),
      montoSubtotal: 42.0,
      montoDescuento: 2.1,
      montoImpuesto: 6.41,
      montoTotal: 42.0,
      metodoPago: 'YAPE',
      ventaId: 99,
      clienteNombre: 'Carlos Manuel Arroyo Vega',
      clienteDocumento: '41982341',
    },
    detalles: [],
    observaciones: 'Anulado por cambio de producto solicitado por el cliente',
  },
  {
    id: 98,
    numeroVenta: 'REC-00098',
    fecha: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(), // Ayer
    clienteId: 1,
    cliente: {
      id: 1,
      documentoIdentidad: '74218934',
      nombre: 'Elena Rosa',
      apellido: 'Mendoza Paredes',
      tipoCliente: TipoCliente.BENEFICIARIO,
      esClienteAmigo: true,
      codigoClienteAmigo: 'CA-48291',
      activo: true,
    },
    usuarioId: 1,
    subtotal: 100.0,
    descuentoTotal: 5.0,
    impuesto: 14.49,
    total: 95.0,
    metodoPago: 'TARJETA_CREDITO',
    estado: 'COMPLETADA',
    detalles: [],
  },
];

export default function VentasPage() {
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUsingDemo, setIsUsingDemo] = useState(false);

  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEstado, setSelectedEstado] = useState<string>('ALL');
  const [fechaInicio, setFechaInicio] = useState<string>('');
  const [fechaFin, setFechaFin] = useState<string>('');

  // Modal de Recibo
  const [selectedVentaForReceipt, setSelectedVentaForReceipt] = useState<Venta | null>(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);

  // Cargar ventas desde API o Demo
  const fetchVentasData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getVentas();
      if (data && data.length > 0) {
        setVentas(data);
        setIsUsingDemo(false);
      } else {
        setVentas(DEMO_VENTAS);
        setIsUsingDemo(true);
      }
    } catch {
      setVentas(DEMO_VENTAS);
      setIsUsingDemo(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVentasData();
  }, [fetchVentasData]);

  // Filtrado de Ventas
  const filteredVentas = useMemo(() => {
    return ventas.filter((v) => {
      // 1. Búsqueda por N° Venta, Comprobante o Cliente
      const term = searchTerm.toLowerCase().trim();
      const matchSearch =
        !term ||
        v.numeroVenta.toLowerCase().includes(term) ||
        (v.recibo?.numeroRecibo && v.recibo.numeroRecibo.toLowerCase().includes(term)) ||
        (v.cliente &&
          `${v.cliente.nombre} ${v.cliente.apellido}`.toLowerCase().includes(term)) ||
        (v.cliente?.documentoIdentidad &&
          v.cliente.documentoIdentidad.includes(term)) ||
        (v.recibo?.clienteNombre &&
          v.recibo.clienteNombre.toLowerCase().includes(term));

      // 2. Filtro por Estado
      const matchEstado =
        selectedEstado === 'ALL' || v.estado === selectedEstado;

      // 3. Filtro por Rango de Fechas
      let matchFecha = true;
      if (v.fecha) {
        const ventaDateStr = v.fecha.split('T')[0]; // YYYY-MM-DD
        if (fechaInicio && ventaDateStr < fechaInicio) {
          matchFecha = false;
        }
        if (fechaFin && ventaDateStr > fechaFin) {
          matchFecha = false;
        }
      }

      return matchSearch && matchEstado && matchFecha;
    });
  }, [ventas, searchTerm, selectedEstado, fechaInicio, fechaFin]);

  // Cálculos estadísticos / KPIs
  const stats = useMemo(() => {
    let totalFacturado = 0;
    let totalDescuentos = 0;
    let completadas = 0;
    let anuladas = 0;

    ventas.forEach((v) => {
      if (v.estado === 'COMPLETADA') {
        totalFacturado += v.total || 0;
        totalDescuentos += v.descuentoTotal || 0;
        completadas++;
      } else if (v.estado === 'ANULADA') {
        anuladas++;
      }
    });

    return {
      totalVentas: ventas.length,
      totalFacturado,
      totalDescuentos,
      completadas,
      anuladas,
    };
  }, [ventas]);

  // Manejar apertura de recibo
  const handleVerRecibo = (venta: Venta) => {
    setSelectedVentaForReceipt(venta);
    setIsReceiptModalOpen(true);
  };

  // Helper para icono de método de pago
  const renderMetodoPagoIcon = (metodo: MetodoPago) => {
    switch (metodo) {
      case 'EFECTIVO':
        return <Banknote className="w-3.5 h-3.5 text-emerald-600" />;
      case 'YAPE':
      case 'PLIN':
        return <Smartphone className="w-3.5 h-3.5 text-purple-600" />;
      case 'TARJETA_DEBITO':
      case 'TARJETA_CREDITO':
        return <CreditCard className="w-3.5 h-3.5 text-sky-600" />;
      default:
        return <Receipt className="w-3.5 h-3.5 text-slate-500" />;
    }
  };

  // Formato para hora y fecha
  const formatDateTime = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return {
        fecha: d.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' }),
        hora: d.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }),
      };
    } catch {
      return { fecha: dateStr, hora: '' };
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Cabecera Principal */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-black text-[#1a365d] tracking-tight">
              Historial de Ventas y Recibos
            </h1>
            {isUsingDemo && (
              <Badge variant="teal" className="text-[10px] uppercase font-bold">
                Modo Demo
              </Badge>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Auditoría de transacciones, tickets emitidos y comprobantes electrónicos.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchVentasData}
            disabled={loading}
            className="h-9 gap-2 text-xs font-semibold rounded-xl border-slate-200 text-slate-700 hover:bg-slate-100"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refrescar</span>
          </Button>

          <Link href="/dashboard/pos">
            <Button
              size="sm"
              className="h-9 gap-2 text-xs font-bold rounded-xl bg-[#319795] hover:bg-[#287e7c] text-white shadow-sm"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Nueva Venta (POS)</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Tarjetas Resumen / KPIs de Ventas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Facturado */}
        <Card className="p-4 bg-white border border-slate-200/80 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Facturación Total</span>
            <div className="p-2 rounded-xl bg-teal-50 text-[#319795]">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-[#1a365d]">
              S/. {stats.totalFacturado.toFixed(2)}
            </span>
            <span className="text-[11px] text-emerald-600 font-bold">Cobrado</span>
          </div>
        </Card>

        {/* Transacciones Emitidas */}
        <Card className="p-4 bg-white border border-slate-200/80 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Total Transacciones</span>
            <div className="p-2 rounded-xl bg-slate-100 text-[#1a365d]">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-[#1a365d]">{stats.totalVentas}</span>
            <span className="text-[11px] text-slate-400">recibos</span>
          </div>
        </Card>

        {/* Ventas Completadas */}
        <Card className="p-4 bg-white border border-emerald-100 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-800">Completadas con Éxito</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-700">{stats.completadas}</span>
            <span className="text-[11px] text-emerald-600/80">liquidadas</span>
          </div>
        </Card>

        {/* Descuentos ClienteAmigo Otorgados */}
        <Card className="p-4 bg-white border border-amber-100 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-800">Descuentos Fidelidad</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <Star className="w-4 h-4 fill-amber-500" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-amber-700">
              S/. {stats.totalDescuentos.toFixed(2)}
            </span>
            <span className="text-[11px] text-amber-700/80">ClienteAmigo</span>
          </div>
        </Card>
      </div>

      {/* Contenedor Principal: Filtros y Tabla */}
      <Card className="bg-white border border-slate-200/80 shadow-xs rounded-2xl overflow-hidden">
        {/* Barra de Filtros Combinados */}
        <div className="p-4 border-b border-slate-100 bg-slate-50/40 flex flex-col lg:flex-row items-center gap-3">
          {/* 1. Búsqueda por N° Recibo o Cliente */}
          <div className="relative w-full lg:w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Buscar por recibo, cliente o DNI..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-8 h-9 text-xs bg-white rounded-xl border-slate-200 shadow-none focus-visible:ring-[#319795]/20 focus-visible:border-[#319795]"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* 2. Filtro por Rango de Fechas */}
          <div className="flex items-center gap-1.5 w-full lg:w-auto">
            <div className="flex items-center gap-1 bg-white px-2.5 py-1 rounded-xl border border-slate-200 text-xs text-slate-600">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-[11px] text-slate-400">Desde:</span>
              <input
                type="date"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
                className="text-xs bg-transparent outline-none text-slate-700 font-semibold"
              />
            </div>
            <div className="flex items-center gap-1 bg-white px-2.5 py-1 rounded-xl border border-slate-200 text-xs text-slate-600">
              <span className="text-[11px] text-slate-400">Hasta:</span>
              <input
                type="date"
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
                className="text-xs bg-transparent outline-none text-slate-700 font-semibold"
              />
            </div>
            {(fechaInicio || fechaFin) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setFechaInicio('');
                  setFechaFin('');
                }}
                className="h-8 px-2 text-xs text-slate-500 hover:text-slate-800"
              >
                Limpiar
              </Button>
            )}
          </div>

          {/* 3. Filtro por Estado */}
          <div className="w-full lg:w-48">
            <select
              value={selectedEstado}
              onChange={(e) => setSelectedEstado(e.target.value)}
              className="flex h-9 w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-[#319795]/20 focus:border-[#319795]"
            >
              <option value="ALL">Todos los Estados</option>
              <option value="COMPLETADA">🟢 Completada</option>
              <option value="PENDIENTE">🟡 Pendiente</option>
              <option value="ANULADA">🔴 Anulada</option>
            </select>
          </div>

          {/* Contador de resultados */}
          <div className="ml-auto text-xs text-slate-500 font-medium whitespace-nowrap">
            Mostrando <span className="font-bold text-slate-800">{filteredVentas.length}</span> de{' '}
            {ventas.length}
          </div>
        </div>

        {/* Tabla de Historial de Ventas */}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-32">N° Venta / Recibo</TableHead>
              <TableHead>Fecha y Hora</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Comprobante</TableHead>
              <TableHead>Método Pago</TableHead>
              <TableHead className="text-center">Estado</TableHead>
              <TableHead className="text-right">Total (S/.)</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, idx) => (
                <TableRow key={idx} className="animate-pulse">
                  <TableCell><div className="h-4 w-24 bg-slate-200 rounded-md"></div></TableCell>
                  <TableCell><div className="h-4 w-32 bg-slate-200 rounded-md"></div></TableCell>
                  <TableCell><div className="h-4 w-40 bg-slate-200 rounded-md"></div></TableCell>
                  <TableCell><div className="h-4 w-20 bg-slate-200 rounded-md"></div></TableCell>
                  <TableCell><div className="h-4 w-24 bg-slate-200 rounded-md"></div></TableCell>
                  <TableCell className="text-center"><div className="h-5 w-20 bg-slate-200 rounded-full mx-auto"></div></TableCell>
                  <TableCell className="text-right"><div className="h-4 w-16 bg-slate-200 rounded-md ml-auto"></div></TableCell>
                  <TableCell className="text-right"><div className="h-8 w-20 bg-slate-200 rounded-xl ml-auto"></div></TableCell>
                </TableRow>
              ))
            ) : filteredVentas.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="py-14 text-center">
                  <div className="flex flex-col items-center justify-center max-w-sm mx-auto space-y-3">
                    <div className="p-3.5 rounded-2xl bg-slate-100 text-slate-400">
                      <Receipt className="w-8 h-8" />
                    </div>
                    <p className="text-sm font-bold text-slate-700">No se encontraron ventas</p>
                    <p className="text-xs text-slate-400">
                      Pruebe ajustando o limpiando los filtros de fecha y búsqueda aplicados.
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredVentas.map((venta) => {
                const { fecha, hora } = formatDateTime(venta.fecha);
                const clienteLabel = venta.cliente
                  ? `${venta.cliente.nombre} ${venta.cliente.apellido || ''}`.trim()
                  : venta.recibo?.clienteNombre || 'PÚBLICO GENERAL';

                const esClienteAmigo = venta.cliente?.esClienteAmigo === true;
                const tipoComp = venta.recibo?.tipoComprobante || 'BOLETA';

                return (
                  <TableRow key={venta.id} className="group">
                    {/* N° Venta / Recibo */}
                    <TableCell>
                      <span className="font-mono font-bold text-[#1a365d] text-xs">
                        {venta.numeroVenta}
                      </span>
                      {venta.recibo?.numeroRecibo && (
                        <span className="text-[10px] text-slate-400 block font-mono">
                          {venta.recibo.numeroRecibo}
                        </span>
                      )}
                    </TableCell>

                    {/* Fecha y Hora */}
                    <TableCell>
                      <div className="flex flex-col text-xs">
                        <span className="font-medium text-slate-800">{fecha}</span>
                        <span className="text-[10px] text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {hora}
                        </span>
                      </div>
                    </TableCell>

                    {/* Cliente */}
                    <TableCell>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-900 text-xs">
                            {clienteLabel}
                          </span>
                          {esClienteAmigo && (
                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-0.5">
                              <Star className="w-2.5 h-2.5 fill-amber-500" />
                              ClienteAmigo
                            </span>
                          )}
                        </div>
                        {venta.cliente?.documentoIdentidad && (
                          <span className="text-[10px] text-slate-400 font-mono">
                            Doc: {venta.cliente.documentoIdentidad}
                          </span>
                        )}
                      </div>
                    </TableCell>

                    {/* Tipo Comprobante */}
                    <TableCell>
                      <Badge variant="outline" className="text-[10px] font-semibold">
                        {tipoComp}
                      </Badge>
                    </TableCell>

                    {/* Método de Pago */}
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-xs text-slate-700 font-medium">
                        {renderMetodoPagoIcon(venta.metodoPago)}
                        <span>{venta.metodoPago.replace('_', ' ')}</span>
                      </div>
                    </TableCell>

                    {/* Estado */}
                    <TableCell className="text-center">
                      <Badge
                        variant={
                          venta.estado === 'COMPLETADA'
                            ? 'emerald'
                            : venta.estado === 'PENDIENTE'
                            ? 'amber'
                            : 'destructive'
                        }
                        className="text-[10px] px-2.5 py-0.5"
                      >
                        {venta.estado}
                      </Badge>
                    </TableCell>

                    {/* Total en Soles */}
                    <TableCell className="text-right font-mono text-sm font-bold text-slate-900">
                      S/. {venta.total.toFixed(2)}
                    </TableCell>

                    {/* Acción: Botón Ver Recibo */}
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleVerRecibo(venta)}
                        className="h-8 gap-1.5 text-xs font-semibold rounded-xl border-slate-200 text-[#1a365d] hover:bg-slate-100 hover:text-[#319795] transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5 text-[#319795]" />
                        <span>Ver Recibo</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Modal Vista Previa del Recibo / Ticket */}
      <ReciboModal
        isOpen={isReceiptModalOpen}
        onClose={() => {
          setIsReceiptModalOpen(false);
          setSelectedVentaForReceipt(null);
        }}
        venta={selectedVentaForReceipt}
      />
    </div>
  );
}
