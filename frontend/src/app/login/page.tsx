'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import {
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
  CheckCircle2,
  ShieldCheck,
  User,
  Lock,
} from 'lucide-react';
import { login, isAuthenticated } from '@/services/authService';

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [emailOrUsername, setEmailOrUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
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

    const identifier = emailOrUsername.trim();
    if (!identifier || !password) {
      setErrorMsg('Por favor completa todos los campos requeridos.');
      return;
    }

    setLoading(true);
    try {
      await login({
        username: identifier,
        password: password,
      });

      const callbackUrl = searchParams.get('callbackUrl');
      router.push(callbackUrl && callbackUrl.startsWith('/') ? callbackUrl : '/dashboard');
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : 'Credenciales inválidas o error de conexión con el servidor.';
      setErrorMsg(message);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoFill = (user: string, pass: string) => {
    setEmailOrUsername(user);
    setPassword(pass);
    setErrorMsg(null);
  };

  return (
    <div className="min-h-screen w-full bg-white flex flex-col lg:flex-row relative overflow-hidden select-none">
      {/* ─── COLUMNA IZQUIERDA: FORMULARIO DE ACCESO ─── */}
      <div className="w-full lg:w-1/2 xl:w-5/12 min-h-screen flex flex-col justify-between px-6 sm:px-12 md:px-16 lg:px-20 py-8 lg:py-12 z-10 bg-white">
        {/* Marca superior opcional / badge sutil */}
        <div className="flex items-center gap-2 text-slate-400 text-xs font-medium">
          <div className="size-2 rounded-full bg-sky-500 animate-pulse" />
          <span>SGF • Sistema de Gestión Farmacéutica</span>
        </div>

        {/* Contenido Central */}
        <div className="w-full max-w-sm mx-auto my-auto py-8">
          {/* Encabezado Principal */}
          <div className="mb-8">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#00b0ff] tracking-tight mb-2">
              Bienvenido
            </h1>
            <p className="text-sm text-slate-500 font-normal">
              Ingresa tu email y contraseña para continuar
            </p>
          </div>

          {/* Banner de error */}
          {errorMsg && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-50/90 border border-rose-200/80 text-rose-700 text-xs flex items-center gap-2.5 animate-in fade-in duration-200">
              <AlertCircle className="size-4 shrink-0 text-rose-600" />
              <span className="flex-1 font-medium">{errorMsg}</span>
            </div>
          )}

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Campo Email / Usuario */}
            <div className="space-y-1.5">
              <label
                htmlFor="emailOrUsername"
                className="block text-xs font-semibold text-slate-700"
              >
                Email
              </label>
              <div className="relative group">
                <input
                  id="emailOrUsername"
                  type="text"
                  value={emailOrUsername}
                  onChange={(e) => setEmailOrUsername(e.target.value)}
                  placeholder="tarrillo@gmail.com"
                  autoComplete="username"
                  disabled={loading}
                  className="w-full h-11 px-4 text-sm font-normal text-slate-800 bg-[#eaf1fb] hover:bg-[#e4ecf7] focus:bg-white rounded-xl border border-transparent focus:border-sky-400 focus:ring-4 focus:ring-sky-100 transition-all outline-none placeholder:text-slate-400 disabled:opacity-60"
                />
              </div>
            </div>

            {/* Campo Contraseña */}
            <div className="space-y-1.5">
              <label
                htmlFor="password"
                className="block text-xs font-semibold text-slate-700"
              >
                Contraseña
              </label>
              <div className="relative group">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  disabled={loading}
                  className="w-full h-11 pl-4 pr-11 text-sm font-normal text-slate-800 bg-[#eaf1fb] hover:bg-[#e4ecf7] focus:bg-white rounded-xl border border-transparent focus:border-sky-400 focus:ring-4 focus:ring-sky-100 transition-all outline-none placeholder:text-slate-400 disabled:opacity-60"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 rounded-lg transition-colors cursor-pointer"
                  tabIndex={-1}
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                >
                  {showPassword ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Fila Recordarme Switch */}
            <div className="flex items-center justify-between pt-1 pb-1">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  role="switch"
                  aria-checked={rememberMe}
                  onClick={() => setRememberMe(!rememberMe)}
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full p-0.5 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-offset-2 ${
                    rememberMe ? 'bg-sky-500' : 'bg-slate-700'
                  }`}
                >
                  <span
                    aria-hidden="true"
                    className={`pointer-events-none inline-block size-4 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                      rememberMe ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
                <span
                  onClick={() => setRememberMe(!rememberMe)}
                  className="text-xs font-medium text-slate-600 cursor-pointer select-none hover:text-slate-800 transition-colors"
                >
                  Recordarme
                </span>
              </div>
            </div>

            {/* Botón Ingresar */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-gradient-to-r from-[#00b0ff] to-[#007aff] hover:from-[#009ee6] hover:to-[#006ee6] text-white font-bold text-xs tracking-wider uppercase rounded-xl shadow-md shadow-sky-500/25 hover:shadow-lg hover:shadow-sky-500/35 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed mt-2"
            >
              {loading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  <span>INGRESANDO...</span>
                </>
              ) : (
                <span>INGRESAR</span>
              )}
            </button>
          </form>

          {/* Accesos rápidos Demo para testing y desarrollo */}
          <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col items-center gap-2">
            <span className="text-[11px] font-medium text-slate-400">
              Cuentas demo para pruebas rápidas:
            </span>
            <div className="flex flex-wrap items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => handleDemoFill('admin', 'admin123')}
                className="px-2.5 py-1 text-[11px] font-semibold text-slate-600 bg-slate-50 hover:bg-sky-50 hover:text-sky-600 rounded-lg border border-slate-200/80 transition-all cursor-pointer"
              >
                Admin
              </button>
              <button
                type="button"
                onClick={() => handleDemoFill('tarrillo@gmail.com', 'admin123')}
                className="px-2.5 py-1 text-[11px] font-semibold text-slate-600 bg-slate-50 hover:bg-sky-50 hover:text-sky-600 rounded-lg border border-slate-200/80 transition-all cursor-pointer"
              >
                Tarrillo (Admin)
              </button>
              <button
                type="button"
                onClick={() => handleDemoFill('farmaceutico', 'farma123')}
                className="px-2.5 py-1 text-[11px] font-semibold text-slate-600 bg-slate-50 hover:bg-sky-50 hover:text-sky-600 rounded-lg border border-slate-200/80 transition-all cursor-pointer"
              >
                Farmacéutico
              </button>
              <button
                type="button"
                onClick={() => handleDemoFill('cajero', 'cajero123')}
                className="px-2.5 py-1 text-[11px] font-semibold text-slate-600 bg-slate-50 hover:bg-sky-50 hover:text-sky-600 rounded-lg border border-slate-200/80 transition-all cursor-pointer"
              >
                Cajero
              </button>
            </div>
          </div>
        </div>

        {/* Footer sutil */}
        <div className="text-center text-[11px] text-slate-400">
          © {new Date().getFullYear()} Farmacia San Juan • Todos los derechos reservados
        </div>
      </div>

      {/* ─── COLUMNA DERECHA: BANNER ARTÍSTICO DIAGONAL ─── */}
      <div className="hidden lg:block lg:w-1/2 xl:w-7/12 relative min-h-screen overflow-hidden bg-white p-2 pl-0">
        {/* Contenedor con corte diagonal (clip-path) idéntico a la referencia */}
        <div
          className="relative w-full h-full overflow-hidden rounded-bl-[48px] shadow-2xl"
          style={{
            clipPath: 'polygon(12% 0, 100% 0, 100% 100%, 0% 100%)',
          }}
        >
          {/* Imagen de arte en alta resolución */}
          <div className="relative w-full h-full transform scale-105 hover:scale-100 transition-transform duration-1000 ease-out">
            <Image
              src="/login-art.jpg"
              alt="Arte decorativo fluido multicolor"
              fill
              priority
              className="object-cover object-center rounded-bl-[48px]"
              sizes="(min-width: 1024px) 60vw, 100vw"
            />
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
        <div className="min-h-screen bg-white flex items-center justify-center">
          <Loader2 className="size-8 animate-spin text-[#00b0ff]" />
        </div>
      }
    >
      <LoginFormContent />
    </Suspense>
  );
}
