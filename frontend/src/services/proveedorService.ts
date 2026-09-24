import api from './api';
import { Proveedor, CreateProveedorDTO, UpdateProveedorDTO, ApiResponse } from '@/types';

export const getProveedores = async (): Promise<Proveedor[]> => {
  try {
    const response = await api.get<Proveedor[] | ApiResponse<Proveedor[]>>('/proveedores');
    if (Array.isArray(response.data)) return response.data;
    if (response.data && 'data' in response.data && Array.isArray((response.data as ApiResponse<Proveedor[]>).data)) {
      return (response.data as ApiResponse<Proveedor[]>).data;
    }
    return [];
  } catch (error) {
    console.error('Error al obtener proveedores:', error);
    throw error;
  }
};

export const getProveedorById = async (id: number): Promise<Proveedor> => {
  const response = await api.get<Proveedor | ApiResponse<Proveedor>>(`/proveedores/${id}`);
  if (response.data && 'data' in response.data) return (response.data as ApiResponse<Proveedor>).data;
  return response.data as Proveedor;
};

export const createProveedor = async (dto: CreateProveedorDTO): Promise<Proveedor> => {
  const response = await api.post<Proveedor | ApiResponse<Proveedor>>('/proveedores', dto);
  if (response.data && 'data' in response.data) return (response.data as ApiResponse<Proveedor>).data;
  return response.data as Proveedor;
};

export const updateProveedor = async (id: number, dto: UpdateProveedorDTO): Promise<Proveedor> => {
  const response = await api.put<Proveedor | ApiResponse<Proveedor>>(`/proveedores/${id}`, dto);
  if (response.data && 'data' in response.data) return (response.data as ApiResponse<Proveedor>).data;
  return response.data as Proveedor;
};

export const deleteProveedor = async (id: number): Promise<void> => {
  await api.delete(`/proveedores/${id}`);
};
