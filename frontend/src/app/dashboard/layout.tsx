'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated } from '@/services/authService';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import { Header } from '@/components/layout/Header';
import { HeaderProvider } from '@/components/layout/HeaderContext';
import { Loader2 } from 'lucide-react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    const authed = isAuthenticated();
    if (!authed) {
      router.replace('/login');
    } else {
      setIsAuthorized(true);
    }
  }, [router]);

  if (isAuthorized === null) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#319795] to-[#285e61] flex items-center justify-center shadow-lg shadow-[#319795]/20 animate-pulse">
            <Loader2 className="w-6 h-6 animate-spin text-white" />
          </div>
          <p className="text-sm font-medium text-slate-400">Verificando sesión activa...</p>
        </div>
      </div>
    );
  }

  return (
    <HeaderProvider>
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
    </HeaderProvider>
  );
}

