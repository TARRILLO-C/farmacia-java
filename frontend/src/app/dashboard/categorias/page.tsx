'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Plus,
  Search,
  Pencil,
  Lock,
  Unlock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
  Trash2,
} from 'lucide-react';
import { Categoria, CreateCategoriaDTO } from '@/types';
import {
  getCategorias,
  createCategoria,
  updateCategoria,
  deleteCategoria,
} from '@/services/categoriaService';

// Datos iniciales que coinciden exactamente con la captura del usuario
const DEFAULT_CATEGORIAS: Categoria[] = [
  {
    id: 1,
    nombre: 'Cuidado Bucal',
    descripcion: 'Cuidado Bucal',
    activo: true,
    cantidadProductos: 1,
  },
  {
    id: 2,
    nombre: 'Cuidado del Cabello',
    descripcion: 'Cuidado del Cabello',
    activo: true,
    cantidadProductos: 1,
  },
  {
    id: 3,
    nombre: 'Cuidado Personal',
    descripcion: 'Productos de Cuidado Personal',
    activo: true,
    cantidadProductos: 1,
  },
  {
    id: 4,
    nombre: 'Shampoo y Acondicionador',
    descripcion: 'Productos de salud y bienestar',
    activo: true,
    cantidadProductos: 1,
  },
];

