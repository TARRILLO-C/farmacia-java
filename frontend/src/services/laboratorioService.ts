import api from './api';
import { Laboratorio, CreateLaboratorioDTO, UpdateLaboratorioDTO, ApiResponse } from '@/types';

export const getLaboratorios = async (): Promise<Laboratorio[]> => {
  try {
    const response = await api.get<Laboratorio[] | ApiResponse<Laboratorio[]>>('/laboratorios');
    if (Array.isArray(response.data)) return response.data;
    if (response.data && 'data' in response.data && Array.isArray((response.data as ApiResponse<Laboratorio[]>).data)) {
      return (response.data as ApiResponse<Laboratorio[]>).data;
    }
    return [];
  } catch (error) {
    console.error('Error al obtener laboratorios:', error);
    throw error;
  }
};

export const getLaboratorioById = async (id: number): Promise<Laboratorio> => {
  const response = await api.get<Laboratorio | ApiResponse<Laboratorio>>(`/laboratorios/${id}`);
  if (response.data && 'data' in response.data) return (response.data as ApiResponse<Laboratorio>).data;
  return response.data as Laboratorio;
};

export const createLaboratorio = async (dto: CreateLaboratorioDTO): Promise<Laboratorio> => {
  const response = await api.post<Laboratorio | ApiResponse<Laboratorio>>('/laboratorios', dto);
  if (response.data && 'data' in response.data) return (response.data as ApiResponse<Laboratorio>).data;
  return response.data as Laboratorio;
};

export const updateLaboratorio = async (id: number, dto: UpdateLaboratorioDTO): Promise<Laboratorio> => {
  const response = await api.put<Laboratorio | ApiResponse<Laboratorio>>(`/laboratorios/${id}`, dto);
  if (response.data && 'data' in response.data) return (response.data as ApiResponse<Laboratorio>).data;
  return response.data as Laboratorio;
};

export const deleteLaboratorio = async (id: number): Promise<void> => {
  await api.delete(`/laboratorios/${id}`);
};
