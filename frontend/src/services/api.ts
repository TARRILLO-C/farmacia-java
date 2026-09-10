import axios, {
  AxiosInstance,
  AxiosResponse,
  InternalAxiosRequestConfig,
  AxiosError,
} from 'axios';

// ============================================================================
// CONFIGURACIÓN BASE DEL CLIENTE HTTP (AXIOS)
// ============================================================================

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

export const TOKEN_STORAGE_KEY = 'sgf_auth_token';
export const USER_STORAGE_KEY = 'sgf_auth_user';

/**
 * Instancia global de Axios para consumir la API REST de Spring Boot
 */
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  timeout: 15000,
});

// ============================================================================
// INTERCEPTOR DE PETICIONES (REQUEST)
// Agrega el JWT Bearer Token a cada solicitud si existe en localStorage
// ============================================================================

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    if (typeof window !== 'undefined') {
      const token =
        localStorage.getItem(TOKEN_STORAGE_KEY) ||
        localStorage.getItem('token');

      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// ============================================================================
// INTERCEPTOR DE RESPUESTAS (RESPONSE)
// Manejo centralizado de errores, renovaciones de sesión y expiración (401)
// ============================================================================

api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError) => {
    if (typeof window !== 'undefined' && error.response) {
      const { status } = error.response;

      // Token expirado o no autorizado
      if (status === 401) {
        localStorage.removeItem(TOKEN_STORAGE_KEY);
        localStorage.removeItem(USER_STORAGE_KEY);
        localStorage.removeItem('token');

        // Evitar bucle infinito si ya se encuentra en la pantalla de login
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login?expired=true';
        }
      }

      // Prohibido (Rol no autorizado)
      if (status === 403) {
        console.error('Acceso denegado: permisos insuficientes.');
      }
    }

    return Promise.reject(error);
  }
);

// ============================================================================
// HELPERS DE AUTENTICACIÓN
// ============================================================================

export const setAuthToken = (token: string): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
  }
};

export const getAuthToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return (
      localStorage.getItem(TOKEN_STORAGE_KEY) ||
      localStorage.getItem('token')
    );
  }
  return null;
};

export const removeAuthToken = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(USER_STORAGE_KEY);
    localStorage.removeItem('token');
  }
};

export default api;
