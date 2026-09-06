'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Activity,
  Lock,
  User,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
  ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { login, isAuthenticated } from '@/services/authService';

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (searchParams.get('expired') === 'true') {
      setErrorMsg('Sesión expirada. Por favor ingrese nuevamente.');
    }

    if (isAuthenticated()) {
      router.replace('/dashboard');
    }
  }, [searchParams, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!username.trim() || !password) {
      setErrorMsg('Por favor complete todos los campos.');
      return;
    }

    setLoading(true);
    try {
      await login({
        username: username.trim(),
        password: password,
      });

      router.push('/dashboard');
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : 'Credenciales inválidas o error de conexión.';
      setErrorMsg(message);
    } finally {
      setLoading(false);
    }
  };

  const setDemo = (user: string, pass: string) => {
    setUsername(user);
    setPassword(pass);
    setErrorMsg(null);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-slate-50 relative overflow-hidden">
      {/* Sutil halo decorativo en paleta institucional */}
      <div className="absolute w-[500px] h-[500px] bg-teal-100/60 rounded-full blur-3xl pointer-events-none -top-24 -left-24" />
      <div className="absolute w-[400px] h-[400px] bg-blue-100/50 rounded-full blur-3xl pointer-events-none -bottom-24 -right-24" />

      <div className="w-full max-w-sm space-y-5 relative z-10">
        {/* Cabecera limpia */}
        <div className="text-center space-y-1.5">
          <div className="inline-flex items-center justify-center size-12 rounded-2xl bg-[#319795] text-white shadow-md shadow-[#319795]/20 mb-1">
            <Activity className="size-6 stroke-[2.5]" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-[#1a365d]">SGF Farmacia</h1>
          <p className="text-xs text-slate-500">Sistema de Gestión Farmacéutica</p>
        </div>

        {/* Alerta de error */}
        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="size-4 shrink-0 text-rose-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Tarjeta de Login - White Mode */}
        <Card className="border-slate-200/90 bg-white shadow-xl shadow-slate-200/50 rounded-3xl">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Usuario */}
              <div className="space-y-1.5">
                <Label htmlFor="username" className="text-xs font-bold text-slate-700">
                  Usuario
                </Label>
                <div className="relative">
                  <Input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="admin"
                    autoComplete="username"
                    disabled={loading}
                    className="bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus-visible:ring-[#319795] h-9 text-xs rounded-xl"
                  />
                </div>
              </div>

              {/* Contraseña */}
              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-xs font-bold text-slate-700">
                  Contraseña
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    disabled={loading}
                    className="bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus-visible:ring-[#319795] h-9 pr-9 text-xs rounded-xl"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                  </button>
                </div>
              </div>

              {/* Botón Ingresar */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full h-9.5 bg-[#319795] hover:bg-[#287e7c] text-white font-bold text-xs rounded-xl shadow-sm active:scale-[0.99] transition-all cursor-pointer mt-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="size-3.5 animate-spin mr-1.5" />
                    <span>Iniciando...</span>
                  </>
                ) : (
                  <>
                    <span>Ingresar al Sistema</span>
                    <ArrowRight className="size-3.5 ml-1.5" />
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Acceso Rápido Demo (1-Click) */}
        <div className="flex items-center justify-center gap-2 pt-0.5">
          <span className="text-[11px] text-slate-400">Acceso demo:</span>
          <button
            type="button"
            onClick={() => setDemo('admin', 'admin123')}
            className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-white text-slate-600 hover:text-[#1a365d] border border-slate-200/90 shadow-2xs hover:border-[#319795]/50 transition-all cursor-pointer"
          >
            Admin
          </button>
          <button
            type="button"
            onClick={() => setDemo('cajero', 'caja2026')}
            className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-white text-slate-600 hover:text-[#1a365d] border border-slate-200/90 shadow-2xs hover:border-[#319795]/50 transition-all cursor-pointer"
          >
            Cajero
          </button>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <Loader2 className="size-8 animate-spin text-[#319795]" />
        </div>
      }
    >
      <LoginFormContent />
    </Suspense>
  );
}
