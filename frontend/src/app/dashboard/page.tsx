'use client';

import React from 'react';
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
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from '@/components/ui/table';

export default function DashboardPage() {
  const stats = [
    {
      title: 'Ventas de Hoy',
      value: 'S/. 2,845.50',
      change: '+12.4% vs ayer',
      trend: 'up',
      icon: TrendingUp,
      color: 'bg-emerald-50 text-emerald-600 border-emerald-200',
    },
    {
      title: 'Alertas de Stock Bajo',
      value: '4 Fármacos',
      change: 'Requieren reposición',
      trend: 'alert',
      icon: AlertTriangle,
      color: 'bg-amber-50 text-amber-600 border-amber-200',
    },
    {
      title: 'Clientes Atendidos',
      value: '38 Pacientes',
      change: '14 Beneficiarios',
      trend: 'neutral',
      icon: Users,
      color: 'bg-blue-50 text-blue-600 border-blue-200',
    },
    {
      title: 'Ventas Registradas',
      value: '42 Tickets',
      change: 'Turno Mañana/Tarde',
      trend: 'up',
      icon: ShoppingCart,
      color: 'bg-indigo-50 text-indigo-600 border-indigo-200',
    },
  ];

  const recentSales = [
    {
      id: 'REC-00104',
      cliente: 'Maria Condori Quispe',
      tipo: 'BENEFICIARIO',
      monto: 'S/. 65.50',
      metodo: 'YAPE',
      hora: '15:42',
      estado: 'COMPLETADA',
    },
    {
      id: 'REC-00103',
      cliente: 'Juan Carlos Mendoza',
      tipo: 'REGULAR',
      monto: 'S/. 124.00',
      metodo: 'TARJETA',
      hora: '15:28',
      estado: 'COMPLETADA',
    },
    {
      id: 'REC-00102',
      cliente: 'Lucia Sanchez R.',
      tipo: 'NUEVO',
      monto: 'S/. 18.20',
      metodo: 'EFECTIVO',
      hora: '14:55',
      estado: 'COMPLETADA',
    },
    {
      id: 'REC-00101',
      cliente: 'Pedro Torres Gomez',
      tipo: 'BENEFICIARIO',
      monto: 'S/. 89.90',
      metodo: 'EFECTIVO',
      hora: '14:10',
      estado: 'COMPLETADA',
    },
  ];

  const lowStockProducts = [
    {
      nombre: 'Paracetamol 500mg',
      lote: 'L-2024-88',
      stock: 6,
      minimo: 30,
      vencimiento: '11/2026',
    },
    {
      nombre: 'Amoxicilina 500mg Caps.',
      lote: 'L-2024-12',
      stock: 12,
      minimo: 40,
      vencimiento: '08/2026',
    },
    {
      nombre: 'Ibuprofeno 400mg Tab.',
      lote: 'L-2024-45',
      stock: 9,
      minimo: 25,
      vencimiento: '12/2026',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Banner Principal con Shadcn Button */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#1a365d] via-[#1e4273] to-[#319795] p-6 md:p-8 text-white shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <Badge variant="teal" className="bg-white/10 text-[#81e6d9] border-white/15">
              <ShieldCheck className="w-3.5 h-3.5 mr-1" />
              Turno Activo • Sistema Conectado
            </Badge>
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              Sistema de Gestión Farmacéutica
            </h2>
            <p className="text-sm text-slate-200">
              Dispensación de medicamentos, control de stock por lotes y facturación con diseño unificado Shadcn UI.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link href="/dashboard/pos">
              <Button variant="secondary" className="bg-white text-[#1a365d] hover:bg-slate-100 font-bold shadow-md">
                <ShoppingCart className="w-4 h-4 text-[#319795]" />
                <span>Punto de Venta</span>
              </Button>
            </Link>
            <Link href="/dashboard/inventario">
              <Button variant="outline" className="bg-[#142a4a]/80 text-white border-white/20 hover:bg-[#142a4a]">
                <Package className="w-4 h-4" />
                <span>Ver Inventario</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Grid de KPIs con Shadcn Card */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <Card key={idx} className="p-5 flex flex-col justify-between hover:shadow-md">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  {stat.title}
                </span>
                <div className={`p-2.5 rounded-xl border ${stat.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-4">
                <span className="text-2xl font-black text-[#1a365d] tracking-tight">
                  {stat.value}
                </span>
                <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                  <span>{stat.change}</span>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Secciones Inferiores con Shadcn Card & Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Últimas Ventas */}
        <Card className="lg:col-span-2 overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <CardTitle className="flex items-center gap-2 text-base">
                <FileText className="w-4 h-4 text-[#319795]" />
                Últimas Ventas Emitidas
              </CardTitle>
              <CardDescription>
                Transacciones registradas durante la jornada de hoy
              </CardDescription>
            </div>
            <Link href="/dashboard/ventas">
              <Button variant="link" size="sm" className="gap-1 group text-xs">
                <span>Ver todas</span>
                <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </Button>
            </Link>
          </CardHeader>

          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Recibo</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Método</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-center">Hora</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {recentSales.map((sale) => (
                  <TableRow key={sale.id}>
                    <TableCell className="font-semibold text-[#1a365d]">
                      {sale.id}
                    </TableCell>
                    <TableCell className="font-medium text-slate-800">
                      {sale.cliente}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          sale.tipo === 'BENEFICIARIO'
                            ? 'emerald'
                            : sale.tipo === 'REGULAR'
                            ? 'blue'
                            : 'purple'
                        }
                      >
                        {sale.tipo}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-slate-500">
                      {sale.metodo}
                    </TableCell>
                    <TableCell className="text-right font-bold text-slate-900">
                      {sale.monto}
                    </TableCell>
                    <TableCell className="text-center text-slate-400">
                      <div className="inline-flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{sale.hora}</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Alertas de Stock Crítico */}
        <Card className="flex flex-col justify-between">
          <CardHeader className="pb-3 border-b border-slate-100">
            <CardTitle className="flex items-center gap-2 text-base">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              Medicamentos por Agotarse
            </CardTitle>
            <CardDescription>
              Nivel por debajo del umbral mínimo
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-4 space-y-3.5 flex-1">
            {lowStockProducts.map((prod, index) => {
              const percentage = Math.round((prod.stock / prod.minimo) * 100);
              return (
                <div
                  key={index}
                  className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/60 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">
                      {prod.nombre}
                    </span>
                    <Badge variant="destructive" className="font-mono text-[10px]">
                      Stock: {prod.stock}
                    </Badge>
                  </div>

                  <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-rose-500 h-1.5 rounded-full transition-all"
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span>Mínimo: {prod.minimo}</span>
                    <span>Vence: {prod.vencimiento}</span>
                  </div>
                </div>
              );
            })}
          </CardContent>

          <div className="p-4 pt-0">
            <Link href="/dashboard/inventario" className="w-full block">
              <Button variant="secondary" className="w-full text-xs font-semibold">
                Gestionar Reabastecimiento
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