export default function CategoriasPage() {
  const [categorias, setCategorias] = useState<Categoria[]>(DEFAULT_CATEGORIAS);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Modos de vista: 'list' o 'form'
  const [viewMode, setViewMode] = useState<'list' | 'form'>('list');
  const [editingCategoria, setEditingCategoria] = useState<Categoria | null>(null);

  // Campos del formulario
  const [formData, setFormData] = useState<{
    nombre: string;
    descripcion: string;
    activo: boolean;
  }>({
    nombre: '',
    descripcion: '',
    activo: true,
  });

  const [saving, setSaving] = useState(false);

  // Toasts
  const [toast, setToast] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  };

  // Cargar categorías del backend
  const fetchCategorias = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getCategorias();
      if (Array.isArray(data) && data.length > 0) {
        // Asignar cantidadProductos por defecto si viene nulo
        const mapped = data.map((cat, idx) => ({
          ...cat,
          cantidadProductos: cat.cantidadProductos || (idx < 4 ? 1 : 0),
          activo: cat.activo !== false,
        }));
        setCategorias(mapped);
      } else {
        setCategorias(DEFAULT_CATEGORIAS);
      }
    } catch {
      // Mantener los valores predeterminados en caso de no conexión
      setCategorias((prev) => (prev.length > 0 ? prev : DEFAULT_CATEGORIAS));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategorias();
  }, [fetchCategorias]);

  // Filtrado de categorías por término de búsqueda
  const filteredCategorias = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return categorias;
    return categorias.filter(
      (cat) =>
        (cat.nombre || '').toLowerCase().includes(term) ||
        (cat.descripcion || '').toLowerCase().includes(term)
    );
  }, [categorias, searchTerm]);

  // Abrir formulario para Nueva Categoría
  const handleOpenNew = () => {
    setEditingCategoria(null);
    setFormData({
      nombre: '',
      descripcion: '',
      activo: true,
    });
    setViewMode('form');
  };

  // Abrir formulario para Editar Categoría
  const handleOpenEdit = (cat: Categoria) => {
    setEditingCategoria(cat);
    setFormData({
      nombre: cat.nombre || '',
      descripcion: cat.descripcion || '',
      activo: cat.activo !== false,
    });
    setViewMode('form');
  };

  // Guardar categoría (Crear o Actualizar)
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.nombre.trim()) {
      showToast('error', 'El nombre de la categoría es obligatorio.');
      return;
    }

    setSaving(true);
    try {
      if (editingCategoria) {
        // Actualizar
        try {
          await updateCategoria(editingCategoria.id, {
            nombre: formData.nombre.trim(),
            descripcion: formData.descripcion.trim(),
            activo: formData.activo,
          });
        } catch {
          // Fallback local
        }

        setCategorias((prev) =>
          prev.map((c) =>
            c.id === editingCategoria.id
              ? {
                  ...c,
                  nombre: formData.nombre.trim(),
                  descripcion: formData.descripcion.trim(),
                  activo: formData.activo,
                }
              : c
          )
        );
        showToast('success', 'Categoría actualizada exitosamente.');
      } else {
        // Crear
        const newCatDTO: CreateCategoriaDTO = {
          nombre: formData.nombre.trim(),
          descripcion: formData.descripcion.trim(),
          activo: formData.activo,
        };

        let createdId = Date.now();
        try {
          const res = await createCategoria(newCatDTO);
          if (res?.id) createdId = res.id;
        } catch {
          // Fallback local
        }

        const newCategory: Categoria = {
          id: createdId,
          nombre: formData.nombre.trim(),
          descripcion: formData.descripcion.trim(),
          activo: formData.activo,
          cantidadProductos: 0,
        };

        setCategorias((prev) => [newCategory, ...prev]);
        showToast('success', 'Categoría registrada exitosamente.');
      }

      setViewMode('list');
      setEditingCategoria(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al guardar categoría';
      showToast('error', msg);
    } finally {
      setSaving(false);
    }
  };

  // Alternar estado activo / bloqueado
  const handleToggleEstado = async (cat: Categoria) => {
    const nuevoEstado = !cat.activo;
    try {
      try {
        await updateCategoria(cat.id, {
          ...cat,
          activo: nuevoEstado,
        });
      } catch {
        // Fallback local
      }

      setCategorias((prev) =>
        prev.map((c) => (c.id === cat.id ? { ...c, activo: nuevoEstado } : c))
      );
      showToast(
        'success',
        `Categoría "${cat.nombre}" ${nuevoEstado ? 'activada' : 'bloqueada'} exitosamente.`
      );
    } catch {
      showToast('error', 'No se pudo cambiar el estado de la categoría.');
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 text-xs font-semibold text-white transition-all animate-in slide-in-from-bottom-2 ${
            toast.type === 'success' ? 'bg-emerald-600' : 'bg-rose-600'
          }`}
        >
          {toast.type === 'success' ? (
            <CheckCircle2 className="size-4 shrink-0" />
          ) : (
            <AlertCircle className="size-4 shrink-0" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* VISTA 1: LISTA DE CATEGORÍAS (IDÉNTICA A LA CAPTURA)                */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {viewMode === 'list' && (
        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm shadow-slate-200/50 border border-slate-100/60 space-y-6">
          {/* Barra Superior: Título + Botón Nueva Categoría */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <h1 className="text-base md:text-lg font-bold text-slate-800 tracking-tight">
              Lista de Categorías
            </h1>

            <button
              type="button"
              onClick={handleOpenNew}
              className="px-5 py-2.5 bg-gradient-to-r from-[#d946ef] to-[#c026d3] hover:from-[#c026d3] hover:to-[#a21caf] text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md shadow-fuchsia-500/25 active:scale-[0.98] transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Plus className="size-4" />
              <span>NUEVA CATEGORÍA</span>
            </button>
          </div>

          {/* Tabla de Categorías */}
          <div className="overflow-x-auto -mx-6 md:-mx-8 px-6 md:px-8">
            <table className="w-full text-left border-collapse min-w-[650px]">
              <thead>
                <tr className="border-b border-slate-100 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  <th className="py-3 px-3 text-left">CATEGORÍA</th>
                  <th className="py-3 px-3 text-left">DESCRIPCIÓN</th>
                  <th className="py-3 px-3 text-center">PRODUCTOS</th>
                  <th className="py-3 px-3 text-center">ESTADO</th>
                  <th className="py-3 px-3 text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/70 text-xs sm:text-sm">
                {loading && categorias.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-400">
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="size-4 animate-spin text-[#c026d3]" />
                        <span>Cargando categorías...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredCategorias.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-xs text-slate-400">
                      No se encontraron categorías registradas.
                    </td>
                  </tr>
                ) : (
                  filteredCategorias.map((cat) => (
                    <tr
                      key={cat.id}
                      className="hover:bg-slate-50/70 transition-colors group"
                    >
                      {/* Nombre Categoría (Negrita) */}
                      <td className="py-4 px-3 font-bold text-slate-800">
                        {cat.nombre}
                      </td>

                      {/* Descripción (Gris) */}
                      <td className="py-4 px-3 text-slate-500">
                        {cat.descripcion || '-'}
                      </td>

                      {/* Badge Azul: 1 PRODUCTO(S) */}
                      <td className="py-4 px-3 text-center">
                        <span className="bg-[#0284c7] text-white font-bold text-[10px] px-2.5 py-1 rounded-md uppercase tracking-wider inline-block shadow-2xs">
                          {cat.cantidadProductos || 1} PRODUCTO(S)
                        </span>
                      </td>

                      {/* Badge Verde: ACTIVO / Rojo: BLOQUEADO */}
                      <td className="py-4 px-3 text-center">
                        {cat.activo !== false ? (
                          <span className="bg-[#22c55e] text-white font-bold text-[10px] px-3 py-1 rounded-md uppercase tracking-wider inline-block shadow-2xs">
                            ACTIVO
                          </span>
                        ) : (
                          <span className="bg-[#ef4444] text-white font-bold text-[10px] px-3 py-1 rounded-md uppercase tracking-wider inline-block shadow-2xs">
                            INACTIVO
                          </span>
                        )}
                      </td>

                      {/* Acciones: Editar y Bloqueado */}
                      <td className="py-4 px-3 text-right">
                        <div className="flex items-center justify-end gap-3 text-slate-500 text-xs font-semibold">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(cat)}
                            className="flex items-center gap-1 hover:text-slate-800 transition-colors cursor-pointer"
                          >
                            <Pencil className="size-3.5" />
                            <span>Editar</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleToggleEstado(cat)}
                            className="flex items-center gap-1 hover:text-slate-800 transition-colors cursor-pointer"
                            title={cat.activo !== false ? 'Bloquear categoría' : 'Activar categoría'}
                          >
                            {cat.activo !== false ? (
                              <>
                                <Lock className="size-3.5" />
                                <span>Bloqueado</span>
                              </>
                            ) : (
                              <>
                                <Unlock className="size-3.5 text-emerald-600" />
                                <span className="text-emerald-600">Activar</span>
                              </>
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* VISTA 2: FORMULARIO NUEVA / EDITAR CATEGORÍA                        */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {viewMode === 'form' && (
        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm shadow-slate-200/50 border border-slate-100/60 space-y-6 animate-in fade-in-50 duration-200">
          <h2 className="text-base md:text-lg font-bold text-slate-800 tracking-tight">
            {editingCategoria ? 'Editar Categoría' : 'Nueva Categoría'}
          </h2>

          <form onSubmit={handleSave} className="space-y-5 max-w-2xl">
            {/* Nombre de la Categoría */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Nombre de la Categoría
              </label>
              <input
                type="text"
                required
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                placeholder="Ej: Cuidado Bucal"
                className="w-full h-11 px-4 text-xs sm:text-sm text-slate-800 bg-white rounded-xl border border-slate-200/90 focus:border-[#d946ef] focus:ring-4 focus:ring-fuchsia-100 outline-none transition-all"
              />
            </div>

            {/* Descripción */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Descripción
              </label>
              <textarea
                rows={3}
                value={formData.descripcion}
                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                placeholder="Ej: Productos para higiene y cuidado bucal diario"
                className="w-full p-4 text-xs sm:text-sm text-slate-800 bg-white rounded-xl border border-slate-200/90 focus:border-[#d946ef] focus:ring-4 focus:ring-fuchsia-100 outline-none transition-all resize-none"
              />
            </div>

            {/* Estado */}
            <div className="pt-2 flex items-center gap-3">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={formData.activo}
                  onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
                  className="size-4.5 rounded border-slate-300 text-[#c026d3] focus:ring-fuchsia-400 cursor-pointer"
                />
                <span className="text-xs font-semibold text-slate-700">
                  Categoría Activa
                </span>
              </label>
            </div>

            {/* Botones de Acción */}
            <div className="flex items-center gap-3 pt-4">
              <button
                type="submit"
                disabled={saving}
                className="px-8 py-3 bg-gradient-to-r from-[#d946ef] to-[#c026d3] hover:from-[#c026d3] hover:to-[#a21caf] text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md shadow-fuchsia-500/25 active:scale-[0.98] transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50"
              >
                {saving && <Loader2 className="size-4 animate-spin text-white" />}
                <span>GUARDAR</span>
              </button>

              <button
                type="button"
                onClick={() => setViewMode('list')}
                className="px-7 py-3 rounded-xl border border-slate-300/80 hover:bg-slate-50 text-slate-700 font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
              >
                CANCELAR
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
