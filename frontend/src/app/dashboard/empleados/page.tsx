'use client';

import * as React from 'react';
import {
  UserCheck,
  Plus,
  Search,
  Phone,
  Edit2,
  Trash2,
  RefreshCw,
  CheckCircle2,
  XCircle,
  CreditCard,
  Users,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingEmpleado, setEditingEmpleado] = React.useState<Empleado | null>(null);

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
      setEmpleados(data);
    } catch (error) {
      console.error('Error al cargar empleados:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadEmpleados();
  }, [loadEmpleados]);

  const handleOpenModal = (emp?: Empleado) => {
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
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingEmpleado(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.dni || !formData.nombres || !formData.apellidos) {
      alert('DNI, Nombres y Apellidos son obligatorios.');
      return;
    }

    try {
      if (editingEmpleado) {
        await updateEmpleado(editingEmpleado.id, formData);
      } else {
        await createEmpleado(formData);
      }
      handleCloseModal();
      loadEmpleados();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error al guardar el empleado.');
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('¿Está seguro de desactivar o eliminar este colaborador?')) {
      try {
        await deleteEmpleado(id);
        loadEmpleados();
      } catch (error) {
        alert('Error al desactivar empleado.');
      }
    }
  };

  const filtered = empleados.filter((emp) => {
    const q = search.toLowerCase();
    const fullName = `${emp.nombres} ${emp.apellidos}`.toLowerCase();
    return fullName.includes(q) || emp.dni.includes(q);
  });

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-[#319795] font-semibold text-sm">
            <UserCheck className="size-4" />
            <span>Talento Humano & Personal Clínico</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mt-1">
            Personal y Empleados
          </h1>
          <p className="text-slate-400 text-sm mt-0.5">
            Registro del personal farmacéutico, químicos regentes y cajeros autorizados para operar el sistema.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadEmpleados}
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
            Nuevo Empleado
          </Button>
        </div>
      </div>

      {/* Barra de búsqueda */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
          <Input
            placeholder="Buscar por DNI, Nombres o Apellidos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-slate-900/70 border-slate-800 text-white placeholder:text-slate-500 rounded-xl"
          />
        </div>
        <div className="text-xs text-slate-400">
          Total: <span className="font-bold text-white">{filtered.length}</span> colaboradores
        </div>
      </div>

      {/* Grid de Empleados */}
      {loading ? (
        <div className="flex items-center justify-center p-12 text-slate-400">
          <RefreshCw className="size-8 animate-spin text-[#319795] mr-3" />
          Cargando colaboradores...
        </div>
      ) : filtered.length === 0 ? (
        <Card className="border-slate-800 bg-slate-900/40 text-center p-8">
          <Users className="size-12 mx-auto text-slate-600 mb-3" />
          <h3 className="text-lg font-semibold text-white">No se encontraron empleados</h3>
          <p className="text-slate-400 text-sm mt-1">
            {search ? 'No hay resultados que coincidan con la búsqueda.' : 'Aún no se han registrado colaboradores.'}
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((emp) => (
            <Card
              key={emp.id}
              className="border-slate-800/80 bg-slate-900/60 hover:border-slate-700 transition-all rounded-xl shadow-lg flex flex-col justify-between"
            >
              <CardHeader className="p-4 pb-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-[#81e6d9] font-bold border border-slate-700">
                      DNI: {emp.dni}
                    </span>
                    <CardTitle className="text-base font-bold text-white mt-2">
                      {emp.nombres} {emp.apellidos}
                    </CardTitle>
                  </div>
                  {emp.activo ? (
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
                {emp.telefono && (
                  <div className="flex items-center gap-2 text-slate-400">
                    <Phone className="size-3.5 text-slate-500 shrink-0" />
                    <span>{emp.telefono}</span>
                  </div>
                )}
              </CardContent>

              <div className="border-t border-slate-800/80 p-3 bg-slate-950/40 flex items-center justify-end gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleOpenModal(emp)}
                  className="h-8 text-slate-300 hover:text-white hover:bg-slate-800"
                >
                  <Edit2 className="size-3.5 mr-1" /> Editar
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleDelete(emp.id)}
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
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in-95">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white">
                  {editingEmpleado ? 'Editar Colaborador' : 'Registrar Colaborador'}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Ingrese la información del personal institucional.
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
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Documento Nacional de Identidad (DNI) *
                </label>
                <Input
                  required
                  maxLength={8}
                  value={formData.dni}
                  onChange={(e) => setFormData({ ...formData, dni: e.target.value })}
                  placeholder="70891234"
                  className="bg-slate-950 border-slate-800 text-white font-mono"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Nombres *
                  </label>
                  <Input
                    required
                    value={formData.nombres}
                    onChange={(e) => setFormData({ ...formData, nombres: e.target.value })}
                    placeholder="Ana María"
                    className="bg-slate-950 border-slate-800 text-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Apellidos *
                  </label>
                  <Input
                    required
                    value={formData.apellidos}
                    onChange={(e) => setFormData({ ...formData, apellidos: e.target.value })}
                    placeholder="López Silva"
                    className="bg-slate-950 border-slate-800 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Teléfono de Contacto
                </label>
                <Input
                  value={formData.telefono || ''}
                  onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                  placeholder="987654321"
                  className="bg-slate-950 border-slate-800 text-white"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="activoEmp"
                  checked={formData.activo}
                  onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
                  className="size-4 rounded border-slate-700 bg-slate-950 text-[#319795]"
                />
                <label htmlFor="activoEmp" className="text-xs text-slate-300 font-medium">
                  Colaborador en Actividad
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
