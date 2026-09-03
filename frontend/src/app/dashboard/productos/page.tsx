'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Pill,
  Plus,
  Search,
  Pencil,
  Trash2,
  AlertTriangle,
  RefreshCw,
  Package,
  Barcode,
  Tags,
  Calendar,
  DollarSign,
  AlertCircle,
  CheckCircle2,
  X,
  Clock,
  ShieldAlert,
  Archive,
  Layers,
  FileSpreadsheet,
} from 'lucide-react';
import { Producto, Categoria } from '@/types';
import { getProductos, deleteProducto, getCategoriasParaSelector } from '@/services/productoService';
import { ProductoModal } from '@/components/modules/productos/ProductoModal';
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';

// Demo data representativa para farmacias
const DEMO_CATEGORIAS: Categoria[] = [
  { id: 1, nombre: 'Analgésicos y Antipiréticos', activo: true },
  { id: 2, nombre: 'Antibióticos y Antimicrobianos', activo: true },
  { id: 3, nombre: 'Antiinflamatorios (AINEs)', activo: true },
  { id: 4, nombre: 'Antihistamínicos', activo: true },
  { id: 5, nombre: 'Gastrointestinales', activo: true },
  { id: 6, nombre: 'Suplementos y Vitaminas', activo: true },
  { id: 7, nombre: 'Respiratorios y Antitusígenos', activo: true },
];

// Generar fecha dinámica para pruebas de vencimiento
const getDynamicDate = (daysOffset: number): string => {
  const d = new Date();
  d.setDate(d.getDate() + daysOffset);
  return d.toISOString().split('T')[0];
};

