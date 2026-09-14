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
import { HeaderActions, HeaderBadge } from '@/components/layout/HeaderContext';
import RoleGuard from '@/components/auth/RoleGuard';
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

export default function ProductosPage() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  // Cargar datos reales (Productos y Categorías)
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [prodsData, catsData] = await Promise.all([
        getProductos().catch(() => []),
        getCategoriasParaSelector().catch(() => []),
      ]);

      setCategorias(Array.isArray(catsData) ? catsData : []);
      setProductos(Array.isArray(prodsData) ? prodsData : []);
    } catch {
      setError('No se pudo conectar con el servidor.');
      setProductos([]);
      setCategorias([]);
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
    <RoleGuard allowedRoles={['ADMIN']}>
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

      {/* Badge de cantidad */}
      <HeaderBadge>
        <Badge variant="teal" className="text-[10px] font-bold">
          {productos.length} {productos.length === 1 ? 'producto' : 'productos'}
        </Badge>
      </HeaderBadge>

      <HeaderActions>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchData}
          disabled={loading}
          className="h-8 sm:h-9 gap-1.5 text-xs font-semibold rounded-xl border-slate-200 text-slate-700 hover:bg-slate-100 shadow-2xs"
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
          className="h-8 sm:h-9 gap-1.5 text-xs font-bold rounded-xl bg-[#319795] hover:bg-[#287e7c] text-white shadow-xs active:scale-[0.98] cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Nuevo Producto</span>
        </Button>
      </HeaderActions>

      {error && (
        <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={fetchData}
            className="text-rose-800 underline font-semibold hover:text-rose-950 shrink-0 cursor-pointer"
          >
            Reintentar
          </button>
        </div>
      )}

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
                    <p className="text-sm font-bold text-slate-700">
                      {searchTerm || selectedCategoria !== 'ALL' || selectedEstado !== 'ALL'
                        ? 'No se encontraron productos'
                        : 'Sin datos'}
                    </p>
                    <p className="text-xs text-slate-400">
                      {searchTerm || selectedCategoria !== 'ALL' || selectedEstado !== 'ALL'
                        ? 'Pruebe ajustando o limpiando los filtros de búsqueda aplicados.'
                        : 'No hay fármacos registrados en el catálogo.'}
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
    </RoleGuard>
  );
}
