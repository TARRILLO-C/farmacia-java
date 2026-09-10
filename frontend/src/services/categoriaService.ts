import api from './api';
import {
  Categoria,
  CreateCategoriaDTO,
  UpdateCategoriaDTO,
  ApiResponse,
} from '@/types';

/**
 * Servicio para la gestión de Categorías de fármacos y productos en el backend Spring Boot.
 * Endpoint base: /categorias
 */

/**
 * Obtiene el listado completo de categorías registradas
 */
export const getCategorias = async (): Promise<Categoria[]> => {
  try {
    const response = await api.get<
      Categoria[] | ApiResponse<Categoria[]> | { content: Categoria[] }
    >('/categorias');

    // Normalizar si Spring Boot devuelve arreglo directo o envuelto en ApiResponse / Page
    if (Array.isArray(response.data)) {
      return response.data;
    }
    if (
      response.data &&
      'data' in response.data &&
      Array.isArray((response.data as ApiResponse<Categoria[]>).data)
    ) {
      return (response.data as ApiResponse<Categoria[]>).data;
    }
    if (
      response.data &&
      'content' in response.data &&
      Array.isArray((response.data as { content: Categoria[] }).content)
    ) {
      return (response.data as { content: Categoria[] }).content;
    }

    return [];
  } catch (error) {
    console.error('Error al obtener categorías desde la API:', error);
    throw error;
  }
};

/**
 * Obtiene una categoría específica por su identificador único
 */
export const getCategoriaById = async (id: number): Promise<Categoria> => {
  try {
    const response = await api.get<Categoria | ApiResponse<Categoria>>(
      `/categorias/${id}`
    );

    if (
      response.data &&
      typeof response.data === 'object' &&
      'data' in response.data
    ) {
      return (response.data as ApiResponse<Categoria>).data;
    }

    return response.data as Categoria;
  } catch (error) {
    console.error(`Error al obtener la categoría ID ${id}:`, error);
    throw error;
  }
};

/**
 * Registra una nueva categoría en el sistema
 */
export const createCategoria = async (
  categoria: CreateCategoriaDTO
): Promise<Categoria> => {
  try {
    const response = await api.post<Categoria | ApiResponse<Categoria>>(
      '/categorias',
      categoria
    );

    if (
      response.data &&
      typeof response.data === 'object' &&
      'data' in response.data
    ) {
      return (response.data as ApiResponse<Categoria>).data;
    }

    return response.data as Categoria;
  } catch (error) {
    console.error('Error al crear la categoría:', error);
    throw error;
  }
};

/**
 * Actualiza los datos de una categoría existente
 */
export const updateCategoria = async (
  id: number,
  categoria: UpdateCategoriaDTO
): Promise<Categoria> => {
  try {
    const response = await api.put<Categoria | ApiResponse<Categoria>>(
      `/categorias/${id}`,
      categoria
    );

    if (
      response.data &&
      typeof response.data === 'object' &&
      'data' in response.data
    ) {
      return (response.data as ApiResponse<Categoria>).data;
    }

    return response.data as Categoria;
  } catch (error) {
    console.error(`Error al actualizar la categoría ID ${id}:`, error);
    throw error;
  }
};

/**
 * Elimina una categoría por su ID
 */
export const deleteCategoria = async (id: number): Promise<void> => {
  try {
    await api.delete(`/categorias/${id}`);
  } catch (error) {
    console.error(`Error al eliminar la categoría ID ${id}:`, error);
    throw error;
  }
};
