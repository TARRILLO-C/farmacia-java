'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Users,
  UserPlus,
  Shield,
  Search,
  RefreshCw,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  Lock,
  Unlock,
  AlertCircle,
  Filter,
  UserCheck,
  ShieldAlert,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from '@/components/ui/table';
import { HeaderActions } from '@/components/layout/HeaderContext';
import RoleGuard from '@/components/auth/RoleGuard';
import { UsuarioDrawer } from './components/UsuarioDrawer';
import {
  getUsuarios,
  createUsuario,
  updateUsuario,
  toggleActivoUsuario,
  deleteUsuario,
} from '@/services/usuarioService';
import { Usuario, CreateUsuarioDTO, UpdateUsuarioDTO, RolUsuario } from '@/types';

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'TODOS' | 'ADMIN' | 'CAJERO'>('TODOS');

  // Modales
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [usuarioToEdit, setUsuarioToEdit] = useState<Usuario | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fetchUsuariosList = async () => {
    try {
      setRefreshing(true);
      const data = await getUsuarios();
      setUsuarios(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error('Error al cargar usuarios:', err);
      setNotification({
        type: 'error',
        message: 'No se pudieron cargar los usuarios. Verifica tu conexión.',
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchUsuariosList();
  }, []);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  const handleSaveUsuario = async (data: CreateUsuarioDTO | UpdateUsuarioDTO) => {
    if (usuarioToEdit) {
      await updateUsuario(usuarioToEdit.id, data);
      showNotification('success', 'Usuario actualizado con éxito.');
    } else {
      await createUsuario(data as CreateUsuarioDTO);
      showNotification('success', 'Nuevo usuario registrado exitosamente.');
    }
    fetchUsuariosList();
  };

  const handleToggleActivo = async (user: Usuario) => {
    try {
      await toggleActivoUsuario(user.id);
      showNotification(
        'success',
        `Usuario ${user.username} ${user.activo ? 'inhabilitado' : 'habilitado'} correctamente.`
      );
      fetchUsuariosList();
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Error al cambiar estado del usuario.';
      showNotification('error', msg);
    }
  };

  const handleDelete = async (user: Usuario) => {
    if (!confirm(`¿Estás seguro de eliminar el usuario "${user.username}"? Esta acción no se puede deshacer.`)) {
      return;
    }
    try {
      await deleteUsuario(user.id);
      showNotification('success', `Usuario ${user.username} eliminado correctamente.`);
      fetchUsuariosList();
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Error al eliminar el usuario.';
      showNotification('error', msg);
    }
  };

  // Filtrado de usuarios
  const filteredUsuarios = useMemo(() => {
    return usuarios.filter((u) => {
      const matchesSearch =
        u.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.username.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = roleFilter === 'TODOS' || u.rol === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [usuarios, searchTerm, roleFilter]);

  // Estadísticas rápidas
  const stats = useMemo(() => {
    const total = usuarios.length;
    const admins = usuarios.filter((u) => u.rol === 'ADMIN').length;
    const cajeros = usuarios.filter((u) => u.rol === 'CAJERO').length;
    const activos = usuarios.filter((u) => u.activo).length;
    return { total, admins, cajeros, activos };
  }, [usuarios]);

  return (
    <RoleGuard allowedRoles={['ADMIN']}>
      <div className="space-y-6">
        {/* Acciones en la cabecera superior */}
        <HeaderActions>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchUsuariosList}
            disabled={refreshing}
            className="gap-2 text-xs font-semibold rounded-xl border-slate-200 text-slate-700 hover:bg-slate-100 shadow-2xs cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-[#319795]' : ''}`} />
            <span>Actualizar</span>
          </Button>

          <Button
            size="sm"
            onClick={() => {
              setUsuarioToEdit(null);
              setIsModalOpen(true);
            }}
            className="gap-2 text-xs font-bold bg-[#1a365d] hover:bg-[#142a4a] text-white shadow-xs cursor-pointer rounded-xl"
          >
            <UserPlus className="w-4 h-4" />
            <span>Nuevo Usuario</span>
          </Button>
        </HeaderActions>

        {/* Notificaciones */}
        {notification && (
          <div
            className={`p-4 rounded-xl border flex items-center justify-between text-xs font-medium animate-in fade-in duration-300 ${
              notification.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}
          >
            <div className="flex items-center gap-2">
              {notification.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600" />
              )}
              <span>{notification.message}</span>
            </div>
            <button
              onClick={() => setNotification(null)}
              className="text-slate-400 hover:text-slate-600 text-xs font-bold"
            >
              ×
            </button>
          </div>
        )}

        {/* Tarjetas de Resumen */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4 border-slate-200/80 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Total Usuarios
              </span>
              <div className="p-2 rounded-xl bg-slate-100 text-slate-600">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl font-black text-[#1a365d]">{stats.total}</span>
              <span className="text-xs text-slate-400 block mt-0.5">Operadores registrados</span>
            </div>
          </Card>

          <Card className="p-4 border-slate-200/80 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Administradores
              </span>
              <div className="p-2 rounded-xl bg-blue-50 text-[#1a365d]">
                <Shield className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl font-black text-[#1a365d]">{stats.admins}</span>
              <span className="text-xs text-slate-400 block mt-0.5">Permisos globales</span>
            </div>
          </Card>

          <Card className="p-4 border-slate-200/80 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Cajeros
              </span>
              <div className="p-2 rounded-xl bg-teal-50 text-[#319795]">
                <UserCheck className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl font-black text-[#319795]">{stats.cajeros}</span>
              <span className="text-xs text-slate-400 block mt-0.5">Atención en ventanilla</span>
            </div>
          </Card>

          <Card className="p-4 border-slate-200/80 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Cuentas Habilitadas
              </span>
              <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl font-black text-emerald-600">{stats.activos}</span>
              <span className="text-xs text-slate-400 block mt-0.5">Con acceso permitido</span>
            </div>
          </Card>
        </div>

        {/* Barra de Filtros y Búsqueda */}
        <Card className="border-slate-200/80 shadow-xs">
          <CardHeader className="pb-3 border-b border-slate-100">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-base text-[#1a365d]">
                  Usuarios y Roles del Sistema
                </CardTitle>
                <CardDescription className="text-xs text-slate-500">
                  Control centralizado de credenciales, roles y acceso a los módulos
                </CardDescription>
              </div>

              {/* Botón rápido crear */}
              <Button
                size="sm"
                onClick={() => {
                  setUsuarioToEdit(null);
                  setIsModalOpen(true);
                }}
                className="bg-[#319795] hover:bg-[#287e7c] text-white text-xs font-bold gap-1.5 rounded-xl self-start sm:self-auto"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Crear Operador</span>
              </Button>
            </div>
          </CardHeader>

          <CardContent className="p-4 space-y-4">
            {/* Filtros */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar por nombre o username..."
                  className="pl-9 h-10 text-xs rounded-xl"
                />
              </div>

              {/* Selector de Rol */}
              <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold text-slate-600 border border-slate-200/80 self-start sm:self-auto">
                <button
                  onClick={() => setRoleFilter('TODOS')}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    roleFilter === 'TODOS'
                      ? 'bg-white text-[#1a365d] shadow-xs font-bold'
                      : 'hover:text-slate-900'
                  }`}
                >
                  Todos ({usuarios.length})
                </button>
                <button
                  onClick={() => setRoleFilter('ADMIN')}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    roleFilter === 'ADMIN'
                      ? 'bg-white text-[#1a365d] shadow-xs font-bold'
                      : 'hover:text-slate-900'
                  }`}
                >
                  Admin ({stats.admins})
                </button>
                <button
                  onClick={() => setRoleFilter('CAJERO')}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    roleFilter === 'CAJERO'
                      ? 'bg-white text-[#319795] shadow-xs font-bold'
                      : 'hover:text-slate-900'
                  }`}
                >
                  Cajeros ({stats.cajeros})
                </button>
              </div>
            </div>

            {/* Tabla de Usuarios */}
            <div className="rounded-xl border border-slate-200/80 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50/70">
                    <TableHead className="font-bold text-slate-700">Operador / Usuario</TableHead>
                    <TableHead className="font-bold text-slate-700">Login (Username)</TableHead>
                    <TableHead className="font-bold text-slate-700 text-center">Rol Asignado</TableHead>
                    <TableHead className="font-bold text-slate-700 text-center">Estado</TableHead>
                    <TableHead className="font-bold text-slate-700 text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-12 text-slate-400">
                        <div className="flex flex-col items-center gap-2">
                          <RefreshCw className="w-5 h-5 animate-spin text-[#319795]" />
                          <span className="text-xs">Cargando operadores del sistema...</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : filteredUsuarios.length > 0 ? (
                    filteredUsuarios.map((u) => (
                      <TableRow key={u.id} className="hover:bg-slate-50/60 transition-colors">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#1a365d] to-[#319795] text-white flex items-center justify-center font-bold text-xs uppercase shadow-2xs">
                              {u.nombre.charAt(0)}
                            </div>
                            <div>
                              <span className="font-bold text-xs sm:text-sm text-slate-900 block">
                                {u.nombre}
                              </span>
                              <span className="text-[11px] text-slate-400">ID: #{u.id}</span>
                            </div>
                          </div>
                        </TableCell>

                        <TableCell>
                          <span className="font-mono text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-1 rounded-md">
                            @{u.username}
                          </span>
                        </TableCell>

                        <TableCell className="text-center">
                          <Badge
                            className={`text-[10px] font-bold py-0.5 ${
                              u.rol === 'ADMIN'
                                ? 'bg-[#1a365d] text-white hover:bg-[#1a365d]'
                                : 'bg-[#319795]/15 text-[#287e7c] border-[#319795]/30 hover:bg-[#319795]/20'
                            }`}
                          >
                            {u.rol === 'ADMIN' ? 'ADMINISTRADOR' : 'CAJERO'}
                          </Badge>
                          <span className="text-[10px] text-slate-400 block mt-0.5 font-medium">
                            {u.modulosPermitidos?.length ?? (u.rol === 'ADMIN' ? 8 : 4)} módulos
                          </span>
                        </TableCell>

                        <TableCell className="text-center">
                          <Badge
                            variant={u.activo ? 'outline' : 'secondary'}
                            className={`text-[10px] gap-1 ${
                              u.activo
                                ? 'border-emerald-300 text-emerald-700 bg-emerald-50'
                                : 'bg-slate-100 text-slate-500'
                            }`}
                          >
                            {u.activo ? (
                              <>
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                <span>Activo</span>
                              </>
                            ) : (
                              <>
                                <XCircle className="w-3 h-3 text-slate-400" />
                                <span>Inactivo</span>
                              </>
                            )}
                          </Badge>
                        </TableCell>

                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Toggle Activo */}
                            <Button
                              variant="ghost"
                              size="sm"
                              title={u.activo ? 'Deshabilitar cuenta' : 'Habilitar cuenta'}
                              onClick={() => handleToggleActivo(u)}
                              className={`h-8 w-8 p-0 rounded-lg cursor-pointer ${
                                u.activo
                                  ? 'text-amber-600 hover:bg-amber-50'
                                  : 'text-emerald-600 hover:bg-emerald-50'
                              }`}
                            >
                              {u.activo ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                            </Button>

                            {/* Editar */}
                            <Button
                              variant="ghost"
                              size="sm"
                              title="Editar usuario"
                              onClick={() => {
                                setUsuarioToEdit(u);
                                setIsModalOpen(true);
                              }}
                              className="h-8 w-8 p-0 rounded-lg text-blue-600 hover:bg-blue-50 cursor-pointer"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </Button>

                            {/* Eliminar (protege admin) */}
                            {u.username !== 'admin' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                title="Eliminar usuario"
                                onClick={() => handleDelete(u)}
                                className="h-8 w-8 p-0 rounded-lg text-rose-600 hover:bg-rose-50 cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-12 text-slate-400">
                        <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                        <p className="text-xs font-semibold text-slate-600">
                          {searchTerm || roleFilter !== 'TODOS'
                            ? 'No se encontraron usuarios con los filtros aplicados'
                            : 'Sin usuarios registrados'}
                        </p>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Drawer Lateral de Creación / Edición */}
        <UsuarioDrawer
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveUsuario}
          usuarioToEdit={usuarioToEdit}
        />
      </div>
    </RoleGuard>
  );
}
