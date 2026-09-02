'use client';

import React, { useState, useEffect } from 'react';
import {
  Pill,
  Barcode,
  Tags,
  DollarSign,
  Package,
  Calendar,
  Building,
  FileText,
  AlertCircle,
  Loader2,
  CheckCircle2,
} from 'lucide-react';
import { Producto, CreateProductoDTO, UpdateProductoDTO, Categoria } from '@/types';
import { createProducto, updateProducto, getCategoriasParaSelector } from '@/services/productoService';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

interface ProductoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitSuccess: () => void;
  productoToEdit?: Producto | null;
  categoriasDisponibles?: Categoria[];
}

export const ProductoModal: React.FC<ProductoModalProps> = ({
  isOpen,
  onClose,
  onSubmitSuccess,
  productoToEdit,
  categoriasDisponibles = [],
}) => {
  // Form fields
  const [codigo, setCodigo] = useState('');
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [principioActivo, setPrincipioActivo] = useState('');
  const [presentacion, setPresentacion] = useState('');
  const [laboratorio, setLaboratorio] = useState('');
  const [lote, setLote] = useState('');
  const [categoriaId, setCategoriaId] = useState<number | ''>('');
  const [precioCompra, setPrecioCompra] = useState<number | ''>('');
  const [precio, setPrecio] = useState<number | ''>('');
  const [stock, setStock] = useState<number | ''>(0);
  const [stockMinimo, setStockMinimo] = useState<number | ''>(10);
  const [fechaVencimiento, setFechaVencimiento] = useState('');
  const [requiereReceta, setRequiereReceta] = useState(false);
  const [activo, setActivo] = useState(true);

  // Categorías para el selector
  const [categorias, setCategorias] = useState<Categoria[]>(categoriasDisponibles);
  const [loadingCategorias, setLoadingCategorias] = useState(false);

  // Estado de validación y envío
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Cargar categorías si no se pasaron como prop
  useEffect(() => {
    if (isOpen) {
      if (categoriasDisponibles && categoriasDisponibles.length > 0) {
        setCategorias(categoriasDisponibles);
      } else {
        setLoadingCategorias(true);
        getCategoriasParaSelector()
          .then((cats) => setCategorias(cats))
          .catch((err) => console.error('Error al cargar categorías:', err))
          .finally(() => setLoadingCategorias(false));
      }
    }
  }, [isOpen, categoriasDisponibles]);

  // Inicializar o resetear formulario
  useEffect(() => {
    if (isOpen) {
      if (productoToEdit) {
        setCodigo(productoToEdit.codigo || '');
        setNombre(productoToEdit.nombre || '');
        setDescripcion(productoToEdit.descripcion || '');
        setPrincipioActivo(productoToEdit.principioActivo || '');
        setPresentacion(productoToEdit.presentacion || '');
        setLaboratorio(productoToEdit.laboratorio || '');
        setLote(productoToEdit.lote || '');
        setCategoriaId(productoToEdit.categoriaId || '');
        setPrecioCompra(
          productoToEdit.precioCompra !== undefined && productoToEdit.precioCompra !== null
            ? productoToEdit.precioCompra
            : ''
        );
        setPrecio(productoToEdit.precio ?? '');
        setStock(productoToEdit.stock ?? 0);
        setStockMinimo(productoToEdit.stockMinimo ?? 10);
        setFechaVencimiento(productoToEdit.fechaVencimiento || '');
        setRequiereReceta(productoToEdit.requiereReceta ?? false);
        setActivo(productoToEdit.activo ?? true);
      } else {
        setCodigo('');
        setNombre('');
        setDescripcion('');
        setPrincipioActivo('');
        setPresentacion('');
        setLaboratorio('');
        setLote('');
        setCategoriaId(categorias.length > 0 ? categorias[0].id : '');
        setPrecioCompra('');
        setPrecio('');
        setStock(0);
        setStockMinimo(10);
        setFechaVencimiento('');
        setRequiereReceta(false);
        setActivo(true);
      }
      setErrors({});
      setIsSubmitting(false);
    }
  }, [isOpen, productoToEdit, categorias]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!codigo.trim()) {
      newErrors.codigo = 'El código de barras o SKU es obligatorio.';
    } else if (codigo.trim().length < 3) {
      newErrors.codigo = 'Debe tener al menos 3 caracteres.';
    }

    if (!nombre.trim()) {
      newErrors.nombre = 'El nombre del producto es obligatorio.';
    } else if (nombre.trim().length < 3) {
      newErrors.nombre = 'Debe contener al menos 3 caracteres.';
    }

    if (!categoriaId || Number(categoriaId) <= 0) {
      newErrors.categoriaId = 'Debe seleccionar una categoría válida.';
    }

    if (precio === '' || Number(precio) <= 0) {
      newErrors.precio = 'El precio de venta debe ser mayor a 0.';
    }

    if (precioCompra !== '' && Number(precioCompra) < 0) {
      newErrors.precioCompra = 'El precio de compra no puede ser negativo.';
    }

    if (stock === '' || Number(stock) < 0) {
      newErrors.stock = 'El stock disponible debe ser 0 o superior.';
    }

    if (stockMinimo !== '' && Number(stockMinimo) < 0) {
      newErrors.stockMinimo = 'El stock mínimo no puede ser negativo.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setIsSubmitting(true);
    setErrors({});

    try {
      const payload: CreateProductoDTO = {
        codigo: codigo.trim(),
        nombre: nombre.trim(),
        descripcion: descripcion.trim() || undefined,
        principioActivo: principioActivo.trim() || undefined,
        presentacion: presentacion.trim() || undefined,
        laboratorio: laboratorio.trim() || undefined,
        lote: lote.trim() || undefined,
        categoriaId: Number(categoriaId),
        precio: Number(precio),
        precioCompra: precioCompra !== '' ? Number(precioCompra) : undefined,
        stock: Number(stock),
        stockMinimo: Number(stockMinimo || 10),
        fechaVencimiento: fechaVencimiento || undefined,
        requiereReceta,
        activo,
      };

      if (productoToEdit) {
        await updateProducto(productoToEdit.id, payload as UpdateProductoDTO);
      } else {
        await createProducto(payload);
      }

      onSubmitSuccess();
      onClose();
    } catch (err: unknown) {
      const errorMsg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Ocurrió un error al procesar la solicitud. Verifique los datos ingresados.';
      setErrors({ general: errorMsg });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl p-6">
        <DialogHeader className="space-y-2 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-teal-50 text-[#319795] border border-teal-100 shadow-xs">
              <Pill className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-[#1a365d]">
                {productoToEdit ? 'Editar Producto Farmacéutico' : 'Nuevo Producto en Inventario'}
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                {productoToEdit
                  ? `Modificando los datos del producto código ${productoToEdit.codigo}`
                  : 'Complete la ficha técnica, precios, lote y parámetros de inventario.'}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Alerta de Error General */}
        {errors.general && (
          <div className="flex items-start gap-3 p-3.5 mt-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{errors.general}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* Fila 1: Código de Barras y Categoría */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="codigo" className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <Barcode className="w-3.5 h-3.5 text-[#319795]" />
                Código de Barras / SKU <span className="text-rose-500">*</span>
              </Label>
              <Input
                id="codigo"
                placeholder="Ej. 7750123456789"
                value={codigo}
                onChange={(e) => setCodigo(e.target.value)}
                className={`h-9 text-xs rounded-xl ${errors.codigo ? 'border-rose-400 focus-visible:ring-rose-200' : ''}`}
              />
              {errors.codigo && <p className="text-[11px] text-rose-500 font-medium">{errors.codigo}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="categoriaId" className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <Tags className="w-3.5 h-3.5 text-[#319795]" />
                Categoría Farmacéutica <span className="text-rose-500">*</span>
              </Label>
              <select
                id="categoriaId"
                value={categoriaId}
                onChange={(e) => setCategoriaId(e.target.value ? Number(e.target.value) : '')}
                disabled={loadingCategorias}
                className={`flex h-9 w-full rounded-xl border bg-white px-3 py-1.5 text-xs text-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-[#319795]/20 focus:border-[#319795] disabled:bg-slate-100 disabled:opacity-50 ${
                  errors.categoriaId ? 'border-rose-400' : 'border-slate-200'
                }`}
              >
                <option value="">-- Seleccione una Categoría --</option>
                {categorias.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.nombre}
                  </option>
                ))}
              </select>
              {errors.categoriaId && <p className="text-[11px] text-rose-500 font-medium">{errors.categoriaId}</p>}
            </div>
          </div>

          {/* Fila 2: Nombre Comercial del Producto */}
          <div className="space-y-1.5">
            <Label htmlFor="nombre" className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <Pill className="w-3.5 h-3.5 text-[#319795]" />
              Nombre Comercial del Producto <span className="text-rose-500">*</span>
            </Label>
            <Input
              id="nombre"
              placeholder="Ej. Paracetamol 500mg Forte"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className={`h-9 text-xs rounded-xl ${errors.nombre ? 'border-rose-400 focus-visible:ring-rose-200' : ''}`}
            />
            {errors.nombre && <p className="text-[11px] text-rose-500 font-medium">{errors.nombre}</p>}
          </div>

          {/* Fila 3: Principio Activo y Presentación */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="principioActivo" className="text-xs font-semibold text-slate-700">
                Principio Activo
              </Label>
              <Input
                id="principioActivo"
                placeholder="Ej. Acetaminofén / Paracetamol"
                value={principioActivo}
                onChange={(e) => setPrincipioActivo(e.target.value)}
                className="h-9 text-xs rounded-xl"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="presentacion" className="text-xs font-semibold text-slate-700">
                Presentación / Forma Farmacéutica
              </Label>
              <Input
                id="presentacion"
                placeholder="Ej. Caja x 100 Tabletas / Frasco 120ml"
                value={presentacion}
                onChange={(e) => setPresentacion(e.target.value)}
                className="h-9 text-xs rounded-xl"
              />
            </div>
          </div>

          {/* Fila 4: Laboratorio y Lote */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="laboratorio" className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-[#319795]" />
                Laboratorio Fabricante
              </Label>
              <Input
                id="laboratorio"
                placeholder="Ej. Genfar, Bayer, Medifarma"
                value={laboratorio}
                onChange={(e) => setLaboratorio(e.target.value)}
                className="h-9 text-xs rounded-xl"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="lote" className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-[#319795]" />
                Número de Lote
              </Label>
              <Input
                id="lote"
                placeholder="Ej. LT-2025-08A"
                value={lote}
                onChange={(e) => setLote(e.target.value)}
                className="h-9 text-xs rounded-xl font-mono"
              />
            </div>
          </div>

          {/* Fila 5: Precios (Compra y Venta) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50/70 p-3 rounded-2xl border border-slate-100">
            <div className="space-y-1.5">
              <Label htmlFor="precioCompra" className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5 text-slate-500" />
                Precio de Compra (S/.)
              </Label>
              <Input
                id="precioCompra"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={precioCompra}
                onChange={(e) => setPrecioCompra(e.target.value ? parseFloat(e.target.value) : '')}
                className="h-9 text-xs rounded-xl font-semibold text-slate-700 bg-white"
              />
              {errors.precioCompra && <p className="text-[11px] text-rose-500">{errors.precioCompra}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="precio" className="text-xs font-bold text-[#1a365d] flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5 text-[#319795]" />
                Precio de Venta al Público (S/.) <span className="text-rose-500">*</span>
              </Label>
              <Input
                id="precio"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                value={precio}
                onChange={(e) => setPrecio(e.target.value ? parseFloat(e.target.value) : '')}
                className={`h-9 text-xs rounded-xl font-bold text-slate-900 bg-white ${
                  errors.precio ? 'border-rose-400' : 'border-slate-200'
                }`}
              />
              {errors.precio && <p className="text-[11px] text-rose-500 font-medium">{errors.precio}</p>}
            </div>
          </div>

          {/* Fila 6: Stock Disponible, Stock Mínimo y Fecha de Vencimiento */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="stock" className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <Package className="w-3.5 h-3.5 text-[#319795]" />
                Stock Actual <span className="text-rose-500">*</span>
              </Label>
              <Input
                id="stock"
                type="number"
                min="0"
                value={stock}
                onChange={(e) => setStock(e.target.value !== '' ? parseInt(e.target.value) : '')}
                className={`h-9 text-xs rounded-xl font-semibold ${errors.stock ? 'border-rose-400' : ''}`}
              />
              {errors.stock && <p className="text-[11px] text-rose-500">{errors.stock}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="stockMinimo" className="text-xs font-semibold text-slate-700">
                Alerta Stock Mínimo
              </Label>
              <Input
                id="stockMinimo"
                type="number"
                min="0"
                value={stockMinimo}
                onChange={(e) => setStockMinimo(e.target.value !== '' ? parseInt(e.target.value) : '')}
                className="h-9 text-xs rounded-xl"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="fechaVencimiento" className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#319795]" />
                Fecha Caducidad
              </Label>
              <Input
                id="fechaVencimiento"
                type="date"
                value={fechaVencimiento}
                onChange={(e) => setFechaVencimiento(e.target.value)}
                className="h-9 text-xs rounded-xl"
              />
            </div>
          </div>

          {/* Fila 7: Swtiches (Receta Médica y Activo) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3 bg-slate-50/50 rounded-2xl border border-slate-100">
            <div className="flex items-center justify-between gap-2">
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-slate-800">Venta Bajo Receta</span>
                <span className="text-[11px] text-slate-500">Exige receta médica en caja</span>
              </div>
              <Switch checked={requiereReceta} onCheckedChange={setRequiereReceta} />
            </div>

            <div className="flex items-center justify-between gap-2">
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-slate-800">Estado Activo</span>
                <span className="text-[11px] text-slate-500">Disponible para dispensación</span>
              </div>
              <Switch checked={activo} onCheckedChange={setActivo} />
            </div>
          </div>

          <DialogFooter className="gap-2 pt-4 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="h-9 text-xs rounded-xl border-slate-200"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="h-9 text-xs rounded-xl bg-[#319795] hover:bg-[#287e7c] text-white font-semibold shadow-xs"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                  Guardando...
                </>
              ) : productoToEdit ? (
                'Actualizar Producto'
              ) : (
                'Guardar Producto'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
