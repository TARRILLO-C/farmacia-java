'use client';

import React, { useState, useEffect } from 'react';
import { AppDrawer } from '@/components/common/AppDrawer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Usuario, CreateUsuarioDTO, UpdateUsuarioDTO, RolUsuario } from '@/types';
import {
  Shield,
  User,
  Lock,
  CheckCircle2,
  AlertCircle,
  Save,
  ShieldCheck,
  LayoutDashboard,
  ShoppingCart,
  Pill,
  Tags,
  Users,
  FileText,
  BarChart3,
  CheckSquare,
  Square,
} from 'lucide-react';

interface UsuarioDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CreateUsuarioDTO | UpdateUsuarioDTO) => Promise<void>;
  usuarioToEdit: Usuario | null;
}

export const MODULOS_SISTEMA = [
  {
    id: 'dashboard',
    nombre: 'Dashboard Principal',
    descripcion: 'Panel de control con métricas y estado del negocio',
    icon: LayoutDashboard,
  },
  {
    id: 'pos',
    nombre: 'Punto de Venta (POS)',
    descripcion: 'Terminal de ventas, cobro y emisión de comprobantes',
    icon: ShoppingCart,
  },
  {
    id: 'inventario',
    nombre: 'Inventario y Fármacos',
    descripcion: 'Catálogo de medicamentos, lotes y niveles de stock',
    icon: Pill,
  },
  {
    id: 'categorias',
    nombre: 'Categorías Terapéuticas',
    descripcion: 'Gestión de familias y clasificaciones de fármacos',
    icon: Tags,
  },
  {
    id: 'clientes',
    nombre: 'Clientes y Fidelización',
    descripcion: 'Registro de clientes y beneficios ClienteAmigo',
    icon: Users,
  },
  {
    id: 'ventas',
    nombre: 'Historial de Ventas',
    descripcion: 'Consulta y auditoría de transacciones concluidas',
    icon: FileText,
  },
  {
    id: 'reportes',
    nombre: 'Reportes y Métricas',
    descripcion: 'Auditoría tributaria, ingresos y ranking de rotación',
    icon: BarChart3,
  },
  {
    id: 'usuarios',
    nombre: 'Control de Usuarios',
    descripcion: 'Administración de operadores y asignación de permisos',
    icon: ShieldCheck,
  },
];

const TODOS_LOS_MODULOS = MODULOS_SISTEMA.map((m) => m.id);
const MODULOS_CAJERO_DEFAULT = ['dashboard', 'pos', 'clientes', 'ventas'];

