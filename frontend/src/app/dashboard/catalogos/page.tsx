'use client';

import * as React from 'react';
import {
  FlaskConical,
  Plus,
  Search,
  Pencil,
  Trash2,
  RefreshCw,
  Building,
  Atom,
  Package,
  CheckCircle2,
  XCircle,
  X,
  Phone,
  Mail,
  FileText,
  Barcode,
  Layers,
  Archive,
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
import {
  Laboratorio,
  PrincipioActivo,
  Presentacion,
  CreateLaboratorioDTO,
  CreatePrincipioActivoDTO,
  CreatePresentacionDTO,
} from '@/types';
import {
  getLaboratorios,
  createLaboratorio,
  updateLaboratorio,
  deleteLaboratorio,
} from '@/services/laboratorioService';
import {
  getPrincipiosActivos,
  createPrincipioActivo,
  updatePrincipioActivo,
  deletePrincipioActivo,
} from '@/services/principioActivoService';
import {
  getPresentaciones,
  createPresentacion,
  updatePresentacion,
  deletePresentacion,
} from '@/services/presentacionService';

type TabKey = 'laboratorios' | 'principios' | 'presentaciones';

export default function CatalogosPage() {
  const [activeTab, setActiveTab] = React.useState<TabKey>('laboratorios');
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState('');

  const [laboratorios, setLaboratorios] = React.useState<Laboratorio[]>([]);
  const [principios, setPrincipios] = React.useState<PrincipioActivo[]>([]);
  const [presentaciones, setPresentaciones] = React.useState<Presentacion[]>([]);

  // Drawer
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false);
  const [editingItem, setEditingItem] = React.useState<any>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Delete Dialog
  const [itemToDelete, setItemToDelete] = React.useState<{ id: number; nombre: string } | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);

  // Form states
  const [nombre, setNombre] = React.useState('');
  const [codigo, setCodigo] = React.useState('');
  const [descripcion, setDescripcion] = React.useState('');
  const [telefono, setTelefono] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [activo, setActivo] = React.useState(true);

  // Toast
  const [toast, setToast] = React.useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const loadData = React.useCallback(async () => {
    try {
      setLoading(true);
      const [labs, pas, pres] = await Promise.all([
        getLaboratorios().catch(() => []),
        getPrincipiosActivos().catch(() => []),
        getPresentaciones().catch(() => []),
      ]);
      setLaboratorios(Array.isArray(labs) ? labs : []);
      setPrincipios(Array.isArray(pas) ? pas : []);
      setPresentaciones(Array.isArray(pres) ? pres : []);
    } catch (error) {
      console.error('Error al cargar catálogos:', error);
      showToast('error', 'No se pudieron sincronizar los catálogos.');
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const handleOpenDrawer = (item?: any) => {
    if (item) {
      setEditingItem(item);
      setNombre(item.nombre || '');
      setCodigo(item.codigo || '');
      setDescripcion(item.descripcion || '');
      setTelefono(item.telefono || '');
      setEmail(item.email || '');
      setActivo(item.activo ?? true);
    } else {
      setEditingItem(null);
      setNombre('');
      setCodigo('');
      setDescripcion('');
      setTelefono('');
      setEmail('');
      setActivo(true);
    }
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setEditingItem(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) {
      showToast('error', 'El nombre es obligatorio.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (activeTab === 'laboratorios') {
        const dto: CreateLaboratorioDTO = {
          nombre: nombre.trim(),
          codigo: codigo.trim() || undefined,
          telefono: telefono.trim() || undefined,
          email: email.trim() || undefined,
          activo,
        };
        if (editingItem) {
          await updateLaboratorio(editingItem.id, dto);
          showToast('success', `Laboratorio "${nombre.trim()}" actualizado.`);
        } else {
          await createLaboratorio(dto);
          showToast('success', `Laboratorio "${nombre.trim()}" registrado.`);
        }
      } else if (activeTab === 'principios') {
        const dto: CreatePrincipioActivoDTO = {
          nombre: nombre.trim(),
          codigo: codigo.trim() || undefined,
          descripcion: descripcion.trim() || undefined,
          activo,
        };
        if (editingItem) {
          await updatePrincipioActivo(editingItem.id, dto);
          showToast('success', `Principio activo "${nombre.trim()}" actualizado.`);
        } else {
          await createPrincipioActivo(dto);
          showToast('success', `Principio activo "${nombre.trim()}" registrado.`);
        }
      } else {
        const dto: CreatePresentacionDTO = {
          nombre: nombre.trim(),
          descripcion: descripcion.trim() || undefined,
          activo,
        };
        if (editingItem) {
          await updatePresentacion(editingItem.id, dto);
          showToast('success', `Presentación "${nombre.trim()}" actualizada.`);
        } else {
          await createPresentacion(dto);
          showToast('success', `Presentación "${nombre.trim()}" registrada.`);
        }
      }
      handleCloseDrawer();
      loadData();
    } catch (error: any) {
      showToast('error', error.response?.data?.message || 'Error al procesar el catálogo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return;
    setIsDeleting(true);
    try {
      if (activeTab === 'laboratorios') await deleteLaboratorio(itemToDelete.id);
      else if (activeTab === 'principios') await deletePrincipioActivo(itemToDelete.id);
      else await deletePresentacion(itemToDelete.id);

      showToast('success', `"${itemToDelete.nombre}" ha sido eliminado/desactivado.`);
      setItemToDelete(null);
      loadData();
    } catch (error) {
      showToast('error', 'Error al desactivar el elemento.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Filtrado
  const filteredItems = React.useMemo(() => {
    const q = search.toLowerCase().trim();
    if (activeTab === 'laboratorios') {
      return laboratorios.filter(
        (l) => !q || l.nombre.toLowerCase().includes(q) || (l.codigo && l.codigo.toLowerCase().includes(q))
      );
    } else if (activeTab === 'principios') {
      return principios.filter(
        (p) => !q || p.nombre.toLowerCase().includes(q) || (p.codigo && p.codigo.toLowerCase().includes(q))
      );
    } else {
      return presentaciones.filter(
        (pr) => !q || pr.nombre.toLowerCase().includes(q) || (pr.descripcion && pr.descripcion.toLowerCase().includes(q))
      );
    }
  }, [activeTab, search, laboratorios, principios, presentaciones]);

  const currentTabTitle =
    activeTab === 'laboratorios'
      ? 'Laboratorio'
      : activeTab === 'principios'
      ? 'Principio Activo'
      : 'Presentación';

  const CurrentIcon =
    activeTab === 'laboratorios'
      ? Building
      : activeTab === 'principios'
      ? Atom
      : Package;

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

      {/* Encabezado Principal */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-[#319795] font-semibold text-sm">
            <FlaskConical className="w-4 h-4" />
            <span>Catálogos Farmacológicos</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1a365d] mt-1">
            Gestión Clínica y Clasificaciones
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            Administre laboratorios fabricantes, principios activos y presentaciones farmacéuticas.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadData}
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
            <span>Nuevo {currentTabTitle}</span>
          </Button>
        </div>
      </div>

      {/* Tarjetas Resumen / KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-white border border-slate-200/80 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Laboratorios</span>
            <div className="p-2 rounded-xl bg-teal-50 text-[#319795]">
              <Building className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-[#1a365d]">{laboratorios.length}</span>
            <span className="text-[11px] text-slate-400">fabricantes</span>
          </div>
        </Card>

        <Card className="p-4 bg-white border border-slate-200/80 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Principios Activos</span>
            <div className="p-2 rounded-xl bg-sky-50 text-sky-600">
              <Atom className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-[#1a365d]">{principios.length}</span>
            <span className="text-[11px] text-slate-400">moléculas</span>
          </div>
        </Card>

        <Card className="p-4 bg-white border border-slate-200/80 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Presentaciones</span>
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-[#1a365d]">{presentaciones.length}</span>
            <span className="text-[11px] text-slate-400">formatos</span>
          </div>
        </Card>

        <Card className="p-4 bg-white border border-emerald-100 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-800">Total Habilitados</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-700">
              {laboratorios.filter((l) => l.activo ?? true).length +
                principios.filter((p) => p.activo ?? true).length +
                presentaciones.filter((pr) => pr.activo ?? true).length}
            </span>
            <span className="text-[11px] text-emerald-600/80">activos globales</span>
          </div>
        </Card>
      </div>

      {/* Tabs Selector de Catálogo */}
      <div className="flex border-b border-slate-200 gap-2">
        <button
          onClick={() => {
            setActiveTab('laboratorios');
            setSearch('');
          }}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition-colors cursor-pointer ${
            activeTab === 'laboratorios'
              ? 'border-[#319795] text-[#319795] bg-teal-50/50 rounded-t-lg'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Building className="w-4 h-4" />
          <span>Laboratorios</span>
          <Badge variant={activeTab === 'laboratorios' ? 'teal' : 'secondary'} className="text-[10px] ml-1">
            {laboratorios.length}
          </Badge>
        </button>

        <button
          onClick={() => {
            setActiveTab('principios');
            setSearch('');
          }}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition-colors cursor-pointer ${
            activeTab === 'principios'
              ? 'border-[#319795] text-[#319795] bg-teal-50/50 rounded-t-lg'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Atom className="w-4 h-4" />
          <span>Principios Activos</span>
          <Badge variant={activeTab === 'principios' ? 'teal' : 'secondary'} className="text-[10px] ml-1">
            {principios.length}
          </Badge>
        </button>

        <button
          onClick={() => {
            setActiveTab('presentaciones');
            setSearch('');
          }}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition-colors cursor-pointer ${
            activeTab === 'presentaciones'
              ? 'border-[#319795] text-[#319795] bg-teal-50/50 rounded-t-lg'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Presentaciones</span>
          <Badge variant={activeTab === 'presentaciones' ? 'teal' : 'secondary'} className="text-[10px] ml-1">
            {presentaciones.length}
          </Badge>
        </button>
      </div>

      {/* Contenedor Principal: Filtros y Tabla */}
      <Card className="bg-white border border-slate-200/80 shadow-xs rounded-2xl overflow-hidden">
        {/* Barra de Filtro */}
        <div className="p-4 border-b border-slate-100 bg-slate-50/40 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder={`Buscar en ${currentTabTitle.toLowerCase()}s...`}
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
            Mostrando <span className="font-bold text-slate-800">{filteredItems.length}</span> registros
          </div>
        </div>

        {/* Tabla de Datos */}
        <Table>
          <TableHeader>
            <TableRow>
              {activeTab === 'laboratorios' && (
                <>
                  <TableHead className="w-32">Código</TableHead>
                  <TableHead>Nombre del Laboratorio</TableHead>
                  <TableHead>Contacto Comercial</TableHead>
                  <TableHead className="text-center">Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </>
              )}
              {activeTab === 'principios' && (
                <>
                  <TableHead className="w-32">Código</TableHead>
                  <TableHead>Principio Activo (Molécula)</TableHead>
                  <TableHead>Descripción Terapéutica</TableHead>
                  <TableHead className="text-center">Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </>
              )}
              {activeTab === 'presentaciones' && (
                <>
                  <TableHead className="w-24">ID</TableHead>
                  <TableHead>Presentación Farmacéutica</TableHead>
                  <TableHead>Detalle / Forma Farmacéutica</TableHead>
                  <TableHead className="text-center">Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </>
              )}
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, idx) => (
                <TableRow key={idx} className="animate-pulse">
                  <TableCell><div className="h-4 w-20 bg-slate-200 rounded-md"></div></TableCell>
                  <TableCell><div className="h-4 w-44 bg-slate-200 rounded-md"></div></TableCell>
                  <TableCell><div className="h-4 w-36 bg-slate-200 rounded-md"></div></TableCell>
                  <TableCell className="text-center"><div className="h-5 w-16 bg-slate-200 rounded-full mx-auto"></div></TableCell>
                  <TableCell className="text-right"><div className="h-6 w-16 bg-slate-200 rounded-md ml-auto"></div></TableCell>
                </TableRow>
              ))
            ) : filteredItems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-14 text-center">
                  <div className="flex flex-col items-center justify-center max-w-sm mx-auto space-y-3">
                    <div className="p-3.5 rounded-2xl bg-slate-100 text-slate-400">
                      <Archive className="w-8 h-8" />
                    </div>
                    <p className="text-sm font-bold text-slate-700">
                      {search ? 'Sin resultados para la búsqueda' : `No hay ${currentTabTitle.toLowerCase()}s registrados`}
                    </p>
                    <p className="text-xs text-slate-400">
                      {search
                        ? 'Intente con otro término o limpie el filtro de búsqueda.'
                        : `Utilice el botón "Nuevo ${currentTabTitle}" para comenzar a registrar.`}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredItems.map((item: any) => {
                const isActivo = item.activo ?? true;

                return (
                  <TableRow key={item.id} className="group hover:bg-slate-50/70 transition-colors">
                    {/* Código / ID */}
                    <TableCell>
                      {item.codigo ? (
                        <div className="flex items-center gap-1.5 font-mono text-xs font-semibold text-slate-700">
                          <Barcode className="w-3.5 h-3.5 text-slate-400" />
                          <span>{item.codigo}</span>
                        </div>
                      ) : (
                        <span className="font-mono text-xs text-slate-400">#{item.id}</span>
                      )}
                    </TableCell>

                    {/* Nombre */}
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm group-hover:text-[#319795] transition-colors">
                          {item.nombre}
                        </span>
                      </div>
                    </TableCell>

                    {/* Columna Específica */}
                    <TableCell>
                      {activeTab === 'laboratorios' && (
                        <div className="flex flex-col gap-1 text-xs text-slate-600">
                          {item.telefono && (
                            <div className="flex items-center gap-1.5">
                              <Phone className="w-3.5 h-3.5 text-slate-400" />
                              <span>{item.telefono}</span>
                            </div>
                          )}
                          {item.email && (
                            <div className="flex items-center gap-1.5">
                              <Mail className="w-3.5 h-3.5 text-slate-400" />
                              <span className="text-slate-500">{item.email}</span>
                            </div>
                          )}
                          {!item.telefono && !item.email && (
                            <span className="text-slate-400 italic">Sin datos de contacto</span>
                          )}
                        </div>
                      )}
                      {(activeTab === 'principios' || activeTab === 'presentaciones') && (
                        <div className="text-xs text-slate-500 max-w-md line-clamp-2">
                          {item.descripcion || <span className="italic text-slate-400">Sin descripción registrada</span>}
                        </div>
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
                          title="Editar registro"
                          onClick={() => handleOpenDrawer(item)}
                          className="h-8 w-8 text-slate-500 hover:text-[#319795] hover:bg-teal-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Eliminar o desactivar"
                          onClick={() => setItemToDelete({ id: item.id, nombre: item.nombre })}
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

      {/* Drawer de Alta y Edición */}
      <AppDrawer
        isOpen={isDrawerOpen}
        onClose={handleCloseDrawer}
        title={editingItem ? `Editar ${currentTabTitle}` : `Nuevo ${currentTabTitle}`}
        description={`Complete la información reglamentaria para el catálogo de ${currentTabTitle.toLowerCase()}s.`}
        icon={CurrentIcon}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        submitText={editingItem ? 'Guardar Cambios' : `Registrar ${currentTabTitle}`}
        cancelText="Cancelar"
        maxWidth="max-w-md"
      >
        <div className="space-y-4 py-2">
          {/* Nombre */}
          <div className="space-y-1.5">
            <Label htmlFor="nombre" className="text-xs font-bold text-slate-700">
              Nombre Oficial <span className="text-rose-500">*</span>
            </Label>
            <Input
              id="nombre"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder={`Ej: ${
                activeTab === 'laboratorios'
                  ? 'Laboratorios Bagó S.A.'
                  : activeTab === 'principios'
                  ? 'Paracetamol (Acetaminofén)'
                  : 'Caja x 30 Tabletas Recubiertas'
              }`}
              className="text-xs h-9 rounded-xl border-slate-200 focus-visible:ring-[#319795]/20 focus-visible:border-[#319795]"
              required
            />
          </div>

          {/* Código (para laboratorios y principios) */}
          {activeTab !== 'presentaciones' && (
            <div className="space-y-1.5">
              <Label htmlFor="codigo" className="text-xs font-bold text-slate-700">
                Código Interno / Fármaco (Opcional)
              </Label>
              <Input
                id="codigo"
                value={codigo}
                onChange={(e) => setCodigo(e.target.value.toUpperCase())}
                placeholder="Ej: LAB-001 o PA-PARAC"
                className="text-xs h-9 font-mono rounded-xl border-slate-200 focus-visible:ring-[#319795]/20 focus-visible:border-[#319795]"
              />
            </div>
          )}

          {/* Teléfono y Email (para Laboratorios) */}
          {activeTab === 'laboratorios' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="telefono" className="text-xs font-bold text-slate-700">
                  Teléfono
                </Label>
                <Input
                  id="telefono"
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  placeholder="Ej: 01-445-8890"
                  className="text-xs h-9 rounded-xl border-slate-200 focus-visible:ring-[#319795]/20 focus-visible:border-[#319795]"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-bold text-slate-700">
                  Correo Electrónico
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="contacto@lab.com"
                  className="text-xs h-9 rounded-xl border-slate-200 focus-visible:ring-[#319795]/20 focus-visible:border-[#319795]"
                />
              </div>
            </div>
          )}

          {/* Descripción (para Principios Activos y Presentaciones) */}
          {activeTab !== 'laboratorios' && (
            <div className="space-y-1.5">
              <Label htmlFor="descripcion" className="text-xs font-bold text-slate-700">
                Descripción / Notas Técnicas
              </Label>
              <textarea
                id="descripcion"
                rows={3}
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                placeholder="Observaciones clínicas, advertencias o detalles de la forma farmacéutica..."
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#319795]/20 focus:border-[#319795]"
              />
            </div>
          )}

          {/* Estado Activo / Inactivo */}
          <div className="pt-2 flex items-center justify-between border-t border-slate-100">
            <div>
              <Label htmlFor="activo" className="text-xs font-bold text-slate-800 cursor-pointer">
                Habilitado para Dispensación
              </Label>
              <p className="text-[11px] text-slate-400">
                Permite asociar este registro a productos en el inventario.
              </p>
            </div>
            <Switch id="activo" checked={activo} onCheckedChange={setActivo} />
          </div>
        </div>
      </AppDrawer>

      {/* Diálogo de Confirmación para Eliminar */}
      <Dialog open={!!itemToDelete} onOpenChange={(open) => !open && setItemToDelete(null)}>
        <DialogContent className="sm:max-w-md bg-white rounded-2xl border border-slate-200 shadow-xl">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-rose-50 text-rose-600 border border-rose-100">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold text-slate-900">
                  Desactivar o Eliminar Registro
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-500 mt-0.5">
                  Esta acción retirará el elemento de las selecciones activas.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <p className="text-xs text-slate-600 my-2">
            ¿Está seguro de que desea eliminar o dar de baja a{' '}
            <strong className="text-slate-900">&quot;{itemToDelete?.nombre}&quot;</strong>?
          </p>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isDeleting}
              onClick={() => setItemToDelete(null)}
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
              {isDeleting ? 'Procesando...' : 'Confirmar Eliminación'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
