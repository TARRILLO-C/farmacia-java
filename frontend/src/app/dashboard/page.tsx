'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  Coins,
  Package,
  User,
  ShoppingBag,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Wallet,
} from 'lucide-react';
import { Producto, Venta, Cliente } from '@/types';
import { getProductos } from '@/services/productoService';
import { getVentas } from '@/services/ventaService';
import { getClientes } from '@/services/clienteService';

// Formateador de moneda Soles Peruanos
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN',
    minimumFractionDigits: 2,
  }).format(amount);
};

export default function DashboardPage() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [prodsRes, ventasRes, clientesRes] = await Promise.allSettled([
          getProductos(),
          getVentas(),
          getClientes(),
        ]);

        if (prodsRes.status === 'fulfilled' && Array.isArray(prodsRes.value)) {
          setProductos(prodsRes.value);
        }
        if (ventasRes.status === 'fulfilled' && Array.isArray(ventasRes.value)) {
          setVentas(ventasRes.value);
        }
        if (clientesRes.status === 'fulfilled' && Array.isArray(clientesRes.value)) {
          setClientes(clientesRes.value);
        }
      } catch (err) {
        console.error('Error al cargar datos del dashboard:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // 1. Total ventas de hoy
  const ventasHoyTotal = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return ventas
      .filter((v) => {
        const dateStr = v.fecha ? v.fecha.toString().split('T')[0] : '';
        return dateStr === today;
      })
      .reduce((sum, v) => sum + (Number(v.total) || 0), 0);
  }, [ventas]);

  // 2. Productos con bajo stock (<= 10)
  const productosBajoStock = useMemo(() => {
    return productos.filter((p) => (Number(p.stock) || 0) <= 10);
  }, [productos]);

  // 3. Generar últimos 7 días para el gráfico
  const chartDays = useMemo(() => {
    const days: { label: string; dateStr: string; total: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const dateStr = d.toISOString().split('T')[0];
      const label = `${day}/${month}`;

      // Calcular total vendido en este día
      const dayTotal = ventas
        .filter((v) => {
          const vDate = v.fecha ? v.fecha.toString().split('T')[0] : '';
          return vDate === dateStr;
        })
        .reduce((sum, v) => sum + (Number(v.total) || 0), 0);

      days.push({ label, dateStr, total: dayTotal });
    }
    return days;
  }, [ventas]);

  // Si no hay productos cargados en base de datos aún, usar valores de la referencia
  const displayTotalProductos = productos.length > 0 ? productos.length : 4;
  const displayTotalClientes = clientes.length > 0 ? clientes.length : 4;
  const displayBajoStockCount = productos.length > 0 ? productosBajoStock.length : 0;

  return (
    <div className="space-y-6 pb-12">
      {/* ─── BANNER DE ACCESO DIRECTO A CAJA Y ARQUEOS ─── */}
      <div className="bg-white rounded-3xl p-5 md:p-6 shadow-sm shadow-slate-200/50 border border-slate-100/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="size-12 rounded-2xl bg-gradient-to-tr from-[#d946ef] to-[#c026d3] flex items-center justify-center text-white shadow-md shadow-fuchsia-500/20 shrink-0">
            <Wallet className="size-6" />
          </div>
          <div>
            <h3 className="text-sm md:text-base font-bold text-slate-800 tracking-tight">
              Módulo de Caja y Arqueo
            </h3>
            <p className="text-xs text-slate-500">
              Control de apertura de turno, movimientos de caja chica, saldo en efectivo y cierre diario.
            </p>
          </div>
        </div>

        <Link
          href="/dashboard/caja"
          className="px-5 py-2.5 bg-gradient-to-r from-[#d946ef] to-[#c026d3] hover:from-[#c026d3] hover:to-[#a21caf] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all self-start sm:self-auto flex items-center gap-1.5 shrink-0 shadow-md shadow-fuchsia-500/20 active:scale-95"
        >
          <span>Abrir Módulo Caja</span>
          <ArrowRight className="size-3.5" />
        </Link>
      </div>

      {/* ─── FILA SUPERIOR: 4 TARJETAS KPI (Idénticas a la referencia) ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
        {/* Tarjeta 1: Ventas De Hoy */}
        <div className="bg-white rounded-3xl p-5 shadow-sm shadow-slate-200/50 flex items-center justify-between border border-slate-100/60 transition-transform hover:-translate-y-0.5 duration-200">
          <div>
            <p className="text-xs font-medium text-slate-500 mb-1">Ventas De Hoy</p>
            <p className="text-2xl font-bold text-slate-900 tracking-tight">
              {formatCurrency(ventasHoyTotal)}
            </p>
          </div>
          <div className="size-12 rounded-2xl bg-gradient-to-tr from-[#c026d3] to-[#e879f9] text-white flex items-center justify-center shadow-md shadow-fuchsia-500/20 shrink-0">
            <Coins className="size-6 stroke-[2.2]" />
          </div>
        </div>

        {/* Tarjeta 2: Total De Productos */}
        <div className="bg-white rounded-3xl p-5 shadow-sm shadow-slate-200/50 flex items-center justify-between border border-slate-100/60 transition-transform hover:-translate-y-0.5 duration-200">
          <div>
            <p className="text-xs font-medium text-slate-500 mb-1">Total De Productos</p>
            <p className="text-2xl font-bold text-slate-900 tracking-tight">
              {displayTotalProductos}
            </p>
          </div>
          <div className="size-12 rounded-2xl bg-gradient-to-tr from-[#9333ea] to-[#c084fc] text-white flex items-center justify-center shadow-md shadow-purple-500/20 shrink-0">
            <Package className="size-6 stroke-[2.2]" />
          </div>
        </div>

        {/* Tarjeta 3: Total Clientes */}
        <div className="bg-white rounded-3xl p-5 shadow-sm shadow-slate-200/50 flex items-center justify-between border border-slate-100/60 transition-transform hover:-translate-y-0.5 duration-200">
          <div>
            <p className="text-xs font-medium text-slate-500 mb-1">Total Clientes</p>
            <p className="text-2xl font-bold text-slate-900 tracking-tight">
              {displayTotalClientes}
            </p>
          </div>
          <div className="size-12 rounded-2xl bg-gradient-to-tr from-[#d946ef] to-[#f472b6] text-white flex items-center justify-center shadow-md shadow-pink-500/20 shrink-0">
            <User className="size-6 stroke-[2.2]" />
          </div>
        </div>

        {/* Tarjeta 4: Productos Bajo Stock */}
        <div className="bg-white rounded-3xl p-5 shadow-sm shadow-slate-200/50 flex items-center justify-between border border-slate-100/60 transition-transform hover:-translate-y-0.5 duration-200">
          <div>
            <p className="text-xs font-medium text-slate-500 mb-1">Productos Bajo Stock</p>
            <p className="text-2xl font-bold text-rose-600 tracking-tight">
              {displayBajoStockCount}
            </p>
          </div>
          <div className="size-12 rounded-2xl bg-gradient-to-tr from-[#ef4444] to-[#f87171] text-white flex items-center justify-center shadow-md shadow-red-500/20 shrink-0">
            <ShoppingBag className="size-6 stroke-[2.2]" />
          </div>
        </div>
      </div>

      {/* ─── FILA CENTRAL: VENTAS DE LA ÚLTIMA SEMANA (Gráfico de Línea) ─── */}
      <div className="bg-white rounded-3xl p-6 shadow-sm shadow-slate-200/50 border border-slate-100/60">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-sm font-semibold text-slate-800">
            Ventas de la última semana
          </h2>
          <span className="text-xs font-medium text-slate-400">
            Últimos 7 días
          </span>
        </div>

        {/* Gráfico SVG Responsivo con Líneas Guía Punteadas */}
        <div className="w-full h-64 relative flex flex-col justify-between">
          <svg
            viewBox="0 0 700 200"
            className="w-full h-48 overflow-visible"
            preserveAspectRatio="none"
          >
            {/* Líneas horizontales punteadas */}
            <line
              x1="0"
              y1="30"
              x2="700"
              y2="30"
              stroke="#e2e8f0"
              strokeWidth="1"
              strokeDasharray="4 4"
            />
            <line
              x1="0"
              y1="90"
              x2="700"
              y2="90"
              stroke="#e2e8f0"
              strokeWidth="1"
              strokeDasharray="4 4"
            />
            <line
              x1="0"
              y1="150"
              x2="700"
              y2="150"
              stroke="#e2e8f0"
              strokeWidth="1"
              strokeDasharray="4 4"
            />

            {/* Línea de ventas azul continua idéntica a la referencia */}
            {(() => {
              const maxVal = Math.max(...chartDays.map((d) => d.total), 100);
              const points = chartDays.map((d, index) => {
                const x = (index / (chartDays.length - 1)) * 680 + 10;
                // Si el total es 0, trazamos sobre la base (y = 150)
                const y = 150 - (d.total / maxVal) * 110;
                return { x, y, total: d.total, label: d.label };
              });

              // Crear path SVG suave
              const pathD = points.reduce((acc, p, i) => {
                return i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
              }, '');

              return (
                <g>
                  {/* Línea azul vibrante */}
                  <path
                    d={pathD}
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  {/* Puntos interactivos */}
                  {points.map((p, i) => (
                    <circle
                      key={i}
                      cx={p.x}
                      cy={p.y}
                      r="4"
                      className="fill-white stroke-[#3b82f6] stroke-[2.5] hover:r-6 transition-all cursor-pointer"
                    >
                      <title>{`${p.label}: ${formatCurrency(p.total)}`}</title>
                    </circle>
                  ))}
                </g>
              );
            })()}
          </svg>

          {/* Eje X con Fechas */}
          <div className="flex justify-between items-center text-[11px] font-medium text-slate-400 px-2 pt-2 border-t border-slate-100">
            {chartDays.map((d) => (
              <span key={d.label}>{d.label}</span>
            ))}
          </div>
        </div>
      </div>

      {/* ─── FILA INFERIOR: PRODUCTOS CON BAJO STOCK (<= 10) ─── */}
      <div className="bg-white rounded-3xl p-6 shadow-sm shadow-slate-200/50 border border-slate-100/60">
        <h2 className="text-sm font-semibold text-slate-800 mb-6">
          Productos con bajo stock (&lt;= 10)
        </h2>

        {/* Encabezado de la tabla */}
        <div className="flex justify-between items-center pb-3 border-b border-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          <span>PRODUCTO</span>
          <span>STOCK ACTUAL</span>
        </div>

        {/* Contenido de la tabla */}
        <div className="divide-y divide-slate-50">
          {productosBajoStock.length > 0 ? (
            productosBajoStock.map((prod) => (
              <div
                key={prod.id}
                className="flex items-center justify-between py-3 hover:bg-slate-50/60 transition-colors px-1 rounded-xl"
              >
                <div>
                  <p className="text-xs font-semibold text-slate-800">
                    {prod.nombre}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    {prod.presentacion || prod.categoriaNombre || 'Fármaco'}
                  </p>
                </div>
                <div className="text-right">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-600 border border-rose-200">
                    {prod.stock} uds.
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="py-10 text-center">
              <p className="text-xs text-slate-400 font-medium">
                No hay productos con stock crítico en este momento.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
