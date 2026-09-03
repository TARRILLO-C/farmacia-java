'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Users,
  UserPlus,
  Search,
  Pencil,
  Trash2,
  Sparkles,
  History,
  Phone,
  CreditCard,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  X,
  Loader2,
} from 'lucide-react';
import { Cliente, TipoCliente } from '@/types';
import { getClientes, deleteCliente } from '@/services/clienteService';
import { ClienteModal } from '@/components/modules/clientes/ClienteModal';
import { HistorialClienteModal } from '@/components/modules/clientes/HistorialClienteModal';
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

const DEMO_CLIENTES: Cliente[] = [
  {
    id: 1,
    documentoIdentidad: '74218934',
    tipoDocumento: 'DNI',
    nombre: 'Elena Rosa',
    apellido: 'Mendoza Paredes',
    email: 'elena.mendoza@gmail.com',
    telefono: '984123456',
    direccion: 'Av. Bolognesi 412, Chiclayo',
    tipoCliente: TipoCliente.BENEFICIARIO,
    esClienteAmigo: true,
    codigoClienteAmigo: 'CA-48291',
    puntosFidelidad: 180,
    totalCompras: 14,
    montoTotalComprado: 684.5,
    activo: true,
  },
  {
    id: 2,
    documentoIdentidad: '41982341',
    tipoDocumento: 'DNI',
    nombre: 'Carlos Manuel',
    apellido: 'Arroyo Vega',
    email: 'carlos.arroyo@outlook.com',
    telefono: '978554210',
    direccion: 'Calle Real 230, Pimentel',
    tipoCliente: TipoCliente.REGULAR,
    esClienteAmigo: true,
    codigoClienteAmigo: 'CA-10294',
    puntosFidelidad: 95,
    totalCompras: 8,
    montoTotalComprado: 340.0,
    activo: true,
  },
  {
    id: 3,
    documentoIdentidad: '20608941234',
    tipoDocumento: 'RUC',
    nombre: 'Policlínico San Judas Tadeo SAC',
    apellido: '',
    email: 'adquisiciones@sanjudas.pe',
    telefono: '074-281920',
    direccion: 'Av. Luis Gonzales 890',
    tipoCliente: TipoCliente.BENEFICIARIO,
    esClienteAmigo: false,
    totalCompras: 22,
    montoTotalComprado: 4820.0,
    activo: true,
  },
  {
    id: 4,
    documentoIdentidad: '71920412',
    tipoDocumento: 'DNI',
    nombre: 'Lucía Fernanda',
    apellido: 'Gómez Ruiz',
    email: 'lucia.gomez@gmail.com',
    telefono: '951234871',
    direccion: 'Urb. Santa Victoria Mz. C Lt. 4',
    tipoCliente: TipoCliente.NUEVO,
    esClienteAmigo: true,
    codigoClienteAmigo: 'CA-88402',
    puntosFidelidad: 50,
    totalCompras: 1,
    montoTotalComprado: 45.0,
    activo: true,
  },
  {
    id: 5,
    documentoIdentidad: '10478291',
    tipoDocumento: 'DNI',
    nombre: 'Jorge Alberto',
    apellido: 'Niñan Bustamante',
    email: 'jorge.ninan@hotmail.com',
    telefono: '942187342',
    direccion: 'Av. Salaverry 104',
    tipoCliente: TipoCliente.REGULAR,
    esClienteAmigo: false,
    totalCompras: 4,
    montoTotalComprado: 128.5,
    activo: true,
  },
];

