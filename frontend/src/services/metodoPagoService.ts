import api from './api';
import { MetodoPagoItem, ApiResponse } from '@/types';

export const getMetodosPago = async (): Promise<MetodoPagoItem[]> => {
  try {
    const response = await api.get<MetodoPagoItem[] | ApiResponse<MetodoPagoItem[]>>('/metodos-pago');
    if (Array.isArray(response.data)) return response.data;
    if (response.data && 'data' in response.data && Array.isArray((response.data as ApiResponse<MetodoPagoItem[]>).data)) {
      return (response.data as ApiResponse<MetodoPagoItem[]>).data;
    }
    return [];
  } catch (error) {
    console.error('Error al obtener métodos de pago:', error);
    // Fallback estándar si la base de datos aún no estuviera inicializada
    return [
      { id: 1, nombre: 'Efectivo', activo: true },
      { id: 2, nombre: 'Tarjeta de Débito', activo: true },
      { id: 3, nombre: 'Tarjeta de Crédito', activo: true },
      { id: 4, nombre: 'Yape / Plin', activo: true },
    ];
  }
};
