'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  Calendar,
  Printer,
  FileSpreadsheet,
  FileText,
  Filter,
  Users,
  Pill,
  ShoppingCart,
  Percent,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  CreditCard,
  Building,
  RefreshCw,
  Clock,
  Layers,
  Award,
  Inbox,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { HeaderActions } from '@/components/layout/HeaderContext';
import {
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from '@/components/ui/table';
import { Venta, Producto, Cliente, TipoCliente } from '@/types';
import { getVentas } from '@/services/ventaService';
import { getProductos } from '@/services/productoService';
import { getClientes } from '@/services/clienteService';
import RoleGuard from '@/components/auth/RoleGuard';

// Formato de moneda PEN
const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN',
    minimumFractionDigits: 2,
  }).format(val);
};

export default function ReportesPage() {
  const [period, setPeriod] = useState<'hoy' | 'semana' | 'mes' | 'anio'>('mes');
  const [activeTab, setActiveTab] = useState<'ventas' | 'productos' | 'metodos'>('ventas');
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Carga de datos reales desde las APIs del backend
  const fetchData = async () => {
    try {
      setRefreshing(true);
      const [vRes, pRes, cRes] = await Promise.allSettled([
        getVentas(),
        getProductos(),
        getClientes(),
      ]);

      if (vRes.status === 'fulfilled') {
        setVentas(Array.isArray(vRes.value) ? vRes.value : []);
      } else {
        setVentas([]);
      }
      if (pRes.status === 'fulfilled') {
        setProductos(Array.isArray(pRes.value) ? pRes.value : []);
      } else {
        setProductos([]);
      }
      if (cRes.status === 'fulfilled') {
        setClientes(Array.isArray(cRes.value) ? cRes.value : []);
      } else {
        setClientes([]);
      }
    } catch {
      setVentas([]);
      setProductos([]);
      setClientes([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filtrado de ventas por el periodo seleccionado
  const filteredVentas = useMemo(() => {
    const now = new Date();
    return ventas.filter((v) => {
      if (v.estado === 'ANULADA') return false;
      if (!v.fecha) return true;
      const d = new Date(v.fecha);
      if (isNaN(d.getTime())) return true;

      if (period === 'hoy') {
        return (
          d.getDate() === now.getDate() &&
          d.getMonth() === now.getMonth() &&
          d.getFullYear() === now.getFullYear()
        );
      } else if (period === 'semana') {
        const weekAgo = new Date(now);
        weekAgo.setDate(now.getDate() - 7);
        return d >= weekAgo;
      } else if (period === 'mes') {
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      } else if (period === 'anio') {
        return d.getFullYear() === now.getFullYear();
      }
      return true;
    });
  }, [ventas, period]);

  // Total ingresos calculados de forma 100% real
  const totalIngresos = useMemo(() => {
    return filteredVentas.reduce((acc, v) => acc + (Number(v.total) || 0), 0);
  }, [filteredVentas]);

  // Margen estimado calculado sobre ingresos reales (30%)
  const gananciaEstimada = useMemo(() => {
    return totalIngresos * 0.30;
  }, [totalIngresos]);

  // Total de transacciones reales concluidas
  const totalTransacciones = filteredVentas.length;

  // Clientes amigos / beneficiarios reales registrados
  const totalBeneficiarios = useMemo(() => {
    return clientes.filter(
      (c) => c.esClienteAmigo || c.tipoCliente === TipoCliente.BENEFICIARIO
    ).length;
  }, [clientes]);

  // Porcentaje de transacciones fidelizadas reales
  const ventasFidelizadas = useMemo(() => {
    if (totalTransacciones === 0) return 0;
    const count = filteredVentas.filter(
      (v) => Boolean(v.cliente) || (v.descuentoTotal && Number(v.descuentoTotal) > 0)
    ).length;
    return Math.round((count / totalTransacciones) * 100);
  }, [filteredVentas, totalTransacciones]);

  // Ranking dinámico de fármacos vendidos en el periodo
  const topMedicamentos = useMemo(() => {
    if (filteredVentas.length === 0) return [];

    const productMap = new Map<number, Producto>();
    productos.forEach((p) => productMap.set(p.id, p));

    const statsMap = new Map<
      number,
      { unidades: number; ingresos: number; nombre: string; producto?: Producto }
    >();

    filteredVentas.forEach((v) => {
      (v.detalles || []).forEach((det) => {
        const pId = det.producto?.id || (det as any).productoId;
        if (!pId) return;

        const current = statsMap.get(pId) || {
          unidades: 0,
          ingresos: 0,
          nombre: det.producto?.nombre || `Producto #${pId}`,
          producto: det.producto || productMap.get(pId),
        };

        current.unidades += Number(det.cantidad) || 0;
        const sub =
          Number(det.subtotal) ||
          (Number(det.cantidad || 0) * Number(det.precioUnitario || 0));
        current.ingresos += sub;

        if (!current.producto && productMap.has(pId)) {
          current.producto = productMap.get(pId);
        }
        statsMap.set(pId, current);
      });
    });

    const list = Array.from(statsMap.values())
      .sort((a, b) => b.unidades - a.unidades)
      .slice(0, 10);

    return list.map((item, idx) => {
      const prod = item.producto;
      return {
        pos: idx + 1,
        nombre: prod?.nombre || item.nombre,
        principio: prod?.principioActivo || prod?.descripcion || 'No especificado',
        laboratorio: prod?.laboratorio || 'N/A',
        categoria: prod?.categoria?.nombre || 'General',
        unidades: item.unidades,
        ingresos: item.ingresos,
        stock: prod?.stock ?? 0,
        requiereReceta: Boolean(prod?.requiereReceta),
      };
    });
  }, [filteredVentas, productos]);

  // Medios de pago calculados 100% dinámicos
  const metodosPago = useMemo(() => {
    if (filteredVentas.length === 0 || totalIngresos === 0) {
      return [];
    }

    const configMetodos: Record<string, { label: string; color: string }> = {
      EFECTIVO: { label: 'Efectivo en Mostrador', color: 'bg-emerald-600' },
      TARJETA_DEBITO: { label: 'Tarjeta de Débito (POS)', color: 'bg-[#1a365d]' },
      TARJETA_CREDITO: { label: 'Tarjeta de Crédito (POS)', color: 'bg-indigo-600' },
      TARJETA: { label: 'Tarjetas Débito / Crédito', color: 'bg-[#1a365d]' },
      YAPE: { label: 'Billetera Digital (Yape)', color: 'bg-[#319795]' },
      PLIN: { label: 'Billetera Digital (Plin)', color: 'bg-teal-500' },
      TRANSFERENCIA: { label: 'Transferencia Bancaria', color: 'bg-amber-500' },
    };

    const totalsByMethod: Record<string, number> = {};
    filteredVentas.forEach((v) => {
      const m = (v.metodoPago || 'EFECTIVO').toUpperCase();
      totalsByMethod[m] = (totalsByMethod[m] || 0) + (Number(v.total) || 0);
    });

    return Object.entries(totalsByMethod)
      .map(([metodo, monto]) => {
        const info = configMetodos[metodo] || { label: metodo, color: 'bg-slate-600' };
        const porcentaje = totalIngresos > 0 ? Math.round((monto / totalIngresos) * 100) : 0;
        return {
          nombre: info.label,
          monto,
          porcentaje,
          color: info.color,
        };
      })
      .sort((a, b) => b.monto - a.monto);
  }, [filteredVentas, totalIngresos]);

  // Ventas diarias de los últimos 7 días calculadas de la data real
  const weeklySalesData = useMemo(() => {
    const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    const days = [];
    const now = new Date();

    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      d.setHours(0, 0, 0, 0);

      const nextD = new Date(d);
      nextD.setDate(d.getDate() + 1);

      const salesInDay = ventas.filter((v) => {
        if (v.estado === 'ANULADA' || !v.fecha) return false;
        const vd = new Date(v.fecha);
        return vd >= d && vd < nextD;
      });

      const monto = salesInDay.reduce((acc, v) => acc + (Number(v.total) || 0), 0);
      days.push({
        dia: dayNames[d.getDay()],
        fecha: `${d.getDate()}/${d.getMonth() + 1}`,
        monto,
        transacciones: salesInDay.length,
      });
    }

    const maxMonto = Math.max(...days.map((d) => d.monto), 0);
    return days.map((d) => ({
      ...d,
      porcentaje: maxMonto > 0 ? Math.round((d.monto / maxMonto) * 100) : 0,
    }));
  }, [ventas]);

  // Métricas tributarias reales
  const statsTributarias = useMemo(() => {
    const boletas = filteredVentas.filter((v) => v.recibo?.tipoComprobante === 'BOLETA').length;
    const facturas = filteredVentas.filter((v) => v.recibo?.tipoComprobante === 'FACTURA').length;
    const total = filteredVentas.length;
    const igvAcumulado = filteredVentas.reduce((acc, v) => acc + (Number(v.impuesto) || 0), 0);

    return {
      boletasPct: total > 0 ? Math.round((boletas / total) * 100) : 0,
      facturasPct: total > 0 ? Math.round((facturas / total) * 100) : 0,
      boletasCount: boletas,
      facturasCount: facturas,
      igvAcumulado,
    };
  }, [filteredVentas]);

  return (
    <RoleGuard allowedRoles={['ADMIN']}>
      <div className="space-y-6">
      {/* Acciones inyectadas en la cabecera superior */}
      <HeaderActions>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchData}
          disabled={refreshing}
          className="gap-2 text-xs font-semibold rounded-xl border-slate-200 text-slate-700 hover:bg-slate-100 shadow-2xs cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-[#319795]' : ''}`} />
          <span>Actualizar Datos</span>
        </Button>

        <Button
          variant="default"
          size="sm"
          onClick={() => window.print()}
          className="gap-2 text-xs font-bold bg-[#1a365d] hover:bg-[#142a4a] text-white shadow-xs cursor-pointer"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>Imprimir / PDF</span>
        </Button>
      </HeaderActions>

      {/* Barra de Filtro de Período de Análisis */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 px-5 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div className="flex items-center gap-2.5">
          <Calendar className="w-4 h-4 text-[#319795]" />
          <span className="text-xs font-bold text-slate-800">Período de Análisis:</span>
          <span className="text-xs text-slate-400 hidden sm:inline">• Datos consolidados del ciclo</span>
        </div>

        <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold text-slate-600 border border-slate-200/80 self-start sm:self-auto">
          <button
            onClick={() => setPeriod('hoy')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              period === 'hoy' ? 'bg-white text-[#1a365d] shadow-xs font-bold' : 'hover:text-slate-900'
            }`}
          >
            Hoy
          </button>
          <button
            onClick={() => setPeriod('semana')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              period === 'semana' ? 'bg-white text-[#1a365d] shadow-xs font-bold' : 'hover:text-slate-900'
            }`}
          >
            Semana
          </button>
          <button
            onClick={() => setPeriod('mes')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              period === 'mes' ? 'bg-white text-[#1a365d] shadow-xs font-bold' : 'hover:text-slate-900'
            }`}
          >
            Mes
          </button>
          <button
            onClick={() => setPeriod('anio')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              period === 'anio' ? 'bg-white text-[#1a365d] shadow-xs font-bold' : 'hover:text-slate-900'
            }`}
          >
            Año
          </button>
        </div>
      </div>

      {/* Grid de KPIs Ejecutivos Principales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Ingresos */}
        <Card className="p-5 border-slate-200/80 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Ingresos Brutos
            </span>
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-2xl sm:text-3xl font-black text-[#1a365d] tracking-tight">
              {formatCurrency(totalIngresos)}
            </span>
            <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-500 font-medium">
              {totalTransacciones > 0 ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700 font-semibold">{totalTransacciones} ventas en periodo</span>
                </>
              ) : (
                <span>Sin ventas en este periodo</span>
              )}
            </div>
          </div>
        </Card>

        {/* Margen / Ganancia Estimada */}
        <Card className="p-5 border-slate-200/80 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Margen Neto Estimado
            </span>
            <div className="p-2.5 rounded-xl bg-teal-50 text-[#319795] border border-teal-200">
              <Percent className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-2xl sm:text-3xl font-black text-[#319795] tracking-tight">
              {formatCurrency(gananciaEstimada)}
            </span>
            <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
              <span>Margen comercial estimado ~30%</span>
            </div>
          </div>
        </Card>

        {/* Comprobantes Emitidos */}
        <Card className="p-5 border-slate-200/80 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Transacciones Concluidas
            </span>
            <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 border border-blue-200">
              <ShoppingCart className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-2xl sm:text-3xl font-black text-[#1a365d] tracking-tight">
              {totalTransacciones}
            </span>
            <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
              <span>
                Ticket prom:{' '}
                {formatCurrency(totalTransacciones > 0 ? totalIngresos / totalTransacciones : 0)}
              </span>
            </div>
          </div>
        </Card>

        {/* Beneficiarios ClienteAmigo */}
        <Card className="p-5 border-slate-200/80 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Impacto ClienteAmigo
            </span>
            <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600 border border-purple-200">
              <Sparkles className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-2xl sm:text-3xl font-black text-purple-700 tracking-tight">
              {totalBeneficiarios}
            </span>
            <div className="mt-1 flex items-center gap-1.5 text-xs text-purple-600 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{ventasFidelizadas}% de ventas fidelizadas</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Pestañas de Secciones de Reporte */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('ventas')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'ventas'
              ? 'bg-[#1a365d] text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Curva de Ventas e Ingresos</span>
        </button>
        <button
          onClick={() => setActiveTab('productos')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'productos'
              ? 'bg-[#1a365d] text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Ranking de Fármacos Top</span>
        </button>
        <button
          onClick={() => setActiveTab('metodos')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'metodos'
              ? 'bg-[#1a365d] text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>Distribución de Medios de Pago</span>
        </button>
      </div>

      {/* SECCIÓN 1: CURVA DE VENTAS Y MÉTODOS DE PAGO */}
      {activeTab === 'ventas' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Gráfico de barras de ventas por día */}
          <Card className="lg:col-span-2 border-slate-200/80 shadow-xs">
            <CardHeader className="pb-4 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base text-[#1a365d]">
                    Ventas Diarias (Últimos 7 Días)
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-500">
                    Evolución real de la recaudación registrada en el sistema
                  </CardDescription>
                </div>
                <Badge variant="teal" className="text-xs">
                  Caja Central
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              {weeklySalesData.some((d) => d.monto > 0) ? (
                <div className="h-64 flex items-end justify-between gap-3 sm:gap-6 pt-6 pb-2 px-2">
                  {weeklySalesData.map((item, idx) => (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                      <span className="text-[10px] font-mono text-slate-500 font-medium group-hover:text-[#319795] transition-colors">
                        {item.monto > 0 ? formatCurrency(item.monto).replace('PEN', '') : 'S/ 0'}
                      </span>
                      <div className="w-full bg-slate-100 rounded-xl h-full flex items-end overflow-hidden p-1">
                        <div
                          className="w-full bg-gradient-to-t from-[#1a365d] to-[#319795] rounded-lg transition-all duration-500 group-hover:brightness-110 min-h-[4px]"
                          style={{ height: `${Math.max(item.porcentaje, item.monto > 0 ? 8 : 2)}%` }}
                        />
                      </div>
                      <div className="flex flex-col items-center">
                        <span className="text-xs font-bold text-slate-700">{item.dia}</span>
                        <span className="text-[10px] text-slate-400">{item.fecha}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-64 flex flex-col items-center justify-center text-center p-6 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                  <Inbox className="w-10 h-10 text-slate-300 mb-2" />
                  <p className="text-sm font-semibold text-slate-600">Sin datos de ventas en los últimos 7 días</p>
                  <p className="text-xs text-slate-400 mt-1">Las ventas registradas en el POS se graficarán automáticamente aquí.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Distribución por Medios de Pago */}
          <Card className="border-slate-200/80 shadow-xs flex flex-col justify-between">
            <CardHeader className="pb-3 border-b border-slate-100">
              <CardTitle className="text-base text-[#1a365d]">
                Medios de Cobro
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Preferencia de pago en el periodo ({filteredVentas.length} transacciones)
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4 space-y-4 flex-1">
              {metodosPago.length > 0 ? (
                metodosPago.map((m, idx) => (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-700">{m.nombre}</span>
                      <span className="font-mono font-bold text-[#1a365d]">{m.porcentaje}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className={`${m.color} h-2 rounded-full transition-all duration-500`}
                        style={{ width: `${m.porcentaje}%` }}
                      />
                    </div>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {formatCurrency(m.monto)}
                    </span>
                  </div>
                ))
              ) : (
                <div className="py-12 flex flex-col items-center justify-center text-center">
                  <CreditCard className="w-8 h-8 text-slate-300 mb-2" />
                  <p className="text-xs font-semibold text-slate-500">Sin datos de pagos</p>
                  <p className="text-[11px] text-slate-400">No hay ventas registradas en este periodo.</p>
                </div>
              )}
            </CardContent>
            <div className="p-4 pt-0 border-t border-slate-100 mt-3">
              <Link href="/dashboard/ventas">
                <Button variant="secondary" className="w-full text-xs font-bold text-[#1a365d]">
                  Auditar Comprobantes Emitidos
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      )}

      {/* SECCIÓN 2: RANKING TOP MEDICAMENTOS */}
      {activeTab === 'productos' && (
        <Card className="border-slate-200/80 shadow-xs overflow-hidden">
          <CardHeader className="border-b border-slate-100 pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base text-[#1a365d]">
                  Top Medicamentos de Mayor Rotación
                </CardTitle>
                <CardDescription className="text-xs text-slate-500">
                  Ranking de productos farmacéuticos según volumen de dispensación e ingresos generados
                </CardDescription>
              </div>
              <Badge className="bg-[#319795]/15 text-[#287e7c] border-[#319795]/30">
                Rotación Real
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {topMedicamentos.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50/70">
                    <TableHead className="w-12 text-center font-bold text-slate-700">#</TableHead>
                    <TableHead className="font-bold text-slate-700">Medicamento / Fármaco</TableHead>
                    <TableHead className="font-bold text-slate-700">Categoría & Lab</TableHead>
                    <TableHead className="font-bold text-slate-700 text-center">Control Médico</TableHead>
                    <TableHead className="font-bold text-slate-700 text-center">Unidades Vendidas</TableHead>
                    <TableHead className="font-bold text-slate-700 text-right">Recaudación</TableHead>
                    <TableHead className="font-bold text-slate-700 text-center">Stock Remanente</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topMedicamentos.map((med) => (
                    <TableRow key={med.pos} className="hover:bg-slate-50/70">
                      <TableCell className="text-center font-black text-slate-500">
                        {med.pos === 1 ? '🥇' : med.pos === 2 ? '🥈' : med.pos === 3 ? '🥉' : med.pos}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-900 text-xs sm:text-sm">{med.nombre}</span>
                          <span className="text-[11px] text-slate-500">{med.principio}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col text-xs">
                          <span className="font-medium text-slate-700">{med.categoria}</span>
                          <span className="text-[11px] text-slate-400">{med.laboratorio}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge
                          variant={med.requiereReceta ? 'destructive' : 'outline'}
                          className="text-[10px] py-0"
                        >
                          {med.requiereReceta ? 'Bajo Receta' : 'Venta Libre'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center font-mono font-bold text-slate-800 text-xs">
                        {med.unidades} uds.
                      </TableCell>
                      <TableCell className="text-right font-black text-slate-900 text-xs font-mono">
                        {formatCurrency(med.ingresos)}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge
                          variant={med.stock <= 15 ? 'destructive' : 'secondary'}
                          className="text-[10px] font-mono"
                        >
                          {med.stock} en lote
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="py-16 flex flex-col items-center justify-center text-center p-6 bg-slate-50/30">
                <Pill className="w-12 h-12 text-slate-300 mb-3" />
                <h3 className="text-sm font-bold text-slate-700">Sin datos de productos dispensados</h3>
                <p className="text-xs text-slate-500 max-w-sm mt-1">
                  Aún no se han registrado transacciones con detalle de medicamentos para el período seleccionado.
                </p>
                <div className="mt-4">
                  <Link href="/dashboard/pos">
                    <Button size="sm" className="bg-[#319795] hover:bg-[#287e7c] text-white text-xs font-bold gap-2">
                      <ShoppingCart className="w-3.5 h-3.5" />
                      <span>Registrar Nueva Venta</span>
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* SECCIÓN 3: DETALLE MEDIOS DE PAGO Y AUDITORÍA */}
      {activeTab === 'metodos' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border-slate-200/80 shadow-xs p-6 space-y-4">
            <h3 className="font-bold text-[#1a365d] text-base">
              Conciliación Bancaria y Caja de Turno
            </h3>
            <p className="text-xs text-slate-500">
              Desglose detallado de los ingresos recaudados durante el periodo seleccionado.
            </p>
            <div className="space-y-3 pt-2">
              {metodosPago.length > 0 ? (
                metodosPago.map((m, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/60 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-slate-800 block">{m.nombre}</span>
                      <span className="text-[11px] text-slate-400">Participación del {m.porcentaje}%</span>
                    </div>
                    <span className="font-mono font-extrabold text-[#1a365d] text-sm">
                      {formatCurrency(m.monto)}
                    </span>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                  <p className="text-xs font-semibold text-slate-500">Sin datos de recaudación en el periodo</p>
                </div>
              )}
            </div>
          </Card>

          <Card className="border-slate-200/80 shadow-xs p-6 flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-[#1a365d] text-base">
                Normativas de Facturación y Tributación
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Comprobantes electrónicos reglamentarios (SUNAT) emitidos en el terminal POS.
              </p>
              <div className="mt-5 space-y-3">
                <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-200 text-xs flex items-center justify-between">
                  <span className="font-semibold text-emerald-800">Boletas de Venta Emitidas</span>
                  <span className="font-bold font-mono text-emerald-900">
                    {statsTributarias.boletasCount} ({statsTributarias.boletasPct}%)
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-200 text-xs flex items-center justify-between">
                  <span className="font-semibold text-blue-800">Facturas con RUC</span>
                  <span className="font-bold font-mono text-blue-900">
                    {statsTributarias.facturasCount} ({statsTributarias.facturasPct}%)
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-100 text-xs flex items-center justify-between">
                  <span className="text-slate-600">Total Impuesto IGV Acumulado</span>
                  <span className="font-mono font-bold text-slate-900">
                    {formatCurrency(statsTributarias.igvAcumulado)}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-4">
              <Link href="/dashboard/pos">
                <Button className="w-full bg-[#319795] hover:bg-[#287e7c] text-white font-bold text-xs">
                  Ir a Caja / Nueva Venta
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      )}
      </div>
    </RoleGuard>
  );
}
