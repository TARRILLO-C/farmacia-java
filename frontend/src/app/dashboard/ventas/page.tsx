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
  AlertCircle,
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
import { HeaderActions, HeaderBadge } from '@/components/layout/HeaderContext';
import { Card } from '@/components/ui/card';
import {
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from '@/components/ui/table';

export default function VentasPage() {
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEstado, setSelectedEstado] = useState<string>('ALL');
  const [fechaInicio, setFechaInicio] = useState<string>('');
  const [fechaFin, setFechaFin] = useState<string>('');

  // Modal de Recibo
  const [selectedVentaForReceipt, setSelectedVentaForReceipt] = useState<Venta | null>(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);

  // Cargar ventas reales desde API
  const fetchVentasData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getVentas();
      setVentas(Array.isArray(data) ? data : []);
    } catch {
      setError('No se pudo conectar con el servidor.');
      setVentas([]);
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
      const numVenta = (v.numeroVenta || v.codigoComprobante || `VTA-${v.id}`).toLowerCase();
      const numRecibo = (v.recibo?.numeroRecibo || v.recibo?.codigoComprobante || '').toLowerCase();
      const cliNombre = (v.clienteNombre || (v.cliente ? `${v.cliente.nombre} ${v.cliente.apellido || ''}` : '') || v.recibo?.clienteNombre || '').toLowerCase();
      const cliDoc = v.clienteDocumento || v.cliente?.documentoIdentidad || v.recibo?.clienteDocumento || '';

      const matchSearch =
        !term ||
        numVenta.includes(term) ||
        numRecibo.includes(term) ||
        cliNombre.includes(term) ||
        cliDoc.includes(term);

      // 2. Filtro por Estado
      const estadoActual = v.estado || 'COMPLETADA';
      const matchEstado =
        selectedEstado === 'ALL' || estadoActual === selectedEstado;

      // 3. Filtro por Rango de Fechas
      let matchFecha = true;
      const fechaVentaStr = (v.fechaVenta || v.fecha || '').split('T')[0];
      if (fechaInicio && fechaVentaStr && fechaVentaStr < fechaInicio) {
        matchFecha = false;
      }
      if (fechaFin && fechaVentaStr && fechaVentaStr > fechaFin) {
        matchFecha = false;
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
      {/* Badge y Acciones inyectadas en la cabecera superior */}
      <HeaderBadge>
        <Badge variant="teal" className="text-[10px] font-bold">
          {ventas.length} {ventas.length === 1 ? 'venta' : 'ventas'}
        </Badge>
      </HeaderBadge>

      <HeaderActions>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchVentasData}
          disabled={loading}
          className="h-8 sm:h-9 gap-1.5 text-xs font-semibold rounded-xl border-slate-200 text-slate-700 hover:bg-slate-100 shadow-2xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">Refrescar</span>
        </Button>

        <Link href="/dashboard/pos">
          <Button
            size="sm"
            className="h-8 sm:h-9 gap-1.5 text-xs font-bold rounded-xl bg-[#319795] hover:bg-[#287e7c] text-white shadow-xs cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Nueva Venta (POS)</span>
          </Button>
        </Link>
      </HeaderActions>

      {error && (
        <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={fetchVentasData}
            className="text-rose-800 underline font-semibold hover:text-rose-950 shrink-0 cursor-pointer"
          >
            Reintentar
          </button>
        </div>
      )}

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
                    <p className="text-sm font-bold text-slate-700">
                      {searchTerm || selectedEstado !== 'ALL' || fechaInicio || fechaFin
                        ? 'No se encontraron ventas'
                        : 'Sin datos'}
                    </p>
                    <p className="text-xs text-slate-400">
                      {searchTerm || selectedEstado !== 'ALL' || fechaInicio || fechaFin
                        ? 'Pruebe ajustando o limpiando los filtros de fecha y búsqueda aplicados.'
                        : 'No hay ventas registradas en el sistema.'}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredVentas.map((venta) => {
                const fechaRaw = venta.fechaVenta || venta.fecha || '';
                const { fecha, hora } = formatDateTime(fechaRaw);
                const clienteLabel =
                  venta.clienteNombre ||
                  (venta.cliente
                    ? `${venta.cliente.nombre} ${venta.cliente.apellido || ''}`.trim()
                    : venta.recibo?.clienteNombre || 'PÚBLICO GENERAL');

                const esClienteAmigo = venta.esClienteAmigo ?? (venta.cliente?.esClienteAmigo === true);
                const tipoComp = (venta as any).tipoComprobante || venta.recibo?.tipoComprobante || 'BOLETA';
                const numVentaDisplay = venta.codigoComprobante || venta.numeroVenta || `VTA-${String(venta.id).padStart(5, '0')}`;
                const metodoPagoVal = venta.metodoPago || 'EFECTIVO';
                const estadoVal = venta.estado || 'COMPLETADA';
                const totalVal = Number(venta.total || 0);

                return (
                  <TableRow key={venta.id} className="group">
                    {/* N° Venta / Recibo */}
                    <TableCell>
                      <span className="font-mono font-bold text-[#1a365d] text-xs">
                        {numVentaDisplay}
                      </span>
                      {(venta.recibo?.numeroRecibo || (venta.recibo?.codigoComprobante && venta.recibo.codigoComprobante !== numVentaDisplay)) && (
                        <span className="text-[10px] text-slate-400 block font-mono">
                          {venta.recibo.numeroRecibo || venta.recibo.codigoComprobante}
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
                        {(venta.clienteDocumento || venta.cliente?.documentoIdentidad) && (
                          <span className="text-[10px] text-slate-400 font-mono">
                            Doc: {venta.clienteDocumento || venta.cliente?.documentoIdentidad}
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
                        {renderMetodoPagoIcon(metodoPagoVal)}
                        <span>{metodoPagoVal.replace('_', ' ')}</span>
                      </div>
                    </TableCell>

                    {/* Estado */}
                    <TableCell className="text-center">
                      <Badge
                        variant={
                          estadoVal === 'COMPLETADA'
                            ? 'emerald'
                            : estadoVal === 'PENDIENTE'
                            ? 'amber'
                            : 'destructive'
                        }
                        className="text-[10px] px-2.5 py-0.5"
                      >
                        {estadoVal}
                      </Badge>
                    </TableCell>

                    {/* Total en Soles */}
                    <TableCell className="text-right font-mono text-sm font-bold text-slate-900">
                      S/. {totalVal.toFixed(2)}
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
