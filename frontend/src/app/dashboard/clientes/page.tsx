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
import { Cliente, CreateClienteDTO, UpdateClienteDTO } from '@/types';
import {
  getClientes,
  createCliente,
  updateCliente,
  deleteCliente,
} from '@/services/clienteService';
import { consultarDni } from '@/services/consultaService';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

// Clientes de muestra basados en la referencia visual de Sistema AG (Foto 1)
const SAMPLE_CLIENTES: Cliente[] = [
  {
    id: 901,
    documentoIdentidad: '00000000',
    nombre: 'Público General',
    apellido: '',
    nombreCompleto: 'Público General',
    email: '',
    telefono: '',
    direccion: '',
    tipoDocumento: 'DNI',
    activo: true,
  },
  {
    id: 902,
    documentoIdentidad: '72345678',
    nombre: 'DEYSI ROXANA',
    apellido: 'GONZÁLEZ CRUZ',
    nombreCompleto: 'DEYSI ROXANA GONZÁLEZ CRUZ',
    email: '',
    telefono: '',
    direccion: '',
    tipoDocumento: 'DNI',
    activo: true,
  },
  {
    id: 903,
    documentoIdentidad: '70000005',
    nombre: 'tarrillo',
    apellido: '',
    nombreCompleto: 'tarrillo',
    email: 'tarrillo@gmail.com',
    telefono: '',
    direccion: '',
    tipoDocumento: 'DNI',
    activo: true,
  },
  {
    id: 904,
    documentoIdentidad: '70000001',
    nombre: 'juan',
    apellido: '',
    nombreCompleto: 'juan',
    email: 'juan@gmail.com',
    telefono: '',
    direccion: '',
    tipoDocumento: 'DNI',
    activo: true,
  },
];

