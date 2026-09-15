'use client';

import React, { useState, useEffect } from 'react';
import { Producto, CreateProductoDTO, UpdateProductoDTO, Categoria } from '@/types';
import { createProducto, updateProducto, getCategoriasParaSelector } from '@/services/productoService';
import { AppDrawer } from '@/components/common/AppDrawer';
import { Pill } from 'lucide-react';

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
  const [categoriaId, setCategoriaId] = useState<number | ''>('');
  const [laboratorio, setLaboratorio] = useState(''); // Proveedor
  const [precioCompra, setPrecioCompra] = useState<number | ''>('');
  const [precio, setPrecio] = useState<number | ''>('');
  const [descuento, setDescuento] = useState<number | ''>(0);
  const [stock, setStock] = useState<number | ''>(0);
  const [precioIncluyeIgv, setPrecioIncluyeIgv] = useState(true);

  // Categorías
  const [categorias, setCategorias] = useState<Categoria[]>(categoriasDisponibles);

  // Estado de envío
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (categoriasDisponibles && categoriasDisponibles.length > 0) {
        setCategorias(categoriasDisponibles);
      } else {
        getCategoriasParaSelector()
          .then((cats) => setCategorias(cats))
          .catch(() => {});
      }
    }
  }, [isOpen, categoriasDisponibles]);

  useEffect(() => {
    if (isOpen) {
      if (productoToEdit) {
        setCodigo(productoToEdit.codigo || '');
        setNombre(productoToEdit.nombre || '');
        setDescripcion(productoToEdit.descripcion || '');
        setCategoriaId(productoToEdit.categoriaId || '');
        setLaboratorio(productoToEdit.laboratorio || '');
        setPrecioCompra(
          productoToEdit.precioCompra !== undefined && productoToEdit.precioCompra !== null
            ? productoToEdit.precioCompra
            : ''
        );
        setPrecio(productoToEdit.precio ?? '');
        setDescuento(0);
        setStock(productoToEdit.stock ?? 0);
        setPrecioIncluyeIgv(true);
      } else {
        setCodigo('');
        setNombre('');
        setDescripcion('');
        setCategoriaId('');
        setLaboratorio('');
        setPrecioCompra('');
        setPrecio('');
        setDescuento(0);
        setStock(0);
        setPrecioIncluyeIgv(true);
      }
      setIsSubmitting(false);
    }
  }, [isOpen, productoToEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!codigo.trim() || !nombre.trim()) return;

    setIsSubmitting(true);
    try {
      const payload: CreateProductoDTO = {
        codigo: codigo.trim(),
        nombre: nombre.trim(),
        descripcion: descripcion.trim() || undefined,
        laboratorio: laboratorio.trim() || undefined,
        categoriaId: categoriaId ? Number(categoriaId) : 1,
        precio: Number(precio || 0),
        precioCompra: precioCompra !== '' ? Number(precioCompra) : undefined,
        stock: Number(stock || 0),
        stockMinimo: 5,
        activo: true,
      };

      if (productoToEdit) {
        await updateProducto(productoToEdit.id, payload as UpdateProductoDTO);
      } else {
        await createProducto(payload);
      }

      onSubmitSuccess();
      onClose();
    } catch {
      onSubmitSuccess();
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AppDrawer
      isOpen={isOpen}
      onClose={onClose}
      title={productoToEdit ? 'Editar Producto' : 'Nuevo Producto'}
      description=""
      icon={Pill}
      onSubmit={handleSubmit}
      submitText={productoToEdit ? 'GUARDAR CAMBIOS' : 'GUARDAR CAMBIOS'}
      isSubmitting={isSubmitting}
      maxWidth="max-w-4xl"
    >
      <div className="space-y-6 font-sans text-xs text-slate-700">
        
        {/* Fila 1: Código & Nombre */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <label className="block font-bold text-slate-800">Código</label>
            <input
              type="text"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
              placeholder="Código del producto"
              className="w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-white text-xs outline-none focus:border-[#0095FF] focus:ring-2 focus:ring-[#0095FF]/10 transition-all placeholder:text-slate-400"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block font-bold text-slate-800">Nombre</label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Nombre del producto"
              className="w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-white text-xs outline-none focus:border-[#0095FF] focus:ring-2 focus:ring-[#0095FF]/10 transition-all placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* Fila 2: Descripción */}
        <div className="space-y-1.5">
          <label className="block font-bold text-slate-800">Descripción</label>
          <textarea
            rows={3}
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            placeholder="Descripción del producto"
            className="w-full p-3.5 rounded-xl border border-slate-200 bg-white text-xs outline-none focus:border-[#0095FF] focus:ring-2 focus:ring-[#0095FF]/10 transition-all placeholder:text-slate-400 resize-y"
          />
        </div>

        {/* Fila 3: Categoría & Proveedor */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <label className="block font-bold text-slate-800">Categoría</label>
            <select
              value={categoriaId}
              onChange={(e) => setCategoriaId(e.target.value ? Number(e.target.value) : '')}
              className="w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-white text-xs outline-none focus:border-[#0095FF] transition-all text-slate-700"
            >
              <option value="">-- Sin categoría --</option>
              {categorias.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.nombre}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block font-bold text-slate-800">Proveedor</label>
            <select
              value={laboratorio}
              onChange={(e) => setLaboratorio(e.target.value)}
              className="w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-white text-xs outline-none focus:border-[#0095FF] transition-all text-slate-700"
            >
              <option value="">-- Seleccione --</option>
              <option value="Laboratorio Genfar">Laboratorio Genfar</option>
              <option value="Bayer">Bayer</option>
              <option value="Colgate">Colgate</option>
              <option value="Medifarma">Medifarma</option>
            </select>
          </div>
        </div>

        {/* Fila 4: Precios, Descuento, Stock */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="space-y-1.5">
            <label className="block font-bold text-slate-800">Precio de Compra</label>
            <input
              type="number"
              step="0.01"
              value={precioCompra}
              onChange={(e) => setPrecioCompra(e.target.value ? parseFloat(e.target.value) : '')}
              placeholder="0.00"
              className="w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-white text-xs outline-none focus:border-[#0095FF] transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block font-bold text-slate-800">Precio de Venta (inc. IGV)</label>
            <input
              type="number"
              step="0.01"
              value={precio}
              onChange={(e) => setPrecio(e.target.value ? parseFloat(e.target.value) : '')}
              placeholder="0.00"
              className="w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-white text-xs outline-none focus:border-[#0095FF] transition-all"
            />
            <span className="text-[11px] text-slate-400 block">Este es el precio que verá el cliente</span>
          </div>

          <div className="space-y-1.5">
            <label className="block font-bold text-slate-800">Descuento (%)</label>
            <input
              type="number"
              value={descuento}
              onChange={(e) => setDescuento(e.target.value ? parseFloat(e.target.value) : '')}
              placeholder="0"
              className="w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-white text-xs outline-none focus:border-[#0095FF] transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block font-bold text-slate-800">Stock</label>
            <input
              type="number"
              value={stock}
              onChange={(e) => setStock(e.target.value !== '' ? parseInt(e.target.value) : '')}
              placeholder="0"
              className="w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-white text-xs outline-none focus:border-[#0095FF] transition-all"
            />
          </div>
        </div>

        {/* Fila 5: IGV (18%) */}
        <div className="space-y-2 pt-2">
          <label className="block font-bold text-slate-800">IGV (18%)</label>
          <div className="flex items-center gap-3">
            <button
              type="button"
              role="switch"
              aria-checked={precioIncluyeIgv}
              onClick={() => setPrecioIncluyeIgv(!precioIncluyeIgv)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                precioIncluyeIgv ? 'bg-[#4B5E78]' : 'bg-slate-300'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                  precioIncluyeIgv ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
            <span
              onClick={() => setPrecioIncluyeIgv(!precioIncluyeIgv)}
              className="text-xs text-slate-600 font-medium cursor-pointer select-none"
            >
              El precio incluye IGV
            </span>
          </div>
          <span className="text-[11px] text-slate-400 block">
            Si está marcado, el IGV se desglosará en boletas/facturas
          </span>
        </div>

        {/* Fila 6: Añadir Nuevas Imágenes */}
        <div className="space-y-2 pt-2">
          <label className="block font-bold text-slate-800">Añadir Nuevas Imágenes</label>
          <div className="w-full h-12 px-3 rounded-xl border border-slate-200 bg-white flex items-center justify-between">
            <label className="px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 text-xs font-medium cursor-pointer hover:bg-slate-100 transition-colors">
              Elegir archivos
              <input type="file" multiple className="hidden" />
            </label>
            <span className="text-xs text-slate-400">No se ha seleccionado ningún archivo</span>
          </div>
          <span className="text-[11px] text-slate-400 block">Puedes seleccionar múltiples imágenes.</span>
        </div>

        {/* Botón Submit Magenta: GUARDAR CAMBIOS */}
        <div className="pt-4 border-t border-slate-100">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-3 rounded-xl bg-[#C026D3] hover:bg-[#A21CAF] text-white font-extrabold text-xs uppercase tracking-wider shadow-md shadow-[#C026D3]/20 transition-all cursor-pointer active:scale-[0.98]"
          >
            {isSubmitting ? 'GUARDANDO...' : 'GUARDAR CAMBIOS'}
          </button>
        </div>

      </div>
    </AppDrawer>
  );
};
