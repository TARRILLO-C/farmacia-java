'use client';

import React, { useState, useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  Menu,
  Search,
  Bell,
  LogOut,
  User,
  Shield,
  ChevronDown,
  X,
  CheckCircle2,
} from 'lucide-react';
import { removeAuthToken, USER_STORAGE_KEY } from '@/services/api';
import { Usuario } from '@/types';

import { SidebarTrigger } from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';

interface HeaderProps {
  onToggleSidebar?: () => void;
}

const MODULE_TITLES: Record<string, { title: string; subtitle: string }> = {
  '/dashboard': {
    title: 'Panel General',
    subtitle: 'Resumen operativo y métricas en tiempo real',
  },
  '/dashboard/pos': {
    title: 'Punto de Venta (POS)',
    subtitle: 'Emisión de boletas, facturas y ventas en mostrador',
  },
  '/dashboard/inventario': {
    title: 'Inventario y Fármacos',
    subtitle: 'Control de existencias, lotes y vencimientos',
  },
  '/dashboard/productos': {
    title: 'Gestión de Productos e Inventario',
    subtitle: 'Control de existencias, lotes y vencimientos',
  },
  '/dashboard/categorias': {
    title: 'Categorías de Productos',
    subtitle: 'Organización y clasificación farmacéutica',
  },
  '/dashboard/clientes': {
    title: 'Directorio de Clientes',
    subtitle: 'Padrón de beneficiarios y clientes regulares',
  },
  '/dashboard/ventas': {
    title: 'Historial de Ventas',
    subtitle: 'Auditoría de transacciones y recibos emitidos',
  },
  '/dashboard/reportes': {
    title: 'Reportes y Métricas',
    subtitle: 'Análisis de ventas, rentabilidad y demanda',
  },
};

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  const pathname = usePathname();
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState('');
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<Partial<Usuario>>({
    nombre: 'Carlos',
    apellido: 'Administrador',
    rol: 'ADMIN',
    email: 'admin@farmacia.com',
  });

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Obtener usuario autenticado desde localStorage en cliente
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(USER_STORAGE_KEY);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setCurrentUser(parsed);
        } catch {
          // Usar valores por defecto
        }
      }
    }
  }, []);

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    removeAuthToken();
    router.push('/login');
  };

  // Determinar título del módulo activo
  const activeModule =
    MODULE_TITLES[pathname] || {
      title: 'Sistema de Gestión Farmacéutica',
      subtitle: 'Plataforma administrativa',
    };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-20 px-4 md:px-8 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-xs transition-all">
      {/* Lado Izquierdo: Botón Hamburguesa Móvil + Títulos */}
      <div className="flex items-center gap-3 md:gap-5">
        <SidebarTrigger className="h-9 w-9 text-slate-700 hover:text-[#1a365d] hover:bg-slate-100 border border-slate-200/80 rounded-xl cursor-pointer" />
        <Separator orientation="vertical" className="h-6 hidden sm:block bg-slate-200" />

        <div className="flex flex-col">
          <h1 className="text-lg md:text-xl font-bold text-[#1a365d] tracking-tight">
            {activeModule.title}
          </h1>
          <p className="text-xs text-slate-500 hidden sm:block">
            {activeModule.subtitle}
          </p>
        </div>
      </div>

      {/* Lado Central / Derecho: Buscador Global + Notificaciones + Perfil */}
      <div className="flex items-center gap-3 md:gap-5">
        {/* Buscador Rápido Global */}
        <div className="relative hidden md:block w-64 lg:w-80">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar fármaco, código o cliente..."
            className="w-full pl-10 pr-9 py-2 text-sm bg-slate-100/80 hover:bg-slate-100 focus:bg-white text-slate-800 placeholder-slate-400 rounded-xl border border-transparent focus:border-[#319795] focus:ring-2 focus:ring-[#319795]/20 outline-hidden transition-all duration-200"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Campana de Notificaciones */}
        <div className="relative">
          <button
            type="button"
            aria-label="Notificaciones"
            className="relative p-2.5 text-slate-600 hover:text-[#1a365d] hover:bg-slate-100 rounded-xl border border-slate-200/80 transition-colors shadow-xs"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#319795] rounded-full ring-2 ring-white"></span>
          </button>
        </div>

        {/* Separador vertical */}
        <div className="h-8 w-px bg-slate-200 hidden sm:block" />

        {/* Perfil de Usuario con Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setUserDropdownOpen(!userDropdownOpen)}
            className="flex items-center gap-3 p-1.5 pr-2.5 rounded-xl hover:bg-slate-100 transition-colors border border-transparent hover:border-slate-200"
          >
            {/* Avatar */}
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#1a365d] to-[#2a4365] text-white flex items-center justify-center font-bold text-sm shadow-xs">
              {currentUser.nombre ? currentUser.nombre.charAt(0).toUpperCase() : 'U'}
            </div>

            {/* Info de Usuario */}
            <div className="hidden md:flex flex-col text-left">
              <span className="text-xs font-bold text-slate-800 leading-tight">
                {currentUser.nombre} {currentUser.apellido || ''}
              </span>
              <div className="flex items-center gap-1 mt-0.5">
                <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold px-1.5 py-0.2 rounded-md bg-[#319795]/10 text-[#287e7c] uppercase">
                  <Shield className="w-2.5 h-2.5" />
                  {currentUser.rol || 'USUARIO'}
                </span>
              </div>
            </div>

            <ChevronDown className="w-4 h-4 text-slate-400 ml-0.5 hidden sm:block" />
          </button>

          {/* Menú Desplegable */}
          {userDropdownOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              {/* Detalle encabezado del menú */}
              <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Sesión activa
                </p>
                <p className="text-sm font-bold text-[#1a365d] truncate">
                  {currentUser.nombre} {currentUser.apellido || ''}
                </p>
                <p className="text-xs text-slate-500 truncate">
                  {currentUser.email || 'admin@farmacia.com'}
                </p>
                <div className="mt-2 flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Caja Abierta & Conectada</span>
                </div>
              </div>

              {/* Opciones del menú */}
              <div className="p-1 space-y-0.5">
                <div className="px-3 py-2 text-xs text-slate-600 flex items-center gap-2.5 rounded-lg hover:bg-slate-100 cursor-pointer transition-colors">
                  <User className="w-4 h-4 text-slate-400" />
                  <span>Mi Cuenta & Turno</span>
                </div>
              </div>

              <div className="border-t border-slate-100 p-1">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-lg transition-colors text-left"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Cerrar Sesión</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
