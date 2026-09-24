import api from './api';
import { LoteInventario, CreateLoteDTO, UpdateLoteDTO, AjusteStockDTO, ApiResponse } from '@/types';

export const getLotes = async (params?: { productoId?: number; proximosAVencerDias?: number }): Promise<LoteInventario[]> => {
  try {
    let url = '/lotes';
    if (params?.productoId) {
      url = `/lotes/producto/${params.productoId}`;
    } else if (params?.proximosAVencerDias) {
      url = `/lotes/proximos-vencer?dias=${params.proximosAVencerDias}`;
    }

    const response = await api.get<LoteInventario[] | ApiResponse<LoteInventario[]>>(url);
    if (Array.isArray(response.data)) return response.data;
    if (response.data && 'data' in response.data && Array.isArray((response.data as ApiResponse<LoteInventario[]>).data)) {
      return (response.data as ApiResponse<LoteInventario[]>).data;
    }
    return [];
  } catch (error) {
    console.error('Error al obtener lotes de inventario:', error);
    throw error;
  }
};

export const getLoteById = async (id: number): Promise<LoteInventario> => {
  const response = await api.get<LoteInventario | ApiResponse<LoteInventario>>(`/lotes/${id}`);
  if (response.data && 'data' in response.data) return (response.data as ApiResponse<LoteInventario>).data;
  return response.data as LoteInventario;
};

export const createLote = async (dto: CreateLoteDTO): Promise<LoteInventario> => {
  const response = await api.post<LoteInventario | ApiResponse<LoteInventario>>('/lotes', dto);
  if (response.data && 'data' in response.data) return (response.data as ApiResponse<LoteInventario>).data;
  return response.data as LoteInventario;
};

export const updateLote = async (id: number, dto: UpdateLoteDTO): Promise<LoteInventario> => {
  const response = await api.put<LoteInventario | ApiResponse<LoteInventario>>(`/lotes/${id}`, dto);
  if (response.data && 'data' in response.data) return (response.data as ApiResponse<LoteInventario>).data;
  return response.data as LoteInventario;
};

export const ajustarStockLote = async (id: number, ajuste: AjusteStockDTO): Promise<LoteInventario> => {
  const response = await api.patch<LoteInventario | ApiResponse<LoteInventario>>(`/lotes/${id}/ajuste-stock`, ajuste);
  if (response.data && 'data' in response.data) return (response.data as ApiResponse<LoteInventario>).data;
  return response.data as LoteInventario;
};

export const deleteLote = async (id: number): Promise<void> => {
  await api.delete(`/lotes/${id}`);
};