export default function UsuarioModal({
  isOpen,
  onClose,
  onSave,
  usuarioToEdit,
}: UsuarioDrawerProps) {
  const isEditing = Boolean(usuarioToEdit);

  const [nombre, setNombre] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rol, setRol] = useState<RolUsuario>('CAJERO');
  const [activo, setActivo] = useState(true);
  const [modulosPermitidos, setModulosPermitidos] = useState<string[]>(MODULOS_CAJERO_DEFAULT);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (usuarioToEdit) {
      setNombre(usuarioToEdit.nombre || '');
      setUsername(usuarioToEdit.username || '');
      setPassword('');
      setRol((usuarioToEdit.rol as RolUsuario) || 'CAJERO');
      setActivo(usuarioToEdit.activo ?? true);

      // Cargar permisos guardados
      if (usuarioToEdit.modulosPermitidos && usuarioToEdit.modulosPermitidos.length > 0) {
        setModulosPermitidos(usuarioToEdit.modulosPermitidos);
      } else if (usuarioToEdit.rol === 'ADMIN') {
        setModulosPermitidos(TODOS_LOS_MODULOS);
      } else {
        setModulosPermitidos(MODULOS_CAJERO_DEFAULT);
      }

      setError(null);
    } else {
      setNombre('');
      setUsername('');
      setPassword('');
      setRol('CAJERO');
      setActivo(true);
      setModulosPermitidos(MODULOS_CAJERO_DEFAULT);
      setError(null);
    }
  }, [usuarioToEdit, isOpen]);

  // Al cambiar el rol en modo creación, ajustar módulos sugeridos
  const handleSelectRole = (nuevoRol: RolUsuario) => {
    setRol(nuevoRol);
    if (!isEditing) {
      if (nuevoRol === 'ADMIN') {
        setModulosPermitidos(TODOS_LOS_MODULOS);
      } else {
        setModulosPermitidos(MODULOS_CAJERO_DEFAULT);
      }
    }
  };

  const toggleModulo = (moduloId: string) => {
    setModulosPermitidos((prev) =>
      prev.includes(moduloId)
        ? prev.filter((id) => id !== moduloId)
        : [...prev, moduloId]
    );
  };

  const handleMarcarTodos = () => {
    setModulosPermitidos(TODOS_LOS_MODULOS);
  };

  const handlePresetCajero = () => {
    setModulosPermitidos(MODULOS_CAJERO_DEFAULT);
  };

  const handleLimpiarModulos = () => {
    setModulosPermitidos([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!nombre.trim()) {
      setError('El nombre completo es obligatorio.');
      return;
    }
    if (!username.trim()) {
      setError('El nombre de usuario es obligatorio.');
      return;
    }
    if (!isEditing && (!password || password.length < 4)) {
      setError('La contraseña debe tener al menos 4 caracteres.');
      return;
    }
    if (modulosPermitidos.length === 0) {
      setError('Debes habilitar al menos un módulo de acceso para este usuario.');
      return;
    }

    try {
      setLoading(true);
      if (isEditing) {
        const updateData: UpdateUsuarioDTO = {
          nombre: nombre.trim(),
          username: username.trim(),
          rol,
          activo,
          modulosPermitidos,
        };
        if (password.trim()) {
          updateData.password = password.trim();
        }
        await onSave(updateData);
      } else {
        const createData: CreateUsuarioDTO = {
          nombre: nombre.trim(),
          username: username.trim().toLowerCase(),
          password: password.trim(),
          rol,
          activo,
          modulosPermitidos,
        };
        await onSave(createData);
      }
      onClose();
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        'Ocurrió un error al guardar el usuario.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppDrawer
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Editar Usuario y Permisos' : 'Nuevo Usuario del Sistema'}
      description={
        isEditing
          ? 'Personaliza los datos, credenciales y módulos específicos a los que tiene acceso.'
          : 'Registra un nuevo operador asignándole credenciales y sus páginas autorizadas.'
      }
      icon={Shield}
      maxWidth="max-w-xl"
      onSubmit={handleSubmit}
      submitText={isEditing ? 'Guardar Cambios' : 'Crear Usuario'}
      submitIcon={Save}
      isSubmitting={loading}
      cancelText="Cancelar"
      badge={
        isEditing ? (
          <Badge className="bg-[#1a365d]/10 text-[#1a365d] border-[#1a365d]/20 text-[10px] font-bold">
            Editando #{usuarioToEdit?.id}
          </Badge>
        ) : (
          <Badge className="bg-[#319795]/10 text-[#319795] border-[#319795]/20 text-[10px] font-bold">
            Nuevo Registro
          </Badge>
        )
      }
    >
      <div className="space-y-6 py-1">
        {error && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-2 text-rose-700 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Sección 1: Datos Generales */}
        <div className="space-y-4">
          <div className="border-b border-slate-100 pb-2">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              1. Credenciales y Datos Personales
            </h4>
          </div>

          {/* Nombre Completo */}
          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-slate-700">
              Nombre Completo <span className="text-rose-500">*</span>
            </Label>
            <div className="relative">
              <User className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <Input
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej: Lic. Carlos Mendoza"
                className="pl-9 h-10 text-xs rounded-xl"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Username */}
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-700">
                Usuario (Login) <span className="text-rose-500">*</span>
              </Label>
              <Input
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s+/g, ''))}
                placeholder="Ej: cmendoza"
                className="h-10 text-xs rounded-xl font-mono"
                required
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                <span>
                  Contraseña {isEditing ? '(Opcional)' : <span className="text-rose-500">*</span>}
                </span>
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={isEditing ? '•••••••• (Sin cambios)' : 'Mínimo 4 caracteres'}
                  className="pl-9 h-10 text-xs rounded-xl"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Sección 2: Rol Base */}
        <div className="space-y-3">
          <div className="border-b border-slate-100 pb-2">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              2. Perfil y Rol Principal
            </h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleSelectRole('ADMIN')}
              className={`p-3.5 rounded-2xl border text-left flex flex-col gap-1 transition-all cursor-pointer ${
                rol === 'ADMIN'
                  ? 'border-[#1a365d] bg-[#1a365d]/5 ring-2 ring-[#1a365d]/20 shadow-xs'
                  : 'border-slate-200 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-[#1a365d]">ADMINISTRADOR</span>
                {rol === 'ADMIN' && <CheckCircle2 className="w-4 h-4 text-[#1a365d]" />}
              </div>
              <span className="text-[11px] text-slate-500">
                Rol jerárquico con privilegios de gestión y configuración global.
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleSelectRole('CAJERO')}
              className={`p-3.5 rounded-2xl border text-left flex flex-col gap-1 transition-all cursor-pointer ${
                rol === 'CAJERO'
                  ? 'border-[#319795] bg-[#319795]/5 ring-2 ring-[#319795]/20 shadow-xs'
                  : 'border-slate-200 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-[#319795]">CAJERO / OPERADOR</span>
                {rol === 'CAJERO' && <CheckCircle2 className="w-4 h-4 text-[#319795]" />}
              </div>
              <span className="text-[11px] text-slate-500">
                Rol operativo orientado a atención de clientes y facturación.
              </span>
            </button>
          </div>
        </div>

        {/* Sección 3: Permisos Granulares por Módulo */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2">
            <div>
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <span>3. Páginas y Módulos Autorizados</span>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#319795]/10 text-[#319795]">
                  {modulosPermitidos.length} de {MODULOS_SISTEMA.length} activos
                </span>
              </h4>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Selecciona con exactitud qué módulos verá este operador en su menú y navegación
              </p>
            </div>

            {/* Acciones Rápidas */}
            <div className="flex items-center gap-1.5 self-start sm:self-auto">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleMarcarTodos}
                className="h-7 text-[10px] font-bold text-[#1a365d] hover:bg-slate-100 px-2 rounded-lg cursor-pointer"
              >
                Todos
              </Button>
              <span className="text-slate-300">|</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handlePresetCajero}
                className="h-7 text-[10px] font-bold text-[#319795] hover:bg-slate-100 px-2 rounded-lg cursor-pointer"
              >
                Preset Caja
              </Button>
              <span className="text-slate-300">|</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleLimpiarModulos}
                className="h-7 text-[10px] font-bold text-slate-400 hover:text-slate-700 px-2 rounded-lg cursor-pointer"
              >
                Limpiar
              </Button>
            </div>
          </div>

          {/* Grid de módulos interactivos */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {MODULOS_SISTEMA.map((modulo) => {
              const Icon = modulo.icon;
              const isSelected = modulosPermitidos.includes(modulo.id);

              return (
                <div
                  key={modulo.id}
                  onClick={() => toggleModulo(modulo.id)}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
                    isSelected
                      ? 'border-[#319795] bg-[#319795]/5 shadow-2xs'
                      : 'border-slate-200/80 bg-white hover:bg-slate-50/70 opacity-75'
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                      isSelected
                        ? 'bg-[#319795] text-white shadow-2xs'
                        : 'bg-slate-100 text-slate-400'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-xs font-bold block truncate ${
                          isSelected ? 'text-[#1a365d]' : 'text-slate-700'
                        }`}
                      >
                        {modulo.nombre}
                      </span>
                      {isSelected ? (
                        <CheckSquare className="w-4 h-4 text-[#319795] shrink-0" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-300 shrink-0" />
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400 block line-clamp-2 mt-0.5 leading-snug">
                      {modulo.descripcion}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Sección 4: Estado Activo */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-3">
          <div>
            <span className="text-xs font-bold text-slate-800 block">
              Habilitación de Cuenta
            </span>
            <span className="text-[11px] text-slate-500">
              {activo
                ? 'El operador se encuentra habilitado para iniciar sesión en la plataforma'
                : 'Cuenta suspendida; se denegará el acceso al iniciar sesión'}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setActivo(!activo)}
            className={`w-12 h-6.5 flex items-center rounded-full p-1 cursor-pointer transition-colors shrink-0 ${
              activo ? 'bg-[#319795]' : 'bg-slate-300'
            }`}
          >
            <div
              className={`bg-white w-4.5 h-4.5 rounded-full shadow-md transform transition-transform ${
                activo ? 'translate-x-5.5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>
    </AppDrawer>
  );
}

export { UsuarioModal as UsuarioDrawer };
