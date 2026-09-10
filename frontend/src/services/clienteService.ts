import api from './api';
import {
  Cliente,
  CreateClienteDTO,
  UpdateClienteDTO,
  ApiResponse,
  Venta,
} from '@/types';

/**
 * Servicio para gestión de Clientes y Programa de Fidelización "ClienteAmigo"
 * Endpoint base: /clientes
 */

/**
 * Obtiene el listado completo de clientes
 */
export const getClientes = async (): Promise<Cliente[]> => {
  try {
    const response = await api.get<
      Cliente[] | ApiResponse<Cliente[]> | { content: Cliente[] }
    >('/clientes');

    if (Array.isArray(response.data)) {
      return response.data;
    }
    if (
      response.data &&
      'data' in response.data &&
      Array.isArray((response.data as ApiResponse<Cliente[]>).data)
    ) {
      return (response.data as ApiResponse<Cliente[]>).data;
    }
    if (
      response.data &&
      'content' in response.data &&
      Array.isArray((response.data as { content: Cliente[] }).content)
    ) {
      return (response.data as { content: Cliente[] }).content;
    }

    return [];
  } catch (error) {
    console.error('Error al obtener clientes desde la API:', error);
    throw error;
  }
};

/**
 * Obtiene un cliente por su identificador primario
 */
export const getClienteById = async (id: number): Promise<Cliente> => {
  try {
    const response = await api.get<Cliente | ApiResponse<Cliente>>(
      `/clientes/${id}`
    );

    if (
      response.data &&
      typeof response.data === 'object' &&
      'data' in response.data
    ) {
      return (response.data as ApiResponse<Cliente>).data;
    }

    return response.data as Cliente;
  } catch (error) {
    console.error(`Error al obtener cliente ID ${id}:`, error);
    throw error;
  }
};

/**
 * Busca un cliente por su número de DNI, RUC o Código ClienteAmigo
 */
export const buscarClientePorDocumentoOCodigo = async (
  termino: string
): Promise<Cliente | null> => {
  try {
    const response = await api.get<Cliente | ApiResponse<Cliente>>(
      `/clientes/buscar`,
      {
        params: { termino: termino.trim() },
      }
    );

    if (
      response.data &&
      typeof response.data === 'object' &&
      'data' in response.data
    ) {
      return (response.data as ApiResponse<Cliente>).data;
    }

    return response.data as Cliente;
  } catch (error) {
    console.warn(`Cliente con documento/código "${termino}" no encontrado:`, error);
    return null;
  }
};

/**
 * Registra un nuevo cliente con opción a suscripción ClienteAmigo
 */
export const createCliente = async (
  cliente: CreateClienteDTO
): Promise<Cliente> => {
  try {
    const response = await api.post<Cliente | ApiResponse<Cliente>>(
      '/clientes',
      cliente
    );

    if (
      response.data &&
      typeof response.data === 'object' &&
      'data' in response.data
    ) {
      return (response.data as ApiResponse<Cliente>).data;
    }

    return response.data as Cliente;
  } catch (error) {
    console.error('Error al registrar cliente:', error);
    throw error;
  }
};

/**
 * Actualiza los datos personales o estado ClienteAmigo del cliente
 */
export const updateCliente = async (
  id: number,
  cliente: UpdateClienteDTO
): Promise<Cliente> => {
  try {
    const response = await api.put<Cliente | ApiResponse<Cliente>>(
      `/clientes/${id}`,
      cliente
    );

    if (
      response.data &&
      typeof response.data === 'object' &&
      'data' in response.data
    ) {
      return (response.data as ApiResponse<Cliente>).data;
    }

    return response.data as Cliente;
  } catch (error) {
    console.error(`Error al actualizar cliente ID ${id}:`, error);
    throw error;
  }
};

/**
 * Elimina o desactiva un cliente
 */
export const deleteCliente = async (id: number): Promise<void> => {
  try {
    await api.delete(`/clientes/${id}`);
  } catch (error) {
    console.error(`Error al eliminar cliente ID ${id}:`, error);
    throw error;
  }
};

/**
 * Obtiene el historial de compras previas realizadas por el cliente
 */
export const getHistorialComprasCliente = async (
  clienteId: number
): Promise<Venta[]> => {
  try {
    const response = await api.get<
      Venta[] | ApiResponse<Venta[]> | { content: Venta[] }
    >(`/clientes/${clienteId}/compras`);

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
    console.warn(`No se pudo cargar historial de compras para cliente ${clienteId}:`, error);
    return [];
  }
};
