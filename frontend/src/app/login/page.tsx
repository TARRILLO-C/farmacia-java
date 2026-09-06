'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Activity,
  Lock,
  User,
  Eye,
  EyeOff,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Sparkles,
  Pill,
  ArrowRight,
  Clock,
  ShieldAlert,
  Building2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { login, isAuthenticated } from '@/services/authService';

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    if (searchParams.get('expired') === 'true') {
      setIsExpired(true);
      setErrorMsg('Su sesión ha caducado por inactividad. Ingrese nuevamente.');
    }

    // Si ya está autenticado, redirigir al dashboard
    if (isAuthenticated()) {
      router.replace('/dashboard');
    }
  }, [searchParams, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!username.trim()) {
      setErrorMsg('Por favor ingrese su usuario o correo electrónico.');
      return;
    }
    if (!password) {
      setErrorMsg('Por favor ingrese su contraseña.');
      return;
    }

    setLoading(true);
    try {
      const response = await login({
        username: username.trim(),
        password: password,
      });

      setSuccessMsg(`¡Bienvenido/a, ${response.usuario.nombre}!`);

      // Breve transición antes de redirigir
      setTimeout(() => {
        router.push('/dashboard');
      }, 650);
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : 'Credenciales inválidas o servicio no disponible.';
      setErrorMsg(message);
    } finally {
      setLoading(false);
    }
  };

  const setDemoCredentials = (role: 'admin' | 'farmaceutico' | 'cajero') => {
    if (role === 'admin') {
      setUsername('admin');
      setPassword('admin123');
    } else if (role === 'farmaceutico') {
      setUsername('farmaceutica');
      setPassword('farma2026');
    } else {
      setUsername('cajero');
      setPassword('caja2026');
    }
    setErrorMsg(null);
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-slate-950 text-slate-100 overflow-hidden relative selection:bg-[#319795] selection:text-white">
      {/* Elementos de fondo decorativos */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#319795]/15 rounded-full blur-3xl pointer-events-none -translate-y-1/2" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#1a365d]/40 rounded-full blur-3xl pointer-events-none translate-y-1/2" />

      {/* Panel Izquierdo: Branding, Hero & Características */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12 xl:p-16 border-r border-slate-800/80 bg-gradient-to-b from-slate-900/90 via-slate-950/80 to-[#0b192c]/90 backdrop-blur-xl">
        {/* Encabezado Logo */}
        <div className="flex items-center gap-3.5">
          <div className="flex aspect-square size-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#319795] to-[#1e4273] text-white shadow-lg shadow-[#319795]/20 ring-1 ring-white/20">
            <Activity className="size-6 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-black tracking-tight text-white">SGF</span>
              <Badge className="bg-[#319795]/20 text-[#81e6d9] border-[#319795]/40 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5">
                Hospital & Farmacia
              </Badge>
            </div>
            <p className="text-xs text-slate-400 font-medium">
              Sistema Integral de Gestión Farmacéutica y POS
            </p>
          </div>
        </div>

        {/* Contenido Central Inspirador */}
        <div className="space-y-8 max-w-lg">
          <div className="space-y-4">
            <Badge variant="outline" className="bg-slate-800/60 text-emerald-400 border-emerald-500/30 gap-1.5 py-1 px-3 text-xs">
              <span className="size-2 rounded-full bg-emerald-400 animate-ping inline-block" />
              Servidor Spring Boot 3 & Next.js Activo
            </Badge>
            <h1 className="text-4xl xl:text-5xl font-black tracking-tight text-white leading-tight">
              Control total en dispensación, lotes y{' '}
              <span className="bg-gradient-to-r from-[#81e6d9] to-[#319795] bg-clip-text text-transparent">
                fidelización
              </span>
              .
            </h1>
            <p className="text-slate-300 text-sm leading-relaxed">
              Plataforma diseñada para optimizar la trazabilidad de fármacos, alertar sobre stock crítico y vencimientos, y acelerar ventas con el módulo ClienteAmigo.
            </p>
          </div>

          {/* Tarjetas informativas de características */}
          <div className="grid grid-cols-2 gap-3.5">
            <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md">
              <div className="p-2 w-fit rounded-xl bg-[#319795]/15 text-[#81e6d9] mb-2.5">
                <Pill className="size-4" />
              </div>
              <h4 className="text-xs font-bold text-white">Trazabilidad FEFO</h4>
              <p className="text-[11px] text-slate-400 mt-1">
                Monitoreo automático por lote y fecha de expiración.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md">
              <div className="p-2 w-fit rounded-xl bg-blue-500/15 text-blue-400 mb-2.5">
                <Sparkles className="size-4" />
              </div>
              <h4 className="text-xs font-bold text-white">ClienteAmigo</h4>
              <p className="text-[11px] text-slate-400 mt-1">
                Acumulación de puntos y descuentos en tiempo real.
              </p>
            </div>
          </div>
        </div>

        {/* Footer Informativo */}
        <div className="flex items-center justify-between text-xs text-slate-400 pt-6 border-t border-slate-800/60">
          <div className="flex items-center gap-2">
            <ShieldCheck className="size-4 text-emerald-400" />
            <span>Autenticación JWT con cifrado de sesión</span>
          </div>
          <span className="font-mono text-[11px] text-slate-400">v1.0.4 • 2026</span>
        </div>
      </div>

      {/* Panel Derecho: Formulario de Login */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-10 lg:p-16 relative z-10">
        <div className="w-full max-w-md space-y-6">
          {/* Logo visible en pantallas pequeñas */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-4">
            <div className="flex aspect-square size-10 items-center justify-center rounded-xl bg-gradient-to-tr from-[#319795] to-[#1e4273] text-white shadow-md">
              <Activity className="size-5 stroke-[2.5]" />
            </div>
            <div>
              <span className="text-lg font-black tracking-tight text-white">SGF Farmacia</span>
              <p className="text-[11px] text-slate-400">Sistema de Gestión Farmacéutica</p>
            </div>
          </div>

          {/* Encabezado del Formulario */}
          <div className="space-y-2 text-center lg:text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700/60 text-xs font-medium text-slate-300">
              <Lock className="size-3 text-[#319795]" />
              Acceso Seguro al Sistema
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Iniciar Sesión
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Ingrese sus credenciales autorizadas para acceder al terminal de caja y panel ejecutivo.
            </p>
          </div>

          {/* Mensaje de sesión expirada */}
          {isExpired && (
            <div className="p-3.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs flex items-start gap-2.5">
              <Clock className="size-4 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Sesión finalizada</p>
                <p className="text-amber-300/80 text-[11px]">
                  Por motivos de seguridad y auditoría médica, la sesión expiró.
                </p>
              </div>
            </div>
          )}

          {/* Alertas de error o éxito */}
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5 animate-in fade-in slide-in-from-top-1 duration-200">
              <AlertCircle className="size-4 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Error al iniciar sesión</p>
                <p className="text-rose-300/90 text-[11px]">{errorMsg}</p>
              </div>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2.5 animate-in fade-in slide-in-from-top-1 duration-200">
              <CheckCircle2 className="size-4 shrink-0 text-emerald-400" />
              <div>
                <p className="font-semibold">{successMsg}</p>
                <p className="text-emerald-300/80 text-[11px]">Redirigiendo al panel de control...</p>
              </div>
            </div>
          )}

          {/* Formulario */}
          <Card className="border-slate-800 bg-slate-900/80 shadow-2xl backdrop-blur-xl">
            <CardContent className="p-6 sm:p-7 space-y-4">
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Campo Usuario / Correo */}
                <div className="space-y-1.5">
                  <Label htmlFor="username" className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <User className="size-3.5 text-[#319795]" />
                    Usuario o Correo Electrónico
                  </Label>
                  <div className="relative">
                    <Input
                      id="username"
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="ej: admin o admin@farmacia.com"
                      autoComplete="username"
                      disabled={loading}
                      className="bg-slate-950/60 border-slate-700/80 text-white placeholder:text-slate-500 focus-visible:ring-[#319795] h-10 text-sm"
                    />
                  </div>
                </div>

                {/* Campo Contraseña */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                      <Lock className="size-3.5 text-[#319795]" />
                      Contraseña
                    </Label>
                    <span className="text-[11px] text-slate-400 hover:text-[#81e6d9] cursor-pointer transition-colors">
                      ¿Olvidó su clave?
                    </span>
                  </div>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      autoComplete="current-password"
                      disabled={loading}
                      className="bg-slate-950/60 border-slate-700/80 text-white placeholder:text-slate-500 focus-visible:ring-[#319795] h-10 pr-10 text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-200 transition-colors"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                </div>

                {/* Recordar sesión */}
                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="size-4 rounded border-slate-700 bg-slate-950 text-[#319795] focus:ring-[#319795] focus:ring-offset-slate-900 cursor-pointer"
                    />
                    <span>Guardar token en localStorage & Cookies</span>
                  </label>
                </div>

                {/* Botón de Envío */}
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-11 bg-gradient-to-r from-[#319795] to-[#287e7c] hover:from-[#287e7c] hover:to-[#1e4273] text-white font-bold text-sm shadow-lg shadow-[#319795]/25 active:scale-[0.99] transition-all cursor-pointer mt-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="size-4 animate-spin mr-2" />
                      <span>Verificando credenciales...</span>
                    </>
                  ) : (
                    <>
                      <span>Acceder al Terminal</span>
                      <ArrowRight className="size-4 ml-1.5" />
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Carga Rápida de Credenciales de Demostración */}
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                <Sparkles className="size-3.5 text-amber-400" />
                Acceso Rápido de Prueba (Demo):
              </span>
              <span className="text-[10px] font-mono text-slate-400">1-Click</span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setDemoCredentials('admin')}
                className="py-1.5 px-2 text-xs font-medium rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700/60 hover:border-[#319795]/50 transition-all text-center"
              >
                👑 Admin
              </button>
              <button
                type="button"
                onClick={() => setDemoCredentials('farmaceutico')}
                className="py-1.5 px-2 text-xs font-medium rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700/60 hover:border-[#319795]/50 transition-all text-center"
              >
                💊 Farmacéutico
              </button>
              <button
                type="button"
                onClick={() => setDemoCredentials('cajero')}
                className="py-1.5 px-2 text-xs font-medium rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700/60 hover:border-[#319795]/50 transition-all text-center"
              >
                🧾 Cajero
              </button>
            </div>
          </div>

          {/* Enlaces de soporte o pie */}
          <div className="text-center">
            <p className="text-[11px] text-slate-400">
              ¿Problemas para acceder? Contacte a soporte técnico en{' '}
              <span className="text-slate-400 font-medium">soporte@farmacia.pe</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
          <Loader2 className="size-8 animate-spin text-[#319795]" />
        </div>
      }
    >
      <LoginFormContent />
    </Suspense>
  );
}
