'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShieldAlert, ArrowLeft, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getStoredUser } from '@/services/authService';
import { RolUsuario } from '@/types';

interface RoleGuardProps {
  allowedRoles?: RolUsuario[];
  moduleKey?: string;
  children: React.ReactNode;
}

export default function RoleGuard({ allowedRoles, moduleKey, children }: RoleGuardProps) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const [userRole, setUserRole] = useState<string>('');

  useEffect(() => {
    const user = getStoredUser();
    if (!user) {
      setAuthorized(false);
      return;
    }
    setUserRole(user.rol);

    // 1. Si se especificó una clave de módulo particular
    if (moduleKey) {
      if (user.modulosPermitidos && user.modulosPermitidos.length > 0) {
        setAuthorized(user.modulosPermitidos.includes(moduleKey));
        return;
      }
      // Fallback si no tiene permisos explícitos: ADMIN tiene todo
      if (user.rol === 'ADMIN') {
        setAuthorized(true);
        return;
      }
    }

    // 2. Si se especificaron roles permitidos
    if (allowedRoles && allowedRoles.length > 0) {
      const hasRole = allowedRoles.includes(user.rol as RolUsuario);
      setAuthorized(hasRole);
      return;
    }

    setAuthorized(true);
  }, [allowedRoles, moduleKey]);

  if (authorized === null) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#319795]" />
      </div>
    );
  }

  if (!authorized) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 mb-4 shadow-sm">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-black text-[#1a365d] tracking-tight">
          Acceso Restringido
        </h2>
        <p className="text-xs text-slate-500 max-w-md mt-2">
          Tu rol actual (<span className="font-bold text-[#1a365d]">{userRole || 'CAJERO'}</span>) no cuenta con los permisos necesarios para acceder a este módulo del sistema.
        </p>
        <div className="flex items-center gap-3 mt-6">
          <Link href="/dashboard/pos">
            <Button className="bg-[#319795] hover:bg-[#287e7c] text-white text-xs font-bold gap-2">
              <ShoppingCart className="w-4 h-4" />
              <span>Ir al Punto de Venta (POS)</span>
            </Button>
          </Link>
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="text-xs font-semibold gap-1.5 border-slate-200 text-slate-700"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Volver</span>
          </Button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
