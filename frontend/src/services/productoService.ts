import api from './api';
import {
  Producto,
  CreateProductoDTO,
  UpdateProductoDTO,
  Categoria,
  ApiResponse,
} from '@/types';
import { getCategorias } from './categoriaService';

/**
 * Servicio para la gestión de Productos e Inventario en el backend Spring Boot.
 * Endpoint base: /productos
 */

/**
 * Obtiene la lista completa de productos desde el backend.
 * Normaliza la respuesta tanto si viene como arreglo directo, ApiResponse o Page.
 */
export const getProductos = async (params?: {
  search?: string;
  categoriaId?: number;
}): Promise<Producto[]> => {
  try {
    const response = await api.get<
      Producto[] | ApiResponse<Producto[]> | { content: Producto[] }
    >('/productos', { params });

    if (Array.isArray(response.data)) {
      return response.data;
    }
    if (
      response.data &&
      'data' in response.data &&
      Array.isArray((response.data as ApiResponse<Producto[]>).data)
    ) {
      return (response.data as ApiResponse<Producto[]>).data;
    }
    if (
      response.data &&
      'content' in response.data &&
      Array.isArray((response.data as { content: Producto[] }).content)
    ) {
      return (response.data as { content: Producto[] }).content;
    }

    return [];
  } catch (error) {
    console.error('Error al obtener productos desde la API:', error);
    throw error;
  }
};

/**
 * Obtiene un producto específico por su identificador primario.
 */
export const getProductoById = async (id: number): Promise<Producto> => {
  try {
    const response = await api.get<Producto | ApiResponse<Producto>>(
      `/productos/${id}`
    );

    if (
      response.data &&
      typeof response.data === 'object' &&
      'data' in response.data
    ) {
      return (response.data as ApiResponse<Producto>).data;
    }

    return response.data as Producto;
  } catch (error) {
    console.error(`Error al obtener producto ID ${id}:`, error);
    throw error;
  }
};

/**
 * Busca un producto por su código de barras exacto.
 */
export const getProductoPorCodigo = async (
  codigo: string
): Promise<Producto | null> => {
  try {
    const response = await api.get<Producto | ApiResponse<Producto>>(
      `/productos/codigo/${encodeURIComponent(codigo.trim())}`
    );

    if (
      response.data &&
      typeof response.data === 'object' &&
      'data' in response.data
    ) {
      return (response.data as ApiResponse<Producto>).data;
    }

    return response.data as Producto;
  } catch (error) {
    console.warn(`Producto con código "${codigo}" no encontrado:`, error);
    return null;
  }
};

/**
 * Registra un nuevo producto/fármaco en el inventario.
 */
export const createProducto = async (
  producto: CreateProductoDTO
): Promise<Producto> => {
  try {
    const response = await api.post<Producto | ApiResponse<Producto>>(
      '/productos',
      producto
    );

    if (
      response.data &&
      typeof response.data === 'object' &&
      'data' in response.data
    ) {
      return (response.data as ApiResponse<Producto>).data;
    }

    return response.data as Producto;
  } catch (error) {
    console.error('Error al registrar nuevo producto:', error);
    throw error;
  }
};

/**
 * Actualiza los datos de un producto existente.
 */
export const updateProducto = async (
  id: number,
  producto: UpdateProductoDTO
): Promise<Producto> => {
  try {
    const response = await api.put<Producto | ApiResponse<Producto>>(
      `/productos/${id}`,
      producto
    );

    if (
      response.data &&
      typeof response.data === 'object' &&
      'data' in response.data
    ) {
      return (response.data as ApiResponse<Producto>).data;
    }

    return response.data as Producto;
  } catch (error) {
    console.error(`Error al actualizar producto ID ${id}:`, error);
    throw error;
  }
};

/**
 * Elimina un producto por su ID.
 */
export const deleteProducto = async (id: number): Promise<void> => {
  try {
    await api.delete(`/productos/${id}`);
  } catch (error) {
    console.error(`Error al eliminar producto ID ${id}:`, error);
    throw error;
  }
};

/**
 * Helper de integración para obtener la lista de categorías activas para el selector desplegable.
 */
export const getCategoriasParaSelector = async (): Promise<Categoria[]> => {
  try {
    const categorias = await getCategorias();
    return categorias.filter((cat) => cat.activo ?? true);
  } catch (error) {
    console.warn('No se pudieron obtener categorías desde la API, usando fallback:', error);
    return [];
  }
};
