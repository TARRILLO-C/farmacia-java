'use client';

import React from 'react';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import { Header } from '@/components/layout/Header';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      {/* Barra lateral oficial Shadcn UI */}
      <AppSidebar />

      {/* Contenedor principal adaptable con SidebarInset */}
      <SidebarInset className="min-w-0 bg-slate-50 flex flex-col min-h-screen overflow-hidden">
        {/* Cabecera superior con SidebarTrigger interactivo */}
        <Header />

        {/* Área de contenido de cada módulo */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-slate-50/70">
          <div className="max-w-7xl mx-auto space-y-6">{children}</div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
