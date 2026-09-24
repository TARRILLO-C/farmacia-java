'use client';

import * as React from 'react';
import {
  UserCheck,
  Plus,
  Search,
  Phone,
  Pencil,
  Trash2,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Users,
  X,
  Archive,
  CreditCard,
  ShieldCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
import { AppDrawer } from '@/components/common/AppDrawer';
import { Empleado, CreateEmpleadoDTO } from '@/types';
import {
  getEmpleados,
  createEmpleado,
  updateEmpleado,
  deleteEmpleado,
} from '@/services/empleadoService';

export default function EmpleadosPage() {
  const [empleados, setEmpleados] = React.useState<Empleado[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState('');
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false);
  const [editingEmpleado, setEditingEmpleado] = React.useState<Empleado | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Delete dialog
  const [empleadoToDelete, setEmpleadoToDelete] = React.useState<Empleado | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);

  // Toast
  const [toast, setToast] = React.useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const [formData, setFormData] = React.useState<CreateEmpleadoDTO>({
    dni: '',
    nombres: '',
    apellidos: '',
    telefono: '',
    activo: true,
  });

  const loadEmpleados = React.useCallback(async () => {
    try {
      setLoading(true);
      const data = await getEmpleados();
      setEmpleados(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error al cargar empleados:', error);
      showToast('error', 'No se pudieron sincronizar los empleados.');
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadEmpleados();
  }, [loadEmpleados]);

  const handleOpenDrawer = (emp?: Empleado) => {
    if (emp) {
      setEditingEmpleado(emp);
      setFormData({
        dni: emp.dni,
        nombres: emp.nombres,
        apellidos: emp.apellidos,
        telefono: emp.telefono || '',
        activo: emp.activo ?? true,
      });
    } else {
      setEditingEmpleado(null);
      setFormData({
        dni: '',
        nombres: '',
        apellidos: '',
        telefono: '',
        activo: true,
      });
    }
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setEditingEmpleado(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.dni.trim() || !formData.nombres.trim() || !formData.apellidos.trim()) {
      showToast('error', 'DNI, Nombres y Apellidos son obligatorios.');
      return;
    }

    if (formData.dni.length !== 8) {
      showToast('error', 'El DNI debe contener exactamente 8 dígitos numéricos.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingEmpleado) {
        await updateEmpleado(editingEmpleado.id, formData);
        showToast('success', `Empleado "${formData.nombres} ${formData.apellidos}" actualizado.`);
      } else {
        await createEmpleado(formData);
        showToast('success', `Empleado "${formData.nombres} ${formData.apellidos}" registrado.`);
      }
      handleCloseDrawer();
      loadEmpleados();
    } catch (error: any) {
      showToast('error', error.response?.data?.message || 'Error al procesar el empleado.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!empleadoToDelete) return;
    setIsDeleting(true);
    try {
      await deleteEmpleado(empleadoToDelete.id);
      showToast('success', `Colaborador "${empleadoToDelete.nombres} ${empleadoToDelete.apellidos}" desactivado.`);
      setEmpleadoToDelete(null);
      loadEmpleados();
    } catch (error) {
      showToast('error', 'Error al desactivar el empleado.');
    } finally {
      setIsDeleting(false);
    }
  };

  const filtered = React.useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return empleados;
    return empleados.filter((emp) => {
      const fullName = `${emp.nombres} ${emp.apellidos}`.toLowerCase();
      return fullName.includes(q) || emp.dni.includes(q) || (emp.telefono && emp.telefono.includes(q));
    });
  }, [empleados, search]);

  const stats = React.useMemo(() => {
    const total = empleados.length;
    const activos = empleados.filter((e) => e.activo ?? true).length;
    const conTelefono = empleados.filter((e) => Boolean(e.telefono)).length;
    const inactivos = total - activos;
    return { total, activos, conTelefono, inactivos };
  }, [empleados]);

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl border text-sm font-medium transition-all animate-in fade-in slide-in-from-top-4 ${
            toast.type === 'success'
              ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
              : 'bg-rose-50 text-rose-900 border-rose-200'
          }`}
        >
          {toast.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : (
            <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
          )}
          <span>{toast.message}</span>
          <button onClick={() => setToast(null)} className="p-1 hover:bg-black/5 rounded-lg ml-2">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-[#319795] font-semibold text-sm">
            <UserCheck className="w-4 h-4" />
            <span>Talento Humano & Personal Clínico</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1a365d] mt-1">
            Personal y Empleados
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            Registro del personal farmacéutico, químicos regentes y cajeros autorizados para operar el sistema.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadEmpleados}
            disabled={loading}
            className="h-8 sm:h-9 gap-1.5 text-xs font-semibold rounded-xl border-slate-200 text-slate-700 hover:bg-slate-100 shadow-2xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refrescar</span>
          </Button>

          <Button
            size="sm"
            onClick={() => handleOpenDrawer()}
            className="h-8 sm:h-9 gap-1.5 text-xs font-bold rounded-xl bg-[#319795] hover:bg-[#287e7c] text-white shadow-xs active:scale-[0.98] cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Nuevo Empleado</span>
          </Button>
        </div>
      </div>

      {/* Tarjetas KPI */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-white border border-slate-200/80 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Total Colaboradores</span>
            <div className="p-2 rounded-xl bg-slate-100 text-[#1a365d]">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-[#1a365d]">{stats.total}</span>
            <span className="text-[11px] text-slate-400">registrados</span>
          </div>
        </Card>

        <Card className="p-4 bg-white border border-emerald-100 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-800">Personal Activo</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-700">{stats.activos}</span>
            <span className="text-[11px] text-emerald-600/80">en nómina</span>
          </div>
        </Card>

        <Card className="p-4 bg-white border border-sky-100 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-sky-800">Con Contacto Móvil</span>
            <div className="p-2 rounded-xl bg-sky-50 text-sky-600">
              <Phone className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-sky-700">{stats.conTelefono}</span>
            <span className="text-[11px] text-sky-600/80">con teléfono</span>
          </div>
        </Card>

        <Card className="p-4 bg-white border border-slate-200/80 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Inactivos / Cesados</span>
            <div className="p-2 rounded-xl bg-slate-100 text-slate-500">
              <XCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-600">{stats.inactivos}</span>
            <span className="text-[11px] text-slate-400">deshabilitados</span>
          </div>
        </Card>
      </div>

      {/* Contenedor Principal: Filtros y Tabla */}
      <Card className="bg-white border border-slate-200/80 shadow-xs rounded-2xl overflow-hidden">
        {/* Barra de Filtro */}
        <div className="p-4 border-b border-slate-100 bg-slate-50/40 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Buscar por DNI, Nombres o Apellidos..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-8 h-9 text-xs bg-white rounded-xl border-slate-200 shadow-none focus-visible:ring-[#319795]/20 focus-visible:border-[#319795]"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="text-xs text-slate-500 font-medium self-end sm:self-center">
            Mostrando <span className="font-bold text-slate-800">{filtered.length}</span> de{' '}
            {empleados.length} colaboradores
          </div>
        </div>

        {/* Tabla */}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-36">DNI</TableHead>
              <TableHead>Colaborador / Funcionario</TableHead>
              <TableHead>Teléfono Móvil</TableHead>
              <TableHead className="text-center">Estado Laboral</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, idx) => (
                <TableRow key={idx} className="animate-pulse">
                  <TableCell><div className="h-4 w-24 bg-slate-200 rounded-md"></div></TableCell>
                  <TableCell><div className="h-4 w-48 bg-slate-200 rounded-md"></div></TableCell>
                  <TableCell><div className="h-4 w-28 bg-slate-200 rounded-md"></div></TableCell>
                  <TableCell className="text-center"><div className="h-5 w-16 bg-slate-200 rounded-full mx-auto"></div></TableCell>
                  <TableCell className="text-right"><div className="h-6 w-16 bg-slate-200 rounded-md ml-auto"></div></TableCell>
                </TableRow>
              ))
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-14 text-center">
                  <div className="flex flex-col items-center justify-center max-w-sm mx-auto space-y-3">
                    <div className="p-3.5 rounded-2xl bg-slate-100 text-slate-400">
                      <Archive className="w-8 h-8" />
                    </div>
                    <p className="text-sm font-bold text-slate-700">
                      {search ? 'Sin resultados para la búsqueda' : 'No hay empleados registrados'}
                    </p>
                    <p className="text-xs text-slate-400">
                      {search
                        ? 'Verifique los datos ingresados o limpie el filtro de búsqueda.'
                        : 'Comience añadiendo personal con el botón "Nuevo Empleado".'}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((emp) => {
                const isActivo = emp.activo ?? true;

                return (
                  <TableRow key={emp.id} className="group hover:bg-slate-50/70 transition-colors">
                    {/* DNI */}
                    <TableCell>
                      <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-[#1a365d] bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200 w-fit">
                        <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                        <span>{emp.dni}</span>
                      </div>
                    </TableCell>

                    {/* Colaborador */}
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-900 text-sm group-hover:text-[#319795] transition-colors">
                          {emp.nombres} {emp.apellidos}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          ID Empleado #{emp.id}
                        </span>
                      </div>
                    </TableCell>

                    {/* Teléfono */}
                    <TableCell>
                      {emp.telefono ? (
                        <div className="flex items-center gap-1.5 text-xs text-slate-600">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          <span>{emp.telefono}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 italic">No registrado</span>
                      )}
                    </TableCell>

                    {/* Estado */}
                    <TableCell className="text-center">
                      {isActivo ? (
                        <Badge variant="emerald" className="text-[11px] px-2.5 py-0.5">
                          <CheckCircle2 className="w-3 h-3 mr-1" /> Activo
                        </Badge>
                      ) : (
                        <Badge variant="destructive" className="text-[11px] px-2.5 py-0.5">
                          <XCircle className="w-3 h-3 mr-1" /> Inactivo
                        </Badge>
                      )}
                    </TableCell>

                    {/* Acciones */}
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Editar colaborador"
                          onClick={() => handleOpenDrawer(emp)}
                          className="h-8 w-8 text-slate-500 hover:text-[#319795] hover:bg-teal-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Dar de baja"
                          onClick={() => setEmpleadoToDelete(emp)}
                          className="h-8 w-8 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Drawer Alta / Edición de Empleado */}
      <AppDrawer
        isOpen={isDrawerOpen}
        onClose={handleCloseDrawer}
        title={editingEmpleado ? 'Editar Colaborador' : 'Nuevo Colaborador'}
        description="Ficha del personal para asignación de turnos y control de acceso."
        icon={Users}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        submitText={editingEmpleado ? 'Guardar Cambios' : 'Registrar Empleado'}
        cancelText="Cancelar"
        maxWidth="max-w-md"
      >
        <div className="space-y-4 py-2">
          {/* DNI */}
          <div className="space-y-1.5">
            <Label htmlFor="dni" className="text-xs font-bold text-slate-700">
              Número de DNI (8 dígitos) <span className="text-rose-500">*</span>
            </Label>
            <Input
              id="dni"
              maxLength={8}
              value={formData.dni}
              onChange={(e) => setFormData({ ...formData, dni: e.target.value.replace(/\D/g, '') })}
              placeholder="Ej: 72891234"
              className="font-mono text-xs h-9 rounded-xl border-slate-200 focus-visible:ring-[#319795]/20 focus-visible:border-[#319795]"
              required
            />
          </div>

          {/* Nombres */}
          <div className="space-y-1.5">
            <Label htmlFor="nombres" className="text-xs font-bold text-slate-700">
              Nombres <span className="text-rose-500">*</span>
            </Label>
            <Input
              id="nombres"
              value={formData.nombres}
              onChange={(e) => setFormData({ ...formData, nombres: e.target.value })}
              placeholder="Ej: Juan Carlos"
              className="text-xs h-9 rounded-xl border-slate-200 focus-visible:ring-[#319795]/20 focus-visible:border-[#319795]"
              required
            />
          </div>

          {/* Apellidos */}
          <div className="space-y-1.5">
            <Label htmlFor="apellidos" className="text-xs font-bold text-slate-700">
              Apellidos Completos <span className="text-rose-500">*</span>
            </Label>
            <Input
              id="apellidos"
              value={formData.apellidos}
              onChange={(e) => setFormData({ ...formData, apellidos: e.target.value })}
              placeholder="Ej: Pérez Quispe"
              className="text-xs h-9 rounded-xl border-slate-200 focus-visible:ring-[#319795]/20 focus-visible:border-[#319795]"
              required
            />
          </div>

          {/* Teléfono */}
          <div className="space-y-1.5">
            <Label htmlFor="telefono" className="text-xs font-bold text-slate-700">
              Teléfono Celular
            </Label>
            <Input
              id="telefono"
              value={formData.telefono || ''}
              onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
              placeholder="Ej: 987654321"
              className="text-xs h-9 rounded-xl border-slate-200 focus-visible:ring-[#319795]/20 focus-visible:border-[#319795]"
            />
          </div>

          {/* Estado Activo */}
          <div className="pt-2 flex items-center justify-between border-t border-slate-100">
            <div>
              <Label htmlFor="activo" className="text-xs font-bold text-slate-800 cursor-pointer">
                Colaborador Activo
              </Label>
              <p className="text-[11px] text-slate-400">
                Determina si el colaborador está habilitado para ingresar al sistema y operar cajas.
              </p>
            </div>
            <Switch
              id="activo"
              checked={formData.activo}
              onCheckedChange={(checked) => setFormData({ ...formData, activo: checked })}
            />
          </div>
        </div>
      </AppDrawer>

      {/* Diálogo Confirmación Eliminar */}
      <Dialog open={!!empleadoToDelete} onOpenChange={(open) => !open && setEmpleadoToDelete(null)}>
        <DialogContent className="sm:max-w-md bg-white rounded-2xl border border-slate-200 shadow-xl">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-rose-50 text-rose-600 border border-rose-100">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold text-slate-900">
                  Desactivar Colaborador
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-500 mt-0.5">
                  El colaborador perderá el acceso a las funciones del sistema.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <p className="text-xs text-slate-600 my-2">
            ¿Confirma que desea dar de baja al empleado{' '}
            <strong className="text-slate-900">
              &quot;{empleadoToDelete?.nombres} {empleadoToDelete?.apellidos}&quot;
            </strong>{' '}
            (DNI: {empleadoToDelete?.dni})?
          </p>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isDeleting}
              onClick={() => setEmpleadoToDelete(null)}
              className="rounded-xl text-xs font-semibold border-slate-200 text-slate-600 hover:bg-slate-100"
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              disabled={isDeleting}
              onClick={handleDeleteConfirm}
              className="rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-xs"
            >
              {isDeleting ? 'Procesando...' : 'Confirmar Baja'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