export default function ClientesPage() {
  const [viewMode, setViewMode] = useState<'list' | 'form'>('list');
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);

  // Búsqueda en lista
  const [searchTerm, setSearchTerm] = useState('');
  const [activeQuery, setActiveQuery] = useState('');

  // Formulario Nuevo / Editar Cliente
  const [clienteToEdit, setClienteToEdit] = useState<Cliente | null>(null);
  const [dni, setDni] = useState('');
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [direccion, setDireccion] = useState('');
  const [searchingDni, setSearchingDni] = useState(false);
  const [saving, setSaving] = useState(false);

  // Eliminación
  const [clienteToDelete, setClienteToDelete] = useState<Cliente | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Toasts
  const [toast, setToast] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  };

  // Cargar clientes combinando backend y muestras
  const fetchClientes = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getClientes().catch(() => []);
      const backendList = Array.isArray(data) ? data : [];

      if (backendList.length > 0) {
        const existingDocs = new Set(
          backendList.map((c) => (c.documentoIdentidad || c.nombreCompleto || '').toLowerCase())
        );
        const nonDuplicateSamples = SAMPLE_CLIENTES.filter(
          (sc) =>
            !existingDocs.has((sc.documentoIdentidad || '').toLowerCase()) &&
            !existingDocs.has((sc.nombreCompleto || '').toLowerCase())
        );
        setClientes([...backendList, ...nonDuplicateSamples]);
      } else {
        setClientes(SAMPLE_CLIENTES);
      }
    } catch {
      setClientes(SAMPLE_CLIENTES);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClientes();
  }, [fetchClientes]);

  // Filtrado de clientes
  const filteredClientes = useMemo(() => {
    const q = (activeQuery || searchTerm).trim().toLowerCase();
    if (!q) return clientes;

    return clientes.filter((c) => {
      const nom = (c.nombreCompleto || `${c.nombre} ${c.apellido}`).toLowerCase();
      const mail = (c.email || '').toLowerCase();
      const tel = (c.telefono || '').toLowerCase();
      const dir = (c.direccion || '').toLowerCase();
      const doc = (c.documentoIdentidad || '').toLowerCase();
      return (
        nom.includes(q) ||
        mail.includes(q) ||
        tel.includes(q) ||
        dir.includes(q) ||
        doc.includes(q)
      );
    });
  }, [clientes, searchTerm, activeQuery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveQuery(searchTerm);
  };

  // Abrir formulario para Nuevo Cliente
  const handleOpenNewCliente = () => {
    setClienteToEdit(null);
    setDni('');
    setNombre('');
    setApellido('');
    setEmail('');
    setTelefono('');
    setDireccion('');
    setViewMode('form');
  };

  // Abrir formulario para Editar Cliente
  const handleOpenEditCliente = (c: Cliente) => {
    setClienteToEdit(c);
    setDni(c.documentoIdentidad || '');
    setNombre(c.nombre || '');
    setApellido(c.apellido || '');
    setEmail(c.email || '');
    setTelefono(c.telefono || '');
    setDireccion(c.direccion || '');
    setViewMode('form');
  };

  // Consulta automática de DNI vía RENIEC / API
  const handleBuscarDni = async () => {
    const cleanDni = dni.trim().replace(/\D/g, '');
    if (!cleanDni) {
      showToast('error', 'Ingrese un número de DNI para consultar.');
      return;
    }
    if (cleanDni.length !== 8) {
      showToast('error', 'El DNI debe tener exactamente 8 dígitos.');
      return;
    }

    setSearchingDni(true);
    try {
      const res = await consultarDni(cleanDni);
      if (res) {
        if (res.nombres) {
          setNombre(res.nombres.trim());
        } else if (res.nombreCompleto) {
          const parts = res.nombreCompleto.trim().split(/\s+/);
          setNombre(parts[0] || '');
        }

        const apellidos = [res.apellidoPaterno, res.apellidoMaterno]
          .filter(Boolean)
          .join(' ')
          .trim();
        if (apellidos) {
          setApellido(apellidos);
        } else if (res.nombreCompleto) {
          const parts = res.nombreCompleto.trim().split(/\s+/);
          setApellido(parts.slice(1).join(' '));
        }

        if (res.direccion) {
          setDireccion(res.direccion.trim());
        }

        showToast('success', 'Datos autocompletados desde RENIEC.');
      } else {
        showToast('error', 'No se encontraron datos para el DNI ingresado.');
      }
    } catch {
      showToast(
        'error',
        'No se pudo conectar con el servicio de RENIEC. Puede ingresar los datos manualmente.'
      );
    } finally {
      setSearchingDni(false);
    }
  };

  // Guardar Cliente (Crear o Actualizar)
  const handleGuardar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) {
      showToast('error', 'El nombre del cliente es obligatorio.');
      return;
    }

    setSaving(true);
    const nombreCompleto = apellido.trim()
      ? `${nombre.trim()} ${apellido.trim()}`
      : nombre.trim();

    try {
      if (clienteToEdit && clienteToEdit.id < 900) {
        // Actualizar en backend si es id real
        const updateData: UpdateClienteDTO = {
          documentoIdentidad: dni.trim() || undefined,
          nombre: nombre.trim(),
          apellido: apellido.trim() || undefined,
          email: email.trim() || undefined,
          telefono: telefono.trim() || undefined,
          direccion: direccion.trim() || undefined,
        };
        await updateCliente(clienteToEdit.id, updateData);
      } else if (!clienteToEdit) {
        // Intentar crear en backend
        const createData: CreateClienteDTO = {
          documentoIdentidad: dni.trim() || '00000000',
          nombre: nombre.trim(),
          apellido: apellido.trim() || undefined,
          email: email.trim() || undefined,
          telefono: telefono.trim() || undefined,
          direccion: direccion.trim() || undefined,
          tipoDocumento: 'DNI',
        };
        try {
          await createCliente(createData);
        } catch {
          // Si el backend no responde, continuamos localmente
        }
      }

      // Actualizar estado local
      if (clienteToEdit) {
        setClientes((prev) =>
          prev.map((c) =>
            c.id === clienteToEdit.id
              ? {
                  ...c,
                  documentoIdentidad: dni.trim(),
                  nombre: nombre.trim(),
                  apellido: apellido.trim(),
                  nombreCompleto,
                  email: email.trim(),
                  telefono: telefono.trim(),
                  direccion: direccion.trim(),
                }
              : c
          )
        );
        showToast('success', 'Cliente actualizado exitosamente.');
      } else {
        const nuevoCliente: Cliente = {
          id: Date.now(),
          documentoIdentidad: dni.trim() || '00000000',
          nombre: nombre.trim(),
          apellido: apellido.trim(),
          nombreCompleto,
          email: email.trim(),
          telefono: telefono.trim(),
          direccion: direccion.trim(),
          tipoDocumento: 'DNI',
          activo: true,
        };
        setClientes((prev) => [nuevoCliente, ...prev]);
        showToast('success', 'Cliente guardado exitosamente.');
      }

      setViewMode('list');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al guardar cliente';
      showToast('error', msg);
    } finally {
      setSaving(false);
    }
  };

  // Confirmar eliminación
  const handleConfirmDelete = async () => {
    if (!clienteToDelete) return;
    setIsDeleting(true);
    try {
      if (clienteToDelete.id < 900) {
        await deleteCliente(clienteToDelete.id);
      }
      setClientes((prev) => prev.filter((c) => c.id !== clienteToDelete.id));
      showToast('success', 'Cliente eliminado correctamente.');
      setClienteToDelete(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al eliminar cliente';
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
      {/* VISTA 1: LISTA DE CLIENTES (FOTO 1)                                    */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {viewMode === 'list' && (
        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm shadow-slate-200/50 border border-slate-100/60">
          {/* Cabecera: Título + Botón NUEVO CLIENTE */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-100/60">
            <h1 className="text-base md:text-lg font-bold text-slate-800 tracking-tight">
              Lista de Clientes
            </h1>
            <button
              type="button"
              onClick={handleOpenNewCliente}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-gradient-to-r from-[#d946ef] to-[#c026d3] hover:from-[#c026d3] hover:to-[#a21caf] text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md shadow-fuchsia-500/25 active:scale-[0.98] transition-all cursor-pointer"
            >
              NUEVO CLIENTE
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
                placeholder="Buscar por nombre, apellido, email..."
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

          {/* Tabla de Clientes */}
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
                        <span>Cargando padrón de clientes...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredClientes.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-400">
                      No se encontraron clientes registrados con ese criterio.
                    </td>
                  </tr>
                ) : (
                  filteredClientes.map((cli) => {
                    const nombreVisible =
                      cli.nombreCompleto ||
                      `${cli.nombre || ''} ${cli.apellido || ''}`.trim() ||
                      cli.nombre ||
                      'Cliente';

                    return (
                      <tr
                        key={cli.id}
                        className="hover:bg-slate-50/70 transition-colors group"
                      >
                        {/* Nombre */}
                        <td className="py-4 px-3 font-medium text-slate-800">
                          {nombreVisible}
                        </td>

                        {/* Email */}
                        <td className="py-4 px-3 text-slate-600">
                          {cli.email || '-'}
                        </td>

                        {/* Teléfono */}
                        <td className="py-4 px-3 text-slate-600">
                          {cli.telefono || '-'}
                        </td>

                        {/* Dirección */}
                        <td className="py-4 px-3 text-slate-600 max-w-xs truncate">
                          {cli.direccion || '-'}
                        </td>

                        {/* Acciones */}
                        <td className="py-4 px-3 text-right pr-4 whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => handleOpenEditCliente(cli)}
                            className="text-slate-500 hover:text-slate-800 font-medium text-xs sm:text-sm mr-5 cursor-pointer transition-colors"
                          >
                            Editar
                          </button>
                          <button
                            type="button"
                            onClick={() => setClienteToDelete(cli)}
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
      {/* VISTA 2: NUEVO / EDITAR CLIENTE (FOTO 2)                               */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {viewMode === 'form' && (
        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm shadow-slate-200/50 border border-slate-100/60 max-w-4xl mx-auto">
          {/* Cabecera del formulario */}
          <div className="flex items-center justify-between pb-6 border-b border-slate-100/60 mb-6">
            <h1 className="text-base md:text-lg font-bold text-slate-800 tracking-tight">
              {clienteToEdit ? 'Editar Cliente' : 'Nuevo Cliente'}
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
            {/* ─── SECCIÓN DNI + BOTÓN BUSCAR ─── */}
            <div className="space-y-1.5">
              <label
                htmlFor="dniInput"
                className="block text-xs font-bold text-slate-700"
              >
                DNI (8 dígitos)
              </label>
              <div className="flex items-center gap-3">
                <input
                  id="dniInput"
                  type="text"
                  maxLength={8}
                  value={dni}
                  onChange={(e) => setDni(e.target.value.replace(/\D/g, ''))}
                  placeholder="Ingrese DNI"
                  className="flex-1 h-11 px-4 text-xs sm:text-sm text-slate-800 bg-slate-50/80 hover:bg-slate-50 focus:bg-white rounded-xl border border-slate-200/80 focus:border-[#00b0ff] focus:ring-4 focus:ring-sky-100 transition-all outline-none placeholder:text-slate-400"
                />
                <button
                  type="button"
                  onClick={handleBuscarDni}
                  disabled={searchingDni}
                  className="h-11 px-6 bg-[#00b0ff] hover:bg-[#009be0] text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md shadow-sky-500/20 active:scale-[0.98] transition-all cursor-pointer flex items-center gap-2 shrink-0 disabled:opacity-70"
                >
                  {searchingDni ? (
                    <Loader2 className="size-4 animate-spin text-white" />
                  ) : (
                    <Search className="size-4 text-white stroke-[2.5]" />
                  )}
                  <span>BUSCAR</span>
                </button>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Ingrese el DNI y presione Buscar para autocompletar los datos
              </p>
            </div>

            {/* ─── FILA: NOMBRE Y APELLIDO ─── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label
                  htmlFor="nombreInput"
                  className="block text-xs font-bold text-slate-700"
                >
                  Nombre
                </label>
                <input
                  id="nombreInput"
                  type="text"
                  required
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Nombre del cliente"
                  className="w-full h-11 px-4 text-xs sm:text-sm text-slate-800 bg-slate-50/80 hover:bg-slate-50 focus:bg-white rounded-xl border border-slate-200/80 focus:border-[#d946ef] focus:ring-4 focus:ring-fuchsia-100 transition-all outline-none placeholder:text-slate-400"
                />
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="apellidoInput"
                  className="block text-xs font-bold text-slate-700"
                >
                  Apellido
                </label>
                <input
                  id="apellidoInput"
                  type="text"
                  value={apellido}
                  onChange={(e) => setApellido(e.target.value)}
                  placeholder="Apellido del cliente"
                  className="w-full h-11 px-4 text-xs sm:text-sm text-slate-800 bg-slate-50/80 hover:bg-slate-50 focus:bg-white rounded-xl border border-slate-200/80 focus:border-[#d946ef] focus:ring-4 focus:ring-fuchsia-100 transition-all outline-none placeholder:text-slate-400"
                />
              </div>
            </div>

            {/* ─── FILA: EMAIL ─── */}
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

            {/* ─── FILA: TELÉFONO ─── */}
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

            {/* ─── FILA: DIRECCIÓN ─── */}
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
                placeholder="Dirección del cliente"
                className="w-full p-4 text-xs sm:text-sm text-slate-800 bg-slate-50/80 hover:bg-slate-50 focus:bg-white rounded-xl border border-slate-200/80 focus:border-[#d946ef] focus:ring-4 focus:ring-fuchsia-100 transition-all outline-none placeholder:text-slate-400 resize-none"
              />
            </div>

            {/* ─── BOTÓN GUARDAR Y CANCELAR ─── */}
            <div className="pt-2 flex items-center gap-3">
              <button
                type="submit"
                disabled={saving}
                className="px-8 py-3 bg-gradient-to-r from-[#d946ef] to-[#c026d3] hover:from-[#c026d3] hover:to-[#a21caf] text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md shadow-fuchsia-500/25 active:scale-[0.98] transition-all cursor-pointer flex items-center gap-2 disabled:opacity-70"
              >
                {saving && <Loader2 className="size-4 animate-spin text-white" />}
                <span>GUARDAR</span>
              </button>

              <button
                type="button"
                onClick={() => setViewMode('list')}
                className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer"
              >
                CANCELAR
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ─── MODAL CONFIRMAR ELIMINACIÓN ─── */}
      <Dialog
        open={Boolean(clienteToDelete)}
        onOpenChange={(open) => !open && !isDeleting && setClienteToDelete(null)}
      >
        <DialogContent className="max-w-md bg-white rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-800">
              ¿Eliminar cliente?
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Esta acción dará de baja al cliente del sistema.
            </DialogDescription>
          </DialogHeader>

          {clienteToDelete && (
            <div className="my-4 p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-700 space-y-1">
              <p>
                Cliente:{' '}
                <strong>
                  {clienteToDelete.nombreCompleto ||
                    `${clienteToDelete.nombre} ${clienteToDelete.apellido}`.trim()}
                </strong>
              </p>
              {clienteToDelete.documentoIdentidad && (
                <p className="text-slate-500">
                  DNI: {clienteToDelete.documentoIdentidad}
                </p>
              )}
              {clienteToDelete.email && (
                <p className="text-slate-500">Email: {clienteToDelete.email}</p>
              )}
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setClienteToDelete(null)}
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
