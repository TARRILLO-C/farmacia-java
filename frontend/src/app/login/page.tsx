'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
  Sparkles,
} from 'lucide-react';
import { login, isAuthenticated } from '@/services/authService';

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [username, setUsername] = useState('tarrillo@gmail.com');
  const [password, setPassword] = useState('admin123');
  const [rememberMe, setRememberMe] = useState(true);
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
    <div className="min-h-screen w-full flex bg-white font-sans selection:bg-[#0095FF]/20 overflow-hidden">
      {/* Sección Izquierda - Formulario de Login */}
      <div className="w-full lg:w-[48%] flex flex-col justify-center items-center px-6 sm:px-12 md:px-16 py-10 z-10">
        <div className="w-full max-w-sm space-y-6">
          
          {/* Título & Subtítulo */}
          <div className="space-y-1.5">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#00A3FF]">
              Bienvenido
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-normal">
              Ingresa tu email y contraseña para continuar
            </p>
          </div>

          {/* Mensaje de error */}
          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2.5 animate-in fade-in slide-in-from-top-2">
              <AlertCircle className="size-4 shrink-0 text-rose-600" />
              <span className="font-medium">{errorMsg}</span>
            </div>
          )}

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Field: Email / Usuario */}
            <div className="space-y-1.5">
              <label htmlFor="username" className="block text-xs font-bold text-[#2A3B50]">
                Email
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="ejemplo@correo.com"
                autoComplete="username"
                disabled={loading}
                className="w-full h-11 px-4 rounded-xl bg-[#EDF3FD] hover:bg-[#E5EEFC] focus:bg-white border border-transparent focus:border-[#0095FF] focus:ring-4 focus:ring-[#0095FF]/15 text-slate-800 text-xs font-medium outline-none transition-all placeholder:text-slate-400"
              />
            </div>

            {/* Field: Contraseña */}
            <div className="space-y-1.5">
              <label htmlFor="password" className="block text-xs font-bold text-[#2A3B50]">
                Contraseña
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  disabled={loading}
                  className="w-full h-11 px-4 pr-10 rounded-xl bg-[#EDF3FD] hover:bg-[#E5EEFC] focus:bg-white border border-transparent focus:border-[#0095FF] focus:ring-4 focus:ring-[#0095FF]/15 text-slate-800 text-xs font-medium outline-none transition-all placeholder:text-slate-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            {/* Switch: Recordarme */}
            <div className="flex items-center gap-3 pt-1">
              <button
                type="button"
                role="switch"
                aria-checked={rememberMe}
                onClick={() => setRememberMe(!rememberMe)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  rememberMe ? 'bg-[#4B5E78]' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                    rememberMe ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
              <span 
                onClick={() => setRememberMe(!rememberMe)}
                className="text-xs text-slate-500 font-medium cursor-pointer select-none"
              >
                Recordarme
              </span>
            </div>

            {/* Botón submit: INGRESAR */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full h-11 rounded-xl font-bold text-xs uppercase tracking-wider text-white shadow-md shadow-[#0095FF]/25 bg-gradient-to-r from-[#00C6FF] to-[#0072FF] hover:from-[#00B8FA] hover:to-[#0065EE] active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    <span>Iniciando...</span>
                  </>
                ) : (
                  <span>INGRESAR</span>
                )}
              </button>
            </div>
          </form>

          {/* Acceso rápido Demo */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1 font-medium">
              <Sparkles className="size-3.5 text-amber-500" /> Demo rápido:
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setDemo('admin', 'admin123')}
                className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-slate-100 text-slate-600 hover:bg-[#0095FF]/10 hover:text-[#0095FF] transition-all cursor-pointer"
              >
                Admin
              </button>
              <button
                type="button"
                onClick={() => setDemo('cajero', 'caja2026')}
                className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-slate-100 text-slate-600 hover:bg-[#0095FF]/10 hover:text-[#0095FF] transition-all cursor-pointer"
              >
                Cajero
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Sección Derecha - Panel de Arte 3D Fluido Diagonal */}
      <div className="hidden lg:block w-[52%] relative p-4 pl-0 h-screen overflow-hidden">
        <div 
          className="w-full h-full rounded-[2rem] overflow-hidden relative shadow-2xl"
          style={{
            clipPath: 'polygon(8% 0, 100% 0, 100% 100%, 0% 100%)',
          }}
        >
          <img
            src="/login-bg.png"
            alt="Arte 3D Fluido"
            className="w-full h-full object-cover object-center transform hover:scale-105 transition-transform duration-700 ease-out"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />
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
          <Loader2 className="size-8 animate-spin text-[#0095FF]" />
        </div>
      }
    >
      <LoginFormContent />
    </Suspense>
  );
}

