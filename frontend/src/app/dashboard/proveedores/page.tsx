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
  Edit2,
  Trash2,
  RefreshCw,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingProveedor, setEditingProveedor] = React.useState<Proveedor | null>(null);

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
      setProveedores(data);
    } catch (error) {
      console.error('Error al cargar proveedores:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadProveedores();
  }, [loadProveedores]);

  const handleOpenModal = (prov?: Proveedor) => {
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
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProveedor(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.ruc || !formData.razonSocial) {
      alert('RUC y Razón Social son campos requeridos.');
      return;
    }

    try {
      if (editingProveedor) {
        await updateProveedor(editingProveedor.id, formData);
      } else {
        await createProveedor(formData);
      }
      handleCloseModal();
      loadProveedores();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error al guardar el proveedor.');
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('¿Está seguro de desactivar o eliminar este proveedor?')) {
      try {
        await deleteProveedor(id);
        loadProveedores();
      } catch (error) {
        alert('Error al desactivar el proveedor.');
      }
    }
  };

  const filtered = proveedores.filter((p) => {
    const q = search.toLowerCase();
    return (
      p.razonSocial.toLowerCase().includes(q) ||
      p.ruc.includes(q) ||
      (p.nombreContacto && p.nombreContacto.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-[#319795] font-semibold text-sm">
            <Briefcase className="size-4" />
            <span>Gestión de Cadena de Suministro</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mt-1">
            Proveedores Farmacéuticos
          </h1>
          <p className="text-slate-400 text-sm mt-0.5">
            Registro de distribuidores mayoristas, laboratorios autorizados y contactos comerciales.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadProveedores}
            className="border-slate-700 bg-slate-900/60 hover:bg-slate-800 text-slate-300"
          >
            <RefreshCw className={`size-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>

          <Button
            onClick={() => handleOpenModal()}
            className="bg-[#319795] hover:bg-[#287e7c] text-white font-semibold shadow-md gap-2"
          >
            <Plus className="size-4" />
            Nuevo Proveedor
          </Button>
        </div>
      </div>

      {/* Barra de búsqueda y filtros */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
          <Input
            placeholder="Buscar por RUC, Razón Social o Contacto..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-slate-900/70 border-slate-800 text-white placeholder:text-slate-500 rounded-xl"
          />
        </div>
        <div className="text-xs text-slate-400">
          Total: <span className="font-bold text-white">{filtered.length}</span> proveedores
        </div>
      </div>

      {/* Lista / Grid de Proveedores */}
      {loading ? (
        <div className="flex items-center justify-center p-12 text-slate-400">
          <RefreshCw className="size-8 animate-spin text-[#319795] mr-3" />
          Cargando proveedores...
        </div>
      ) : filtered.length === 0 ? (
        <Card className="border-slate-800 bg-slate-900/40 text-center p-8">
          <Building2 className="size-12 mx-auto text-slate-600 mb-3" />
          <h3 className="text-lg font-semibold text-white">No se encontraron proveedores</h3>
          <p className="text-slate-400 text-sm mt-1">
            {search ? 'No hay resultados que coincidan con la búsqueda.' : 'Aún no se han registrado proveedores.'}
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((prov) => (
            <Card
              key={prov.id}
              className="border-slate-800/80 bg-slate-900/60 hover:border-slate-700 transition-all rounded-xl shadow-lg flex flex-col justify-between overflow-hidden"
            >
              <CardHeader className="p-4 pb-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-[#81e6d9] font-bold border border-slate-700">
                      RUC: {prov.ruc}
                    </span>
                    <CardTitle className="text-base font-bold text-white mt-2 leading-snug line-clamp-1">
                      {prov.razonSocial}
                    </CardTitle>
                  </div>
                  {prov.activo ? (
                    <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 font-medium">
                      <CheckCircle2 className="size-3" /> Activo
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20 font-medium">
                      <XCircle className="size-3" /> Inactivo
                    </span>
                  )}
                </div>
              </CardHeader>

              <CardContent className="p-4 pt-1 space-y-2 text-xs text-slate-300">
                {prov.nombreContacto && (
                  <div className="flex items-center gap-2 text-slate-300">
                    <span className="text-slate-500 font-medium">Contacto:</span>
                    <span className="font-semibold text-white">{prov.nombreContacto}</span>
                  </div>
                )}
                {prov.telefono && (
                  <div className="flex items-center gap-2 text-slate-300">
                    <Phone className="size-3.5 text-slate-500 shrink-0" />
                    <span>{prov.telefono}</span>
                  </div>
                )}
                {prov.email && (
                  <div className="flex items-center gap-2 text-slate-300">
                    <Mail className="size-3.5 text-slate-500 shrink-0" />
                    <span className="truncate">{prov.email}</span>
                  </div>
                )}
                {prov.direccion && (
                  <div className="flex items-center gap-2 text-slate-400">
                    <MapPin className="size-3.5 text-slate-500 shrink-0" />
                    <span className="truncate">{prov.direccion}</span>
                  </div>
                )}
              </CardContent>

              <div className="border-t border-slate-800/80 p-3 bg-slate-950/40 flex items-center justify-end gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleOpenModal(prov)}
                  className="h-8 text-slate-300 hover:text-white hover:bg-slate-800"
                >
                  <Edit2 className="size-3.5 mr-1" /> Editar
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleDelete(prov.id)}
                  className="h-8 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10"
                >
                  <Trash2 className="size-3.5 mr-1" /> Desactivar
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modal Crear / Editar */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in-95">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white">
                  {editingProveedor ? 'Editar Proveedor' : 'Registrar Nuevo Proveedor'}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Complete los datos de la empresa proveedora.
                </p>
              </div>
              <button
                onClick={handleCloseModal}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    RUC (11 dígitos) *
                  </label>
                  <Input
                    required
                    maxLength={11}
                    value={formData.ruc}
                    onChange={(e) => setFormData({ ...formData, ruc: e.target.value })}
                    placeholder="20123456789"
                    className="bg-slate-950 border-slate-800 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Teléfono
                  </label>
                  <Input
                    value={formData.telefono || ''}
                    onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                    placeholder="01-4458920 / 999888777"
                    className="bg-slate-950 border-slate-800 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Razón Social *
                </label>
                <Input
                  required
                  value={formData.razonSocial}
                  onChange={(e) => setFormData({ ...formData, razonSocial: e.target.value })}
                  placeholder="Droguería Distribuidora S.A.C."
                  className="bg-slate-950 border-slate-800 text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Nombre de Contacto
                  </label>
                  <Input
                    value={formData.nombreContacto || ''}
                    onChange={(e) => setFormData({ ...formData, nombreContacto: e.target.value })}
                    placeholder="Lic. Carlos Mendoza"
                    className="bg-slate-950 border-slate-800 text-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Correo Electrónico
                  </label>
                  <Input
                    type="email"
                    value={formData.email || ''}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="ventas@proveedor.com"
                    className="bg-slate-950 border-slate-800 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Dirección Fiscal
                </label>
                <Input
                  value={formData.direccion || ''}
                  onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                  placeholder="Av. Las Industrias 1020, Lima"
                  className="bg-slate-950 border-slate-800 text-white"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="activo"
                  checked={formData.activo}
                  onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
                  className="size-4 rounded border-slate-700 bg-slate-950 text-[#319795]"
                />
                <label htmlFor="activo" className="text-xs text-slate-300 font-medium">
                  Proveedor Activo en el Sistema
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCloseModal}
                  className="border-slate-700 bg-transparent text-slate-300 hover:bg-slate-800"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="bg-[#319795] hover:bg-[#287e7c] text-white font-semibold"
                >
                  {editingProveedor ? 'Actualizar Proveedor' : 'Guardar Proveedor'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
