'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  Receipt,
  Lock,
  Unlock,
  CreditCard,
  Smartphone,
  Coins,
  DollarSign,
  AlertCircle,
  CheckCircle2,
  Clock,
  Printer,
  Calendar,
  Search,
  Plus,
  RefreshCw,
  Loader2,
  X,
  FileText,
} from 'lucide-react';
import {
  Caja,
  MovimientoCaja,
  AperturaCajaDTO,
  CierreCajaDTO,
  MovimientoCajaRequestDTO,
} from '@/types';
import {
  getCajaActiva,
  abrirCaja,
  cerrarCaja,
  registrarMovimientoCaja,
  getHistorialCajas,
} from '@/services/cajaService';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export default function CajaPage() {
  const [activeCaja, setActiveCaja] = useState<Caja | null>(null);
  const [historialCajas, setHistorialCajas] = useState<Caja[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'turno' | 'historial'>('turno');

  // Modales
  const [isAperturaModalOpen, setIsAperturaModalOpen] = useState(false);
  const [isCierreModalOpen, setIsCierreModalOpen] = useState(false);
  const [isMovimientoModalOpen, setIsMovimientoModalOpen] = useState(false);
  const [selectedArqueoTicket, setSelectedArqueoTicket] = useState<Caja | null>(null);

  // Estados de formularios
  const [montoInicialInput, setMontoInicialInput] = useState('100.00');
  const [obsAperturaInput, setObsAperturaInput] = useState('');

  const [montoCierreRealInput, setMontoCierreRealInput] = useState('');
  const [obsCierreInput, setObsCierreInput] = useState('');

  const [movTipo, setMovTipo] = useState<'INGRESO' | 'EGRESO'>('EGRESO');
  const [movConcepto, setMovConcepto] = useState('');
  const [movMonto, setMovMonto] = useState('');
  const [movMetodo, setMovMetodo] = useState('EFECTIVO');

  // Filtros de Historial
  const [filtroFechaInicio, setFiltroFechaInicio] = useState('');
  const [filtroFechaFin, setFiltroFechaFin] = useState('');

  const [submitting, setSubmitting] = useState(false);

  // Toasts
  const [toast, setToast] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  };

  // Cargar datos de caja
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [activa, hist] = await Promise.all([
        getCajaActiva(),
        getHistorialCajas({
          fechaInicio: filtroFechaInicio || undefined,
          fechaFin: filtroFechaFin || undefined,
        }),
      ]);
      setActiveCaja(activa);
      setHistorialCajas(Array.isArray(hist) ? hist : []);
    } catch {
      showToast('error', 'Error al sincronizar datos de caja.');
    } finally {
      setLoading(false);
    }
  }, [filtroFechaInicio, filtroFechaFin]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Manejar Apertura de Caja
  const handleAperturaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const inicial = parseFloat(montoInicialInput);
    if (isNaN(inicial) || inicial < 0) {
      showToast('error', 'Ingrese un monto inicial válido.');
      return;
    }

    setSubmitting(true);
    try {
      const nueva = await abrirCaja({
        montoInicial: inicial,
        observaciones: obsAperturaInput.trim() || undefined,
      });
      setActiveCaja(nueva);
      setIsAperturaModalOpen(false);
      setObsAperturaInput('');
      showToast('success', `¡Caja abierta exitosamente con S/ ${inicial.toFixed(2)}!`);
      fetchData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al abrir caja';
      showToast('error', msg);
    } finally {
      setSubmitting(false);
    }
  };

  // Manejar Cierre y Arqueo de Caja
  const handleCierreSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCaja) return;

    const real = parseFloat(montoCierreRealInput);
    if (isNaN(real) || real < 0) {
      showToast('error', 'Ingrese el monto real en efectivo contado.');
      return;
    }

    setSubmitting(true);
    try {
      const cerrada = await cerrarCaja(activeCaja.id, {
        montoCierre: real,
        observaciones: obsCierreInput.trim() || undefined,
      });
      setActiveCaja(null);
      setIsCierreModalOpen(false);
      setMontoCierreRealInput('');
      setObsCierreInput('');
      setSelectedArqueoTicket(cerrada);
      showToast('success', '¡Caja cerrada y arqueo completado!');
      fetchData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al cerrar caja';
      showToast('error', msg);
    } finally {
      setSubmitting(false);
    }
  };

  // Manejar Registro de Movimiento Manual
  const handleMovimientoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCaja) return;

    const montoVal = parseFloat(movMonto);
    if (!movConcepto.trim()) {
      showToast('error', 'Ingrese el concepto o motivo del movimiento.');
      return;
    }
    if (isNaN(montoVal) || montoVal <= 0) {
      showToast('error', 'Ingrese un monto mayor a cero.');
      return;
    }

    setSubmitting(true);
    try {
      await registrarMovimientoCaja(activeCaja.id, {
        tipo: movTipo,
        concepto: movConcepto.trim(),
        monto: montoVal,
        metodoPago: movMetodo,
      });
      setIsMovimientoModalOpen(false);
      setMovConcepto('');
      setMovMonto('');
      showToast('success', `${movTipo === 'INGRESO' ? 'Ingreso' : 'Egreso'} registrado con éxito.`);
      fetchData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al registrar movimiento';
      showToast('error', msg);
    } finally {
      setSubmitting(false);
    }
  };

  // Cálculos para la vista de Cierre
  const diferenciaCierre = useMemo(() => {
    if (!activeCaja) return 0;
    const real = parseFloat(montoCierreRealInput) || 0;
    const esperado = activeCaja.saldoEsperadoEfectivo || 0;
    return real - esperado;
  }, [activeCaja, montoCierreRealInput]);

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Notificación */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 text-xs font-semibold text-white transition-all animate-in slide-in-from-bottom-2 ${
            toast.type === 'success' ? 'bg-emerald-600' : 'bg-rose-600'
          }`}
        >
          {toast.type === 'success' ? (
            <CheckCircle2 className="size-4 shrink-0" />
          ) : (
            <AlertCircle className="size-4 shrink-0" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* ─── ENCABEZADO PRINCIPAL Y ESTADO DE CAJA ─── */}
      <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm shadow-slate-200/50 border border-slate-100/60 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="size-14 rounded-2xl bg-gradient-to-tr from-[#d946ef] to-[#c026d3] flex items-center justify-center text-white shadow-md shadow-fuchsia-500/20 shrink-0">
            <Wallet className="size-7" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight">
                Control de Caja y Arqueo
              </h1>
              {activeCaja ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold uppercase tracking-wider">
                  <span className="size-2 rounded-full bg-emerald-500 animate-ping" />
                  <span>Caja Abierta</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200 text-[11px] font-bold uppercase tracking-wider">
                  <Lock className="size-3" />
                  <span>Caja Cerrada</span>
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {activeCaja
                ? `Turno activo iniciado el ${new Date(activeCaja.fechaApertura).toLocaleDateString()} a las ${new Date(activeCaja.fechaApertura).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} por ${activeCaja.usuarioAperturaNombre || 'Cajero'}`
                : 'No hay ninguna caja abierta en este momento. Inicia un turno para comenzar a registrar operaciones.'}
            </p>
          </div>
        </div>

        {/* Botones de Acción de Caja */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {activeCaja ? (
            <>
              <button
                type="button"
                onClick={() => setIsMovimientoModalOpen(true)}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Plus className="size-3.5" />
                <span>Movimiento Manual</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMontoCierreRealInput(activeCaja.saldoEsperadoEfectivo.toFixed(2));
                  setIsCierreModalOpen(true);
                }}
                className="px-5 py-2.5 bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md shadow-rose-500/25 active:scale-[0.98] transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Lock className="size-3.5" />
                <span>Cerrar Caja / Arqueo</span>
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => setIsAperturaModalOpen(true)}
              className="px-6 py-3 bg-gradient-to-r from-[#d946ef] to-[#c026d3] hover:from-[#c026d3] hover:to-[#a21caf] text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md shadow-fuchsia-500/25 active:scale-[0.98] transition-all cursor-pointer flex items-center gap-2"
            >
              <Unlock className="size-4" />
              <span>ABRIR CAJA (INICIAR TURNO)</span>
            </button>
          )}

          <button
            type="button"
            onClick={fetchData}
            title="Refrescar datos"
            className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-500 transition-colors cursor-pointer"
          >
            <RefreshCw className={`size-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* ─── PESTAÑAS (TABS) ─── */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('turno')}
          className={`px-5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'turno'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Caja Actual (Turno en Vivo)
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('historial')}
          className={`px-5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'historial'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Historial de Arqueos y Cierres
        </button>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* VISTA 1: CAJA ACTUAL (TURNO)                                        */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {activeTab === 'turno' && (
        <div className="space-y-6">
          {activeCaja ? (
            <>
              {/* Tarjetas de Métricas en Vivo */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* 1. Saldo Esperado en Efectivo */}
                <div className="bg-gradient-to-br from-[#16a34a] to-[#15803d] text-white p-5 rounded-3xl shadow-sm shadow-emerald-500/20 relative overflow-hidden">
                  <div className="relative z-10">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-100 block">
                      Saldo en Efectivo (Caja Física)
                    </span>
                    <span className="text-2xl sm:text-3xl font-black tracking-tight mt-1 block">
                      S/ {activeCaja.saldoEsperadoEfectivo.toFixed(2)}
                    </span>
                    <span className="text-[10px] text-emerald-100/90 mt-2 block">
                      Fondo + Ventas Efectivo + Ingresos - Egresos
                    </span>
                  </div>
                  <Coins className="size-20 absolute -right-4 -bottom-4 text-emerald-400/20" />
                </div>

                {/* 2. Total Ventas del Turno */}
                <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                    Total Ventas del Turno
                  </span>
                  <span className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight mt-1 block">
                    S/ {activeCaja.totalVentasTotal.toFixed(2)}
                  </span>
                  <div className="flex items-center gap-3 text-[10px] text-slate-500 mt-2">
                    <span className="flex items-center gap-1 font-semibold text-emerald-600">
                      Efec: S/ {activeCaja.totalVentasEfectivo.toFixed(2)}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1 font-semibold text-blue-600">
                      Tarj: S/ {activeCaja.totalVentasTarjeta.toFixed(2)}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1 font-semibold text-fuchsia-600">
                      Dig: S/ {activeCaja.totalVentasDigital.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* 3. Fondo Inicial de Caja */}
                <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                    Monto Inicial (Sencillo)
                  </span>
                  <span className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight mt-1 block">
                    S/ {activeCaja.montoInicial.toFixed(2)}
                  </span>
                  <span className="text-[10px] text-slate-400 mt-2 block">
                    Base física registrada al abrir
                  </span>
                </div>

                {/* 4. Ingresos y Egresos Manuales */}
                <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                    Movimientos Manuales
                  </span>
                  <div className="flex items-baseline gap-4 mt-1">
                    <div>
                      <span className="text-xs text-emerald-600 font-bold block">+ Ingresos</span>
                      <span className="text-lg font-black text-emerald-700">
                        S/ {activeCaja.totalIngresosManuales.toFixed(2)}
                      </span>
                    </div>
                    <div>
                      <span className="text-xs text-rose-600 font-bold block">- Egresos</span>
                      <span className="text-lg font-black text-rose-700">
                        S/ {activeCaja.totalEgresosManuales.toFixed(2)}
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Gastos menores / ingresos extras
                  </span>
                </div>
              </div>

              {/* Tabla de Movimientos del Turno */}
              <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm shadow-slate-200/50 border border-slate-100/60 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-slate-800">
                      Movimientos del Turno
                    </h3>
                    <p className="text-xs text-slate-400">
                      Registro cronológico de ventas, ingresos y retiros de efectivo
                    </p>
                  </div>

                  <span className="text-xs text-slate-500 font-medium">
                    {activeCaja.movimientos?.length || 0} operaciones
                  </span>
                </div>

                <div className="overflow-x-auto -mx-6 md:-mx-8 px-6 md:px-8">
                  <table className="w-full text-left border-collapse min-w-[700px]">
                    <thead>
                      <tr className="border-b border-slate-100 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        <th className="py-3 px-3 text-left">HORA</th>
                        <th className="py-3 px-3 text-left">TIPO</th>
                        <th className="py-3 px-3 text-left">CONCEPTO / DESCRIPCIÓN</th>
                        <th className="py-3 px-3 text-center">MÉTODO</th>
                        <th className="py-3 px-3 text-right">MONTO</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100/70 text-xs sm:text-sm">
                      {(!activeCaja.movimientos || activeCaja.movimientos.length === 0) ? (
                        <tr>
                          <td colSpan={5} className="py-8 text-center text-xs text-slate-400">
                            Aún no se han registrado movimientos en este turno.
                          </td>
                        </tr>
                      ) : (
                        activeCaja.movimientos.map((mov) => {
                          const isVenta = mov.tipo === 'VENTA';
                          const isIngreso = mov.tipo === 'INGRESO';
                          const isEgreso = mov.tipo === 'EGRESO';

                          return (
                            <tr key={mov.id} className="hover:bg-slate-50/70 transition-colors">
                              <td className="py-3.5 px-3 text-slate-500 text-xs">
                                {new Date(mov.fecha).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </td>

                              <td className="py-3.5 px-3">
                                {isVenta && (
                                  <span className="bg-emerald-50 text-emerald-700 font-bold text-[10px] px-2.5 py-1 rounded-md uppercase tracking-wider border border-emerald-200">
                                    VENTA POS
                                  </span>
                                )}
                                {isIngreso && (
                                  <span className="bg-blue-50 text-blue-700 font-bold text-[10px] px-2.5 py-1 rounded-md uppercase tracking-wider border border-blue-200">
                                    INGRESO
                                  </span>
                                )}
                                {isEgreso && (
                                  <span className="bg-rose-50 text-rose-700 font-bold text-[10px] px-2.5 py-1 rounded-md uppercase tracking-wider border border-rose-200">
                                    EGRESO
                                  </span>
                                )}
                              </td>

                              <td className="py-3.5 px-3 font-medium text-slate-800">
                                {mov.concepto}
                              </td>

                              <td className="py-3.5 px-3 text-center text-slate-600 font-semibold text-xs">
                                {mov.metodoPago || 'EFECTIVO'}
                              </td>

                              <td
                                className={`py-3.5 px-3 text-right font-bold text-sm ${
                                  isEgreso ? 'text-rose-600' : 'text-emerald-600'
                                }`}
                              >
                                {isEgreso ? '-' : '+'} S/ {mov.monto.toFixed(2)}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : (
            /* Banner cuando no hay caja abierta */
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-sm max-w-xl mx-auto space-y-4">
              <div className="size-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <Lock className="size-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-800">Caja Registradora Cerrada</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Para comenzar a emitir ventas y registrar pagos en el mostrador, es necesario
                iniciar el turno con el monto de fondo inicial.
              </p>
              <button
                type="button"
                onClick={() => setIsAperturaModalOpen(true)}
                className="px-6 py-3 bg-gradient-to-r from-[#d946ef] to-[#c026d3] hover:from-[#c026d3] hover:to-[#a21caf] text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md shadow-fuchsia-500/25 active:scale-[0.98] transition-all cursor-pointer inline-flex items-center gap-2"
              >
                <Unlock className="size-4" />
                <span>ABRIR CAJA AHORA</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* VISTA 2: HISTORIAL DE ARQUEOS Y CIERRES                             */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {activeTab === 'historial' && (
        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm shadow-slate-200/50 border border-slate-100/60 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-slate-800 tracking-tight">
                Historial de Arqueos y Cierres de Caja
              </h2>
              <p className="text-xs text-slate-400">
                Auditoría detallada de turnos, balances de efectivo y descuadres
              </p>
            </div>

            {/* Filtros de Fecha */}
            <div className="flex items-center gap-2 flex-wrap">
              <input
                type="date"
                value={filtroFechaInicio}
                onChange={(e) => setFiltroFechaInicio(e.target.value)}
                className="h-9 px-3 text-xs bg-slate-50 rounded-xl border border-slate-200 outline-none"
              />
              <span className="text-xs text-slate-400">a</span>
              <input
                type="date"
                value={filtroFechaFin}
                onChange={(e) => setFiltroFechaFin(e.target.value)}
                className="h-9 px-3 text-xs bg-slate-50 rounded-xl border border-slate-200 outline-none"
              />
              <button
                type="button"
                onClick={fetchData}
                className="px-3.5 py-2 bg-slate-800 text-white font-bold text-xs rounded-xl hover:bg-slate-900 transition-colors cursor-pointer"
              >
                Filtrar
              </button>
            </div>
          </div>

          {/* Tabla de Historial */}
          <div className="overflow-x-auto -mx-6 md:-mx-8 px-6 md:px-8">
            <table className="w-full text-left border-collapse min-w-[750px]">
              <thead>
                <tr className="border-b border-slate-100 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  <th className="py-3 px-3 text-left">ID</th>
                  <th className="py-3 px-3 text-left">APERTURA</th>
                  <th className="py-3 px-3 text-left">CIERRE</th>
                  <th className="py-3 px-3 text-right">INICIAL</th>
                  <th className="py-3 px-3 text-right">VENTAS TOTAL</th>
                  <th className="py-3 px-3 text-right">CIERRE REAL</th>
                  <th className="py-3 px-3 text-center">DIFERENCIA</th>
                  <th className="py-3 px-3 text-center">ESTADO</th>
                  <th className="py-3 px-3 text-right">TICKET</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/70 text-xs sm:text-sm">
                {historialCajas.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-xs text-slate-400">
                      No hay registros de arqueos anteriores.
                    </td>
                  </tr>
                ) : (
                  historialCajas.map((c) => {
                    const dif = c.diferencia || 0;
                    const isCuadrada = Math.abs(dif) < 0.01;
                    const isFaltante = dif < -0.01;

                    return (
                      <tr key={c.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-4 px-3 font-bold text-slate-800">#{c.id}</td>

                        <td className="py-4 px-3 text-slate-600 text-xs">
                          {new Date(c.fechaApertura).toLocaleString([], {
                            dateStyle: 'short',
                            timeStyle: 'short',
                          })}
                        </td>

                        <td className="py-4 px-3 text-slate-600 text-xs">
                          {c.fechaCierre
                            ? new Date(c.fechaCierre).toLocaleString([], {
                                dateStyle: 'short',
                                timeStyle: 'short',
                              })
                            : '-'}
                        </td>

                        <td className="py-4 px-3 text-right text-slate-700">
                          S/ {c.montoInicial.toFixed(2)}
                        </td>

                        <td className="py-4 px-3 text-right font-semibold text-slate-800">
                          S/ {c.totalVentasTotal.toFixed(2)}
                        </td>

                        <td className="py-4 px-3 text-right font-bold text-slate-800">
                          {c.montoCierre !== undefined && c.montoCierre !== null
                            ? `S/ ${c.montoCierre.toFixed(2)}`
                            : '-'}
                        </td>

                        <td className="py-4 px-3 text-center">
                          {c.estado === 'ABIERTA' ? (
                            <span className="text-slate-400 text-xs">En curso</span>
                          ) : isCuadrada ? (
                            <span className="bg-emerald-50 text-emerald-700 font-bold text-[10px] px-2 py-0.5 rounded-md border border-emerald-200">
                              Cuadrada
                            </span>
                          ) : isFaltante ? (
                            <span className="bg-rose-50 text-rose-700 font-bold text-[10px] px-2 py-0.5 rounded-md border border-rose-200">
                              Faltante S/ {Math.abs(dif).toFixed(2)}
                            </span>
                          ) : (
                            <span className="bg-blue-50 text-blue-700 font-bold text-[10px] px-2 py-0.5 rounded-md border border-blue-200">
                              Sobrante S/ {dif.toFixed(2)}
                            </span>
                          )}
                        </td>

                        <td className="py-4 px-3 text-center">
                          {c.estado === 'ABIERTA' ? (
                            <span className="bg-emerald-500 text-white font-bold text-[10px] px-2.5 py-0.5 rounded-md">
                              ABIERTA
                            </span>
                          ) : (
                            <span className="bg-slate-500 text-white font-bold text-[10px] px-2.5 py-0.5 rounded-md">
                              CERRADA
                            </span>
                          )}
                        </td>

                        <td className="py-4 px-3 text-right">
                          <button
                            type="button"
                            onClick={() => setSelectedArqueoTicket(c)}
                            className="p-1.5 text-slate-500 hover:text-fuchsia-600 transition-colors cursor-pointer"
                            title="Ver Ticket de Arqueo"
                          >
                            <Receipt className="size-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─── MODAL 1: APERTURA DE CAJA ─── */}
      <Dialog open={isAperturaModalOpen} onOpenChange={setIsAperturaModalOpen}>
        <DialogContent className="max-w-md bg-white rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-800 flex items-center gap-2">
              <Unlock className="size-5 text-[#c026d3]" />
              <span>Apertura de Caja (Iniciar Turno)</span>
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleAperturaSubmit} className="space-y-4 pt-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Monto Inicial en Efectivo (Sencillo de Caja)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-xs">
                  S/
                </span>
                <input
                  type="number"
                  min="0"
                  step="0.10"
                  required
                  value={montoInicialInput}
                  onChange={(e) => setMontoInicialInput(e.target.value)}
                  placeholder="100.00"
                  className="w-full h-11 pl-10 pr-4 text-sm font-bold text-slate-800 bg-white rounded-xl border border-slate-200 focus:border-[#d946ef] focus:ring-4 focus:ring-fuchsia-100 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Observaciones de Apertura (Opcional)
              </label>
              <textarea
                rows={2}
                value={obsAperturaInput}
                onChange={(e) => setObsAperturaInput(e.target.value)}
                placeholder="Ej: Turno mañana, caja asignada a mostrador principal."
                className="w-full p-3 text-xs text-slate-800 bg-white rounded-xl border border-slate-200 focus:border-[#d946ef] focus:ring-4 focus:ring-fuchsia-100 outline-none resize-none"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsAperturaModalOpen(false)}
                className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs uppercase"
              >
                CANCELAR
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2.5 bg-gradient-to-r from-[#d946ef] to-[#c026d3] text-white font-bold text-xs uppercase rounded-xl shadow-md cursor-pointer disabled:opacity-50"
              >
                {submitting ? 'Abriendo...' : 'CONFIRMAR APERTURA'}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* ─── MODAL 2: REGISTRO DE MOVIMIENTO MANUAL ─── */}
      <Dialog open={isMovimientoModalOpen} onOpenChange={setIsMovimientoModalOpen}>
        <DialogContent className="max-w-md bg-white rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-800 flex items-center gap-2">
              <Plus className="size-5 text-[#c026d3]" />
              <span>Registrar Movimiento Manual de Caja</span>
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleMovimientoSubmit} className="space-y-4 pt-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Tipo de Movimiento
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setMovTipo('EGRESO')}
                  className={`py-2 rounded-xl text-xs font-bold uppercase transition-all cursor-pointer ${
                    movTipo === 'EGRESO'
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  - Retiro / Egreso
                </button>
                <button
                  type="button"
                  onClick={() => setMovTipo('INGRESO')}
                  className={`py-2 rounded-xl text-xs font-bold uppercase transition-all cursor-pointer ${
                    movTipo === 'INGRESO'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  + Entrada / Ingreso
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Concepto / Motivo
              </label>
              <input
                type="text"
                required
                value={movConcepto}
                onChange={(e) => setMovConcepto(e.target.value)}
                placeholder="Ej: Pago de delivery de pedidos urgentes"
                className="w-full h-10 px-3.5 text-xs text-slate-800 bg-white rounded-xl border border-slate-200 outline-none focus:border-[#d946ef]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Monto (S/)</label>
                <input
                  type="number"
                  min="0.10"
                  step="0.10"
                  required
                  value={movMonto}
                  onChange={(e) => setMovMonto(e.target.value)}
                  placeholder="25.00"
                  className="w-full h-10 px-3.5 text-xs text-slate-800 bg-white rounded-xl border border-slate-200 outline-none focus:border-[#d946ef]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Método</label>
                <select
                  value={movMetodo}
                  onChange={(e) => setMovMetodo(e.target.value)}
                  className="w-full h-10 px-3 text-xs text-slate-800 bg-white rounded-xl border border-slate-200 outline-none cursor-pointer"
                >
                  <option value="EFECTIVO">Efectivo</option>
                  <option value="YAPE">Yape</option>
                  <option value="PLIN">Plin</option>
                  <option value="TARJETA">Tarjeta</option>
                </select>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsMovimientoModalOpen(false)}
                className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs uppercase"
              >
                CANCELAR
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2.5 bg-gradient-to-r from-[#d946ef] to-[#c026d3] text-white font-bold text-xs uppercase rounded-xl shadow-md cursor-pointer disabled:opacity-50"
              >
                {submitting ? 'Guardando...' : 'REGISTRAR'}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* ─── MODAL 3: CIERRE DE CAJA Y ARQUEO ─── */}
      <Dialog open={isCierreModalOpen} onOpenChange={setIsCierreModalOpen}>
        <DialogContent className="max-w-lg bg-white rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-800 flex items-center gap-2">
              <Lock className="size-5 text-rose-600" />
              <span>Arqueo y Cierre de Caja</span>
            </DialogTitle>
          </DialogHeader>

          {activeCaja && (
            <form onSubmit={handleCierreSubmit} className="space-y-4 pt-2">
              {/* Resumen del Sistema */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2 text-xs">
                <div className="flex justify-between text-slate-500">
                  <span>Monto Inicial de Apertura:</span>
                  <span className="font-semibold text-slate-800">
                    S/ {activeCaja.montoInicial.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Ventas en Efectivo:</span>
                  <span className="font-semibold text-emerald-600">
                    + S/ {activeCaja.totalVentasEfectivo.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Ingresos Manuales:</span>
                  <span className="font-semibold text-blue-600">
                    + S/ {activeCaja.totalIngresosManuales.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Egresos / Gastos Manuales:</span>
                  <span className="font-semibold text-rose-600">
                    - S/ {activeCaja.totalEgresosManuales.toFixed(2)}
                  </span>
                </div>
                <div className="pt-2 border-t border-slate-200 flex justify-between font-bold text-sm text-slate-900">
                  <span>Saldo Esperado en Efectivo:</span>
                  <span className="text-[#16a34a]">
                    S/ {activeCaja.saldoEsperadoEfectivo.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Input Efectivo Real */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Efectivo Físico Real Contado en Caja
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-xs">
                    S/
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="0.10"
                    required
                    value={montoCierreRealInput}
                    onChange={(e) => setMontoCierreRealInput(e.target.value)}
                    placeholder="0.00"
                    className="w-full h-11 pl-10 pr-4 text-base font-bold text-slate-800 bg-white rounded-xl border border-slate-200 outline-none focus:border-[#d946ef]"
                  />
                </div>
              </div>

              {/* Resultado del Descuadre / Diferencia */}
              <div
                className={`p-3.5 rounded-xl border text-xs font-semibold flex items-center justify-between ${
                  Math.abs(diferenciaCierre) < 0.01
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : diferenciaCierre < 0
                    ? 'bg-rose-50 text-rose-800 border-rose-200'
                    : 'bg-blue-50 text-blue-800 border-blue-200'
                }`}
              >
                <span>Diferencia de Arqueo:</span>
                <span className="text-sm font-black">
                  {Math.abs(diferenciaCierre) < 0.01
                    ? 'S/ 0.00 (Caja Cuadrada)'
                    : diferenciaCierre < 0
                    ? `- S/ ${Math.abs(diferenciaCierre).toFixed(2)} (Faltante)`
                    : `+ S/ ${diferenciaCierre.toFixed(2)} (Sobrante)`}
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Observaciones de Cierre (Opcional)
                </label>
                <textarea
                  rows={2}
                  value={obsCierreInput}
                  onChange={(e) => setObsCierreInput(e.target.value)}
                  placeholder="Ej: Turno cerrado conforme sin incidencias."
                  className="w-full p-3 text-xs text-slate-800 bg-white rounded-xl border border-slate-200 outline-none focus:border-[#d946ef] resize-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCierreModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs uppercase"
                >
                  CANCELAR
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 bg-gradient-to-r from-rose-500 to-rose-600 text-white font-bold text-xs uppercase rounded-xl shadow-md cursor-pointer disabled:opacity-50"
                >
                  {submitting ? 'Cerrando...' : 'CONFIRMAR CIERRE'}
                </button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* ─── MODAL 4: TICKET DE ARQUEO IMPRIMIBLE ─── */}
      <Dialog
        open={Boolean(selectedArqueoTicket)}
        onOpenChange={(open) => !open && setSelectedArqueoTicket(null)}
      >
        <DialogContent className="max-w-sm bg-white rounded-3xl p-6 text-slate-900 font-mono">
          {selectedArqueoTicket && (
            <div className="space-y-4">
              <div className="text-center pb-3 border-b border-dashed border-slate-300">
                <span className="text-base font-black uppercase tracking-tight block">
                  SISTEMA AG FARMACIA
                </span>
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest block">
                  TICKET DE ARQUEO DE CAJA
                </span>
                <span className="text-[10px] text-slate-400 block mt-1">
                  Caja N° #{selectedArqueoTicket.id}
                </span>
              </div>

              <div className="text-xs space-y-1.5 text-slate-600 border-b border-dashed border-slate-300 pb-3">
                <div className="flex justify-between">
                  <span>Apertura:</span>
                  <span className="font-semibold text-slate-800">
                    {new Date(selectedArqueoTicket.fechaApertura).toLocaleString([], {
                      dateStyle: 'short',
                      timeStyle: 'short',
                    })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Cierre:</span>
                  <span className="font-semibold text-slate-800">
                    {selectedArqueoTicket.fechaCierre
                      ? new Date(selectedArqueoTicket.fechaCierre).toLocaleString([], {
                          dateStyle: 'short',
                          timeStyle: 'short',
                        })
                      : 'En curso'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Cajero Responsable:</span>
                  <span className="font-semibold text-slate-800">
                    {selectedArqueoTicket.usuarioCierreNombre ||
                      selectedArqueoTicket.usuarioAperturaNombre ||
                      'Administrador'}
                  </span>
                </div>
              </div>

              <div className="text-xs space-y-2 border-b border-dashed border-slate-300 pb-3">
                <div className="flex justify-between">
                  <span>Fondo Inicial:</span>
                  <span className="font-bold">
                    S/ {selectedArqueoTicket.montoInicial.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-emerald-600">
                  <span>Ventas Efectivo:</span>
                  <span className="font-bold">
                    + S/ {selectedArqueoTicket.totalVentasEfectivo.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-blue-600">
                  <span>Ventas Tarjeta:</span>
                  <span className="font-bold">
                    + S/ {selectedArqueoTicket.totalVentasTarjeta.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-fuchsia-600">
                  <span>Ventas Digitales:</span>
                  <span className="font-bold">
                    + S/ {selectedArqueoTicket.totalVentasDigital.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between font-bold text-slate-800 pt-1 border-t border-slate-100">
                  <span>Total Ventas Emitidas:</span>
                  <span>S/ {selectedArqueoTicket.totalVentasTotal.toFixed(2)}</span>
                </div>
              </div>

              <div className="text-xs space-y-1.5 border-b border-dashed border-slate-300 pb-3">
                <div className="flex justify-between">
                  <span>Saldo Esperado Efectivo:</span>
                  <span className="font-bold">
                    S/ {selectedArqueoTicket.saldoEsperadoEfectivo.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Efectivo Real Contado:</span>
                  <span className="font-black text-sm">
                    S/{' '}
                    {selectedArqueoTicket.montoCierre !== undefined &&
                    selectedArqueoTicket.montoCierre !== null
                      ? selectedArqueoTicket.montoCierre.toFixed(2)
                      : '0.00'}
                  </span>
                </div>
                <div className="flex justify-between font-bold pt-1">
                  <span>Diferencia / Descuadre:</span>
                  <span
                    className={
                      Math.abs(selectedArqueoTicket.diferencia || 0) < 0.01
                        ? 'text-emerald-600'
                        : (selectedArqueoTicket.diferencia || 0) < 0
                        ? 'text-rose-600'
                        : 'text-blue-600'
                    }
                  >
                    S/ {(selectedArqueoTicket.diferencia || 0).toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedArqueoTicket(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-sans font-bold"
                >
                  Cerrar
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-sans font-bold flex items-center gap-1.5 cursor-pointer hover:bg-slate-800"
                >
                  <Printer className="size-3.5" />
                  <span>Imprimir</span>
                </button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