const DEMO_PRODUCTOS: Producto[] = [
  {
    id: 1,
    codigo: '7750123450012',
    nombre: 'Paracetamol 500mg Forte',
    principioActivo: 'Paracetamol',
    presentacion: 'Caja x 100 Tabletas',
    laboratorio: 'Laboratorios Genfar',
    lote: 'LT-2024-81',
    fechaVencimiento: getDynamicDate(240), // Vence en 8 meses -> OK (Verde)
    precioCompra: 8.2,
    precio: 14.5,
    stock: 145,
    stockMinimo: 20,
    requiereReceta: false,
    activo: true,
    categoriaId: 1,
    categoria: DEMO_CATEGORIAS[0],
  },
  {
    id: 2,
    codigo: '7750123450029',
    nombre: 'Amoxicilina + Ácido Clavulánico 500/125mg',
    principioActivo: 'Amoxicilina / Clavulanato',
    presentacion: 'Caja x 14 Tabletas Recubiertas',
    laboratorio: 'Medifarma',
    lote: 'LT-2024-45',
    fechaVencimiento: getDynamicDate(180), // Vence en 6 meses -> OK (Verde)
    precioCompra: 18.5,
    precio: 32.0,
    stock: 64,
    stockMinimo: 15,
    requiereReceta: true,
    activo: true,
    categoriaId: 2,
    categoria: DEMO_CATEGORIAS[1],
  },
  {
    id: 3,
    codigo: '7750123450036',
    nombre: 'Ibuprofeno 400mg',
    principioActivo: 'Ibuprofeno',
    presentacion: 'Caja x 50 Cápsulas Blandas',
    laboratorio: 'Bayer Consumer',
    lote: 'LT-2023-99',
    fechaVencimiento: getDynamicDate(18), // Vence en 18 días -> Próximo a vencer (Amarillo)
    precioCompra: 9.0,
    precio: 16.5,
    stock: 35,
    stockMinimo: 10,
    requiereReceta: false,
    activo: true,
    categoriaId: 3,
    categoria: DEMO_CATEGORIAS[2],
  },
  {
    id: 4,
    codigo: '7750123450043',
    nombre: 'Loratadina 10mg',
    principioActivo: 'Loratadina',
    presentacion: 'Caja x 30 Tabletas',
    laboratorio: 'Portugal',
    lote: 'LT-2024-12',
    fechaVencimiento: getDynamicDate(300),
    precioCompra: 5.4,
    precio: 11.0,
    stock: 6, // Stock bajo <= stockMinimo -> Advertencia (Amarillo)
    stockMinimo: 12,
    requiereReceta: false,
    activo: true,
    categoriaId: 4,
    categoria: DEMO_CATEGORIAS[3],
  },
  {
    id: 5,
    codigo: '7750123450050',
    nombre: 'Azitromicina 500mg',
    principioActivo: 'Azitromicina Dihidrato',
    presentacion: 'Caja x 3 Tabletas',
    laboratorio: 'Genfar',
    lote: 'LT-2024-33',
    fechaVencimiento: getDynamicDate(150),
    precioCompra: 12.0,
    precio: 22.5,
    stock: 0, // Stock agotado -> Agotado (Rojo)
    stockMinimo: 10,
    requiereReceta: true,
    activo: true,
    categoriaId: 2,
    categoria: DEMO_CATEGORIAS[1],
  },
  {
    id: 6,
    codigo: '7750123450067',
    nombre: 'Omeprazol 20mg Cápsulas',
    principioActivo: 'Omeprazol',
    presentacion: 'Frasco x 30 Cápsulas',
    laboratorio: 'AC Farma',
    lote: 'LT-2023-11',
    fechaVencimiento: getDynamicDate(-12), // Vencido hace 12 días -> Vencido (Rojo)
    precioCompra: 7.5,
    precio: 15.0,
    stock: 18,
    stockMinimo: 10,
    requiereReceta: false,
    activo: true,
    categoriaId: 5,
    categoria: DEMO_CATEGORIAS[4],
  },
  {
    id: 7,
    codigo: '7750123450074',
    nombre: 'Redoxon Vitamina C 1000mg Efervescente',
    principioActivo: 'Ácido Ascórbico',
    presentacion: 'Tubo x 10 Tabletas Efervescentes',
    laboratorio: 'Bayer',
    lote: 'LT-2024-60',
    fechaVencimiento: getDynamicDate(400),
    precioCompra: 14.2,
    precio: 24.0,
    stock: 50,
    stockMinimo: 15,
    requiereReceta: false,
    activo: true,
    categoriaId: 6,
    categoria: DEMO_CATEGORIAS[5],
  },
  {
    id: 8,
    codigo: '7750123450081',
    nombre: 'Salbutamol Inhalador 100mcg',
    principioActivo: 'Salbutamol Sulfato',
    presentacion: 'Inhalador 200 dosis',
    laboratorio: 'GlaxoSmithKline',
    lote: 'LT-2024-77',
    fechaVencimiento: getDynamicDate(210),
    precioCompra: 16.0,
    precio: 28.5,
    stock: 22,
    stockMinimo: 8,
    requiereReceta: true,
    activo: true,
    categoriaId: 7,
    categoria: DEMO_CATEGORIAS[6],
  },
];

