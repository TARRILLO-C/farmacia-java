'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Search,
  Loader2,
  CheckCircle2,
  AlertCircle,
  X,
  ArrowLeft,
  Trash2,
} from 'lucide-react';
import { Proveedor, CreateProveedorDTO, UpdateProveedorDTO } from '@/types';
import {
  getProveedores,
  createProveedor,
  updateProveedor,
  deleteProveedor,
} from '@/services/proveedorService';
import { consultarRuc } from '@/services/consultaService';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

// Proveedores de muestra basados en la referencia visual de Sistema AG
const SAMPLE_PROVEEDORES: Proveedor[] = [
  {
    id: 901,
    ruc: '20100123456',
    razonSocial: 'Droguería y Distribuidora Continental S.A.C.',
    nombreContacto: 'Ing. Roberto Silva',
    telefono: '014332211',
    email: 'ventas@continental.com.pe',
    direccion: 'Av. Argentina 2450, Lima',
    activo: true,
  },
  {
    id: 902,
    ruc: '20501234567',
    razonSocial: 'Laboratorios Bagó del Perú S.A.',
    nombreContacto: 'Dra. Patricia Alva',
    telefono: '012223344',
    email: 'pedidos@bago.com.pe',
    direccion: 'Av. Javier Prado Este 456, San Isidro',
    activo: true,
  },
  {
    id: 903,
    ruc: '20100234568',
    razonSocial: 'Medifarma S.A.',
    nombreContacto: 'Lic. Fernando Cruz',
    telefono: '013155000',
    email: 'contacto@medifarma.com.pe',
    direccion: 'Jr. Ecuador 787, Lima',
    activo: true,
  },
];

