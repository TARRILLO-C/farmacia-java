import api from './api';
import { Recibo, ApiResponse } from '@/types';

export const getReciboById = async (id: number): Promise<Recibo> => {
  const response = await api.get<Recibo | ApiResponse<Recibo>>(`/recibos/${id}`);
  if (response.data && 'data' in response.data) return (response.data as ApiResponse<Recibo>).data;
  return response.data as Recibo;
};

export const getReciboByCodigo = async (codigo: string): Promise<Recibo> => {
  const response = await api.get<Recibo | ApiResponse<Recibo>>(`/recibos/codigo/${encodeURIComponent(codigo)}`);
  if (response.data && 'data' in response.data) return (response.data as ApiResponse<Recibo>).data;
  return response.data as Recibo;
};

export const getReciboByVentaId = async (ventaId: number): Promise<Recibo> => {
  const response = await api.get<Recibo | ApiResponse<Recibo>>(`/recibos/venta/${ventaId}`);
  if (response.data && 'data' in response.data) return (response.data as ApiResponse<Recibo>).data;
  return response.data as Recibo;
};
