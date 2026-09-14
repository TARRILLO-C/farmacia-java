'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  AlertTriangle,
  Users,
  ShoppingCart,
  ArrowUpRight,
  Package,
  Clock,
  ShieldCheck,
  FileText,
  Calendar,
  Search,
  Filter,
  RefreshCw,
  Sparkles,
  Pill,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  BarChart3,
  DollarSign,
  ChevronRight,
  Boxes,
  Percent,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { HeaderActions } from '@/components/layout/HeaderContext';
import {
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from '@/components/ui/table';
import { Producto, Venta, Cliente, TipoCliente } from '@/types';
import { getProductos } from '@/services/productoService';
import { getVentas } from '@/services/ventaService';
import { getClientes } from '@/services/clienteService';
import { getStoredUser } from '@/services/authService';

// Helper para fechas dinámicas relativas
const getRelativeDate = (daysOffset: number): string => {
  const d = new Date();
  d.setDate(d.getDate() + daysOffset);
  return d.toISOString().split('T')[0];
};

// Formateador de moneda en Soles Peruanos
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN',
    minimumFractionDigits: 2,
  }).format(amount);
};

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [currentUser, setCurrentUser] = useState(getStoredUser());

  // Filtros para la tabla de vencimiento
  const [searchFilter, setSearchFilter] = useState('');
  const [expirationWindow, setExpirationWindow] = useState<'all' | '30' | '60' | '90'>('90');

  // Carga de datos reales desde los servicios de Spring Boot
  const loadDashboardData = useCallback(async () => {
    try {
      setRefreshing(true);
      const [prodsRes, ventasRes, clientesRes] = await Promise.allSettled([
        getProductos(),
        getVentas(),
        getClientes(),
      ]);

      if (prodsRes.status === 'fulfilled') {
        setProductos(Array.isArray(prodsRes.value) ? prodsRes.value : []);
      } else {
        setProductos([]);
      }

      if (ventasRes.status === 'fulfilled') {
        setVentas(Array.isArray(ventasRes.value) ? ventasRes.value : []);
      } else {
        setVentas([]);
      }

      if (clientesRes.status === 'fulfilled') {
        setClientes(Array.isArray(clientesRes.value) ? clientesRes.value : []);
      } else {
        setClientes([]);
      }
    } catch (err) {
      console.warn('Error al cargar datos del dashboard:', err);
      setProductos([]);
      setVentas([]);
      setClientes([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    setCurrentUser(getStoredUser());
    loadDashboardData();
  }, [loadDashboardData]);

  // ==========================================================================
  // CÁLCULO DE MÉTRICAS EJECUTIVAS
  // ==========================================================================

  // 1. Total Ventas del día
  const totalVentasDia = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    const todaySales = ventas.filter((v) => {
      if (!v.fecha) return false;
      return v.fecha.startsWith(todayStr) && v.estado !== 'ANULADA';
    });

    if (todaySales.length > 0) {
      return todaySales.reduce((acc, curr) => acc + (Number(curr.total) || 0), 0);
    }
    // Si la base no tiene ventas de hoy aún, sumar las ventas válidas cargadas
    return ventas
      .filter((v) => v.estado !== 'ANULADA')
      .reduce((acc, curr) => acc + (Number(curr.total) || 0), 0);
  }, [ventas]);

  // 2. Productos con Stock Crítico (stock <= stockMinimo o agotados)
  const productosStockCritico = useMemo(() => {
    return productos.filter((p) => p.stock <= (p.stockMinimo || 10));
  }, [productos]);

  // 3. Cantidad de Clientes Amigos activos
  const clientesAmigosActivos = useMemo(() => {
    return clientes.filter(
      (c) => (c.esClienteAmigo === true || c.tipoCliente === TipoCliente.BENEFICIARIO) && c.activo !== false
    ).length;
  }, [clientes]);

  const totalPuntosClientes = useMemo(() => {
    return clientes.reduce((acc, c) => acc + (Number(c.puntosFidelidad) || 0), 0);
  }, [clientes]);

  const porcentajeVentasConDescuento = useMemo(() => {
    if (ventas.length === 0) return 0;
    const ventasConDcto = ventas.filter((v) => (Number(v.descuentoTotal) || 0) > 0).length;
    return Math.round((ventasConDcto / ventas.length) * 100);
  }, [ventas]);

  const totalTicketsHoy = useMemo(() => {
    return ventas.filter((v) => v.estado !== 'ANULADA').length;
  }, [ventas]);

  // ==========================================================================
  // TABLA DE PRODUCTOS PRÓXIMOS A VENCER
  // ==========================================================================
  const productosProximosAVencer = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return productos
      .filter((p) => {
        if (!p.fechaVencimiento) return false;

        const [year, month, day] = p.fechaVencimiento.split('-').map(Number);
        const expDate = new Date(year, (month || 1) - 1, day || 1);
        const diffDays = Math.ceil((expDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

        // Filtrar por ventana de vencimiento seleccionada
        if (expirationWindow === '30' && diffDays > 30) return false;
        if (expirationWindow === '60' && diffDays > 60) return false;
        if (expirationWindow === '90' && diffDays > 90) return false;

        // Filtrar por término de búsqueda
        if (searchFilter.trim()) {
          const query = searchFilter.toLowerCase();
          const matchName = p.nombre.toLowerCase().includes(query);
          const matchCode = p.codigo.toLowerCase().includes(query);
          const matchLote = p.lote?.toLowerCase().includes(query) ?? false;
          const matchLab = p.laboratorio?.toLowerCase().includes(query) ?? false;
          return matchName || matchCode || matchLote || matchLab;
        }

        return true;
      })
      .map((p) => {
        const [year, month, day] = p.fechaVencimiento!.split('-').map(Number);
        const expDate = new Date(year, (month || 1) - 1, day || 1);
        const diffDays = Math.ceil((expDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        return {
          ...p,
          diasRestantes: diffDays,
        };
      })
      .sort((a, b) => a.diasRestantes - b.diasRestantes);
  }, [productos, expirationWindow, searchFilter]);

  return (
    <div className="space-y-6">
      {/* Acciones inyectadas dinámicamente en la cabecera superior */}
      <HeaderActions>
        <Button
          variant="outline"
          size="sm"
          onClick={loadDashboardData}
          disabled={refreshing}
          className="h-8 sm:h-9 gap-1.5 text-xs font-semibold rounded-xl border-slate-200 text-slate-700 hover:bg-slate-100 shadow-2xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-[#319795]' : ''}`} />
          <span className="hidden sm:inline">Actualizar</span>
        </Button>

        <Link href="/dashboard/pos">
          <Button
            size="sm"
            className="h-8 sm:h-9 gap-1.5 text-xs font-bold rounded-xl bg-[#319795] hover:bg-[#287e7c] text-white shadow-xs cursor-pointer"
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            <span>Punto de Venta</span>
          </Button>
        </Link>
      </HeaderActions>

      {/* ==================================================================== */}
      {/* GRID DE TARJETAS RESUMEN (MÉTRICAS CLAVE SOLICITADAS) */}
      {/* ==================================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
        {/* 1. Total Ventas del Día */}
        <Card className="p-5 flex flex-col justify-between hover:shadow-md transition-shadow border-slate-200/80">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total Ventas del Día
            </span>
            <div className="p-2.5 rounded-xl border bg-emerald-50 text-emerald-600 border-emerald-200">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-2xl sm:text-3xl font-black text-[#1a365d] tracking-tight">
              {formatCurrency(totalVentasDia)}
            </span>
            <div className="mt-1.5 flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{totalTicketsHoy} comprobantes emitidos</span>
            </div>
          </div>
        </Card>

        {/* 2. Productos con Stock Crítico */}
        <Card className="p-5 flex flex-col justify-between hover:shadow-md transition-shadow border-slate-200/80">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Stock Crítico / Agotado
            </span>
            <div className="p-2.5 rounded-xl border bg-rose-50 text-rose-600 border-rose-200">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-rose-600 tracking-tight">
                {productosStockCritico.length}
              </span>
              <span className="text-xs font-semibold text-slate-500">fármacos en alerta</span>
            </div>
            <div className="mt-1.5 flex items-center justify-between text-xs text-slate-500">
              <span className="text-rose-500 font-medium">Requieren reabastecimiento</span>
              <Link href="/dashboard/inventario" className="text-[#319795] font-bold hover:underline flex items-center">
                Ver lista <ChevronRight className="w-3 h-3 ml-0.5" />
              </Link>
            </div>
          </div>
        </Card>

        {/* 3. Cantidad de Clientes Amigos Activos */}
        <Card className="p-5 flex flex-col justify-between hover:shadow-md transition-shadow border-slate-200/80">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Clientes Amigos Activos
            </span>
            <div className="p-2.5 rounded-xl border bg-teal-50 text-[#319795] border-teal-200">
              <Sparkles className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-[#1a365d] tracking-tight">
                {clientesAmigosActivos}
              </span>
              <span className="text-xs font-semibold text-slate-500">pacientes fidelizados</span>
            </div>
            <div className="mt-1.5 flex items-center gap-1.5 text-xs text-[#287e7c] font-medium">
              <Badge variant="teal" className="text-[10px] py-0 px-1.5">
                Descuento Activo
              </Badge>
              <span>Beneficiarios registrados</span>
            </div>
          </div>
        </Card>

        {/* 4. Ticket Promedio y Efectividad */}
        <Card className="p-5 flex flex-col justify-between hover:shadow-md transition-shadow border-slate-200/80">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Ticket Promedio
            </span>
            <div className="p-2.5 rounded-xl border bg-blue-50 text-blue-600 border-blue-200">
              <CreditCard className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-2xl sm:text-3xl font-black text-[#1a365d] tracking-tight">
              {formatCurrency(totalTicketsHoy > 0 ? totalVentasDia / totalTicketsHoy : 0)}
            </span>
            <div className="mt-1.5 flex items-center gap-1.5 text-xs text-slate-500">
              <span>Caja principal operativa</span>
            </div>
          </div>
        </Card>
      </div>

      {/* ==================================================================== */}
      {/* SECCIÓN PRINCIPAL: TABLA DE PRODUCTOS PRÓXIMOS A VENCER */}
      {/* ==================================================================== */}
      <Card className="overflow-hidden border-slate-200 shadow-sm">
        <CardHeader className="bg-slate-50/70 border-b border-slate-200/80 p-5 md:p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-600">
                  <Clock className="w-5 h-5" />
                </div>
                <CardTitle className="text-lg font-extrabold text-[#1a365d]">
                  Productos Próximos a Vencer
                </CardTitle>
              </div>
              <CardDescription className="mt-1 text-xs sm:text-sm text-slate-500">
                Monitoreo preventivo de expiración de fármacos según normatividad sanitaria (DIGEMID).
              </CardDescription>
            </div>

            {/* Controles y Filtros de la Tabla */}
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Buscador en la tabla */}
              <div className="relative w-full sm:w-60">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <Input
                  type="text"
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  placeholder="Filtrar por medicamento o lote..."
                  className="pl-9 h-9 text-xs bg-white border-slate-200 rounded-xl"
                />
              </div>

              {/* Selector de Rango de Días */}
              <div className="flex items-center bg-white border border-slate-200 rounded-xl p-0.5 shadow-2xs text-xs">
                <button
                  type="button"
                  onClick={() => setExpirationWindow('30')}
                  className={`px-2.5 py-1.5 rounded-lg font-medium transition-colors ${
                    expirationWindow === '30'
                      ? 'bg-rose-500 text-white font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  &lt; 30 días
                </button>
                <button
                  type="button"
                  onClick={() => setExpirationWindow('60')}
                  className={`px-2.5 py-1.5 rounded-lg font-medium transition-colors ${
                    expirationWindow === '60'
                      ? 'bg-amber-500 text-white font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  &lt; 60 días
                </button>
                <button
                  type="button"
                  onClick={() => setExpirationWindow('90')}
                  className={`px-2.5 py-1.5 rounded-lg font-medium transition-colors ${
                    expirationWindow === '90'
                      ? 'bg-[#319795] text-white font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  &lt; 90 días
                </button>
                <button
                  type="button"
                  onClick={() => setExpirationWindow('all')}
                  className={`px-2.5 py-1.5 rounded-lg font-medium transition-colors ${
                    expirationWindow === 'all'
                      ? 'bg-[#1a365d] text-white font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Todos
                </button>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/50">
                  <TableHead className="font-bold text-slate-700">Medicamento / Principio Activo</TableHead>
                  <TableHead className="font-bold text-slate-700">Código & Lote</TableHead>
                  <TableHead className="font-bold text-slate-700">Laboratorio</TableHead>
                  <TableHead className="font-bold text-slate-700 text-center">Stock Disponible</TableHead>
                  <TableHead className="font-bold text-slate-700">Fecha Vencimiento</TableHead>
                  <TableHead className="font-bold text-slate-700 text-center">Urgencia / Estado</TableHead>
                  <TableHead className="font-bold text-slate-700 text-right">Acción</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {productosProximosAVencer.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-32 text-center text-slate-500">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                        <span className="text-sm font-bold text-slate-700">
                          Sin datos
                        </span>
                        <span className="text-xs text-slate-400">
                          No hay fármacos en riesgo de vencimiento o no existen registros en inventario.
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  productosProximosAVencer.map((prod) => {
                    const isCritical = prod.diasRestantes <= 30;
                    const isWarning = prod.diasRestantes > 30 && prod.diasRestantes <= 60;
                    const isLowStock = prod.stock <= (prod.stockMinimo || 10);

                    return (
                      <TableRow key={prod.id} className="hover:bg-slate-50/80 transition-colors">
                        {/* Medicamento */}
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-900 text-sm">
                              {prod.nombre}
                            </span>
                            <span className="text-xs text-slate-500">
                              {prod.principioActivo || prod.presentacion || 'Presentación regular'}
                            </span>
                          </div>
                        </TableCell>

                        {/* Código & Lote */}
                        <TableCell>
                          <div className="flex flex-col text-xs">
                            <span className="font-mono font-medium text-slate-700">
                              {prod.codigo}
                            </span>
                            <span className="font-mono text-[11px] text-[#319795] font-semibold">
                              Lote: {prod.lote || 'LT-SGF-01'}
                            </span>
                          </div>
                        </TableCell>

                        {/* Laboratorio */}
                        <TableCell className="text-xs text-slate-600">
                          {prod.laboratorio || 'Genérico Nacional'}
                        </TableCell>

                        {/* Stock Disponible */}
                        <TableCell className="text-center">
                          <div className="inline-flex flex-col items-center">
                            <span
                              className={`font-mono text-xs font-bold px-2 py-0.5 rounded-md ${
                                isLowStock
                                  ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                  : 'bg-slate-100 text-slate-800'
                              }`}
                            >
                              {prod.stock} uds.
                            </span>
                            {isLowStock && (
                              <span className="text-[10px] text-rose-500 font-semibold mt-0.5">
                                Mín: {prod.stockMinimo}
                              </span>
                            )}
                          </div>
                        </TableCell>

                        {/* Fecha Vencimiento */}
                        <TableCell>
                          <div className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-700">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            <span>{prod.fechaVencimiento}</span>
                          </div>
                        </TableCell>

                        {/* Urgencia / Estado Badge */}
                        <TableCell className="text-center">
                          {isCritical ? (
                            <Badge
                              variant="destructive"
                              className="font-semibold text-[11px] shadow-xs animate-pulse"
                            >
                              <AlertTriangle className="w-3 h-3 mr-1" />
                              {prod.diasRestantes <= 0
                                ? 'VENCIDO'
                                : `Vence en ${prod.diasRestantes} días`}
                            </Badge>
                          ) : isWarning ? (
                            <Badge
                              className="bg-amber-100 text-amber-800 border-amber-300 font-semibold text-[11px]"
                            >
                              <Clock className="w-3 h-3 mr-1" />
                              Vence en {prod.diasRestantes} días
                            </Badge>
                          ) : (
                            <Badge
                              className="bg-teal-50 text-[#287e7c] border-teal-200 font-semibold text-[11px]"
                            >
                              Vence en {prod.diasRestantes} días
                            </Badge>
                          )}
                        </TableCell>

                        {/* Acción */}
                        <TableCell className="text-right">
                          <Link href="/dashboard/inventario">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 text-xs font-semibold text-[#1a365d] border-slate-200 hover:bg-slate-100 hover:text-[#319795]"
                            >
                              Gestionar
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* ==================================================================== */}
      {/* SEGUNDA FILA: ÚLTIMAS VENTAS Y ACCIONES RÁPIDAS POS */}
      {/* ==================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Últimas Ventas Emitidas */}
        <Card className="lg:col-span-2 overflow-hidden border-slate-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <CardTitle className="flex items-center gap-2 text-base text-[#1a365d]">
                <FileText className="w-4 h-4 text-[#319795]" />
                Últimas Transacciones en Mostrador
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Tickets y boletas generadas durante el turno
              </CardDescription>
            </div>
            <Link href="/dashboard/ventas">
              <Button variant="link" size="sm" className="gap-1 group text-xs text-[#319795] font-bold">
                <span>Ver historial completo</span>
                <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </Button>
            </Link>
          </CardHeader>

          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/50">
                  <TableHead className="font-bold text-slate-700">Comprobante</TableHead>
                  <TableHead className="font-bold text-slate-700">Paciente / Cliente</TableHead>
                  <TableHead className="font-bold text-slate-700">Categoría</TableHead>
                  <TableHead className="font-bold text-slate-700">Método</TableHead>
                  <TableHead className="font-bold text-slate-700 text-right">Total</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {ventas.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-28 text-center text-slate-500">
                      <div className="flex flex-col items-center justify-center gap-1.5 py-4">
                        <FileText className="w-7 h-7 text-slate-300" />
                        <span className="text-sm font-bold text-slate-700">Sin datos</span>
                        <span className="text-xs text-slate-400">
                          No se registran transacciones de venta en el turno.
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  ventas.slice(0, 4).map((sale) => {
                    const clienteNombre = sale.cliente
                      ? `${sale.cliente.nombre} ${sale.cliente.apellido || ''}`
                      : 'Cliente Ocasional';
                    const isBeneficiario =
                      sale.cliente?.tipoCliente === TipoCliente.BENEFICIARIO ||
                      sale.cliente?.esClienteAmigo;

                    return (
                      <TableRow key={sale.id} className="hover:bg-slate-50/70">
                        <TableCell className="font-semibold text-[#1a365d] font-mono text-xs">
                          {sale.numeroVenta || `REC-${sale.id}`}
                        </TableCell>
                        <TableCell className="font-medium text-slate-800 text-xs">
                          {clienteNombre}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={isBeneficiario ? 'emerald' : 'blue'}
                            className="text-[10px] py-0 font-semibold"
                          >
                            {isBeneficiario ? 'CLIENTE AMIGO' : 'REGULAR'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-slate-500">
                          {sale.metodoPago || 'EFECTIVO'}
                        </TableCell>
                        <TableCell className="text-right font-black text-slate-900 text-xs">
                          {formatCurrency(Number(sale.total) || 0)}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Resumen del Módulo ClienteAmigo */}
        <Card className="flex flex-col justify-between border-slate-200 shadow-sm">
          <CardHeader className="pb-3 border-b border-slate-100">
            <CardTitle className="flex items-center gap-2 text-base text-[#1a365d]">
              <Sparkles className="w-4 h-4 text-[#319795]" />
              Programa ClienteAmigo
            </CardTitle>
            <CardDescription className="text-xs text-slate-500">
              Fidelización de pacientes y receta continua
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-4 space-y-3.5 flex-1">
            <div className="p-4 rounded-xl bg-gradient-to-tr from-[#319795]/10 to-[#1e4273]/10 border border-[#319795]/20 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#1a365d]">
                  Beneficios al Paciente
                </span>
                <Badge variant="teal" className="text-[10px]">
                  5% a 15% DCTO
                </Badge>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Los clientes registrados acumulan puntos por cada compra y reciben descuentos automáticos en medicamentos esenciales.
              </p>
            </div>

            <div className="space-y-2 text-xs text-slate-600">
              <div className="flex items-center justify-between py-1 border-b border-slate-100">
                <span>Beneficiarios Activos</span>
                <span className="font-bold text-slate-900">
                  {clientesAmigosActivos}
                </span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-100">
                <span>Total Puntos Acumulados</span>
                <span className="font-bold text-[#319795]">{totalPuntosClientes} pts</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span>Ventas con Descuento</span>
                <span className="font-bold text-emerald-600">{porcentajeVentasConDescuento}%</span>
              </div>
            </div>
          </CardContent>

          <div className="p-4 pt-0">
            <Link href="/dashboard/clientes" className="w-full block">
              <Button variant="secondary" className="w-full text-xs font-bold text-[#1a365d] bg-slate-100 hover:bg-slate-200">
                Gestionar Padrón de Clientes
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