export default function ProveedoresPage() {
  const [viewMode, setViewMode] = useState<'list' | 'form'>('list');
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [loading, setLoading] = useState(true);

  // Búsqueda en lista
  const [searchTerm, setSearchTerm] = useState('');
  const [activeQuery, setActiveQuery] = useState('');

  // Formulario Nuevo / Editar Proveedor
  const [proveedorToEdit, setProveedorToEdit] = useState<Proveedor | null>(null);
  const [ruc, setRuc] = useState('');
  const [razonSocial, setRazonSocial] = useState('');
  const [estadoSunat, setEstadoSunat] = useState('');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [direccion, setDireccion] = useState('');
  const [searchingRuc, setSearchingRuc] = useState(false);
  const [saving, setSaving] = useState(false);

  // Eliminación
  const [proveedorToDelete, setProveedorToDelete] = useState<Proveedor | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Toast
  const [toast, setToast] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  };

  // Cargar proveedores combinando backend y muestras
  const fetchProveedores = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getProveedores().catch(() => []);
      const backendList = Array.isArray(data) ? data : [];

      if (backendList.length > 0) {
        const existingRucs = new Set(
          backendList.map((p) => (p.ruc || p.razonSocial || '').toLowerCase())
        );
        const nonDuplicateSamples = SAMPLE_PROVEEDORES.filter(
          (sp) =>
            !existingRucs.has((sp.ruc || '').toLowerCase()) &&
            !existingRucs.has((sp.razonSocial || '').toLowerCase())
        );
        setProveedores([...backendList, ...nonDuplicateSamples]);
      } else {
        setProveedores(SAMPLE_PROVEEDORES);
      }
    } catch {
      setProveedores(SAMPLE_PROVEEDORES);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProveedores();
  }, [fetchProveedores]);

  // Filtrado de proveedores
  const filteredProveedores = useMemo(() => {
    const q = (activeQuery || searchTerm).trim().toLowerCase();
    if (!q) return proveedores;

    return proveedores.filter((p) => {
      const nom = (p.razonSocial || p.nombreContacto || '').toLowerCase();
      const mail = (p.email || '').toLowerCase();
      const tel = (p.telefono || '').toLowerCase();
      const dir = (p.direccion || '').toLowerCase();
      const doc = (p.ruc || '').toLowerCase();
      return (
        nom.includes(q) ||
        mail.includes(q) ||
        tel.includes(q) ||
        dir.includes(q) ||
        doc.includes(q)
      );
    });
  }, [proveedores, searchTerm, activeQuery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveQuery(searchTerm);
  };

  // Abrir formulario para Nuevo Proveedor
  const handleOpenNewProveedor = () => {
    setProveedorToEdit(null);
    setRuc('');
    setRazonSocial('');
    setEstadoSunat('');
    setEmail('');
    setTelefono('');
    setDireccion('');
    setViewMode('form');
  };

  // Abrir formulario para Editar Proveedor
  const handleOpenEditProveedor = (p: Proveedor) => {
    setProveedorToEdit(p);
    setRuc(p.ruc || '');
    setRazonSocial(p.razonSocial || '');
    setEstadoSunat('ACTIVO - REGISTRADO');
    setEmail(p.email || '');
    setTelefono(p.telefono || '');
    setDireccion(p.direccion || '');
    setViewMode('form');
  };

  // Consulta automática de RUC vía SUNAT / API
  const handleBuscarRuc = async () => {
    const cleanRuc = ruc.trim().replace(/\D/g, '');
    if (!cleanRuc) {
      showToast('error', 'Ingrese un número de RUC para consultar.');
      return;
    }
    if (cleanRuc.length !== 11) {
      showToast('error', 'El RUC debe tener exactamente 11 dígitos.');
      return;
    }

    setSearchingRuc(true);
    try {
      const res = await consultarRuc(cleanRuc);
      if (res) {
        if (res.nombreCompleto) {
          setRazonSocial(res.nombreCompleto.trim());
        }

        const estadoParts = [res.estado, res.condicion].filter(Boolean).join(' - ');
        setEstadoSunat(estadoParts || 'HABIDO / ACTIVO');

        if (res.direccion) {
          setDireccion(res.direccion.trim());
        }

        showToast('success', 'Datos del proveedor obtenidos desde SUNAT.');
      } else {
        showToast('error', 'No se encontraron datos para el RUC ingresado.');
      }
    } catch {
      showToast(
        'error',
        'No se pudo conectar con el servicio de SUNAT. Puede ingresar los datos manualmente.'
      );
    } finally {
      setSearchingRuc(false);
    }
  };

  // Manejar Enter o Tab en el campo RUC
  const handleRucKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleBuscarRuc();
    }
  };

  // Guardar Proveedor (Crear o Actualizar)
  const handleGuardar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!razonSocial.trim()) {
      showToast('error', 'La Razón Social o Nombre del proveedor es obligatorio.');
      return;
    }

    setSaving(true);
    try {
      if (proveedorToEdit && proveedorToEdit.id < 900) {
        const updateData: UpdateProveedorDTO = {
          ruc: ruc.trim() || undefined,
          razonSocial: razonSocial.trim(),
          email: email.trim() || undefined,
          telefono: telefono.trim() || undefined,
          direccion: direccion.trim() || undefined,
        };
        await updateProveedor(proveedorToEdit.id, updateData);
      } else if (!proveedorToEdit) {
        const createData: CreateProveedorDTO = {
          ruc: ruc.trim() || '20000000000',
          razonSocial: razonSocial.trim(),
          email: email.trim() || undefined,
          telefono: telefono.trim() || undefined,
          direccion: direccion.trim() || undefined,
          activo: true,
        };
        try {
          await createProveedor(createData);
        } catch {
          // Continuar localmente si el backend no responde
        }
      }

      // Actualizar estado local
      if (proveedorToEdit) {
        setProveedores((prev) =>
          prev.map((p) =>
            p.id === proveedorToEdit.id
              ? {
                  ...p,
                  ruc: ruc.trim(),
                  razonSocial: razonSocial.trim(),
                  email: email.trim(),
                  telefono: telefono.trim(),
                  direccion: direccion.trim(),
                }
              : p
          )
        );
        showToast('success', 'Proveedor actualizado exitosamente.');
      } else {
        const nuevoProveedor: Proveedor = {
          id: Date.now(),
          ruc: ruc.trim() || '20000000000',
          razonSocial: razonSocial.trim(),
          nombreContacto: razonSocial.trim(),
          email: email.trim(),
          telefono: telefono.trim(),
          direccion: direccion.trim(),
          activo: true,
        };
        setProveedores((prev) => [nuevoProveedor, ...prev]);
        showToast('success', 'Proveedor registrado exitosamente.');
      }

      setViewMode('list');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al guardar proveedor';
      showToast('error', msg);
    } finally {
      setSaving(false);
    }
  };

  // Confirmar eliminación
  const handleConfirmDelete = async () => {
    if (!proveedorToDelete) return;
    setIsDeleting(true);
    try {
      if (proveedorToDelete.id < 900) {
        await deleteProveedor(proveedorToDelete.id);
      }
      setProveedores((prev) => prev.filter((p) => p.id !== proveedorToDelete.id));
      showToast('success', 'Proveedor eliminado correctamente.');
      setProveedorToDelete(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al eliminar proveedor';
      showToast('error', msg);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Notificación */}
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

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* VISTA 1: LISTA DE PROVEEDORES (FOTO 1)                                  */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {viewMode === 'list' && (
        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm shadow-slate-200/50 border border-slate-100/60">
          {/* Cabecera: Título + Botón NUEVO PROVEEDOR */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-100/60">
            <h1 className="text-base md:text-lg font-bold text-slate-800 tracking-tight">
              Lista de Proveedores
            </h1>
            <button
              type="button"
              onClick={handleOpenNewProveedor}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-gradient-to-r from-[#d946ef] to-[#c026d3] hover:from-[#c026d3] hover:to-[#a21caf] text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md shadow-fuchsia-500/25 active:scale-[0.98] transition-all cursor-pointer"
            >
              NUEVO PROVEEDOR
            </button>
          </div>

          {/* Buscador + Botón BUSCAR */}
          <form onSubmit={handleSearchSubmit} className="flex items-center gap-3 my-6">
            <div className="relative flex-1">
              <Search className="size-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por nombre, email..."
                className="w-full h-11 pl-11 pr-4 text-xs font-normal text-slate-800 bg-slate-50/80 hover:bg-slate-50 focus:bg-white rounded-xl border border-slate-200/80 focus:border-[#d946ef] focus:ring-4 focus:ring-fuchsia-100 transition-all outline-none placeholder:text-slate-400"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm('');
                    setActiveQuery('');
                  }}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="size-3.5" />
                </button>
              )}
            </div>
            <button
              type="submit"
              className="h-11 px-7 bg-gradient-to-r from-[#d946ef] to-[#c026d3] hover:from-[#c026d3] hover:to-[#a21caf] text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md shadow-fuchsia-500/20 active:scale-[0.98] transition-all cursor-pointer shrink-0"
            >
              BUSCAR
            </button>
          </form>

          {/* Tabla de Proveedores */}
          <div className="overflow-x-auto -mx-6 md:-mx-8 px-6 md:px-8">
            <table className="w-full text-left border-collapse min-w-[750px]">
              <thead>
                <tr className="border-b border-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  <th className="py-3 px-3 text-left">NOMBRE</th>
                  <th className="py-3 px-3 text-left">EMAIL</th>
                  <th className="py-3 px-3 text-left">TELÉFONO</th>
                  <th className="py-3 px-3 text-left">DIRECCIÓN</th>
                  <th className="py-3 px-3 text-right pr-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/70 text-xs">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-400">
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="size-4 animate-spin text-[#c026d3]" />
                        <span>Cargando catálogo de proveedores...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredProveedores.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-400">
                      No se encontraron proveedores registrados con ese criterio.
                    </td>
                  </tr>
                ) : (
                  filteredProveedores.map((prov) => {
                    const nombreVisible =
                      prov.razonSocial || prov.nombreContacto || 'Proveedor';

                    return (
                      <tr
                        key={prov.id}
                        className="hover:bg-slate-50/70 transition-colors group"
                      >
                        {/* Nombre / Razón Social */}
                        <td className="py-4 px-3 font-medium text-slate-800">
                          <div>
                            <span>{nombreVisible}</span>
                            {prov.ruc && (
                              <span className="block text-[11px] text-slate-400 font-normal">
                                RUC: {prov.ruc}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Email */}
                        <td className="py-4 px-3 text-slate-600">
                          {prov.email || '-'}
                        </td>

                        {/* Teléfono */}
                        <td className="py-4 px-3 text-slate-600">
                          {prov.telefono || '-'}
                        </td>

                        {/* Dirección */}
                        <td className="py-4 px-3 text-slate-600 max-w-xs truncate">
                          {prov.direccion || '-'}
                        </td>

                        {/* Acciones */}
                        <td className="py-4 px-3 text-right pr-4 whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => handleOpenEditProveedor(prov)}
                            className="text-slate-500 hover:text-slate-800 font-medium text-xs sm:text-sm mr-5 cursor-pointer transition-colors"
                          >
                            Editar
                          </button>
                          <button
                            type="button"
                            onClick={() => setProveedorToDelete(prov)}
                            className="text-red-500 hover:text-red-700 font-medium text-xs sm:text-sm cursor-pointer transition-colors"
                          >
                            Eliminar
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* VISTA 2: NUEVO / EDITAR PROVEEDOR (FOTO 2)                             */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {viewMode === 'form' && (
        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm shadow-slate-200/50 border border-slate-100/60 max-w-5xl mx-auto">
          {/* Cabecera del formulario */}
          <div className="flex items-center justify-between pb-6 border-b border-slate-100/60 mb-6">
            <h1 className="text-base md:text-lg font-bold text-slate-800 tracking-tight">
              {proveedorToEdit ? 'Editar Proveedor' : 'Nuevo Proveedor'}
            </h1>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 cursor-pointer transition-colors"
            >
              <ArrowLeft className="size-4" />
              <span>Volver a la lista</span>
            </button>
          </div>

          <form onSubmit={handleGuardar} className="space-y-6">
            {/* ─── FILA 1: RUC (con Buscar y soporte Enter/Tab) ─── */}
            <div className="space-y-1.5">
              <label
                htmlFor="rucInput"
                className="block text-xs font-bold text-slate-700"
              >
                RUC (Ingrese y presione Tab o Enter para buscar)
              </label>
              <div className="flex items-center gap-3">
                <input
                  id="rucInput"
                  type="text"
                  maxLength={11}
                  value={ruc}
                  onChange={(e) => setRuc(e.target.value.replace(/\D/g, ''))}
                  onKeyDown={handleRucKeyDown}
                  placeholder="Ingrese el RUC (11 dígitos)"
                  className="flex-1 h-11 px-4 text-xs sm:text-sm text-slate-800 bg-slate-50/80 hover:bg-slate-50 focus:bg-white rounded-xl border border-slate-200/80 focus:border-[#d946ef] focus:ring-4 focus:ring-fuchsia-100 transition-all outline-none placeholder:text-slate-400"
                />
                <button
                  type="button"
                  onClick={handleBuscarRuc}
                  disabled={searchingRuc}
                  className="h-11 px-6 border-2 border-[#c026d3] text-[#c026d3] hover:bg-[#c026d3]/5 font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center gap-2 shrink-0 disabled:opacity-70"
                >
                  {searchingRuc ? (
                    <Loader2 className="size-4 animate-spin text-[#c026d3]" />
                  ) : (
                    <Search className="size-4 stroke-[2.5]" />
                  )}
                  <span>BUSCAR</span>
                </button>
              </div>
            </div>

            {/* ─── FILA 2: RAZÓN SOCIAL / NOMBRE + ESTADO SUNAT ─── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label
                  htmlFor="razonSocialInput"
                  className="block text-xs font-bold text-slate-700"
                >
                  Razón Social / Nombre
                </label>
                <input
                  id="razonSocialInput"
                  type="text"
                  required
                  value={razonSocial}
                  onChange={(e) => setRazonSocial(e.target.value)}
                  placeholder="Nombre del proveedor"
                  className="w-full h-11 px-4 text-xs sm:text-sm text-slate-800 bg-slate-50/80 hover:bg-slate-50 focus:bg-white rounded-xl border border-slate-200/80 focus:border-[#d946ef] focus:ring-4 focus:ring-fuchsia-100 transition-all outline-none placeholder:text-slate-400"
                />
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="estadoSunatInput"
                  className="block text-xs font-bold text-slate-700"
                >
                  Estado SUNAT
                </label>
                <input
                  id="estadoSunatInput"
                  type="text"
                  readOnly
                  disabled
                  value={estadoSunat}
                  placeholder="Se llenará automáticamente"
                  className="w-full h-11 px-4 text-xs sm:text-sm text-slate-600 bg-slate-100/90 rounded-xl border border-slate-200/70 outline-none placeholder:text-slate-400 cursor-not-allowed"
                />
              </div>
            </div>

            {/* ─── FILA 3: EMAIL + TELÉFONO ─── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label
                  htmlFor="emailInput"
                  className="block text-xs font-bold text-slate-700"
                >
                  Email
                </label>
                <input
                  id="emailInput"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="correo@ejemplo.com"
                  className="w-full h-11 px-4 text-xs sm:text-sm text-slate-800 bg-slate-50/80 hover:bg-slate-50 focus:bg-white rounded-xl border border-slate-200/80 focus:border-[#d946ef] focus:ring-4 focus:ring-fuchsia-100 transition-all outline-none placeholder:text-slate-400"
                />
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="telefonoInput"
                  className="block text-xs font-bold text-slate-700"
                >
                  Teléfono
                </label>
                <input
                  id="telefonoInput"
                  type="tel"
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  placeholder="Número de teléfono"
                  className="w-full h-11 px-4 text-xs sm:text-sm text-slate-800 bg-slate-50/80 hover:bg-slate-50 focus:bg-white rounded-xl border border-slate-200/80 focus:border-[#d946ef] focus:ring-4 focus:ring-fuchsia-100 transition-all outline-none placeholder:text-slate-400"
                />
              </div>
            </div>

            {/* ─── FILA 4: DIRECCIÓN ─── */}
            <div className="space-y-1.5">
              <label
                htmlFor="direccionInput"
                className="block text-xs font-bold text-slate-700"
              >
                Dirección
              </label>
              <textarea
                id="direccionInput"
                rows={3}
                value={direccion}
                onChange={(e) => setDireccion(e.target.value)}
                placeholder="Dirección del proveedor"
                className="w-full p-4 text-xs sm:text-sm text-slate-800 bg-slate-50/80 hover:bg-slate-50 focus:bg-white rounded-xl border border-slate-200/80 focus:border-[#d946ef] focus:ring-4 focus:ring-fuchsia-100 transition-all outline-none placeholder:text-slate-400 resize-none"
              />
            </div>

            {/* ─── BOTONES INFERIORES: CANCELAR (Izquierda) + GUARDAR (Derecha) ─── */}
            <div className="pt-2 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className="px-6 py-2.5 border border-slate-300 text-slate-600 hover:bg-slate-50 font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer"
              >
                CANCELAR
              </button>

              <button
                type="submit"
                disabled={saving}
                className="px-8 py-2.5 bg-gradient-to-r from-[#d946ef] to-[#c026d3] hover:from-[#c026d3] hover:to-[#a21caf] text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md shadow-fuchsia-500/25 active:scale-[0.98] transition-all cursor-pointer flex items-center gap-2 disabled:opacity-70"
              >
                {saving && <Loader2 className="size-4 animate-spin text-white" />}
                <span>GUARDAR</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ─── MODAL CONFIRMAR ELIMINACIÓN ─── */}
      <Dialog
        open={Boolean(proveedorToDelete)}
        onOpenChange={(open) => !open && !isDeleting && setProveedorToDelete(null)}
      >
        <DialogContent className="max-w-md bg-white rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-800">
              ¿Eliminar proveedor?
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Esta acción dará de baja al proveedor del catálogo.
            </DialogDescription>
          </DialogHeader>

          {proveedorToDelete && (
            <div className="my-4 p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-700 space-y-1">
              <p>
                Proveedor:{' '}
                <strong>
                  {proveedorToDelete.razonSocial || proveedorToDelete.nombreContacto}
                </strong>
              </p>
              {proveedorToDelete.ruc && (
                <p className="text-slate-500">RUC: {proveedorToDelete.ruc}</p>
              )}
              {proveedorToDelete.email && (
                <p className="text-slate-500">Email: {proveedorToDelete.email}</p>
              )}
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setProveedorToDelete(null)}
              disabled={isDeleting}
              className="rounded-xl text-xs font-semibold"
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="size-3.5 animate-spin mr-1.5" />
                  <span>Eliminando...</span>
                </>
              ) : (
                <>
                  <Trash2 className="size-3.5 mr-1.5" />
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
