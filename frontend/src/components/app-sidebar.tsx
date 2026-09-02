'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  ShoppingCart,
  Pill,
  Tags,
  Users,
  FileText,
  BarChart3,
  Activity,
  PlusCircle,
  LogOut,
  ChevronRight,
} from 'lucide-react';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { removeAuthToken } from '@/services/api';

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

const navItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Punto de Venta (POS)',
    href: '/dashboard/pos',
    icon: ShoppingCart,
    badge: 'CAJA',
  },
  {
    title: 'Inventario y Fármacos',
    href: '/dashboard/inventario',
    icon: Pill,
  },
  {
    title: 'Categorías',
    href: '/dashboard/categorias',
    icon: Tags,
  },
  {
    title: 'Clientes',
    href: '/dashboard/clientes',
    icon: Users,
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
    <Sidebar collapsible="icon" className="border-r border-sidebar-border" {...props}>
      {/* 1. Header con branding SGF y Botón de Venta Rápida */}
      <SidebarHeader className="border-b border-sidebar-border p-3 group-data-[collapsible=icon]:p-2 group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:justify-center">
        <SidebarMenu className="group-data-[collapsible=icon]:items-center">
          <SidebarMenuItem className="group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center">
            <SidebarMenuButton
              size="lg"
              asChild
              className="hover:bg-sidebar-accent hover:text-sidebar-accent-foreground data-[state=open]:bg-sidebar-accent group-data-[collapsible=icon]:!size-9 group-data-[collapsible=icon]:!p-0 group-data-[collapsible=icon]:justify-center"
            >
              <Link
                href="/dashboard"
                className="flex items-center gap-3 group-data-[collapsible=icon]:gap-0 group-data-[collapsible=icon]:justify-center"
              >
                <div className="flex aspect-square size-9 group-data-[collapsible=icon]:size-9 items-center justify-center rounded-xl bg-gradient-to-tr from-[#319795] to-[#285e61] text-white shadow-md shrink-0">
                  <Activity className="size-5 stroke-[2.5]" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                  <span className="truncate font-bold text-white flex items-center gap-1.5">
                    SGF
                    <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded-full bg-[#319795]/30 text-[#81e6d9] border border-[#319795]/50">
                      v1.0
                    </span>
                  </span>
                  <span className="truncate text-xs text-slate-300 font-medium">
                    Gestión Farmacéutica
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        {/* Botón de Venta Rápida en versión extendida */}
        <div className="mt-1 px-1 group-data-[collapsible=icon]:hidden">
          <Button
            asChild
            className="w-full justify-center gap-2 h-9 text-xs font-bold shadow-md bg-[#319795] hover:bg-[#287e7c] text-white rounded-xl active:scale-[0.98] transition-transform"
          >
            <Link href="/dashboard/pos">
              <PlusCircle className="size-4" />
              <span>Nueva Venta Rápida</span>
            </Link>
          </Button>
        </div>
      </SidebarHeader>

      {/* 2. Contenido de navegación estructurado con Shadcn */}
      <SidebarContent className="px-2 py-3 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:py-2 overflow-x-hidden">
        <SidebarGroup className="group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:items-center">
          <SidebarGroupLabel className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-3 mb-1 group-data-[collapsible=icon]:hidden">
            Menú Principal
          </SidebarGroupLabel>

          <SidebarGroupAction asChild title="Nueva Venta Rápida" className="group-data-[collapsible=icon]:hidden">
            <Link href="/dashboard/pos">
              <PlusCircle className="size-4" />
              <span className="sr-only">Nueva Venta Rápida</span>
            </Link>
          </SidebarGroupAction>

          <SidebarGroupContent>
            <SidebarMenu className="group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:gap-1.5">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive =
                  item.href === '/dashboard'
                    ? pathname === '/dashboard'
                    : pathname.startsWith(item.href);

                return (
                  <SidebarMenuItem
                    key={item.href}
                    className="group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:w-full"
                  >
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.title}
                      className={`gap-3 h-10 px-3 rounded-xl transition-all group-data-[collapsible=icon]:!size-9 group-data-[collapsible=icon]:!p-0 group-data-[collapsible=icon]:justify-center ${
                        isActive
                          ? 'bg-[#319795] text-white shadow-sm hover:bg-[#287e7c] hover:text-white font-bold'
                          : 'text-slate-200 hover:bg-sidebar-accent hover:text-white font-medium'
                      }`}
                    >
                      <Link
                        href={item.href}
                        className="flex items-center gap-3 group-data-[collapsible=icon]:gap-0 group-data-[collapsible=icon]:justify-center w-full h-full"
                      >
                        <Icon
                          className={`size-4.5 shrink-0 ${
                            isActive ? 'text-white' : 'text-slate-300'
                          }`}
                        />
                        <span className="text-sm truncate group-data-[collapsible=icon]:hidden">
                          {item.title}
                        </span>
                        {isActive && (
                          <ChevronRight className="size-4 ml-auto text-white/80 group-data-[collapsible=icon]:hidden" />
                        )}
                      </Link>
                    </SidebarMenuButton>

                    {item.badge && (
                      <SidebarMenuBadge className="bg-[#319795]/20 text-[#81e6d9] border border-[#319795]/40 font-mono text-[10px] font-bold px-1.5 py-0.5 rounded-md group-data-[collapsible=icon]:hidden">
                        {item.badge}
                      </SidebarMenuBadge>
                    )}
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* 3. Footer con Turno / Usuario y Logout */}
      <SidebarFooter className="p-3 border-t border-sidebar-border group-data-[collapsible=icon]:p-2 group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:justify-center">
        <SidebarMenu className="group-data-[collapsible=icon]:items-center">
          <SidebarMenuItem className="group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center">
            <SidebarMenuButton
              size="lg"
              tooltip="Turno Activo (Cerrar Sesión)"
              onClick={handleLogout}
              className="text-sidebar-foreground hover:bg-sidebar-accent hover:text-rose-300 transition-colors rounded-xl group-data-[collapsible=icon]:!size-9 group-data-[collapsible=icon]:!p-0 group-data-[collapsible=icon]:justify-center"
            >
              <div className="flex aspect-square size-8 group-data-[collapsible=icon]:size-8 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400 shrink-0">
                <div className="size-2 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <div className="grid flex-1 text-left text-xs leading-tight group-data-[collapsible=icon]:hidden">
                <span className="truncate font-bold text-white">Turno Activo</span>
                <span className="truncate text-[10px] text-slate-300">Caja Principal</span>
              </div>
              <LogOut className="size-4 ml-auto text-slate-400 hover:text-rose-400 group-data-[collapsible=icon]:hidden" />
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      {/* 4. Rail colapsable para interacción desktop */}
      <SidebarRail />
    </Sidebar>
  );
}

export default AppSidebar;
