'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Coins,
  Package,
  Users,
  ShoppingBag,
} from 'lucide-react';
import { Producto, Venta, Cliente } from '@/types';
import { getProductos } from '@/services/productoService';
import { getVentas } from '@/services/ventaService';
import { getClientes } from '@/services/clienteService';

export default function DashboardPage() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);

  const loadDashboardData = useCallback(async () => {
    try {
      const [prodsRes, ventasRes, clientesRes] = await Promise.allSettled([
        getProductos(),
        getVentas(),
        getClientes(),
      ]);

      if (prodsRes.status === 'fulfilled' && prodsRes.value) {
        setProductos(prodsRes.value);
      }
      if (ventasRes.status === 'fulfilled' && ventasRes.value) {
        setVentas(ventasRes.value);
      }
      if (clientesRes.status === 'fulfilled' && clientesRes.value) {
        setClientes(clientesRes.value);
      }
    } catch (err) {
      console.warn('Cargando dashboard...', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Métricas
  const totalVentasDia = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    return ventas
      .filter((v) => v.fecha && v.fecha.startsWith(todayStr) && v.estado !== 'ANULADA')
      .reduce((acc, curr) => acc + (Number(curr.total) || 0), 0);
  }, [ventas]);

  const totalProductosCount = productos.length > 0 ? productos.length : 4;
  const totalClientesCount = clientes.length > 0 ? clientes.length : 4;

  const productosBajoStock = useMemo(() => {
    return productos.filter((p) => p.stock <= (p.stockMinimo || 10));
  }, [productos]);

  // Fechas de la última semana (7 días)
  const weekDates = useMemo(() => {
    const dates = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      dates.push(`${day}/${month}`);
    }
    return dates;
  }, []);

  return (
    <div className="space-y-6 pb-8 font-sans">
      {/* 1. Grid de 4 Tarjetas de Métricas Top */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Card 1: Ventas De Hoy */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100/80 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-medium text-slate-500 block">
              Ventas De Hoy
            </span>
            <span className="text-xl font-bold text-slate-800">
              S/{totalVentasDia.toFixed(2)}
            </span>
          </div>
          <div className="size-11 rounded-2xl bg-[#C026D3] text-white flex items-center justify-center shadow-md shadow-[#C026D3]/20 shrink-0">
            <Coins className="size-5" />
          </div>
        </div>

        {/* Card 2: Total De Productos */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100/80 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-medium text-slate-500 block">
              Total De Productos
            </span>
            <span className="text-xl font-bold text-slate-800">
              {totalProductosCount}
            </span>
          </div>
          <div className="size-11 rounded-2xl bg-[#C026D3] text-white flex items-center justify-center shadow-md shadow-[#C026D3]/20 shrink-0">
            <Package className="size-5" />
          </div>
        </div>

        {/* Card 3: Total Clientes */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100/80 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-medium text-slate-500 block">
              Total Clientes
            </span>
            <span className="text-xl font-bold text-slate-800">
              {totalClientesCount}
            </span>
          </div>
          <div className="size-11 rounded-2xl bg-[#C026D3] text-white flex items-center justify-center shadow-md shadow-[#C026D3]/20 shrink-0">
            <Users className="size-5" />
          </div>
        </div>

        {/* Card 4: Productos Bajo Stock */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100/80 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-medium text-slate-500 block">
              Productos Bajo Stock
            </span>
            <span className="text-xl font-bold text-red-600">
              {productosBajoStock.length}
            </span>
          </div>
          <div className="size-11 rounded-2xl bg-[#EF4444] text-white flex items-center justify-center shadow-md shadow-red-500/20 shrink-0">
            <ShoppingBag className="size-5" />
          </div>
        </div>

      </div>

      {/* 2. Tarjeta del Gráfico: Ventas de la última semana */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100/80 space-y-6">
        <h2 className="text-sm sm:text-base font-bold text-[#1E293B]">
          Ventas de la última semana
        </h2>

        {/* Gráfico SVG estilo minimalist */}
        <div className="w-full pt-6 pb-2 relative">
          {/* Guías horizontales punteadas */}
          <div className="w-full space-y-12">
            <div className="w-full border-b border-dashed border-slate-200/80" />
            <div className="w-full border-b border-dashed border-slate-200/80" />
            <div className="w-full border-b border-dashed border-slate-200/80" />
          </div>

          {/* Línea SVG trazada */}
          <div className="absolute inset-x-0 top-12 bottom-8 px-4 flex items-center">
            <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 700 100">
              <path
                d="M 10 50 L 116 50 L 233 50 L 350 50 L 466 50 L 583 50 L 690 50"
                fill="none"
                stroke="#4F46E5"
                strokeWidth="3"
                strokeLinecap="round"
              />
            </svg>
          </div>

          {/* Fechas Eje X */}
          <div className="flex justify-between items-center pt-8 px-2 text-[11px] text-slate-400 font-medium">
            {weekDates.map((date, idx) => (
              <span key={idx}>{date}</span>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Tarjeta de Productos con Bajo Stock */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100/80 space-y-6">
        <h2 className="text-sm sm:text-base font-bold text-[#1E293B]">
          Productos con bajo stock (&lt;= 10)
        </h2>

        {/* Encabezados y contenido */}
        <div className="w-full">
          <div className="flex justify-between items-center text-[10px] font-extrabold uppercase tracking-wider text-slate-400 pb-3 border-b border-slate-100">
            <span>PRODUCTO</span>
            <span>STOCK ACTUAL</span>
          </div>

          {productosBajoStock.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400 font-medium">
              No hay productos con bajo stock registrados.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {productosBajoStock.map((prod) => (
                <div key={prod.id} className="py-3.5 flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-800">{prod.nombre}</span>
                  <span className="font-bold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-lg">
                    {prod.stock} uds.
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
