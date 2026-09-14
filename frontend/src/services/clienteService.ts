import api from './api';
import {
  Cliente,
  CreateClienteDTO,
  UpdateClienteDTO,
  ApiResponse,
  Venta,
} from '@/types';
import { normalizeVenta, getVentas } from './ventaService';

/**
 * Servicio para gestión de Clientes y Programa de Fidelización "ClienteAmigo"
 * Endpoint base: /clientes
 */

/**
 * Normaliza objetos Cliente recibidos del backend Spring Boot (ClienteResponseDTO)
 * asegurando consistencia entre DTOs y compatibilidad total con el frontend Next.js.
 */
export const normalizeCliente = (raw: any): Cliente => {
  if (!raw) return raw;
  const doc = (raw.documentoIdentidad || raw.dniRuc || '').toString().trim();
  let nombre = (raw.nombre || '').toString().trim();
  let apellido = (raw.apellido || '').toString().trim();

  if (!nombre && raw.nombreCompleto) {
    const parts = raw.nombreCompleto.toString().trim().split(/\s+/);
    nombre = parts[0] || '';
    apellido = parts.slice(1).join(' ') || '';
  }

  const nombreCompleto =
    raw.nombreCompleto ||
    `${nombre} ${apellido}`.trim() ||
    'Cliente';

  return {
    ...raw,
    id: raw.id,
    dniRuc: doc,
    documentoIdentidad: doc,
    tipoDocumento: raw.tipoDocumento || (doc.length === 11 ? 'RUC' : 'DNI'),
    nombre,
    apellido,
    nombreCompleto,
    direccion: raw.direccion || '',
    telefono: raw.telefono || '',
    email: raw.email || '',
    tipoCliente: raw.tipoCliente || 'REGULAR',
    esClienteAmigo: Boolean(raw.esClienteAmigo),
    codigoClienteAmigo: raw.codigoClienteAmigo || raw.numeroClienteAmigo,
    numeroClienteAmigo: raw.numeroClienteAmigo || raw.codigoClienteAmigo,
    porcentajeDescuento: Number(raw.porcentajeDescuento ?? (raw.esClienteAmigo ? 5 : 0)),
    puntosFidelidad: Number(raw.puntosFidelidad ?? 0),
    activo: raw.activo ?? true,
  };
};

/**
 * Obtiene el listado completo de clientes
 */
export const getClientes = async (): Promise<Cliente[]> => {
  try {
    const response = await api.get<
      Cliente[] | ApiResponse<Cliente[]> | { content: Cliente[] }
    >('/clientes');

    let rawList: any[] = [];
    if (Array.isArray(response.data)) {
      rawList = response.data;
    } else if (
      response.data &&
      'data' in response.data &&
      Array.isArray((response.data as ApiResponse<Cliente[]>).data)
    ) {
      rawList = (response.data as ApiResponse<Cliente[]>).data;
    } else if (
      response.data &&
      'content' in response.data &&
      Array.isArray((response.data as { content: Cliente[] }).content)
    ) {
      rawList = (response.data as { content: Cliente[] }).content;
    }

    return rawList.map(normalizeCliente);
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

    let rawData: any = response.data;
    if (
      response.data &&
      typeof response.data === 'object' &&
      'data' in response.data
    ) {
      rawData = (response.data as ApiResponse<Cliente>).data;
    }

    return normalizeCliente(rawData);
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
  const query = termino.trim();
  if (!query) return null;

  try {
    const response = await api.get<any>(
      `/clientes/buscar`,
      {
        params: { termino: query, term: query },
      }
    );

    let rawData = response.data;
    if (rawData && typeof rawData === 'object' && 'data' in rawData) {
      rawData = rawData.data;
    }

    if (Array.isArray(rawData)) {
      if (rawData.length > 0) {
        // Encontrar coincidencia exacta por DNI/RUC o código, o tomar el primero
        const exactMatch = rawData.find(
          (c: any) =>
            (c.dniRuc && c.dniRuc.trim() === query) ||
            (c.documentoIdentidad && c.documentoIdentidad.trim() === query) ||
            (c.numeroClienteAmigo && c.numeroClienteAmigo.trim().toLowerCase() === query.toLowerCase()) ||
            (c.codigoClienteAmigo && c.codigoClienteAmigo.trim().toLowerCase() === query.toLowerCase())
        );
        return normalizeCliente(exactMatch || rawData[0]);
      }
    } else if (rawData && typeof rawData === 'object' && rawData.id) {
      return normalizeCliente(rawData);
    }

    // Fallback: intentar por endpoint directo de documento
    try {
      const directDocRes = await api.get<any>(`/clientes/documento/${encodeURIComponent(query)}`);
      let docData = directDocRes.data;
      if (docData && typeof docData === 'object' && 'data' in docData) {
        docData = docData.data;
      }
      if (docData && typeof docData === 'object' && docData.id) {
        return normalizeCliente(docData);
      }
    } catch {
      // Ignorar si no existe
    }

    return null;
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
    const response = await api.get<any>(`/clientes/${clienteId}/compras`);

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
  } catch {
    // Fallback silencioso: consultar /ventas y filtrar por clienteId para evitar errores 500 en consola
    try {
      const allVentas = await getVentas();
      return allVentas.filter(
        (v) =>
          Number(v.clienteId) === Number(clienteId) ||
          Number(v.cliente?.id) === Number(clienteId)
      );
    } catch {
      return [];
    }
  }
};
