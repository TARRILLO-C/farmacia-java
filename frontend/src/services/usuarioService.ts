import api from './api';
import { Usuario, CreateUsuarioDTO, UpdateUsuarioDTO, ApiResponse } from '@/types';

/**
 * Servicio para la gestión integral de Usuarios del Sistema en Spring Boot 3.
 * Endpoint base: /usuarios (protegido por rol ADMIN)
 */

export const getUsuarios = async (): Promise<Usuario[]> => {
  try {
    const response = await api.get<
      Usuario[] | ApiResponse<Usuario[]> | { content: Usuario[] }
    >('/usuarios');

    if (Array.isArray(response.data)) {
      return response.data;
    }
    if (
      response.data &&
      'data' in response.data &&
      Array.isArray((response.data as ApiResponse<Usuario[]>).data)
    ) {
      return (response.data as ApiResponse<Usuario[]>).data;
    }
    if (
      response.data &&
      'content' in response.data &&
      Array.isArray((response.data as { content: Usuario[] }).content)
    ) {
      return (response.data as { content: Usuario[] }).content;
    }

    return [];
  } catch (error) {
    console.error('Error al obtener usuarios desde la API:', error);
    throw error;
  }
};

export const getUsuarioById = async (id: number): Promise<Usuario> => {
  try {
    const response = await api.get<Usuario | ApiResponse<Usuario>>(`/usuarios/${id}`);
    if (response.data && typeof response.data === 'object' && 'data' in response.data) {
      return (response.data as ApiResponse<Usuario>).data;
    }
    return response.data as Usuario;
  } catch (error) {
    console.error(`Error al obtener usuario ${id}:`, error);
    throw error;
  }
};

export const createUsuario = async (dto: CreateUsuarioDTO): Promise<Usuario> => {
  try {
    const response = await api.post<Usuario | ApiResponse<Usuario>>('/usuarios', dto);
    if (response.data && typeof response.data === 'object' && 'data' in response.data) {
      return (response.data as ApiResponse<Usuario>).data;
    }
    return response.data as Usuario;
  } catch (error) {
    console.error('Error al registrar usuario:', error);
    throw error;
  }
};

export const updateUsuario = async (
  id: number,
  dto: UpdateUsuarioDTO
): Promise<Usuario> => {
  try {
    const response = await api.put<Usuario | ApiResponse<Usuario>>(
      `/usuarios/${id}`,
      dto
    );
    if (response.data && typeof response.data === 'object' && 'data' in response.data) {
      return (response.data as ApiResponse<Usuario>).data;
    }
    return response.data as Usuario;
  } catch (error) {
    console.error(`Error al actualizar usuario ${id}:`, error);
    throw error;
  }
};

export const toggleActivoUsuario = async (id: number): Promise<Usuario> => {
  try {
    const response = await api.patch<Usuario | ApiResponse<Usuario>>(
      `/usuarios/${id}/toggle-activo`
    );
    if (response.data && typeof response.data === 'object' && 'data' in response.data) {
      return (response.data as ApiResponse<Usuario>).data;
    }
    return response.data as Usuario;
  } catch (error) {
    console.error(`Error al modificar estado de usuario ${id}:`, error);
    throw error;
  }
};

export const deleteUsuario = async (id: number): Promise<void> => {
  try {
    await api.delete(`/usuarios/${id}`);
  } catch (error) {
    console.error(`Error al eliminar usuario ${id}:`, error);
    throw error;
  }
};
