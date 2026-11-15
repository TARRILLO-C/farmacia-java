import api from './api';
import {
  Caja,
  MovimientoCaja,
  AperturaCajaDTO,
  CierreCajaDTO,
  MovimientoCajaRequestDTO,
  ApiResponse,
} from '@/types';

/**
 * Servicio integral para Gestión de Caja y Arqueos en Spring Boot 3
 * Endpoint base: /cajas
 */

const LOCAL_STORAGE_ACTIVE_CAJA_KEY = 'sgf_active_caja';
const LOCAL_STORAGE_HISTORIAL_CAJAS_KEY = 'sgf_historial_cajas';

export const normalizeCaja = (c: any): Caja => {
  if (!c) return c;
  const mi = Number(c.montoInicial ?? 0);
  const tve = Number(c.totalVentasEfectivo ?? 0);
  const tvt = Number(c.totalVentasTarjeta ?? 0);
  const tvd = Number(c.totalVentasDigital ?? 0);
  const tvTotal = Number(c.totalVentasTotal ?? (tve + tvt + tvd));
  const tim = Number(c.totalIngresosManuales ?? 0);
  const tem = Number(c.totalEgresosManuales ?? 0);
  const se = Number(c.saldoEsperadoEfectivo ?? (mi + tve + tim - tem));
  const dif = Number(c.diferencia ?? 0);

  return {
    ...c,
    montoInicial: mi,
    montoCierre: c.montoCierre != null ? Number(c.montoCierre) : undefined,
    totalVentasEfectivo: tve,
    totalVentasTarjeta: tvt,
    totalVentasDigital: tvd,
    totalVentasTotal: tvTotal,
    totalIngresosManuales: tim,
    totalEgresosManuales: tem,
    saldoEsperadoEfectivo: se,
    diferencia: dif,
    movimientos: Array.isArray(c.movimientos) ? c.movimientos : [],
  };
};

// Cargar caja activa desde LocalStorage de respaldo
const getLocalActiveCaja = (): Caja | null => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_ACTIVE_CAJA_KEY);
    return raw ? normalizeCaja(JSON.parse(raw)) : null;
  } catch {
    return null;
  }
};

const saveLocalActiveCaja = (caja: Caja | null) => {
  if (typeof window === 'undefined') return;
  try {
    if (caja) {
      localStorage.setItem(LOCAL_STORAGE_ACTIVE_CAJA_KEY, JSON.stringify(caja));
    } else {
      localStorage.removeItem(LOCAL_STORAGE_ACTIVE_CAJA_KEY);
    }
  } catch {
    // Ignorar errores de almacenamiento local
  }
};

const getLocalHistorial = (): Caja[] => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_HISTORIAL_CAJAS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const saveLocalHistorial = (historial: Caja[]) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_STORAGE_HISTORIAL_CAJAS_KEY, JSON.stringify(historial));
  } catch {
    // Ignorar errores
  }
};

/**
 * Obtiene la caja que se encuentra actualmente ABIERTA
 */
export const getCajaActiva = async (): Promise<Caja | null> => {
  try {
    const response = await api.get<Caja | ApiResponse<Caja>>('/cajas/activa');
    if (response.data && typeof response.data === 'object' && 'data' in response.data) {
      const data = normalizeCaja((response.data as ApiResponse<Caja>).data);
      saveLocalActiveCaja(data);
      return data;
    }
    const data = normalizeCaja(response.data as Caja);
    saveLocalActiveCaja(data);
    return data;
  } catch {
    // Fallback con datos guardados localmente
    return getLocalActiveCaja();
  }
};

/**
 * Apertura de Caja (Iniciar Turno)
 */
export const abrirCaja = async (dto: AperturaCajaDTO): Promise<Caja> => {
  try {
    const response = await api.post<Caja | ApiResponse<Caja>>('/cajas/abrir', dto);
    let result: Caja;
    if (response.data && typeof response.data === 'object' && 'data' in response.data) {
      result = normalizeCaja((response.data as ApiResponse<Caja>).data);
    } else {
      result = normalizeCaja(response.data as Caja);
    }
    saveLocalActiveCaja(result);
    return result;
  } catch (error) {
    // Fallback de contingencia local
    const initialMonto = Number(dto.montoInicial) || 0;
    const now = new Date().toISOString();
    const mockCaja: Caja = normalizeCaja({
      id: Date.now(),
      fechaApertura: now,
      montoInicial: initialMonto,
      totalVentasEfectivo: 0,
      totalVentasTarjeta: 0,
      totalVentasDigital: 0,
      totalVentasTotal: 0,
      totalIngresosManuales: 0,
      totalEgresosManuales: 0,
      saldoEsperadoEfectivo: initialMonto,
      diferencia: 0,
      estado: 'ABIERTA',
      usuarioAperturaNombre: 'Administrador',
      observacionesApertura: dto.observaciones,
      movimientos: [
        {
          id: Date.now() + 1,
          tipo: 'INGRESO',
          concepto: 'Fondo Inicial de Caja',
          monto: initialMonto,
          metodoPago: 'EFECTIVO',
          fecha: now,
          usuarioNombre: 'Administrador',
        },
      ],
    });
    saveLocalActiveCaja(mockCaja);
    return mockCaja;
  }
};

