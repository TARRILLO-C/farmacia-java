import api from './api';
import { PrincipioActivo, CreatePrincipioActivoDTO, UpdatePrincipioActivoDTO, ApiResponse } from '@/types';

export const getPrincipiosActivos = async (): Promise<PrincipioActivo[]> => {
  try {
    const response = await api.get<PrincipioActivo[] | ApiResponse<PrincipioActivo[]>>('/principios-activos');
    if (Array.isArray(response.data)) return response.data;
    if (response.data && 'data' in response.data && Array.isArray((response.data as ApiResponse<PrincipioActivo[]>).data)) {
      return (response.data as ApiResponse<PrincipioActivo[]>).data;
    }
    return [];
  } catch (error) {
    console.error('Error al obtener principios activos:', error);
    throw error;
  }
};

export const getPrincipioActivoById = async (id: number): Promise<PrincipioActivo> => {
  const response = await api.get<PrincipioActivo | ApiResponse<PrincipioActivo>>(`/principios-activos/${id}`);
  if (response.data && 'data' in response.data) return (response.data as ApiResponse<PrincipioActivo>).data;
  return response.data as PrincipioActivo;
};

export const createPrincipioActivo = async (dto: CreatePrincipioActivoDTO): Promise<PrincipioActivo> => {
  const response = await api.post<PrincipioActivo | ApiResponse<PrincipioActivo>>('/principios-activos', dto);
  if (response.data && 'data' in response.data) return (response.data as ApiResponse<PrincipioActivo>).data;
  return response.data as PrincipioActivo;
};

export const updatePrincipioActivo = async (id: number, dto: UpdatePrincipioActivoDTO): Promise<PrincipioActivo> => {
  const response = await api.put<PrincipioActivo | ApiResponse<PrincipioActivo>>(`/principios-activos/${id}`, dto);
  if (response.data && 'data' in response.data) return (response.data as ApiResponse<PrincipioActivo>).data;
  return response.data as PrincipioActivo;
};

export const deletePrincipioActivo = async (id: number): Promise<void> => {
  await api.delete(`/principios-activos/${id}`);
};
