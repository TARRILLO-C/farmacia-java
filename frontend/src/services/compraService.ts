import api from './api';
import { Compra, CreateCompraDTO, ApiResponse } from '@/types';

export const getCompras = async (params?: { proveedorId?: number; fechaInicio?: string; fechaFin?: string }): Promise<Compra[]> => {
  try {
    const response = await api.get<Compra[] | ApiResponse<Compra[]>>('/compras', { params });
    if (Array.isArray(response.data)) return response.data;
    if (response.data && 'data' in response.data && Array.isArray((response.data as ApiResponse<Compra[]>).data)) {
      return (response.data as ApiResponse<Compra[]>).data;
    }
    return [];
  } catch (error) {
    console.error('Error al obtener compras a proveedores:', error);
    throw error;
  }
};

export const getCompraById = async (id: number): Promise<Compra> => {
  const response = await api.get<Compra | ApiResponse<Compra>>(`/compras/${id}`);
  if (response.data && 'data' in response.data) return (response.data as ApiResponse<Compra>).data;
  return response.data as Compra;
};

export const registrarCompra = async (dto: CreateCompraDTO): Promise<Compra> => {
  try {
    const response = await api.post<Compra | ApiResponse<Compra>>('/compras', dto);
    if (response.data && 'data' in response.data) return (response.data as ApiResponse<Compra>).data;
    return response.data as Compra;
  } catch (error) {
    console.error('Error al registrar compra:', error);
    throw error;
  }
};
