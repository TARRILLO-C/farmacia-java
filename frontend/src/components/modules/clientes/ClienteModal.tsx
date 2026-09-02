'use client';

import React, { useState, useEffect } from 'react';
import {
  User,
  Sparkles,
  Loader2,
  AlertCircle,
  CheckCircle2,
  CreditCard,
  Phone,
  Mail,
  MapPin,
  HeartHandshake,
} from 'lucide-react';
import { Cliente, CreateClienteDTO, UpdateClienteDTO, TipoCliente } from '@/types';
import { createCliente, updateCliente } from '@/services/clienteService';
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

interface ClienteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitSuccess: () => void;
  clienteToEdit?: Cliente | null;
}

export const ClienteModal: React.FC<ClienteModalProps> = ({
  isOpen,
  onClose,
  onSubmitSuccess,
  clienteToEdit,
}) => {
  const [tipoDocumento, setTipoDocumento] = useState<'DNI' | 'RUC' | 'CE' | 'PASAPORTE'>('DNI');
  const [documentoIdentidad, setDocumentoIdentidad] = useState('');
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [direccion, setDireccion] = useState('');
  const [tipoCliente, setTipoCliente] = useState<TipoCliente>(TipoCliente.REGULAR);

  // Programa de Fidelización "ClienteAmigo"
  const [esClienteAmigo, setEsClienteAmigo] = useState(false);
  const [codigoClienteAmigo, setCodigoClienteAmigo] = useState('');
  const [activo, setActivo] = useState(true);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const generarCodigoClienteAmigo = () => {
    const randomSuffix = Math.floor(10000 + Math.random() * 90000);
    return `CA-${randomSuffix}`;
  };

  useEffect(() => {
    if (isOpen) {
      if (clienteToEdit) {
        setTipoDocumento(clienteToEdit.tipoDocumento || 'DNI');
        setDocumentoIdentidad(clienteToEdit.documentoIdentidad || '');
        setNombre(clienteToEdit.nombre || '');
        setApellido(clienteToEdit.apellido || '');
        setEmail(clienteToEdit.email || '');
        setTelefono(clienteToEdit.telefono || '');
        setDireccion(clienteToEdit.direccion || '');
        setTipoCliente(clienteToEdit.tipoCliente || TipoCliente.REGULAR);
        setEsClienteAmigo(clienteToEdit.esClienteAmigo ?? false);
        setCodigoClienteAmigo(clienteToEdit.codigoClienteAmigo || '');
        setActivo(clienteToEdit.activo ?? true);
      } else {
        setTipoDocumento('DNI');
        setDocumentoIdentidad('');
        setNombre('');
        setApellido('');
        setEmail('');
        setTelefono('');
        setDireccion('');
        setTipoCliente(TipoCliente.NUEVO);
        setEsClienteAmigo(false);
        setCodigoClienteAmigo('');
        setActivo(true);
      }
      setErrors({});
      setIsSubmitting(false);
    }
  }, [isOpen, clienteToEdit]);

  const handleToggleClienteAmigo = (checked: boolean) => {
    setEsClienteAmigo(checked);
    if (checked) {
      if (!codigoClienteAmigo) {
        setCodigoClienteAmigo(generarCodigoClienteAmigo());
      }
    } else {
      setCodigoClienteAmigo('');
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!documentoIdentidad.trim()) {
      newErrors.documentoIdentidad = 'El número de documento es obligatorio.';
    } else if (tipoDocumento === 'DNI' && !/^\d{8}$/.test(documentoIdentidad.trim())) {
      newErrors.documentoIdentidad = 'El DNI debe contener exactamente 8 dígitos numéricos.';
    } else if (tipoDocumento === 'RUC' && !/^\d{11}$/.test(documentoIdentidad.trim())) {
      newErrors.documentoIdentidad = 'El RUC debe contener exactamente 11 dígitos numéricos.';
    }

    if (!nombre.trim()) {
      newErrors.nombre = 'El nombre es obligatorio.';
    }

    if (!apellido.trim()) {
      newErrors.apellido = 'El apellido es obligatorio.';
    }

    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = 'Introduce un correo electrónico válido.';
    }

    if (esClienteAmigo && !codigoClienteAmigo.trim()) {
      newErrors.codigoClienteAmigo = 'El código de ClienteAmigo no puede estar vacío.';
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
      if (clienteToEdit) {
        const updateData: UpdateClienteDTO = {
          tipoDocumento,
          documentoIdentidad: documentoIdentidad.trim(),
          nombre: nombre.trim(),
          apellido: apellido.trim(),
          email: email.trim() || undefined,
          telefono: telefono.trim() || undefined,
          direccion: direccion.trim() || undefined,
          tipoCliente,
          esClienteAmigo,
          codigoClienteAmigo: esClienteAmigo ? codigoClienteAmigo.trim() : undefined,
          activo,
        };
        await updateCliente(clienteToEdit.id, updateData);
      } else {
        const createData: CreateClienteDTO = {
          tipoDocumento,
          documentoIdentidad: documentoIdentidad.trim(),
          nombre: nombre.trim(),
          apellido: apellido.trim(),
          email: email.trim() || undefined,
          telefono: telefono.trim() || undefined,
          direccion: direccion.trim() || undefined,
          tipoCliente,
          esClienteAmigo,
          codigoClienteAmigo: esClienteAmigo ? codigoClienteAmigo.trim() : undefined,
          puntosFidelidad: esClienteAmigo ? 50 : 0,
          activo,
        };
        await createCliente(createData);
      }

      onSubmitSuccess();
      onClose();
    } catch (err: unknown) {
      const errorMsg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || 'Error al guardar el cliente. Verifica los datos ingresados.';
      setErrors({ general: errorMsg });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isEditing = Boolean(clienteToEdit);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden max-h-[90vh] flex flex-col" showCloseButton={false}>
        {/* Cabecera Shadcn con acento temático */}
        <div className="flex items-center gap-3 px-6 py-4 bg-[#1a365d] text-white shrink-0">
          <div className="p-2.5 rounded-xl bg-gradient-to-tr from-[#319795] to-[#287e7c] text-white shadow-xs">
            <User className="w-5 h-5" />
          </div>
          <div>
            <DialogTitle className="text-white">
              {isEditing ? 'Editar Ficha del Cliente' : 'Registrar Nuevo Cliente'}
            </DialogTitle>
            <DialogDescription className="text-slate-300">
              Padrón farmacéutico y fidelización "ClienteAmigo"
            </DialogDescription>
          </div>
        </div>

        {/* Formulario scrollable */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1 scrollbar-thin">
          {errors.general && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errors.general}</span>
            </div>
          )}

          {/* Fila 1: Documento de Identidad y Tipo */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <Label className="mb-1.5 block">
                Tipo Doc. <span className="text-rose-500">*</span>
              </Label>
              <select
                value={tipoDocumento}
                onChange={(e) => setTipoDocumento(e.target.value as 'DNI' | 'RUC' | 'CE' | 'PASAPORTE')}
                className="w-full h-10 px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-xl outline-hidden focus:border-[#319795] focus:ring-2 focus:ring-[#319795]/20 font-medium text-slate-800"
              >
                <option value="DNI">DNI (8 dígitos)</option>
                <option value="RUC">RUC (11 dígitos)</option>
                <option value="CE">Carnet Extranjería</option>
                <option value="PASAPORTE">Pasaporte</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <Label htmlFor="docIdentidad" className="mb-1.5 block">
                Número de Documento <span className="text-rose-500">*</span>
              </Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <CreditCard className="w-4 h-4" />
                </div>
                <Input
                  id="docIdentidad"
                  value={documentoIdentidad}
                  onChange={(e) => {
                    setDocumentoIdentidad(e.target.value);
                    if (errors.documentoIdentidad) {
                      setErrors((prev) => ({ ...prev, documentoIdentidad: '' }));
                    }
                  }}
                  placeholder={tipoDocumento === 'DNI' ? 'Ej: 74218934' : 'Ej: 20601234567'}
                  className={`pl-9 ${errors.documentoIdentidad ? 'border-rose-400 focus:ring-rose-200' : ''}`}
                  autoFocus
                />
              </div>
              {errors.documentoIdentidad && (
                <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{errors.documentoIdentidad}</span>
                </p>
              )}
            </div>
          </div>

          {/* Fila 2: Nombres y Apellidos */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="cliNombre" className="mb-1.5 block">
                Nombres <span className="text-rose-500">*</span>
              </Label>
              <Input
                id="cliNombre"
                value={nombre}
                onChange={(e) => {
                  setNombre(e.target.value);
                  if (errors.nombre) setErrors((prev) => ({ ...prev, nombre: '' }));
                }}
                placeholder="Ej: Elena Rosa"
                className={errors.nombre ? 'border-rose-400 focus:ring-rose-200' : ''}
              />
              {errors.nombre && (
                <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{errors.nombre}</span>
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="cliApellido" className="mb-1.5 block">
                Apellidos <span className="text-rose-500">*</span>
              </Label>
              <Input
                id="cliApellido"
                value={apellido}
                onChange={(e) => {
                  setApellido(e.target.value);
                  if (errors.apellido) setErrors((prev) => ({ ...prev, apellido: '' }));
                }}
                placeholder="Ej: Mendoza Paredes"
                className={errors.apellido ? 'border-rose-400 focus:ring-rose-200' : ''}
              />
              {errors.apellido && (
                <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{errors.apellido}</span>
                </p>
              )}
            </div>
          </div>

          {/* Fila 3: Teléfono y Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="cliTelefono" className="mb-1.5 block">
                Teléfono / WhatsApp <span className="text-slate-400 lowercase font-normal">(opcional)</span>
              </Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Phone className="w-4 h-4" />
                </div>
                <Input
                  id="cliTelefono"
                  type="tel"
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  placeholder="Ej: 987654321"
                  className="pl-9"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="cliEmail" className="mb-1.5 block">
                Correo Electrónico <span className="text-slate-400 lowercase font-normal">(opcional)</span>
              </Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <Input
                  id="cliEmail"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Ej: cliente@correo.com"
                  className="pl-9"
                />
              </div>
              {errors.email && (
                <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{errors.email}</span>
                </p>
              )}
            </div>
          </div>

          {/* Fila 4: Dirección y Tipo de Cliente */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <Label htmlFor="cliDireccion" className="mb-1.5 block">
                Dirección Residencial <span className="text-slate-400 lowercase font-normal">(opcional)</span>
              </Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <MapPin className="w-4 h-4" />
                </div>
                <Input
                  id="cliDireccion"
                  value={direccion}
                  onChange={(e) => setDireccion(e.target.value)}
                  placeholder="Ej: Av. Los Libertadores 450, Chiclayo"
                  className="pl-9"
                />
              </div>
            </div>

            <div>
              <Label className="mb-1.5 block">
                Categoría Cliente <span className="text-rose-500">*</span>
              </Label>
              <select
                value={tipoCliente}
                onChange={(e) => setTipoCliente(e.target.value as TipoCliente)}
                className="w-full h-10 px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-xl outline-hidden focus:border-[#319795] focus:ring-2 focus:ring-[#319795]/20 font-bold text-slate-800"
              >
                <option value={TipoCliente.BENEFICIARIO}>BENEFICIARIO (Convenio)</option>
                <option value={TipoCliente.REGULAR}>REGULAR (Frecuente)</option>
                <option value={TipoCliente.NUEVO}>NUEVO (Primer ingreso)</option>
              </select>
            </div>
          </div>

          {/* SECCIÓN ESPECIAL: PROGRAMA FIDELIZACIÓN "CLIENTEAMIGO" */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-teal-50/70 via-emerald-50/50 to-blue-50/50 border border-[#319795]/30 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-[#319795] text-white shadow-xs">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-sm font-black text-[#1a365d] flex items-center gap-1.5">
                    Programa "ClienteAmigo"
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#319795] text-white uppercase tracking-wider">
                      Club Fidelidad
                    </span>
                  </span>
                  <p className="text-xs text-slate-500">
                    Otorga descuentos preferenciales y acumulación de puntos por compras
                  </p>
                </div>
              </div>

              <Switch
                checked={esClienteAmigo}
                onCheckedChange={handleToggleClienteAmigo}
              />
            </div>

            {esClienteAmigo && (
              <div className="pt-3 border-t border-[#319795]/20 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end">
                  <div>
                    <Label className="mb-1 block text-[#1a365d]">
                      Número Único ClienteAmigo
                    </Label>
                    <div className="flex items-center gap-2">
                      <Input
                        value={codigoClienteAmigo}
                        onChange={(e) => setCodigoClienteAmigo(e.target.value.toUpperCase())}
                        placeholder="Ej: CA-78421"
                        className="font-mono font-bold text-[#1a365d] border-[#319795]/40"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setCodigoClienteAmigo(generarCodigoClienteAmigo())}
                        className="shrink-0 text-[#319795]"
                      >
                        Regenerar
                      </Button>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-white/80 border border-[#319795]/20 text-[11px] text-slate-600 flex items-center gap-2">
                    <HeartHandshake className="w-5 h-5 text-[#319795] shrink-0" />
                    <span>
                      Al afiliar, recibe <strong>50 puntos iniciales</strong> y 10% de descuento preferencial.
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </form>

        {/* Pie de Acciones */}
        <DialogFooter className="px-6 py-4 bg-slate-50/50 justify-between sm:justify-between items-center shrink-0">
          <div className="flex items-center gap-2">
            <Switch
              checked={activo}
              onCheckedChange={setActivo}
            />
            <span className="text-xs font-semibold text-slate-600">
              Cliente Activo en Sistema
            </span>
          </div>

          <div className="flex items-center gap-2">
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
              onClick={handleSubmit}
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
                  <span>{isEditing ? 'Guardar Cambios' : 'Registrar Cliente'}</span>
                </>
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
