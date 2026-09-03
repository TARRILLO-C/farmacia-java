'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Tags,
  Plus,
  Search,
  Pencil,
  Trash2,
  AlertTriangle,
  RefreshCw,
  Package,
  Layers,
  CheckCircle2,
  X,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { Categoria } from '@/types';
import { getCategorias, deleteCategoria } from '@/services/categoriaService';
import { CategoriaModal } from '@/components/modules/categorias/CategoriaModal';
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

const DEMO_CATEGORIAS: Categoria[] = [
  {
    id: 1,
    nombre: 'Analgésicos y Antipiréticos',
    descripcion: 'Alivio del dolor de diversa etiología y reducción del cuadro febril',
    activo: true,
    cantidadProductos: 28,
  },
  {
    id: 2,
    nombre: 'Antibióticos y Antimicrobianos',
    descripcion: 'Tratamiento de infecciones bacterianas de venta bajo receta médica',
    activo: true,
    cantidadProductos: 19,
  },
  {
    id: 3,
    nombre: 'Antiinflamatorios No Esteroideos (AINEs)',
    descripcion: 'Control de procesos inflamatorios, dolores musculares y articulares',
    activo: true,
    cantidadProductos: 24,
  },
  {
    id: 4,
    nombre: 'Antihistamínicos y Antialérgicos',
    descripcion: 'Alivio sintomático de alergias estacionales, rinitis y prurito',
    activo: true,
    cantidadProductos: 15,
  },
  {
    id: 5,
    nombre: 'Suplementos y Vitaminas',
    descripcion: 'Complejos vitamínicos, minerales y estimulantes inmunitarios',
    activo: true,
    cantidadProductos: 32,
  },
  {
    id: 6,
    nombre: 'Gastrointestinales y Antiácidos',
    descripcion: 'Protectores gástricos, antiácidos y reguladores de la motilidad',
    activo: false,
    cantidadProductos: 11,
  },
];