export default function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUsingDemo, setIsUsingDemo] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [filtroTipo, setFiltroTipo] = useState<string>('TODOS');
  const [soloClienteAmigo, setSoloClienteAmigo] = useState<boolean>(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [clienteToEdit, setClienteToEdit] = useState<Cliente | null>(null);

  const [isHistorialOpen, setIsHistorialOpen] = useState(false);
  const [clienteParaHistorial, setClienteParaHistorial] = useState<Cliente | null>(null);

  const [clienteToDelete, setClienteToDelete] = useState<Cliente | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [toast, setToast] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchClientes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getClientes();
      if (data && data.length > 0) {
        setClientes(data);
        setIsUsingDemo(false);
      } else {
        setClientes(DEMO_CLIENTES);
        setIsUsingDemo(true);
      }
    } catch {
      setError('Servidor Spring Boot desconectado. Mostrando padrón demostrativo.');
      setClientes(DEMO_CLIENTES);
      setIsUsingDemo(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClientes();
  }, [fetchClientes]);

  const filteredClientes = useMemo(() => {
    return clientes.filter((cli) => {
      const term = searchTerm.toLowerCase().trim();
      const matchText =
        !term ||
        cli.nombre.toLowerCase().includes(term) ||
        cli.apellido.toLowerCase().includes(term) ||
        cli.documentoIdentidad.toLowerCase().includes(term) ||
        (cli.codigoClienteAmigo && cli.codigoClienteAmigo.toLowerCase().includes(term)) ||
        (cli.telefono && cli.telefono.includes(term));

      const matchTipo = filtroTipo === 'TODOS' || cli.tipoCliente === filtroTipo;
      const matchClienteAmigo = !soloClienteAmigo || cli.esClienteAmigo === true;

      return matchText && matchTipo && matchClienteAmigo;
    });
  }, [clientes, searchTerm, filtroTipo, soloClienteAmigo]);

  const totalSociosClienteAmigo = useMemo(
    () => clientes.filter((c) => c.esClienteAmigo).length,
    [clientes]
  );

  const handleOpenCreateModal = () => {
    setClienteToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (cliente: Cliente) => {
    setClienteToEdit(cliente);
    setIsModalOpen(true);
  };

  const handleOpenHistorial = (cliente: Cliente) => {
    setClienteParaHistorial(cliente);
    setIsHistorialOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!clienteToDelete) return;

    setIsDeleting(true);
    try {
      if (!isUsingDemo) {
        await deleteCliente(clienteToDelete.id);
      } else {
        setClientes((prev) => prev.filter((c) => c.id !== clienteToDelete.id));
      }

      showToast(
        'success',
        `Cliente ${clienteToDelete.nombre} ${clienteToDelete.apellido} eliminado correctamente.`
      );
      setClienteToDelete(null);
      if (!isUsingDemo) fetchClientes();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || 'Error al eliminar cliente.';
      showToast('error', msg);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-5">
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

      {/* Encabezado Superior con Acciones */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl md:text-2xl font-black text-[#1a365d] tracking-tight">
              Padrón de Clientes & Pacientes
            </h2>
            <Badge variant="teal" className="font-bold">
              {clientes.length} registrados
            </Badge>
          </div>
          <p className="text-xs md:text-sm text-slate-500 mt-1">
            Gestión de historial clínico farmacéutico y programa de fidelización "ClienteAmigo".
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={fetchClientes}
            title="Recargar padrón"
            className="h-10 w-10 border-slate-200 bg-white hover:bg-slate-50 shadow-2xs"
          >
            <RefreshCw className={`w-4 h-4 text-slate-600 ${loading ? 'animate-spin' : ''}`} />
          </Button>

          <Button
            variant="teal"
            onClick={handleOpenCreateModal}
            className="h-10 px-4 gap-2 font-bold shadow-xs cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Nuevo Cliente</span>
          </Button>
        </div>
      </div>

      {/* Banner ClienteAmigo */}
      <Card className="p-4 bg-gradient-to-r from-[#1a365d] via-[#1f4270] to-[#266266] text-white border-0 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="p-2.5 rounded-xl bg-[#319795] text-white shadow-xs shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-black tracking-wide text-white">
                  Club de Fidelización "ClienteAmigo"
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-white/20 text-[#81e6d9]">
                  {totalSociosClienteAmigo} miembros activos
                </span>
              </div>
              <p className="text-xs text-slate-200 mt-0.5">
                Descuento del 10% en medicamentos seleccionados y acumulación de puntos de salud.
              </p>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setSoloClienteAmigo(!soloClienteAmigo)}
            className={`font-semibold transition-all ${
              soloClienteAmigo
                ? 'bg-[#319795] text-white border-[#319795] hover:bg-[#287e7c]'
                : 'bg-white/10 text-white border-white/20 hover:bg-white/20'
            }`}
          >
            {soloClienteAmigo ? '✓ Mostrando solo Socios' : 'Filtrar solo Socios'}
          </Button>
        </div>
      </Card>

      {isUsingDemo && (
        <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>Aviso:</strong> {error || 'Servidor desconectado. Mostrando padrón demostrativo.'}
            </span>
          </div>
          <button
            onClick={fetchClientes}
            className="text-amber-800 underline font-bold hover:text-amber-950 shrink-0 cursor-pointer"
          >
            Reconectar
          </button>
        </div>
      )}

      {/* Buscador y Filtros */}
      <Card className="p-3.5 bg-white border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por DNI/RUC, nombre o código ClienteAmigo..."
            className="pl-10 pr-9"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-bold text-slate-400 mr-1 hidden sm:inline">
            Tipo:
          </span>
          {[
            { id: 'TODOS', label: 'Todos' },
            { id: TipoCliente.BENEFICIARIO, label: 'Beneficiarios' },
            { id: TipoCliente.REGULAR, label: 'Regulares' },
            { id: TipoCliente.NUEVO, label: 'Nuevos' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFiltroTipo(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                filtroTipo === tab.id
                  ? 'bg-[#1a365d] text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </Card>

      {/* Tabla */}
      <Card className="bg-white border border-slate-200/80 shadow-xs overflow-hidden rounded-2xl">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cliente / Razón Social</TableHead>
              <TableHead>Documento</TableHead>
              <TableHead>Contacto</TableHead>
              <TableHead className="text-center">Tipo Cliente</TableHead>
              <TableHead className="text-center">Programa ClienteAmigo</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, idx) => (
                <TableRow key={idx} className="animate-pulse">
                  <TableCell><div className="h-4 w-40 bg-slate-200 rounded-md"></div></TableCell>
                  <TableCell><div className="h-4 w-24 bg-slate-200 rounded-md"></div></TableCell>
                  <TableCell><div className="h-4 w-28 bg-slate-200 rounded-md"></div></TableCell>
                  <TableCell className="text-center"><div className="h-4 w-20 bg-slate-200 rounded-full mx-auto"></div></TableCell>
                  <TableCell className="text-center"><div className="h-4 w-24 bg-slate-200 rounded-full mx-auto"></div></TableCell>
                  <TableCell className="text-right"><div className="h-4 w-16 bg-slate-200 rounded-md ml-auto"></div></TableCell>
                </TableRow>
              ))
            ) : filteredClientes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-12 text-center">
                  <div className="flex flex-col items-center justify-center max-w-sm mx-auto space-y-3">
                    <div className="p-3.5 rounded-2xl bg-slate-100 text-slate-400">
                      <Users className="w-8 h-8" />
                    </div>
                    <p className="text-sm font-bold text-slate-700">No se encontraron clientes</p>
                    <p className="text-xs text-slate-400">
                      Prueba con otro término de búsqueda o cambia los filtros.
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredClientes.map((cliente) => (
                <TableRow key={cliente.id} className="group">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#1a365d] to-[#2a4365] text-white flex items-center justify-center font-bold text-xs shadow-xs shrink-0">
                        {cliente.nombre.charAt(0)}
                        {cliente.apellido ? cliente.apellido.charAt(0) : ''}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 text-sm">
                          {cliente.nombre} {cliente.apellido}
                        </div>
                        {cliente.email && (
                          <span className="text-[11px] text-slate-400 truncate block max-w-xs">
                            {cliente.email}
                          </span>
                        )}
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                      <span className="font-mono font-bold text-slate-700 text-xs">
                        {cliente.tipoDocumento || 'DNI'}: {cliente.documentoIdentidad}
                      </span>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="space-y-0.5">
                      {cliente.telefono ? (
                        <div className="flex items-center gap-1.5 text-slate-700 font-semibold text-xs">
                          <Phone className="w-3 h-3 text-[#319795]" />
                          <span>{cliente.telefono}</span>
                        </div>
                      ) : (
                        <span className="text-slate-300 italic text-[11px]">Sin teléfono</span>
                      )}
                      {cliente.direccion && (
                        <span className="text-[10px] text-slate-400 block truncate max-w-xs">
                          {cliente.direccion}
                        </span>
                      )}
                    </div>
                  </TableCell>

                  <TableCell className="text-center">
                    <Badge
                      variant={
                        cliente.tipoCliente === TipoCliente.BENEFICIARIO
                          ? 'emerald'
                          : cliente.tipoCliente === TipoCliente.REGULAR
                          ? 'blue'
                          : 'purple'
                      }
                    >
                      {cliente.tipoCliente}
                    </Badge>
                  </TableCell>

                  <TableCell className="text-center">
                    {cliente.esClienteAmigo ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200 font-mono font-bold text-xs">
                        <Sparkles className="w-3 h-3 text-[#319795]" />
                        <span>{cliente.codigoClienteAmigo || 'CA-SOCIO'}</span>
                      </span>
                    ) : (
                      <span className="text-slate-300 font-bold">—</span>
                    )}
                  </TableCell>

                  <TableCell className="text-right">
                    <div className="inline-flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenHistorial(cliente)}
                        title="Ver historial de compras"
                        className="h-8 w-8 text-slate-500 hover:text-[#319795] hover:bg-[#319795]/10 rounded-lg cursor-pointer"
                      >
                        <History className="w-4 h-4" />
                      </Button>

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenEditModal(cliente)}
                        title="Editar cliente"
                        className="h-8 w-8 text-slate-600 hover:text-[#1a365d] hover:bg-slate-100 rounded-lg cursor-pointer"
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setClienteToDelete(cliente)}
                        title="Eliminar cliente"
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

      {/* Modales Shadcn */}
      <ClienteModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmitSuccess={() => {
          showToast(
            'success',
            clienteToEdit
              ? 'Cliente actualizado con éxito.'
              : 'Cliente registrado correctamente con beneficios aplicados.'
          );
          fetchClientes();
        }}
        clienteToEdit={clienteToEdit}
      />

      <HistorialClienteModal
        isOpen={isHistorialOpen}
        onClose={() => setIsHistorialOpen(false)}
        cliente={clienteParaHistorial}
      />

      {/* Diálogo Eliminación */}
      <Dialog open={Boolean(clienteToDelete)} onOpenChange={(open) => !open && !isDeleting && setClienteToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-rose-100 text-rose-600">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <DialogTitle>¿Eliminar cliente?</DialogTitle>
                <DialogDescription>Se dará de baja la ficha en el padrón farmacéutico.</DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {clienteToDelete && (
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-1 my-2">
              <p>
                Cliente: <strong>{clienteToDelete.nombre} {clienteToDelete.apellido}</strong>
              </p>
              <p className="text-slate-500">
                {clienteToDelete.tipoDocumento || 'DNI'}: {clienteToDelete.documentoIdentidad}
              </p>
              {clienteToDelete.esClienteAmigo && (
                <p className="text-amber-600 font-semibold pt-1">
                  Atención: El cliente cuenta con suscripción activa a "ClienteAmigo" ({clienteToDelete.codigoClienteAmigo}).
                </p>
              )}
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setClienteToDelete(null)}
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
