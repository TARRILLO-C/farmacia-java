import api from './api';
import { Role, ApiResponse } from '@/types';

export const getRoles = async (): Promise<Role[]> => {
  try {
    const response = await api.get<Role[] | ApiResponse<Role[]>>('/roles');
    if (Array.isArray(response.data)) return response.data;
    if (response.data && 'data' in response.data && Array.isArray((response.data as ApiResponse<Role[]>).data)) {
      return (response.data as ApiResponse<Role[]>).data;
    }
    return [];
  } catch (error) {
    console.error('Error al obtener roles del sistema:', error);
    return [
      { id: 1, nombre: 'ADMIN', descripcion: 'Administrador del sistema' },
      { id: 2, nombre: 'FARMACEUTICO', descripcion: 'Farmacéutico regente' },
      { id: 3, nombre: 'CAJERO', descripcion: 'Operador de caja / mostrador' },
    ];
  }
};