export default function ProductosPage() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUsingDemo, setIsUsingDemo] = useState(false);

  // Filtros combinados
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoria, setSelectedCategoria] = useState<string>('ALL');
  const [selectedEstado, setSelectedEstado] = useState<string>('ALL');

  // Modales
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [productoToEdit, setProductoToEdit] = useState<Producto | null>(null);
  const [productoToDelete, setProductoToDelete] = useState<Producto | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Notificación tipo toast
  const [toast, setToast] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  // Cargar datos (Productos y Categorías)
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [prodsData, catsData] = await Promise.all([
        getProductos().catch(() => null),
        getCategoriasParaSelector().catch(() => null),
      ]);

      // Resolver Categorías
      if (catsData && catsData.length > 0) {
        setCategorias(catsData);
      } else {
        setCategorias(DEMO_CATEGORIAS);
      }

      // Resolver Productos
      if (prodsData && prodsData.length > 0) {
        setProductos(prodsData);
        setIsUsingDemo(false);
      } else {
        setProductos(DEMO_PRODUCTOS);
        setIsUsingDemo(true);
      }
    } catch (err) {
      console.warn('Backend no disponible, usando catálogo de demostración:', err);
      setProductos(DEMO_PRODUCTOS);
      setCategorias(DEMO_CATEGORIAS);
      setIsUsingDemo(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Función para determinar el estado visual del producto
  const getEstadoProducto = (producto: Producto) => {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    // 1. Rojo: Stock agotado
    if (producto.stock <= 0) {
      return {
        tipo: 'DANGER',
        variant: 'destructive' as const,
        label: 'Agotado',
        detalle: 'Sin existencias',
      };
    }

    // 2. Rojo: Vencido / Amarillo: Próximo a vencer
    if (producto.fechaVencimiento) {
      const [year, month, day] = producto.fechaVencimiento.split('-').map(Number);
      const fechaVenc = new Date(year, month - 1, day);
      fechaVenc.setHours(0, 0, 0, 0);

      const diffTime = fechaVenc.getTime() - hoy.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays < 0) {
        return {
          tipo: 'DANGER',
          variant: 'destructive' as const,
          label: 'Vencido',
          detalle: `Expiró hace ${Math.abs(diffDays)}d`,
        };
      }

      if (diffDays <= 30) {
        return {
          tipo: 'WARNING',
          variant: 'amber' as const,
          label: `Vence en ${diffDays}d`,
          detalle: 'Caducidad próxima',
        };
      }
    }

    // 3. Amarillo: Stock bajo
    if (producto.stock <= (producto.stockMinimo || 10)) {
      return {
        tipo: 'WARNING',
        variant: 'amber' as const,
        label: 'Stock Bajo',
        detalle: `Mín: ${producto.stockMinimo}`,
      };
    }

    // 4. Verde: Stock óptimo
    return {
      tipo: 'OK',
      variant: 'emerald' as const,
      label: 'Stock OK',
      detalle: 'Existencias óptimas',
    };
  };

  // Filtrado reactivo de productos
  const filteredProductos = useMemo(() => {
    return productos.filter((prod) => {
      // Filtro por texto (Nombre, Principio Activo o Código de barras)
      const term = searchTerm.toLowerCase().trim();
      const matchSearch =
        !term ||
        prod.nombre.toLowerCase().includes(term) ||
        prod.codigo.toLowerCase().includes(term) ||
        (prod.principioActivo && prod.principioActivo.toLowerCase().includes(term)) ||
        (prod.laboratorio && prod.laboratorio.toLowerCase().includes(term));

      // Filtro por Categoría
      const matchCategoria =
        selectedCategoria === 'ALL' ||
        prod.categoriaId?.toString() === selectedCategoria;

      // Filtro por Estado (OK, WARNING, DANGER)
      const estado = getEstadoProducto(prod);
      const matchEstado =
        selectedEstado === 'ALL' || estado.tipo === selectedEstado;

      return matchSearch && matchCategoria && matchEstado;
    });
  }, [productos, searchTerm, selectedCategoria, selectedEstado]);

  // Cálculos estadísticos para las tarjetas KPI
  const stats = useMemo(() => {
    let stockOkCount = 0;
    let warningCount = 0;
    let dangerCount = 0;
    let valorTotal = 0;

    productos.forEach((p) => {
      const estado = getEstadoProducto(p);
      if (estado.tipo === 'OK') stockOkCount++;
      if (estado.tipo === 'WARNING') warningCount++;
      if (estado.tipo === 'DANGER') dangerCount++;

      const precioBase = p.precioCompra ?? p.precio;
      valorTotal += (p.stock || 0) * precioBase;
    });

    return {
      total: productos.length,
      stockOkCount,
      warningCount,
      dangerCount,
      valorTotal,
    };
  }, [productos]);

  // Handler para eliminar producto
  const handleDeleteConfirm = async () => {
    if (!productoToDelete) return;
    setIsDeleting(true);
    try {
      await deleteProducto(productoToDelete.id);
      setProductos((prev) => prev.filter((p) => p.id !== productoToDelete.id));
      showToast('success', `El producto "${productoToDelete.nombre}" ha sido eliminado.`);
      setProductoToDelete(null);
    } catch (err) {
      console.warn('Error al eliminar producto en API, aplicando localmente:', err);
      setProductos((prev) => prev.filter((p) => p.id !== productoToDelete.id));
      showToast('success', `Producto "${productoToDelete.nombre}" eliminado del catálogo.`);
      setProductoToDelete(null);
    } finally {
      setIsDeleting(false);
    }
  };

  // Formato para fechas
  const formatFecha = (fechaStr?: string) => {
    if (!fechaStr) return 'No registrada';
    try {
      const [year, month, day] = fechaStr.split('-');
      return `${day}/${month}/${year}`;
    } catch {
      return fechaStr;
    }
  };

  // Helper para nombre de categoría
  const getCategoriaNombre = (prod: Producto) => {
    if (prod.categoria?.nombre) return prod.categoria.nombre;
    const found = categorias.find((c) => c.id === prod.categoriaId);
    return found ? found.nombre : `Categoría #${prod.categoriaId}`;
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl border text-sm font-medium transition-all animate-in fade-in slide-in-from-top-4 ${
            toast.type === 'success'
              ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
              : 'bg-rose-50 text-rose-900 border-rose-200'
          }`}
        >
          {toast.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          )}
          <span>{toast.message}</span>
          <button
            onClick={() => setToast(null)}
            className="p-1 hover:bg-black/5 rounded-lg ml-2"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Cabecera Principal */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-black text-[#1a365d] tracking-tight">
              Gestión de Productos e Inventario
            </h1>
            {isUsingDemo && (
              <Badge variant="amber" className="text-[10px] uppercase font-bold">
                Modo Demostración
              </Badge>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Control de catálogo farmacéutico, existencias, precios y fechas de caducidad.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchData}
            disabled={loading}
            className="h-9 gap-2 text-xs font-semibold rounded-xl border-slate-200 text-slate-700 hover:bg-slate-100"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refrescar</span>
          </Button>

          <Button
            size="sm"
            onClick={() => {
              setProductoToEdit(null);
              setIsModalOpen(true);
            }}
            className="h-9 gap-2 text-xs font-bold rounded-xl bg-[#319795] hover:bg-[#287e7c] text-white shadow-sm active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span>Nuevo Producto</span>
          </Button>
        </div>
      </div>

      {/* Tarjetas Resumen / KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Productos */}
        <Card className="p-4 bg-white border border-slate-200/80 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Total Fármacos</span>
            <div className="p-2 rounded-xl bg-slate-100 text-[#1a365d]">
              <Pill className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-[#1a365d]">{stats.total}</span>
            <span className="text-[11px] text-slate-400">ítems registrados</span>
          </div>
        </Card>

        {/* Stock OK (Verde) */}
        <Card className="p-4 bg-white border border-emerald-100 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-800">Stock Disponible</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-700">{stats.stockOkCount}</span>
            <span className="text-[11px] text-emerald-600/80">óptimos</span>
          </div>
        </Card>

        {/* Alerta (Amarillo: Vence pronto o Stock bajo) */}
        <Card className="p-4 bg-white border border-amber-100 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-800">Próximos a Vencer / Bajo</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-amber-700">{stats.warningCount}</span>
            <span className="text-[11px] text-amber-700/80">en riesgo</span>
          </div>
        </Card>

        {/* Crítico (Rojo: Agotados o Vencidos) */}
        <Card className="p-4 bg-white border border-rose-100 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-rose-800">Agotados / Vencidos</span>
            <div className="p-2 rounded-xl bg-rose-50 text-rose-600">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-rose-700">{stats.dangerCount}</span>
            <span className="text-[11px] text-rose-600/80">atención urgente</span>
          </div>
        </Card>
      </div>

      {/* Contenedor Principal: Filtros y Tabla */}
      <Card className="bg-white border border-slate-200/80 shadow-xs rounded-2xl overflow-hidden">
        {/* Barra de Filtros Combinados */}
        <div className="p-4 border-b border-slate-100 bg-slate-50/40 flex flex-col md:flex-row items-center gap-3">
          {/* 1. Búsqueda por Nombre / Código */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Buscar por fármaco o código de barras..."
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

          {/* 2. Filtro desplegable por Categoría */}
          <div className="w-full md:w-56">
            <select
              value={selectedCategoria}
              onChange={(e) => setSelectedCategoria(e.target.value)}
              className="flex h-9 w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-[#319795]/20 focus:border-[#319795]"
            >
              <option value="ALL">Todas las Categorías</option>
              {categorias.map((cat) => (
                <option key={cat.id} value={cat.id.toString()}>
                  {cat.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* 3. Filtro desplegable por Estado Visual */}
          <div className="w-full md:w-48">
            <select
              value={selectedEstado}
              onChange={(e) => setSelectedEstado(e.target.value)}
              className="flex h-9 w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-[#319795]/20 focus:border-[#319795]"
            >
              <option value="ALL">Todos los Estados</option>
              <option value="OK">🟢 Stock Óptimo (Verde)</option>
              <option value="WARNING">🟡 Próximo a Vencer / Bajo</option>
              <option value="DANGER">🔴 Agotado / Vencido</option>
            </select>
          </div>

          {/* Contador de resultados */}
          <div className="ml-auto text-xs text-slate-500 font-medium whitespace-nowrap">
            Mostrando <span className="font-bold text-slate-800">{filteredProductos.length}</span> de{' '}
            {productos.length}
          </div>
        </div>

        {/* Tabla de Productos e Inventario */}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-36">Código / Barras</TableHead>
              <TableHead>Nombre & Presentación</TableHead>
              <TableHead>Categoría</TableHead>
              <TableHead className="text-right">P. Compra</TableHead>
              <TableHead className="text-right">P. Venta</TableHead>
              <TableHead className="text-center">Stock Disponible</TableHead>
              <TableHead className="text-center">Caducidad</TableHead>
              <TableHead className="text-center">Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading ? (
              Array.from({ length: 6 }).map((_, idx) => (
                <TableRow key={idx} className="animate-pulse">
                  <TableCell><div className="h-4 w-28 bg-slate-200 rounded-md"></div></TableCell>
                  <TableCell><div className="h-4 w-44 bg-slate-200 rounded-md"></div></TableCell>
                  <TableCell><div className="h-4 w-24 bg-slate-200 rounded-md"></div></TableCell>
                  <TableCell className="text-right"><div className="h-4 w-16 bg-slate-200 rounded-md ml-auto"></div></TableCell>
                  <TableCell className="text-right"><div className="h-4 w-16 bg-slate-200 rounded-md ml-auto"></div></TableCell>
                  <TableCell className="text-center"><div className="h-4 w-12 bg-slate-200 rounded-md mx-auto"></div></TableCell>
                  <TableCell className="text-center"><div className="h-4 w-20 bg-slate-200 rounded-md mx-auto"></div></TableCell>
                  <TableCell className="text-center"><div className="h-5 w-20 bg-slate-200 rounded-full mx-auto"></div></TableCell>
                  <TableCell className="text-right"><div className="h-6 w-16 bg-slate-200 rounded-md ml-auto"></div></TableCell>
                </TableRow>
              ))
            ) : filteredProductos.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="py-14 text-center">
                  <div className="flex flex-col items-center justify-center max-w-sm mx-auto space-y-3">
                    <div className="p-3.5 rounded-2xl bg-slate-100 text-slate-400">
                      <Archive className="w-8 h-8" />
                    </div>
                    <p className="text-sm font-bold text-slate-700">No se encontraron productos</p>
                    <p className="text-xs text-slate-400">
                      {searchTerm || selectedCategoria !== 'ALL' || selectedEstado !== 'ALL'
                        ? 'Pruebe ajustando o limpiando los filtros de búsqueda aplicados.'
                        : 'No hay fármacos registrados en el catálogo. Haga click en "Nuevo Producto" para comenzar.'}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredProductos.map((prod) => {
                const estado = getEstadoProducto(prod);

                return (
                  <TableRow key={prod.id} className="group">
                    {/* Código de barras */}
                    <TableCell>
                      <div className="flex items-center gap-1.5 font-mono text-xs font-semibold text-slate-700">
                        <Barcode className="w-3.5 h-3.5 text-slate-400" />
                        <span>{prod.codigo}</span>
                      </div>
                      {prod.lote && (
                        <span className="text-[10px] text-slate-400 block mt-0.5">
                          Lote: {prod.lote}
                        </span>
                      )}
                    </TableCell>

                    {/* Nombre y Presentación */}
                    <TableCell>
                      <div className="flex flex-col min-w-[180px]">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-900 text-sm group-hover:text-[#319795] transition-colors">
                            {prod.nombre}
                          </span>
                          {prod.requiereReceta && (
                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-50 text-amber-700 border border-amber-200">
                              RECETA
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-slate-500">
                          {prod.presentacion || prod.principioActivo || prod.laboratorio || 'Dispensación general'}
                        </span>
                      </div>
                    </TableCell>

                    {/* Categoría */}
                    <TableCell>
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 bg-slate-100/80 px-2.5 py-1 rounded-lg">
                        <Tags className="w-3 h-3 text-slate-400" />
                        {getCategoriaNombre(prod)}
                      </span>
                    </TableCell>

                    {/* Precio Compra */}
                    <TableCell className="text-right font-mono text-xs text-slate-500">
                      {prod.precioCompra !== undefined && prod.precioCompra !== null
                        ? `S/. ${prod.precioCompra.toFixed(2)}`
                        : '-'}
                    </TableCell>

                    {/* Precio Venta */}
                    <TableCell className="text-right font-mono text-sm font-bold text-slate-900">
                      S/. {prod.precio.toFixed(2)}
                    </TableCell>

                    {/* Stock disponible */}
                    <TableCell className="text-center">
                      <div className="inline-flex flex-col items-center">
                        <span
                          className={`text-sm font-extrabold ${
                            prod.stock <= 0
                              ? 'text-rose-600'
                              : prod.stock <= (prod.stockMinimo || 10)
                              ? 'text-amber-600'
                              : 'text-slate-800'
                          }`}
                        >
                          {prod.stock}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          mín: {prod.stockMinimo || 10} u.
                        </span>
                      </div>
                    </TableCell>

                    {/* Fecha de Caducidad */}
                    <TableCell className="text-center">
                      <div className="inline-flex items-center gap-1 text-xs text-slate-600 font-medium">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{formatFecha(prod.fechaVencimiento)}</span>
                      </div>
                    </TableCell>

                    {/* Indicadores visuales (Badges: Verde, Amarillo, Rojo) */}
                    <TableCell className="text-center">
                      <Badge variant={estado.variant} className="shadow-2xs text-[11px] px-2.5 py-0.5">
                        {estado.label}
                      </Badge>
                    </TableCell>

                    {/* Acciones */}
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          title="Editar producto"
                          onClick={() => {
                            setProductoToEdit(prod);
                            setIsModalOpen(true);
                          }}
                          className="h-8 w-8 text-slate-500 hover:text-[#319795] hover:bg-teal-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          title="Eliminar producto"
                          onClick={() => setProductoToDelete(prod)}
                          className="h-8 w-8 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Modal de Alta y Edición de Producto */}
      <ProductoModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setProductoToEdit(null);
        }}
        onSubmitSuccess={() => {
          fetchData();
          showToast(
            'success',
            productoToEdit
              ? 'Producto actualizado correctamente.'
              : 'Nuevo producto agregado al catálogo con éxito.'
          );
        }}
        productoToEdit={productoToEdit}
        categoriasDisponibles={categorias}
      />

      {/* Diálogo de Confirmación para Eliminar */}
      <Dialog
        open={!!productoToDelete}
        onOpenChange={(open) => !open && setProductoToDelete(null)}
      >
        <DialogContent className="sm:max-w-md rounded-2xl p-6">
          <DialogHeader className="space-y-3">
            <div className="w-11 h-11 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-slate-900">
                ¿Eliminar este producto del catálogo?
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500 mt-1">
                Esta acción dará de baja el fármaco de forma permanente. No podrá ser dispensado en el POS.
              </DialogDescription>
            </div>
          </DialogHeader>

          {productoToDelete && (
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1 my-2">
              <p className="text-xs font-bold text-slate-800">
                {productoToDelete.nombre}
              </p>
              <p className="text-[11px] text-slate-500 font-mono">
                Código: {productoToDelete.codigo} | Stock: {productoToDelete.stock} unidades
              </p>
            </div>
          )}

          <DialogFooter className="gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setProductoToDelete(null)}
              disabled={isDeleting}
              className="h-9 text-xs rounded-xl border-slate-200"
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="h-9 text-xs rounded-xl font-semibold"
            >
              {isDeleting ? 'Eliminando...' : 'Sí, eliminar producto'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
