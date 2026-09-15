'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Tags,
  Users,
  FileText,
  BarChart3,
  LogOut,
  Boxes,
  Truck,
  UserCheck,
  ShieldCheck,
  Settings,
  Plus,
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
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '@/components/ui/sidebar';
import { removeAuthToken } from '@/services/api';

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

const gestionItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Productos',
    href: '/dashboard/productos',
    icon: Package,
  },
  {
    title: 'Categorias',
    href: '/dashboard/categorias',
    icon: Tags,
  },
  {
    title: 'Inventario',
    href: '/dashboard/inventario',
    icon: Boxes,
  },
  {
    title: 'Clientes',
    href: '/dashboard/clientes',
    icon: Users,
  },
  {
    title: 'Proveedores',
    href: '/dashboard/proveedores',
    icon: Truck,
  },
  {
    title: 'Usuarios',
    href: '/dashboard/usuarios',
    icon: UserCheck,
  },
  {
    title: 'Permisos',
    href: '/dashboard/permisos',
    icon: ShieldCheck,
  },
  {
    title: 'Configuración',
    href: '/dashboard/configuracion',
    icon: Settings,
  },
];

const ventasItems: NavItem[] = [
  {
    title: 'Punto de Venta (POS)',
    href: '/dashboard/pos',
    icon: ShoppingCart,
    badge: 'CAJA',
  },
  {
    title: 'Historial de Ventas',
    href: '/dashboard/ventas',
    icon: FileText,
  },
  {
    title: 'Reportes y Métricas',
    href: '/dashboard/reportes',
    icon: BarChart3,
  },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    removeAuthToken();
    router.push('/login');
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-slate-200/70 bg-[#F8FAFC]" {...props}>
      {/* 1. Header con Branding "Sistema AG" */}
      <SidebarHeader className="p-4 group-data-[collapsible=icon]:p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              asChild
              className="hover:bg-transparent group-data-[collapsible=icon]:!size-10 group-data-[collapsible=icon]:!p-0 group-data-[collapsible=icon]:justify-center"
            >
              <Link
                href="/dashboard"
                className="flex items-center gap-3 group-data-[collapsible=icon]:gap-0 group-data-[collapsible=icon]:justify-center"
              >
                {/* Cross logo teal/cyan */}
                <div className="flex size-9 items-center justify-center rounded-xl bg-[#E6F7F7] text-[#00A3FF] border border-[#00A3FF]/20 shadow-2xs shrink-0">
                  <Plus className="size-6 stroke-[3] text-[#00A3FF]" />
                </div>
                <div className="grid flex-1 text-left group-data-[collapsible=icon]:hidden">
                  <span className="truncate font-extrabold text-[#1E293B] text-base tracking-tight">
                    Sistema AG
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* 2. Contenido de navegación GESTIÓN y VENTAS */}
      <SidebarContent className="px-3 py-2 space-y-4 group-data-[collapsible=icon]:px-1 overflow-x-hidden">
        {/* Grupo GESTIÓN */}
        <SidebarGroup className="p-0">
          <SidebarGroupLabel className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 px-3 mb-2 group-data-[collapsible=icon]:hidden">
            GESTIÓN
          </SidebarGroupLabel>

          <SidebarGroupContent>
            <SidebarMenu className="space-y-1 group-data-[collapsible=icon]:items-center">
              {gestionItems.map((item) => {
                const Icon = item.icon;
                const isActive =
                  item.href === '/dashboard'
                    ? pathname === '/dashboard'
                    : pathname.startsWith(item.href);

                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.title}
                      className={`gap-3 h-11 px-3 rounded-2xl transition-all ${
                        isActive
                          ? 'bg-white text-slate-900 font-extrabold shadow-sm border border-slate-200/80'
                          : 'text-slate-600 hover:bg-white/60 hover:text-slate-900 font-medium'
                      }`}
                    >
                      <Link
                        href={item.href}
                        className="flex items-center gap-3 w-full h-full"
                      >
                        <div
                          className={`size-7 rounded-xl flex items-center justify-center shrink-0 transition-all ${
                            isActive
                              ? 'bg-gradient-to-tr from-[#D946EF] to-[#C026D3] text-white shadow-xs'
                              : 'bg-white text-slate-500 border border-slate-200/60'
                          }`}
                        >
                          <Icon className="size-4" />
                        </div>
                        <span className="text-xs truncate group-data-[collapsible=icon]:hidden">
                          {item.title}
                        </span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Grupo VENTAS */}
        <SidebarGroup className="p-0">
          <SidebarGroupLabel className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 px-3 mb-2 group-data-[collapsible=icon]:hidden">
            VENTAS
          </SidebarGroupLabel>

          <SidebarGroupContent>
            <SidebarMenu className="space-y-1 group-data-[collapsible=icon]:items-center">
              {ventasItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname.startsWith(item.href);

                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.title}
                      className={`gap-3 h-11 px-3 rounded-2xl transition-all ${
                        isActive
                          ? 'bg-white text-slate-900 font-extrabold shadow-sm border border-slate-200/80'
                          : 'text-slate-600 hover:bg-white/60 hover:text-slate-900 font-medium'
                      }`}
                    >
                      <Link
                        href={item.href}
                        className="flex items-center gap-3 w-full h-full"
                      >
                        <div
                          className={`size-7 rounded-xl flex items-center justify-center shrink-0 transition-all ${
                            isActive
                              ? 'bg-gradient-to-tr from-[#D946EF] to-[#C026D3] text-white shadow-xs'
                              : 'bg-white text-slate-500 border border-slate-200/60'
                          }`}
                        >
                          <Icon className="size-4" />
                        </div>
                        <span className="text-xs truncate group-data-[collapsible=icon]:hidden">
                          {item.title}
                        </span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* 3. Footer con Botón Salir */}
      <SidebarFooter className="p-3 border-t border-slate-200/60">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              onClick={handleLogout}
              className="text-slate-600 hover:bg-rose-50 hover:text-rose-600 transition-colors rounded-2xl"
            >
              <div className="flex size-8 items-center justify-center rounded-xl bg-slate-200/80 text-slate-600 shrink-0">
                <LogOut className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-xs group-data-[collapsible=icon]:hidden">
                <span className="truncate font-bold">Cerrar Sesión</span>
                <span className="truncate text-[10px] text-slate-400">Salida segura</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}

export default AppSidebar;

