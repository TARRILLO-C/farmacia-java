import api from './api';
import {
  Venta,
  CreateVentaDTO,
  ApiResponse,
  Recibo,
} from '@/types';

/**
 * Servicio para el registro y gestión de Ventas y Comprobantes POS en Spring Boot.
 * Endpoint base: /ventas
 */

/**
 * Registra una nueva transacción de venta en el POS con sus detalles de productos.
 * Endpoint: POST /ventas
 */
export const postVenta = async (
  ventaData: CreateVentaDTO
): Promise<Venta> => {
  try {
    const response = await api.post<Venta | ApiResponse<Venta>>(
      '/ventas',
      ventaData
    );

    let rawData: any = response.data;
    if (
      response.data &&
      typeof response.data === 'object' &&
      'data' in response.data
    ) {
      rawData = (response.data as ApiResponse<Venta>).data;
    }

    const normalized = normalizeVenta(rawData);
    if (ventaData.metodoPago && (!normalized.metodoPago || normalized.metodoPago === 'EFECTIVO')) {
      normalized.metodoPago = ventaData.metodoPago;
    }
    if (ventaData.tipoComprobante && !normalized.tipoComprobante) {
      normalized.tipoComprobante = ventaData.tipoComprobante;
    }

    return normalized;
  } catch (error) {
    console.error('Error al registrar la venta en la API:', error);
    throw error;
  }
};

/**
 * Alias de conveniencia para registrar una venta.
 */
export const createVenta = postVenta;

/**
 * Normaliza objetos de venta provenientes de Spring Boot (VentaResponseDTO)
 * para asegurar compatibilidad total y prevenir errores de tipo en el frontend.
 */
export const normalizeVenta = (raw: any): Venta => {
  if (!raw) return raw;
  const id = raw.id || 0;
  const numVenta =
    raw.codigoComprobante ||
    raw.numeroVenta ||
    raw.recibo?.codigoComprobante ||
    raw.recibo?.numeroRecibo ||
    `VTA-${String(id).padStart(5, '0')}`;

  const fecha = raw.fechaVenta || raw.fecha || new Date().toISOString();
  const subtotal = Number(raw.subtotal || 0);
  const total = Number(raw.total || 0);
  const descuentoTotal = Number(raw.descuentoTotal || 0);
  const igv = Number(raw.igv ?? raw.impuesto ?? 0);
  const estado: any = raw.estado || 'COMPLETADA';
  const metodoPago: any = raw.metodoPago || raw.recibo?.metodoPago || 'EFECTIVO';

  const detalles = Array.isArray(raw.detalles)
    ? raw.detalles.map((d: any) => ({
        id: d.id,
        productoId: d.productoId,
        productoNombre: d.productoNombre || d.producto?.nombre,
        codigoBarras: d.codigoBarras || d.producto?.codigoBarras,
        producto: d.producto,
        cantidad: Number(d.cantidad || 1),
        precioUnitario: Number(d.precioUnitario || 0),
        descuento: Number(d.descuento || 0),
        subtotal: Number(d.subtotalItem ?? d.subtotal ?? (d.precioUnitario * d.cantidad)),
        subtotalItem: Number(d.subtotalItem ?? d.subtotal ?? (d.precioUnitario * d.cantidad)),
      }))
    : [];

  return {
    ...raw,
    id,
    numeroVenta: numVenta,
    codigoComprobante: raw.codigoComprobante || numVenta,
    fecha,
    fechaVenta: raw.fechaVenta || fecha,
    subtotal,
    total,
    descuentoTotal,
    igv,
    impuesto: igv,
    estado,
    metodoPago,
    clienteId: raw.clienteId ?? raw.cliente?.id,
    clienteNombre:
      raw.clienteNombre ||
      (raw.cliente ? `${raw.cliente.nombre} ${raw.cliente.apellido || ''}`.trim() : undefined),
    clienteDocumento: raw.clienteDocumento || raw.cliente?.documentoIdentidad,
    esClienteAmigo: raw.esClienteAmigo ?? raw.cliente?.esClienteAmigo ?? false,
    detalles,
  };
};

/**
 * Obtiene el listado histórico de ventas realizadas.
 */
export const getVentas = async (): Promise<Venta[]> => {
  try {
    const response = await api.get<
      Venta[] | ApiResponse<Venta[]> | { content: Venta[] }
    >('/ventas');

    let rawList: any[] = [];
    if (Array.isArray(response.data)) {
      rawList = response.data;
    } else if (
      response.data &&
      'data' in response.data &&
      Array.isArray((response.data as ApiResponse<Venta[]>).data)
    ) {
      rawList = (response.data as ApiResponse<Venta[]>).data;
    } else if (
      response.data &&
      'content' in response.data &&
      Array.isArray((response.data as { content: Venta[] }).content)
    ) {
      rawList = (response.data as { content: Venta[] }).content;
    }

    return rawList.map(normalizeVenta);
  } catch (error) {
    console.error('Error al obtener ventas desde la API:', error);
    throw error;
  }
};

/**
 * Obtiene el detalle completo de una venta por su ID.
 */
export const getVentaById = async (id: number): Promise<Venta> => {
  try {
    const response = await api.get<Venta | ApiResponse<Venta>>(
      `/ventas/${id}`
    );

    let rawData: any = response.data;
    if (
      response.data &&
      typeof response.data === 'object' &&
      'data' in response.data
    ) {
      rawData = (response.data as ApiResponse<Venta>).data;
    }

    return normalizeVenta(rawData);
  } catch (error) {
    console.error(`Error al obtener venta ID ${id}:`, error);
    throw error;
  }
};

/**
 * Anula una venta previamente registrada.
 */
export const anularVenta = async (
  id: number,
  motivo?: string
): Promise<void> => {
  try {
    await api.patch(`/ventas/${id}/anular`, { motivo });
  } catch (error) {
    console.error(`Error al anular venta ID ${id}:`, error);
    throw error;
  }
};
