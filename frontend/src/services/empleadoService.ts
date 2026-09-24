import api from './api';
import { Empleado, CreateEmpleadoDTO, UpdateEmpleadoDTO, ApiResponse } from '@/types';

export const getEmpleados = async (): Promise<Empleado[]> => {
  try {
    const response = await api.get<Empleado[] | ApiResponse<Empleado[]>>('/empleados');
    if (Array.isArray(response.data)) return response.data;
    if (response.data && 'data' in response.data && Array.isArray((response.data as ApiResponse<Empleado[]>).data)) {
      return (response.data as ApiResponse<Empleado[]>).data;
    }
    return [];
  } catch (error) {
    console.error('Error al obtener empleados:', error);
    throw error;
  }
};

export const getEmpleadoById = async (id: number): Promise<Empleado> => {
  const response = await api.get<Empleado | ApiResponse<Empleado>>(`/empleados/${id}`);
  if (response.data && 'data' in response.data) return (response.data as ApiResponse<Empleado>).data;
  return response.data as Empleado;
};

export const createEmpleado = async (dto: CreateEmpleadoDTO): Promise<Empleado> => {
  const response = await api.post<Empleado | ApiResponse<Empleado>>('/empleados', dto);
  if (response.data && 'data' in response.data) return (response.data as ApiResponse<Empleado>).data;
  return response.data as Empleado;
};

export const updateEmpleado = async (id: number, dto: UpdateEmpleadoDTO): Promise<Empleado> => {
  const response = await api.put<Empleado | ApiResponse<Empleado>>(`/empleados/${id}`, dto);
  if (response.data && 'data' in response.data) return (response.data as ApiResponse<Empleado>).data;
  return response.data as Empleado;
};

export const deleteEmpleado = async (id: number): Promise<void> => {
  await api.delete(`/empleados/${id}`);
};