/**
 * Cierre de Caja y Arqueo
 */
export const cerrarCaja = async (id: number, dto: CierreCajaDTO): Promise<Caja> => {
  try {
    const response = await api.post<Caja | ApiResponse<Caja>>(`/cajas/${id}/cerrar`, dto);
    let result: Caja;
    if (response.data && typeof response.data === 'object' && 'data' in response.data) {
      result = normalizeCaja((response.data as ApiResponse<Caja>).data);
    } else {
      result = normalizeCaja(response.data as Caja);
    }

    // Mover de caja activa a historial local
    saveLocalActiveCaja(null);
    const hist = getLocalHistorial();
    saveLocalHistorial([result, ...hist.filter((h) => h.id !== id)]);
    return result;
  } catch (error) {
    // Fallback de contingencia local
    const local = getLocalActiveCaja();
    const montoCierre = Number(dto.montoCierre) || 0;
    const esperado = local ? local.saldoEsperadoEfectivo : montoCierre;
    const diferencia = montoCierre - esperado;

    const closedCaja: Caja = normalizeCaja({
      ...(local || {
        id,
        fechaApertura: new Date().toISOString(),
        montoInicial: 0,
        totalVentasEfectivo: 0,
        totalVentasTarjeta: 0,
        totalVentasDigital: 0,
        totalVentasTotal: 0,
        totalIngresosManuales: 0,
        totalEgresosManuales: 0,
        saldoEsperadoEfectivo: 0,
      }),
      id,
      fechaCierre: new Date().toISOString(),
      montoCierre,
      diferencia,
      estado: 'CERRADA',
      usuarioCierreNombre: 'Administrador',
      observacionesCierre: dto.observaciones,
    });

    saveLocalActiveCaja(null);
    const hist = getLocalHistorial();
    saveLocalHistorial([closedCaja, ...hist.filter((h) => h.id !== id)]);
    return closedCaja;
  }
};

/**
 * Registra un movimiento manual (Ingreso o Egreso)
 */
export const registrarMovimientoCaja = async (
  cajaId: number,
  dto: MovimientoCajaRequestDTO
): Promise<MovimientoCaja> => {
  try {
    const response = await api.post<MovimientoCaja | ApiResponse<MovimientoCaja>>(
      `/cajas/${cajaId}/movimientos`,
      dto
    );
    if (response.data && typeof response.data === 'object' && 'data' in response.data) {
      return (response.data as ApiResponse<MovimientoCaja>).data;
    }
    return response.data as MovimientoCaja;
  } catch {
    // Actualizar localmente si no hay conexión
    const local = getLocalActiveCaja();
    const movMonto = Number(dto.monto) || 0;
    const nuevoMov: MovimientoCaja = {
      id: Date.now(),
      cajaId,
      tipo: dto.tipo,
      concepto: dto.concepto,
      monto: movMonto,
      metodoPago: dto.metodoPago || 'EFECTIVO',
      fecha: new Date().toISOString(),
      usuarioNombre: 'Administrador',
    };

    if (local && local.id === cajaId) {
      const isIngreso = dto.tipo.toUpperCase() === 'INGRESO';
      const updated: Caja = {
        ...local,
        totalIngresosManuales: isIngreso
          ? local.totalIngresosManuales + movMonto
          : local.totalIngresosManuales,
        totalEgresosManuales: !isIngreso
          ? local.totalEgresosManuales + movMonto
          : local.totalEgresosManuales,
        saldoEsperadoEfectivo: isIngreso
          ? local.saldoEsperadoEfectivo + movMonto
          : local.saldoEsperadoEfectivo - movMonto,
        movimientos: [nuevoMov, ...(local.movimientos || [])],
      };
      saveLocalActiveCaja(updated);
    }

    return nuevoMov;
  }
};

/**
 * Obtiene el historial de sesiones de caja
 */
export const getHistorialCajas = async (params?: {
  fechaInicio?: string;
  fechaFin?: string;
}): Promise<Caja[]> => {
  try {
    const response = await api.get<Caja[] | ApiResponse<Caja[]>>('/cajas/historial', {
      params,
    });
    if (Array.isArray(response.data)) return response.data.map(normalizeCaja);
    if (response.data && 'data' in response.data && Array.isArray((response.data as ApiResponse<Caja[]>).data)) {
      return (response.data as ApiResponse<Caja[]>).data.map(normalizeCaja);
    }
    return getLocalHistorial().map(normalizeCaja);
  } catch {
    return getLocalHistorial().map(normalizeCaja);
  }
};

/**
 * Obtiene el detalle de una caja específica por su ID
 */
export const getCajaById = async (id: number): Promise<Caja> => {
  try {
    const response = await api.get<Caja | ApiResponse<Caja>>(`/cajas/${id}`);
    if (response.data && typeof response.data === 'object' && 'data' in response.data) {
      return normalizeCaja((response.data as ApiResponse<Caja>).data);
    }
    return normalizeCaja(response.data as Caja);
  } catch {
    const all = [...(getLocalActiveCaja() ? [getLocalActiveCaja()!] : []), ...getLocalHistorial()];
    const match = all.find((c) => c.id === id);
    if (match) return normalizeCaja(match);
    throw new Error('Caja no encontrada');
  }
};

