import api from './api';
import { Presentacion, CreatePresentacionDTO, UpdatePresentacionDTO, ApiResponse } from '@/types';

export const getPresentaciones = async (): Promise<Presentacion[]> => {
  try {
    const response = await api.get<Presentacion[] | ApiResponse<Presentacion[]>>('/presentaciones');
    if (Array.isArray(response.data)) return response.data;
    if (response.data && 'data' in response.data && Array.isArray((response.data as ApiResponse<Presentacion[]>).data)) {
      return (response.data as ApiResponse<Presentacion[]>).data;
    }
    return [];
  } catch (error) {
    console.error('Error al obtener presentaciones:', error);
    throw error;
  }
};

export const getPresentacionById = async (id: number): Promise<Presentacion> => {
  const response = await api.get<Presentacion | ApiResponse<Presentacion>>(`/presentaciones/${id}`);
  if (response.data && 'data' in response.data) return (response.data as ApiResponse<Presentacion>).data;
  return response.data as Presentacion;
};

export const createPresentacion = async (dto: CreatePresentacionDTO): Promise<Presentacion> => {
  const response = await api.post<Presentacion | ApiResponse<Presentacion>>('/presentaciones', dto);
  if (response.data && 'data' in response.data) return (response.data as ApiResponse<Presentacion>).data;
  return response.data as Presentacion;
};

export const updatePresentacion = async (id: number, dto: UpdatePresentacionDTO): Promise<Presentacion> => {
  const response = await api.put<Presentacion | ApiResponse<Presentacion>>(`/presentaciones/${id}`, dto);
  if (response.data && 'data' in response.data) return (response.data as ApiResponse<Presentacion>).data;
  return response.data as Presentacion;
};

export const deletePresentacion = async (id: number): Promise<void> => {
  await api.delete(`/presentaciones/${id}`);
};
