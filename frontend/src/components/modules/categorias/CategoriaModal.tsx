'use client';

import React, { useState, useEffect } from 'react';
import { Tags, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Categoria, CreateCategoriaDTO, UpdateCategoriaDTO } from '@/types';
import { createCategoria, updateCategoria } from '@/services/categoriaService';
import { AppDrawer } from '@/components/common/AppDrawer';
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
    <AppDrawer
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Editar Categoría' : 'Nueva Categoría'}
      description={
        isEditing
          ? `Modificando registro ID #${categoriaToEdit?.id}`
          : 'Registrar nueva categoría para clasificación de fármacos'
      }
      icon={Tags}
      onSubmit={handleSubmit}
      submitText={isEditing ? 'Guardar Cambios' : 'Registrar Categoría'}
      submitIcon={CheckCircle2}
      isSubmitting={isSubmitting}
      maxWidth="max-w-xl"
    >
      <div className="space-y-4">
        {errors.general && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errors.general}</span>
          </div>
        )}

        {/* Campo: Nombre */}
        <div className="space-y-1.5">
          <Label htmlFor="nombre" className="text-xs font-semibold text-slate-700">
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
            className={`h-9 text-xs rounded-xl ${errors.nombre ? 'border-rose-400 focus-visible:ring-rose-200' : ''}`}
            autoFocus
          />
          {errors.nombre && (
            <p className="text-xs text-rose-600 flex items-center gap-1 mt-1">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{errors.nombre}</span>
            </p>
          )}
        </div>

        {/* Campo: Descripción */}
        <div className="space-y-1.5">
          <Label htmlFor="descripcion" className="text-xs font-semibold text-slate-700">
            Descripción <span className="text-slate-400 font-normal lowercase">(opcional)</span>
          </Label>
          <Textarea
            id="descripcion"
            rows={3}
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            placeholder="Describe los medicamentos o productos que comprende esta categoría..."
            className="text-xs rounded-xl"
          />
        </div>

        {/* Campo: Estado Activo */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-800 block">
              Estado Operativo
            </span>
            <span className="text-[11px] text-slate-500">
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
      </div>
    </AppDrawer>
  );
};
