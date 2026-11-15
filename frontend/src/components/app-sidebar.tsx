'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Tags,
  Boxes,
  Users,
  Briefcase,
  UserCheck,
  ShieldCheck,
  Settings,
  FileText,
  BarChart3,
  PlusCircle,
  LogOut,
  ChevronRight,
  Plus,
  Wallet,
} from 'lucide-react';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarRail,
} from '@/components/ui/sidebar';
import { logout, getStoredUser } from '@/services/authService';
import { Usuario } from '@/types';

interface SidebarItemDef {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

const gestionItems: SidebarItemDef[] = [
  { title: 'Productos', href: '/dashboard/productos', icon: Package },
  { title: 'Categorías', href: '/dashboard/categorias', icon: Tags },
  { title: 'Inventario', href: '/dashboard/inventario', icon: Boxes },
  { title: 'Clientes', href: '/dashboard/clientes', icon: Users },
  { title: 'Proveedores', href: '/dashboard/proveedores', icon: Briefcase },
  { title: 'Usuarios', href: '/dashboard/usuarios', icon: UserCheck },
  { title: 'Permisos', href: '/dashboard/permisos', icon: ShieldCheck },
  { title: 'Configuración', href: '/dashboard/configuracion', icon: Settings },
];

const ventasItems: SidebarItemDef[] = [
  { title: 'Nueva Venta', href: '/dashboard/pos', icon: ShoppingCart, badge: 'POS' },
  { title: 'Caja', href: '/dashboard/caja', icon: Wallet },
  { title: 'Historial', href: '/dashboard/ventas', icon: FileText },
  { title: 'Reportes', href: '/dashboard/reportes', icon: BarChart3 },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const router = useRouter();
  const [currentUser, setCurrentUser] = React.useState<Usuario | null>(null);

  React.useEffect(() => {
    const user = getStoredUser();
    setCurrentUser(user);
  }, []);

  const handleLogout = () => {
    logout();
  };

  const isDashboardActive = pathname === '/dashboard';

  return (
    <Sidebar
      collapsible="icon"
      className="border-r border-slate-200/80 bg-[#f4f6fa] text-slate-700"
      {...props}
    >
      {/* ─── 1. Header con branding Sistema AG ─── */}
      <SidebarHeader className="bg-[#f4f6fa] p-4 group-data-[collapsible=icon]:p-2 border-b border-transparent">
        <Link
          href="/dashboard"
          className="flex items-center gap-3 group-data-[collapsible=icon]:justify-center"
        >
          {/* Logo con cruz médica turquesa/cian idéntica a Sistema AG */}
          <div className="size-9 rounded-xl bg-white border border-teal-100 shadow-sm flex items-center justify-center shrink-0">
            <svg
              viewBox="0 0 24 24"
              className="size-5 text-[#2dd4bf] fill-current"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M10 3a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v6h6a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1h-6v6a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1v-6H4a1 1 0 0 1-1-1v-2a1 1 0 0 1 1-1h6V3z"
                fill="currentColor"
              />
            </svg>
          </div>
          <span className="font-bold text-slate-800 text-sm tracking-tight group-data-[collapsible=icon]:hidden">
            Sistema AG
          </span>
        </Link>
      </SidebarHeader>

      {/* ─── 2. Contenido de Navegación ─── */}
      <SidebarContent className="bg-[#f4f6fa] px-3 py-2 space-y-4 group-data-[collapsible=icon]:px-1 overflow-x-hidden">
        {/* Item Principal: Dashboard Activo Estilo Pill Flotante */}
        <div className="pt-1">
          <Link
            href="/dashboard"
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl transition-all ${
              isDashboardActive
                ? 'bg-white shadow-sm shadow-slate-200/60 text-slate-800 font-semibold border border-slate-100/80'
                : 'text-slate-600 hover:bg-white/60 hover:text-slate-900 font-medium'
            }`}
          >
            {/* Badge de Icono Fucsia / Magenta con sombra */}
            <div
              className={`size-7 rounded-xl flex items-center justify-center shrink-0 ${
                isDashboardActive
                  ? 'bg-gradient-to-tr from-[#d946ef] to-[#ec4899] text-white shadow-sm shadow-fuchsia-500/30'
                  : 'bg-slate-100 text-slate-500'
              }`}
            >
              <LayoutDashboard className="size-4" />
            </div>
            <span className="text-xs group-data-[collapsible=icon]:hidden">Dashboard</span>
          </Link>
        </div>

        {/* Sección: GESTIÓN */}
        <SidebarGroup className="p-0">
          <SidebarGroupLabel className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 mb-1.5 group-data-[collapsible=icon]:hidden">
            GESTIÓN
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <div className="space-y-1.5">
              {gestionItems.map((item) => {
                const Icon = item.icon;
                const isActive =
                  item.href !== '/dashboard' && pathname.startsWith(item.href);

                return (
                  <Link
                    key={item.title}
                    href={item.href}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all ${
                      isActive
                        ? 'bg-white shadow-sm text-slate-900 font-semibold border border-slate-100'
                        : 'bg-white/60 hover:bg-white text-slate-600 hover:text-slate-900 shadow-2xs hover:shadow-xs border border-transparent hover:border-slate-100'
                    }`}
                  >
                    <div
                      className={`size-6 rounded-lg flex items-center justify-center shrink-0 ${
                        isActive
                          ? 'bg-gradient-to-tr from-[#d946ef] to-[#ec4899] text-white shadow-xs'
                          : 'bg-slate-100/90 text-slate-500'
                      }`}
                    >
                      <Icon className="size-3.5" />
                    </div>
                    <span className="text-xs font-medium group-data-[collapsible=icon]:hidden">
                      {item.title}
                    </span>
                  </Link>
                );
              })}
            </div>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Sección: VENTAS */}
        <SidebarGroup className="p-0">
          <SidebarGroupLabel className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 mb-1.5 group-data-[collapsible=icon]:hidden">
            VENTAS
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <div className="space-y-1.5">
              <Link
                href="/dashboard/pos"
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all ${
                  pathname.startsWith('/dashboard/pos')
                    ? 'bg-white shadow-sm text-slate-900 font-semibold border border-slate-100'
                    : 'bg-white/60 hover:bg-white text-slate-600 hover:text-slate-900 shadow-2xs hover:shadow-xs border border-transparent hover:border-slate-100'
                }`}
              >
                <div
                  className={`size-6 rounded-lg flex items-center justify-center shrink-0 ${
                    pathname.startsWith('/dashboard/pos')
                      ? 'bg-gradient-to-tr from-[#d946ef] to-[#ec4899] text-white shadow-xs'
                      : 'bg-slate-100/90 text-slate-500'
                  }`}
                >
                  <ShoppingCart className="size-3.5" />
                </div>
                <span className="text-xs font-medium group-data-[collapsible=icon]:hidden">
                  Nueva Venta
                </span>
              </Link>
              <Link
                href="/dashboard/ventas"
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all ${
                  pathname.startsWith('/dashboard/ventas')
                    ? 'bg-white shadow-sm text-slate-900 font-semibold border border-slate-100'
                    : 'bg-white/60 hover:bg-white text-slate-600 hover:text-slate-900 shadow-2xs hover:shadow-xs border border-transparent hover:border-slate-100'
                }`}
              >
                <div
                  className={`size-6 rounded-lg flex items-center justify-center shrink-0 ${
                    pathname.startsWith('/dashboard/ventas')
                      ? 'bg-gradient-to-tr from-[#d946ef] to-[#ec4899] text-white shadow-xs'
                      : 'bg-slate-100/90 text-slate-500'
                  }`}
                >
                  <FileText className="size-3.5" />
                </div>
                <span className="text-xs font-medium group-data-[collapsible=icon]:hidden">
                  Historial de Ventas
                </span>
              </Link>
            </div>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Sección: REPORTES */}
        <SidebarGroup className="p-0">
          <SidebarGroupLabel className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 mb-1.5 group-data-[collapsible=icon]:hidden">
            REPORTES
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <div className="space-y-1.5">
              <Link
                href="/dashboard/reportes"
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all ${
                  pathname.startsWith('/dashboard/reportes')
                    ? 'bg-white shadow-sm text-slate-900 font-semibold border border-slate-100'
                    : 'bg-white/60 hover:bg-white text-slate-600 hover:text-slate-900 shadow-2xs hover:shadow-xs border border-transparent hover:border-slate-100'
                }`}
              >
                <div
                  className={`size-6 rounded-lg flex items-center justify-center shrink-0 ${
                    pathname.startsWith('/dashboard/reportes')
                      ? 'bg-gradient-to-tr from-[#d946ef] to-[#ec4899] text-white shadow-xs'
                      : 'bg-slate-100/90 text-slate-500'
                  }`}
                >
                  <BarChart3 className="size-3.5" />
                </div>
                <span className="text-xs font-medium group-data-[collapsible=icon]:hidden">
                  Productos Más Vendidos
                </span>
              </Link>
            </div>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Sección: PÁGINAS DE CUENTA */}
        <SidebarGroup className="p-0">
          <SidebarGroupLabel className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 mb-1.5 group-data-[collapsible=icon]:hidden">
            PÁGINAS DE CUENTA
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <div className="space-y-1.5">
              <Link
                href="/dashboard/usuarios"
                className="w-full flex items-center gap-3 px-3 py-2 rounded-xl bg-white/60 hover:bg-white text-slate-600 hover:text-slate-900 shadow-2xs hover:shadow-xs border border-transparent hover:border-slate-100 transition-all"
              >
                <div className="size-6 rounded-lg bg-slate-100/90 text-slate-500 flex items-center justify-center shrink-0">
                  <UserCheck className="size-3.5" />
                </div>
                <span className="text-xs font-medium group-data-[collapsible=icon]:hidden">
                  Perfil
                </span>
              </Link>

              <button
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-xl bg-white/60 hover:bg-rose-50 text-slate-600 hover:text-rose-600 shadow-2xs hover:shadow-xs border border-transparent hover:border-rose-100 transition-all text-left cursor-pointer"
              >
                <div className="size-6 rounded-lg bg-slate-100/90 text-slate-500 flex items-center justify-center shrink-0 group-hover:text-rose-600">
                  <LogOut className="size-3.5" />
                </div>
                <span className="text-xs font-medium group-data-[collapsible=icon]:hidden">
                  Cerrar Sesión
                </span>
              </button>
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* ─── 3. Footer con Usuario y Logout ─── */}
      <SidebarFooter className="bg-[#f4f6fa] p-3 border-t border-slate-200/60 group-data-[collapsible=icon]:p-2">
        <button
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-slate-600 hover:text-rose-600 hover:bg-white transition-all text-left cursor-pointer group-data-[collapsible=icon]:justify-center"
        >
          <div className="size-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-600 shrink-0">
            <LogOut className="size-3.5" />
          </div>
          <div className="flex-1 truncate text-xs group-data-[collapsible=icon]:hidden">
            <p className="font-semibold text-slate-800 truncate">
              {currentUser?.nombre || currentUser?.username || 'Usuario'}
            </p>
            <p className="text-[10px] text-slate-400 truncate">Cerrar Sesión</p>
          </div>
        </button>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}

export default AppSidebar;
