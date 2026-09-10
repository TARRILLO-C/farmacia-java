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

    if (
      response.data &&
      typeof response.data === 'object' &&
      'data' in response.data
    ) {
      return (response.data as ApiResponse<Venta>).data;
    }

    return response.data as Venta;
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
 * Obtiene el listado histórico de ventas realizadas.
 */
export const getVentas = async (): Promise<Venta[]> => {
  try {
    const response = await api.get<
      Venta[] | ApiResponse<Venta[]> | { content: Venta[] }
    >('/ventas');

    if (Array.isArray(response.data)) {
      return response.data;
    }
    if (
      response.data &&
      'data' in response.data &&
      Array.isArray((response.data as ApiResponse<Venta[]>).data)
    ) {
      return (response.data as ApiResponse<Venta[]>).data;
    }
    if (
      response.data &&
      'content' in response.data &&
      Array.isArray((response.data as { content: Venta[] }).content)
    ) {
      return (response.data as { content: Venta[] }).content;
    }

    return [];
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

    if (
      response.data &&
      typeof response.data === 'object' &&
      'data' in response.data
    ) {
      return (response.data as ApiResponse<Venta>).data;
    }

    return response.data as Venta;
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
