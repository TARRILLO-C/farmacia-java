import { AxiosError } from 'axios';
import api from './api';
import { ApiResponse, DocumentoConsulta } from '@/types';

/**
 * Consulta de DNI (RENIEC) y RUC (SUNAT) a través del backend.
 * Endpoint base: /consultas — el token de apiperu.dev vive solo en el servidor.
 */

export class ConsultaDocumentoError extends Error {
  /** true cuando el servicio externo falló (503/red) y vale la pena reintentar */
  readonly reintentable: boolean;

  constructor(message: string, reintentable: boolean) {
    super(message);
    this.name = 'ConsultaDocumentoError';
    this.reintentable = reintentable;
  }
}

const consultar = async (ruta: string): Promise<DocumentoConsulta> => {
  try {
    const response = await api.get<ApiResponse<DocumentoConsulta>>(ruta);
    return response.data.data;
  } catch (error) {
    const err = error as AxiosError<{ message?: string }>;
    const status = err.response?.status;
    const mensaje =
      err.response?.data?.message ||
      (status === undefined
        ? 'No hay conexión con el servidor. Verifique que el backend esté activo.'
        : 'No se pudo completar la consulta.');
    throw new ConsultaDocumentoError(mensaje, status === undefined || status >= 500);
  }
};

export const consultarDni = (dni: string) => consultar(`/consultas/dni/${encodeURIComponent(dni)}`);

export const consultarRuc = (ruc: string) => consultar(`/consultas/ruc/${encodeURIComponent(ruc)}`);