export default function CategoriasPage() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUsingDemo, setIsUsingDemo] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [categoriaToEdit, setCategoriaToEdit] = useState<Categoria | null>(null);

  const [categoriaToDelete, setCategoriaToDelete] = useState<Categoria | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [toast, setToast] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchCategorias = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getCategorias();
      if (data && data.length > 0) {
        setCategorias(data);
        setIsUsingDemo(false);
      } else {
        setCategorias(DEMO_CATEGORIAS);
        setIsUsingDemo(true);
      }
    } catch {
      setError('Servidor Spring Boot desconectado. Visualizando datos de muestra.');
      setCategorias(DEMO_CATEGORIAS);
      setIsUsingDemo(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategorias();
  }, [fetchCategorias]);

  const filteredCategorias = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return categorias;

    return categorias.filter(
      (cat) =>
        cat.nombre.toLowerCase().includes(term) ||
        (cat.descripcion && cat.descripcion.toLowerCase().includes(term)) ||
        cat.id.toString().includes(term)
    );
  }, [categorias, searchTerm]);

  const handleOpenCreateModal = () => {
    setCategoriaToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (cat: Categoria) => {
    setCategoriaToEdit(cat);
    setIsModalOpen(true);
  };

  const handleModalSuccess = () => {
    showToast(
      'success',
      categoriaToEdit
        ? 'Categoría actualizada exitosamente.'
        : 'Nueva categoría registrada con éxito.'
    );
    fetchCategorias();
  };

  const handleConfirmDelete = async () => {
    if (!categoriaToDelete) return;

    setIsDeleting(true);
    try {
      if (!isUsingDemo) {
        await deleteCategoria(categoriaToDelete.id);
      } else {
        setCategorias((prev) => prev.filter((c) => c.id !== categoriaToDelete.id));
      }

      showToast('success', `Categoría "${categoriaToDelete.nombre}" eliminada.`);
      setCategoriaToDelete(null);
      if (!isUsingDemo) fetchCategorias();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || 'Error al eliminar categoría.';
      showToast('error', msg);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl border text-sm font-medium animate-in slide-in-from-bottom-5 duration-200 ${
            toast.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}
        >
          {toast.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          )}
          <span>{toast.message}</span>
          <button onClick={() => setToast(null)} className="p-1 hover:bg-black/5 rounded-lg ml-2">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Encabezado con Shadcn Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl md:text-2xl font-black text-[#1a365d] tracking-tight">
              Gestión de Categorías
            </h2>
            <Badge variant="teal">
              {categorias.length} {categorias.length === 1 ? 'categoría' : 'categorías'}
            </Badge>
          </div>
          <p className="text-xs md:text-sm text-slate-500 mt-1">
            Clasifica y organiza el catálogo farmacéutico para facilitar la búsqueda y facturación.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={fetchCategorias}
            title="Recargar categorías"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>

          <Button
            variant="teal"
            onClick={handleOpenCreateModal}
          >
            <Plus className="w-4 h-4" />
            <span>Nueva Categoría</span>
          </Button>
        </div>
      </div>

      {isUsingDemo && (
        <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>Aviso:</strong> {error || 'Servidor desconectado. Visualizando datos locales de demostración.'}
            </span>
          </div>
          <button
            onClick={fetchCategorias}
            className="text-amber-800 underline font-semibold hover:text-amber-950 shrink-0"
          >
            Reconectar
          </button>
        </div>
      )}

      {/* Buscador con Shadcn Input & Card */}
      <Card className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nombre, descripción o ID..."
            className="pl-10 pr-9"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="text-xs text-slate-500 font-medium">
          Mostrando <span className="font-bold text-slate-800">{filteredCategorias.length}</span> de{' '}
          <span className="font-bold text-slate-800">{categorias.length}</span> resultados
        </div>
      </Card>

      {/* Tabla Shadcn */}
      <Card className="bg-white border border-slate-200/80 shadow-xs overflow-hidden rounded-2xl">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-20">ID</TableHead>
              <TableHead>Nombre de Categoría</TableHead>
              <TableHead>Descripción</TableHead>
              <TableHead className="text-center">Fármacos Asociados</TableHead>
              <TableHead className="text-center">Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, idx) => (
                <TableRow key={idx} className="animate-pulse">
                  <TableCell><div className="h-4 w-8 bg-slate-200 rounded-md"></div></TableCell>
                  <TableCell><div className="h-4 w-40 bg-slate-200 rounded-md"></div></TableCell>
                  <TableCell><div className="h-4 w-60 bg-slate-200 rounded-md"></div></TableCell>
                  <TableCell className="text-center"><div className="h-4 w-16 bg-slate-200 rounded-md mx-auto"></div></TableCell>
                  <TableCell className="text-center"><div className="h-4 w-14 bg-slate-200 rounded-full mx-auto"></div></TableCell>
                  <TableCell className="text-right"><div className="h-4 w-16 bg-slate-200 rounded-md ml-auto"></div></TableCell>
                </TableRow>
              ))
            ) : filteredCategorias.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-12 text-center">
                  <div className="flex flex-col items-center justify-center max-w-sm mx-auto space-y-3">
                    <div className="p-3.5 rounded-2xl bg-slate-100 text-slate-400">
                      <Layers className="w-8 h-8" />
                    </div>
                    <p className="text-sm font-bold text-slate-700">No se encontraron categorías</p>
                    <p className="text-xs text-slate-400">
                      {searchTerm ? 'No hay coincidencias para el término ingresado.' : 'No hay categorías registradas.'}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredCategorias.map((cat) => (
                <TableRow key={cat.id} className="group">
                  <TableCell className="font-mono font-bold text-slate-500">
                    #{cat.id.toString().padStart(3, '0')}
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 rounded-lg bg-[#1a365d]/5 text-[#1a365d] group-hover:bg-[#319795]/10 group-hover:text-[#319795] transition-colors">
                        <Tags className="w-4 h-4" />
                      </div>
                      <span className="font-bold text-slate-800 text-sm">{cat.nombre}</span>
                    </div>
                  </TableCell>

                  <TableCell className="text-slate-500 max-w-xs truncate">
                    {cat.descripcion || <span className="text-slate-300 italic">Sin descripción</span>}
                  </TableCell>

                  <TableCell className="text-center">
                    <Badge variant="secondary" className="gap-1 font-bold">
                      <Package className="w-3 h-3 text-[#319795]" />
                      {cat.cantidadProductos ?? 0} {cat.cantidadProductos === 1 ? 'producto' : 'productos'}
                    </Badge>
                  </TableCell>

                  <TableCell className="text-center">
                    <Badge variant={cat.activo !== false ? 'emerald' : 'secondary'}>
                      {cat.activo !== false ? 'Activa' : 'Inactiva'}
                    </Badge>
                  </TableCell>

                  <TableCell className="text-right">
                    <div className="inline-flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenEditModal(cat)}
                        title="Editar categoría"
                        className="h-8 w-8 text-slate-600 hover:text-[#1a365d] hover:bg-slate-100 rounded-lg cursor-pointer"
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setCategoriaToDelete(cat)}
                        title="Eliminar categoría"
                        className="h-8 w-8 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Modal Crear / Editar con Shadcn */}
      <CategoriaModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmitSuccess={handleModalSuccess}
        categoriaToEdit={categoriaToEdit}
      />

      {/* Diálogo de Eliminación con Shadcn Dialog */}
      <Dialog open={Boolean(categoriaToDelete)} onOpenChange={(open) => !open && !isDeleting && setCategoriaToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-rose-100 text-rose-600">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <DialogTitle>¿Eliminar categoría?</DialogTitle>
                <DialogDescription>Esta acción no se puede deshacer.</DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {categoriaToDelete && (
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-1 my-2">
              <p>
                Categoría: <strong>"{categoriaToDelete.nombre}"</strong> (#{categoriaToDelete.id})
              </p>
              {categoriaToDelete.cantidadProductos && categoriaToDelete.cantidadProductos > 0 ? (
                <p className="text-rose-600 font-semibold">
                  Atención: Cuenta con {categoriaToDelete.cantidadProductos} productos asociados.
                </p>
              ) : null}
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setCategoriaToDelete(null)}
              disabled={isDeleting}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Eliminando...</span>
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  <span>Sí, Eliminar</span>
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
