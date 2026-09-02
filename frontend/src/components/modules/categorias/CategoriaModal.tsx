'use client';

import React, { useState, useEffect } from 'react';
import { Tags, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Categoria, CreateCategoriaDTO, UpdateCategoriaDTO } from '@/types';
import { createCategoria, updateCategoria } from '@/services/categoriaService';
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
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';

interface CategoriaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitSuccess: () => void;
  categoriaToEdit?: Categoria | null;
}

export const CategoriaModal: React.FC<CategoriaModalProps> = ({
  isOpen,
  onClose,
  onSubmitSuccess,
  categoriaToEdit,
}) => {
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [activo, setActivo] = useState(true);

  const [errors, setErrors] = useState<{ nombre?: string; general?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (categoriaToEdit) {
        setNombre(categoriaToEdit.nombre || '');
        setDescripcion(categoriaToEdit.descripcion || '');
        setActivo(categoriaToEdit.activo ?? true);
      } else {
        setNombre('');
        setDescripcion('');
        setActivo(true);
      }
      setErrors({});
      setIsSubmitting(false);
    }
  }, [isOpen, categoriaToEdit]);

  const validate = (): boolean => {
    const newErrors: { nombre?: string } = {};

    if (!nombre.trim()) {
      newErrors.nombre = 'El nombre de la categoría es obligatorio.';
    } else if (nombre.trim().length < 3) {
      newErrors.nombre = 'El nombre debe contener al menos 3 caracteres.';
    } else if (nombre.trim().length > 80) {
      newErrors.nombre = 'El nombre no puede exceder los 80 caracteres.';
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
      if (categoriaToEdit) {
        const updateData: UpdateCategoriaDTO = {
          nombre: nombre.trim(),
          descripcion: descripcion.trim() || undefined,
          activo,
        };
        await updateCategoria(categoriaToEdit.id, updateData);
      } else {
        const createData: CreateCategoriaDTO = {
          nombre: nombre.trim(),
          descripcion: descripcion.trim() || undefined,
          activo,
        };
        await createCategoria(createData);
      }

      onSubmitSuccess();
      onClose();
    } catch (err: unknown) {
      const errorMsg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ||
        'Ocurrió un error al procesar la categoría. Verifica la conexión con el servidor.';
      setErrors({ general: errorMsg });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isEditing = Boolean(categoriaToEdit);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg p-0 overflow-hidden" showCloseButton={false}>
        {/* Cabecera estilizada shadcn con acento médico */}
        <div className="flex items-center gap-3 px-6 py-4 bg-[#1a365d] text-white">
          <div className="p-2 rounded-xl bg-[#319795] text-white shadow-xs">
            <Tags className="w-5 h-5" />
          </div>
          <div>
            <DialogTitle className="text-white">
              {isEditing ? 'Editar Categoría' : 'Nueva Categoría'}
            </DialogTitle>
            <DialogDescription className="text-slate-300">
              {isEditing
                ? `Modificando registro ID #${categoriaToEdit?.id}`
                : 'Registrar nueva categoría para clasificación de fármacos'}
            </DialogDescription>
          </div>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {errors.general && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errors.general}</span>
            </div>
          )}

          {/* Campo: Nombre con Shadcn Input & Label */}
          <div className="space-y-1.5">
            <Label htmlFor="nombre">
              Nombre de la Categoría <span className="text-rose-500">*</span>
            </Label>
            <Input
              id="nombre"
              value={nombre}
              onChange={(e) => {
                setNombre(e.target.value);
                if (errors.nombre) setErrors((prev) => ({ ...prev, nombre: undefined }));
              }}
              placeholder="Ej: Antibióticos, Analgésicos, Suplementos..."
              className={errors.nombre ? 'border-rose-400 focus:ring-rose-200' : ''}
              autoFocus
            />
            {errors.nombre && (
              <p className="text-xs text-rose-600 flex items-center gap-1 mt-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{errors.nombre}</span>
              </p>
            )}
          </div>

          {/* Campo: Descripción con Shadcn Textarea & Label */}
          <div className="space-y-1.5">
            <Label htmlFor="descripcion">
              Descripción <span className="text-slate-400 font-normal lowercase">(opcional)</span>
            </Label>
            <Textarea
              id="descripcion"
              rows={3}
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Describe los medicamentos o productos que comprende esta categoría..."
            />
          </div>

          {/* Campo: Estado Activo con Shadcn Switch */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-800 block">
                Estado Operativo
              </span>
              <span className="text-xs text-slate-500">
                {activo
                  ? 'La categoría estará disponible en catálogos y ventas'
                  : 'La categoría quedará inactiva y oculta'}
              </span>
            </div>

            <Switch
              checked={activo}
              onCheckedChange={setActivo}
            />
          </div>

          <DialogFooter className="gap-2 sm:space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>

            <Button
              type="submit"
              variant="default"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-[#81e6d9]" />
                  <span>Guardando...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 text-[#81e6d9]" />
                  <span>{isEditing ? 'Guardar Cambios' : 'Registrar Categoría'}</span>
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
