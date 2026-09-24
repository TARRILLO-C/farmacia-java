'use client';

import * as React from 'react';
import {
  Briefcase,
  Plus,
  Search,
  Building2,
  Phone,
  Mail,
  MapPin,
  Pencil,
  Trash2,
  RefreshCw,
  CheckCircle2,
  XCircle,
  X,
  Archive,
  UserCheck,
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
import { Proveedor, CreateProveedorDTO } from '@/types';
import {
  getProveedores,
  createProveedor,
  updateProveedor,
  deleteProveedor,
} from '@/services/proveedorService';

export default function ProveedoresPage() {
  const [proveedores, setProveedores] = React.useState<Proveedor[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState('');
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false);
  const [editingProveedor, setEditingProveedor] = React.useState<Proveedor | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Delete dialog
  const [proveedorToDelete, setProveedorToDelete] = React.useState<Proveedor | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);

  // Toast
  const [toast, setToast] = React.useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const [formData, setFormData] = React.useState<CreateProveedorDTO>({
    ruc: '',
    razonSocial: '',
    nombreContacto: '',
    telefono: '',
    email: '',
    direccion: '',
    activo: true,
  });

  const loadProveedores = React.useCallback(async () => {
    try {
      setLoading(true);
      const data = await getProveedores();
      setProveedores(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error al cargar proveedores:', error);
      showToast('error', 'No se pudieron sincronizar los proveedores.');
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadProveedores();
  }, [loadProveedores]);

  const handleOpenDrawer = (prov?: Proveedor) => {
    if (prov) {
      setEditingProveedor(prov);
      setFormData({
        ruc: prov.ruc,
        razonSocial: prov.razonSocial,
        nombreContacto: prov.nombreContacto || '',
        telefono: prov.telefono || '',
        email: prov.email || '',
        direccion: prov.direccion || '',
        activo: prov.activo ?? true,
      });
    } else {
      setEditingProveedor(null);
      setFormData({
        ruc: '',
        razonSocial: '',
        nombreContacto: '',
        telefono: '',
        email: '',
        direccion: '',
        activo: true,
      });
    }
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setEditingProveedor(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.ruc.trim() || !formData.razonSocial.trim()) {
      showToast('error', 'RUC y Razón Social son campos requeridos.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingProveedor) {
        await updateProveedor(editingProveedor.id, formData);
        showToast('success', `Proveedor "${formData.razonSocial}" actualizado con éxito.`);
      } else {
        await createProveedor(formData);
        showToast('success', `Proveedor "${formData.razonSocial}" registrado con éxito.`);
      }
      handleCloseDrawer();
      loadProveedores();
    } catch (error: any) {
      showToast('error', error.response?.data?.message || 'Error al procesar el proveedor.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!proveedorToDelete) return;
    setIsDeleting(true);
    try {
      await deleteProveedor(proveedorToDelete.id);
      showToast('success', `Proveedor "${proveedorToDelete.razonSocial}" desactivado/eliminado.`);
      setProveedorToDelete(null);
      loadProveedores();
    } catch (error) {
      showToast('error', 'Error al eliminar el proveedor.');
    } finally {
      setIsDeleting(false);
    }
  };

  const filtered = React.useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return proveedores;
    return proveedores.filter(
      (p) =>
        p.razonSocial.toLowerCase().includes(q) ||
        p.ruc.includes(q) ||
        (p.nombreContacto && p.nombreContacto.toLowerCase().includes(q))
    );
  }, [proveedores, search]);

  const stats = React.useMemo(() => {
    const total = proveedores.length;
    const activos = proveedores.filter((p) => p.activo ?? true).length;
    const conContacto = proveedores.filter((p) => Boolean(p.nombreContacto)).length;
    const inactivos = total - activos;
    return { total, activos, conContacto, inactivos };
  }, [proveedores]);

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
            <Briefcase className="w-4 h-4" />
            <span>Gestión de Cadena de Suministro</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1a365d] mt-1">
            Proveedores Farmacéuticos
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            Registro de distribuidores mayoristas, droguerías y laboratorios comerciales.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadProveedores}
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
            <span>Nuevo Proveedor</span>
          </Button>
        </div>
      </div>

      {/* Tarjetas KPI */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-white border border-slate-200/80 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Total Proveedores</span>
            <div className="p-2 rounded-xl bg-slate-100 text-[#1a365d]">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-[#1a365d]">{stats.total}</span>
            <span className="text-[11px] text-slate-400">empresas</span>
          </div>
        </Card>

        <Card className="p-4 bg-white border border-emerald-100 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-800">Proveedores Activos</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-700">{stats.activos}</span>
            <span className="text-[11px] text-emerald-600/80">con orden de compra</span>
          </div>
        </Card>

        <Card className="p-4 bg-white border border-sky-100 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-sky-800">Con Contacto Directo</span>
            <div className="p-2 rounded-xl bg-sky-50 text-sky-600">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-sky-700">{stats.conContacto}</span>
            <span className="text-[11px] text-sky-600/80">ejecutivos registrados</span>
          </div>
        </Card>

        <Card className="p-4 bg-white border border-slate-200/80 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Inactivos / Bajas</span>
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
              placeholder="Buscar por RUC, Razón Social o Contacto..."
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
            {proveedores.length} proveedores
          </div>
        </div>

        {/* Tabla */}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-36">RUC</TableHead>
              <TableHead>Razón Social & Dirección</TableHead>
              <TableHead>Contacto Comercial</TableHead>
              <TableHead>Comunicación</TableHead>
              <TableHead className="text-center">Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, idx) => (
                <TableRow key={idx} className="animate-pulse">
                  <TableCell><div className="h-4 w-28 bg-slate-200 rounded-md"></div></TableCell>
                  <TableCell><div className="h-4 w-52 bg-slate-200 rounded-md"></div></TableCell>
                  <TableCell><div className="h-4 w-32 bg-slate-200 rounded-md"></div></TableCell>
                  <TableCell><div className="h-4 w-36 bg-slate-200 rounded-md"></div></TableCell>
                  <TableCell className="text-center"><div className="h-5 w-16 bg-slate-200 rounded-full mx-auto"></div></TableCell>
                  <TableCell className="text-right"><div className="h-6 w-16 bg-slate-200 rounded-md ml-auto"></div></TableCell>
                </TableRow>
              ))
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-14 text-center">
                  <div className="flex flex-col items-center justify-center max-w-sm mx-auto space-y-3">
                    <div className="p-3.5 rounded-2xl bg-slate-100 text-slate-400">
                      <Archive className="w-8 h-8" />
                    </div>
                    <p className="text-sm font-bold text-slate-700">
                      {search ? 'Sin coincidencias para la búsqueda' : 'No hay proveedores registrados'}
                    </p>
                    <p className="text-xs text-slate-400">
                      {search
                        ? 'Verifique los términos de búsqueda o limpie el filtro.'
                        : 'Comience añadiendo distribuidores con el botón "Nuevo Proveedor".'}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((prov) => {
                const isActivo = prov.activo ?? true;

                return (
                  <TableRow key={prov.id} className="group hover:bg-slate-50/70 transition-colors">
                    {/* RUC */}
                    <TableCell>
                      <span className="font-mono text-xs font-bold text-[#1a365d] bg-slate-100 px-2 py-1 rounded-md border border-slate-200">
                        {prov.ruc}
                      </span>
                    </TableCell>

                    {/* Razón Social y Dirección */}
                    <TableCell>
                      <div className="flex flex-col min-w-[200px]">
                        <span className="font-bold text-slate-900 text-sm group-hover:text-[#319795] transition-colors">
                          {prov.razonSocial}
                        </span>
                        {prov.direccion && (
                          <div className="flex items-center gap-1 text-xs text-slate-400 mt-0.5">
                            <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                            <span className="truncate max-w-xs">{prov.direccion}</span>
                          </div>
                        )}
                      </div>
                    </TableCell>

                    {/* Contacto */}
                    <TableCell>
                      {prov.nombreContacto ? (
                        <div className="flex items-center gap-1.5 text-xs text-slate-700 font-medium">
                          <UserCheck className="w-3.5 h-3.5 text-teal-600" />
                          <span>{prov.nombreContacto}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 italic">No especificado</span>
                      )}
                    </TableCell>

                    {/* Comunicación */}
                    <TableCell>
                      <div className="flex flex-col gap-1 text-xs text-slate-600">
                        {prov.telefono && (
                          <div className="flex items-center gap-1.5">
                            <Phone className="w-3.5 h-3.5 text-slate-400" />
                            <span>{prov.telefono}</span>
                          </div>
                        )}
                        {prov.email && (
                          <div className="flex items-center gap-1.5">
                            <Mail className="w-3.5 h-3.5 text-slate-400" />
                            <span className="text-slate-500 truncate max-w-[180px]">{prov.email}</span>
                          </div>
                        )}
                        {!prov.telefono && !prov.email && (
                          <span className="text-slate-400 italic">Sin datos</span>
                        )}
                      </div>
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
                          title="Editar proveedor"
                          onClick={() => handleOpenDrawer(prov)}
                          className="h-8 w-8 text-slate-500 hover:text-[#319795] hover:bg-teal-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Eliminar o dar de baja"
                          onClick={() => setProveedorToDelete(prov)}
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

      {/* Drawer Alta / Edición de Proveedor */}
      <AppDrawer
        isOpen={isDrawerOpen}
        onClose={handleCloseDrawer}
        title={editingProveedor ? 'Editar Proveedor' : 'Nuevo Proveedor'}
        description="Complete la ficha técnica y fiscal del proveedor o laboratorio distribuidor."
        icon={Building2}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        submitText={editingProveedor ? 'Actualizar Ficha' : 'Registrar Proveedor'}
        cancelText="Cancelar"
        maxWidth="max-w-lg"
      >
        <div className="space-y-4 py-2">
          {/* RUC */}
          <div className="space-y-1.5">
            <Label htmlFor="ruc" className="text-xs font-bold text-slate-700">
              Número de RUC (11 dígitos) <span className="text-rose-500">*</span>
            </Label>
            <Input
              id="ruc"
              maxLength={11}
              value={formData.ruc}
              onChange={(e) => setFormData({ ...formData, ruc: e.target.value.replace(/\D/g, '') })}
              placeholder="Ej: 20512345678"
              className="font-mono text-xs h-9 rounded-xl border-slate-200 focus-visible:ring-[#319795]/20 focus-visible:border-[#319795]"
              required
            />
          </div>

          {/* Razón Social */}
          <div className="space-y-1.5">
            <Label htmlFor="razonSocial" className="text-xs font-bold text-slate-700">
              Razón Social / Nombre Comercial <span className="text-rose-500">*</span>
            </Label>
            <Input
              id="razonSocial"
              value={formData.razonSocial}
              onChange={(e) => setFormData({ ...formData, razonSocial: e.target.value })}
              placeholder="Ej: Droguería & Distribuidora Médica del Norte S.A.C."
              className="text-xs h-9 rounded-xl border-slate-200 focus-visible:ring-[#319795]/20 focus-visible:border-[#319795]"
              required
            />
          </div>

          {/* Contacto */}
          <div className="space-y-1.5">
            <Label htmlFor="nombreContacto" className="text-xs font-bold text-slate-700">
              Persona de Contacto / Asesor Comercial
            </Label>
            <Input
              id="nombreContacto"
              value={formData.nombreContacto || ''}
              onChange={(e) => setFormData({ ...formData, nombreContacto: e.target.value })}
              placeholder="Ej: Lic. Carlos Mendoza"
              className="text-xs h-9 rounded-xl border-slate-200 focus-visible:ring-[#319795]/20 focus-visible:border-[#319795]"
            />
          </div>

          {/* Teléfono y Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="telefono" className="text-xs font-bold text-slate-700">
                Teléfono de Contacto
              </Label>
              <Input
                id="telefono"
                value={formData.telefono || ''}
                onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                placeholder="Ej: 01-445-9870"
                className="text-xs h-9 rounded-xl border-slate-200 focus-visible:ring-[#319795]/20 focus-visible:border-[#319795]"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-bold text-slate-700">
                Correo Institucional
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email || ''}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="ventas@distribuidora.pe"
                className="text-xs h-9 rounded-xl border-slate-200 focus-visible:ring-[#319795]/20 focus-visible:border-[#319795]"
              />
            </div>
          </div>

          {/* Dirección */}
          <div className="space-y-1.5">
            <Label htmlFor="direccion" className="text-xs font-bold text-slate-700">
              Dirección Fiscal o Almacén
            </Label>
            <Input
              id="direccion"
              value={formData.direccion || ''}
              onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
              placeholder="Ej: Av. Los Industriales 450, Lima"
              className="text-xs h-9 rounded-xl border-slate-200 focus-visible:ring-[#319795]/20 focus-visible:border-[#319795]"
            />
          </div>

          {/* Estado Habilitado */}
          <div className="pt-2 flex items-center justify-between border-t border-slate-100">
            <div>
              <Label htmlFor="activo" className="text-xs font-bold text-slate-800 cursor-pointer">
                Proveedor Activo para Compras
              </Label>
              <p className="text-[11px] text-slate-400">
                Habilita o deshabilita la emisión de nuevas órdenes de compra hacia este proveedor.
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
      <Dialog open={!!proveedorToDelete} onOpenChange={(open) => !open && setProveedorToDelete(null)}>
        <DialogContent className="sm:max-w-md bg-white rounded-2xl border border-slate-200 shadow-xl">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-rose-50 text-rose-600 border border-rose-100">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold text-slate-900">
                  Desactivar Proveedor
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-500 mt-0.5">
                  El proveedor dejará de figurar en el registro de órdenes de abastecimiento.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <p className="text-xs text-slate-600 my-2">
            ¿Confirma que desea dar de baja a{' '}
            <strong className="text-slate-900">&quot;{proveedorToDelete?.razonSocial}&quot;</strong> (RUC: {proveedorToDelete?.ruc})?
          </p>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isDeleting}
              onClick={() => setProveedorToDelete(null)}
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
