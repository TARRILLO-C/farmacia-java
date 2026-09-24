'use client';

import * as React from 'react';
import {
  FlaskConical,
  Plus,
  Search,
  Edit2,
  Trash2,
  RefreshCw,
  Building,
  Atom,
  Package,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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

  // Modal genérico
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingItem, setEditingItem] = React.useState<any>(null);

  // Form states
  const [nombre, setNombre] = React.useState('');
  const [codigo, setCodigo] = React.useState('');
  const [descripcion, setDescripcion] = React.useState('');
  const [telefono, setTelefono] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [activo, setActivo] = React.useState(true);

  const loadData = React.useCallback(async () => {
    try {
      setLoading(true);
      const [labs, pas, pres] = await Promise.all([
        getLaboratorios(),
        getPrincipiosActivos(),
        getPresentaciones(),
      ]);
      setLaboratorios(labs);
      setPrincipios(pas);
      setPresentaciones(pres);
    } catch (error) {
      console.error('Error al cargar catálogos:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const handleOpenModal = (item?: any) => {
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
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) {
      alert('El nombre es requerido.');
      return;
    }

    try {
      if (activeTab === 'laboratorios') {
        const dto: CreateLaboratorioDTO = {
          nombre: nombre.trim(),
          codigo: codigo.trim() || undefined,
          telefono: telefono.trim() || undefined,
          email: email.trim() || undefined,
          activo,
        };
        if (editingItem) await updateLaboratorio(editingItem.id, dto);
        else await createLaboratorio(dto);
      } else if (activeTab === 'principios') {
        const dto: CreatePrincipioActivoDTO = {
          nombre: nombre.trim(),
          codigo: codigo.trim() || undefined,
          descripcion: descripcion.trim() || undefined,
          activo,
        };
        if (editingItem) await updatePrincipioActivo(editingItem.id, dto);
        else await createPrincipioActivo(dto);
      } else {
        const dto: CreatePresentacionDTO = {
          nombre: nombre.trim(),
          descripcion: descripcion.trim() || undefined,
          activo,
        };
        if (editingItem) await updatePresentacion(editingItem.id, dto);
        else await createPresentacion(dto);
      }
      handleCloseModal();
      loadData();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error al procesar el catálogo.');
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('¿Está seguro de eliminar o desactivar este elemento?')) {
      try {
        if (activeTab === 'laboratorios') await deleteLaboratorio(id);
        else if (activeTab === 'principios') await deletePrincipioActivo(id);
        else await deletePresentacion(id);
        loadData();
      } catch (error) {
        alert('Error al desactivar el elemento.');
      }
    }
  };

  // Filtrado
  const filteredItems = React.useMemo(() => {
    const q = search.toLowerCase();
    if (activeTab === 'laboratorios') {
      return laboratorios.filter(
        (l) => l.nombre.toLowerCase().includes(q) || (l.codigo && l.codigo.toLowerCase().includes(q))
      );
    } else if (activeTab === 'principios') {
      return principios.filter(
        (p) => p.nombre.toLowerCase().includes(q) || (p.codigo && p.codigo.toLowerCase().includes(q))
      );
    } else {
      return presentaciones.filter(
        (pr) => pr.nombre.toLowerCase().includes(q) || (pr.descripcion && pr.descripcion.toLowerCase().includes(q))
      );
    }
  }, [activeTab, search, laboratorios, principios, presentaciones]);

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-[#319795] font-semibold text-sm">
            <FlaskConical className="size-4" />
            <span>Catálogos Farmacológicos</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mt-1">
            Gestión Clínica y Clasificaciones
          </h1>
          <p className="text-slate-400 text-sm mt-0.5">
            Administre laboratorios fabricantes, principios activos y presentaciones farmacéuticas.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadData}
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
            Nuevo {activeTab === 'laboratorios' ? 'Laboratorio' : activeTab === 'principios' ? 'Principio Activo' : 'Presentación'}
          </Button>
        </div>
      </div>

      {/* Tabs de selección */}
      <div className="flex border-b border-slate-800 gap-2">
        <button
          onClick={() => { setActiveTab('laboratorios'); setSearch(''); }}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === 'laboratorios'
              ? 'border-[#319795] text-white'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Building className="size-4" />
          Laboratorios ({laboratorios.length})
        </button>

        <button
          onClick={() => { setActiveTab('principios'); setSearch(''); }}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === 'principios'
              ? 'border-[#319795] text-white'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Atom className="size-4" />
          Principios Activos ({principios.length})
        </button>

        <button
          onClick={() => { setActiveTab('presentaciones'); setSearch(''); }}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === 'presentaciones'
              ? 'border-[#319795] text-white'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Package className="size-4" />
          Presentaciones ({presentaciones.length})
        </button>
      </div>

      {/* Búsqueda */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
          <Input
            placeholder={`Buscar en ${activeTab}...`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-slate-900/70 border-slate-800 text-white placeholder:text-slate-500 rounded-xl"
          />
        </div>
      </div>

      {/* Grid de Contenido */}
      {loading ? (
        <div className="flex items-center justify-center p-12 text-slate-400">
          <RefreshCw className="size-8 animate-spin text-[#319795] mr-3" />
          Cargando catálogo...
        </div>
      ) : filteredItems.length === 0 ? (
        <Card className="border-slate-800 bg-slate-900/40 text-center p-8">
          <FlaskConical className="size-12 mx-auto text-slate-600 mb-3" />
          <h3 className="text-lg font-semibold text-white">No se encontraron registros</h3>
          <p className="text-slate-400 text-sm mt-1">
            {search ? 'No hay coincidencias con la búsqueda.' : 'Aún no se han creado registros en esta sección.'}
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map((item: any) => (
            <Card
              key={item.id}
              className="border-slate-800/80 bg-slate-900/60 hover:border-slate-700 transition-all rounded-xl shadow-lg flex flex-col justify-between"
            >
              <CardHeader className="p-4 pb-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    {item.codigo && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-[#81e6d9] font-bold border border-slate-700">
                        {item.codigo}
                      </span>
                    )}
                    <CardTitle className="text-base font-bold text-white mt-1">
                      {item.nombre}
                    </CardTitle>
                  </div>
                  {item.activo ? (
                    <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 font-medium">
                      <CheckCircle2 className="size-3" /> Activo
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20 font-medium">
                      <XCircle className="size-3" /> Inactivo
                    </span>
                  )}
                </div>
              </CardHeader>

              <CardContent className="p-4 pt-1 space-y-1.5 text-xs text-slate-300">
                {item.descripcion && (
                  <p className="text-slate-400 line-clamp-2">{item.descripcion}</p>
                )}
                {item.telefono && (
                  <div className="text-slate-400">
                    <span className="text-slate-500">Tel:</span> {item.telefono}
                  </div>
                )}
                {item.email && (
                  <div className="text-slate-400 truncate">
                    <span className="text-slate-500">Email:</span> {item.email}
                  </div>
                )}
              </CardContent>

              <div className="border-t border-slate-800/80 p-2.5 bg-slate-950/40 flex items-center justify-end gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleOpenModal(item)}
                  className="h-7 text-xs text-slate-300 hover:text-white hover:bg-slate-800"
                >
                  <Edit2 className="size-3 mr-1" /> Editar
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleDelete(item.id)}
                  className="h-7 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10"
                >
                  <Trash2 className="size-3 mr-1" /> Eliminar
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modal Crear / Editar */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in-95">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white">
                  {editingItem ? 'Editar' : 'Nuevo'}{' '}
                  {activeTab === 'laboratorios'
                    ? 'Laboratorio'
                    : activeTab === 'principios'
                    ? 'Principio Activo'
                    : 'Presentación'}
                </h3>
              </div>
              <button
                onClick={handleCloseModal}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Nombre *
                </label>
                <Input
                  required
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder={
                    activeTab === 'laboratorios'
                      ? 'Ej: Laboratorios Bagó'
                      : activeTab === 'principios'
                      ? 'Ej: Paracetamol / Acetaminofén'
                      : 'Ej: Caja con 100 Tabletas'
                  }
                  className="bg-slate-950 border-slate-800 text-white"
                />
              </div>

              {activeTab !== 'presentaciones' && (
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Código Identificador
                  </label>
                  <Input
                    value={codigo}
                    onChange={(e) => setCodigo(e.target.value)}
                    placeholder="Ej: LAB-BAGO / PA-PARA"
                    className="bg-slate-950 border-slate-800 text-white font-mono"
                  />
                </div>
              )}

              {activeTab === 'laboratorios' ? (
                <>
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">
                      Teléfono
                    </label>
                    <Input
                      value={telefono}
                      onChange={(e) => setTelefono(e.target.value)}
                      placeholder="Ej: +51 1 456-7890"
                      className="bg-slate-950 border-slate-800 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">
                      Email
                    </label>
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="contacto@laboratorio.com"
                      className="bg-slate-950 border-slate-800 text-white"
                    />
                  </div>
                </>
              ) : (
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Descripción / Indicaciones
                  </label>
                  <Input
                    value={descripcion}
                    onChange={(e) => setDescripcion(e.target.value)}
                    placeholder="Notas o descripción del catálogo..."
                    className="bg-slate-950 border-slate-800 text-white"
                  />
                </div>
              )}

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="activoItem"
                  checked={activo}
                  onChange={(e) => setActivo(e.target.checked)}
                  className="size-4 rounded border-slate-700 bg-slate-950 text-[#319795]"
                />
                <label htmlFor="activoItem" className="text-xs text-slate-300 font-medium">
                  Estado Activo en el Sistema
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
                  Guardar
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
