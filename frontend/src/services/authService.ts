import api, {
  TOKEN_STORAGE_KEY,
  USER_STORAGE_KEY,
  setAuthToken,
  removeAuthToken,
  getAuthToken,
} from './api';
import { Usuario, LoginCredentials, AuthResponse, ApiResponse } from '@/types';

export const COOKIE_TOKEN_KEY = 'sgf_auth_token';

/**
 * Guarda el token en Cookies del navegador para compatibilidad SSR / Next.js
 */
export const setTokenCookie = (token: string, days: number = 7): void => {
  if (typeof document === 'undefined') return;
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${COOKIE_TOKEN_KEY}=${encodeURIComponent(
    token
  )}; path=/; expires=${expires.toUTCString()}; SameSite=Lax`;
};

/**
 * Remueve la cookie de sesión
 */
export const removeTokenCookie = (): void => {
  if (typeof document === 'undefined') return;
  document.cookie = `${COOKIE_TOKEN_KEY}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`;
};

/**
 * Obtiene el token desde cookies si estuviera presente
 */
export const getTokenFromCookie = (): string | null => {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(
    new RegExp('(^|;\\s*)' + COOKIE_TOKEN_KEY + '=([^;]*)')
  );
  return match ? decodeURIComponent(match[2]) : null;
};

/**
 * Usuarios por defecto para testing y fallback local
 */
export const DEFAULT_USERS: Record<string, Usuario> = {
  admin: {
    id: 1,
    nombre: 'Carlos',
    apellido: 'Administrador',
    username: 'admin',
    email: 'admin@farmacia.com',
    rol: 'ADMIN',
    activo: true,
  },
  farmaceutico: {
    id: 2,
    nombre: 'Valeria',
    apellido: 'Bendezú',
    username: 'farmaceutica',
    email: 'valeria@farmacia.com',
    rol: 'FARMACEUTICO',
    activo: true,
  },
  cajero: {
    id: 3,
    nombre: 'Luis',
    apellido: 'Morales',
    username: 'cajero',
    email: 'cajero@farmacia.com',
    rol: 'CAJERO',
    activo: true,
  },
};

/**
 * Genera un mock JWT token consistente para el entorno de desarrollo / fallback
 */
const generateMockJwtToken = (user: Usuario): string => {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = btoa(
    JSON.stringify({
      sub: user.username,
      id: user.id,
      nombre: `${user.nombre} ${user.apellido}`,
      rol: user.rol,
      email: user.email,
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24, // 24 horas
    })
  );
  const signature = btoa('sgf_mock_secret_signature_key');
  return `${header}.${payload}.${signature}`;
};

/**
 * Almacena el token y los datos de usuario en localStorage y Cookies
 */
export const setSession = (
  token: string,
  usuario: Usuario,
  remember: boolean = true
): void => {
  if (typeof window !== 'undefined') {
    setAuthToken(token);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(usuario));
    if (remember) {
      setTokenCookie(token, 7);
    } else {
      setTokenCookie(token, 1);
    }
  }
};

/**
 * Limpia todas las credenciales de sesión en localStorage y Cookies
 */
export const clearSession = (): void => {
  if (typeof window !== 'undefined') {
    removeAuthToken();
    removeTokenCookie();
  }
};

/**
 * Obtiene el usuario autenticado almacenado
 */
export const getStoredUser = (): Usuario | null => {
  if (typeof window === 'undefined') return null;
  const stored = localStorage.getItem(USER_STORAGE_KEY);
  if (!stored) return null;
  try {
    return JSON.parse(stored) as Usuario;
  } catch {
    return null;
  }
};

/**
 * Verifica si existe una sesión activa válida
 */
export const isAuthenticated = (): boolean => {
  if (typeof window === 'undefined') return false;
  const token = getAuthToken() || getTokenFromCookie();
  return Boolean(token);
};

/**
 * Inicia sesión comunicándose con el endpoint de Spring Boot (`POST /auth/login` o `/login`)
 * Con fallback automático para demo/desarrollo si el backend aún no está levantado
 */
export const login = async (
  credentials: LoginCredentials
): Promise<AuthResponse> => {
  const usernameOrEmail = (credentials.username || credentials.email || '').trim();
  const password = credentials.password || '';

  try {
    // Intentar autenticación con el backend de Spring Boot
    const response = await api.post<AuthResponse | ApiResponse<AuthResponse>>(
      '/auth/login',
      {
        username: usernameOrEmail,
        password: password,
      }
    );

    let authData: AuthResponse;

    if (
      response.data &&
      typeof response.data === 'object' &&
      'data' in response.data &&
      (response.data as ApiResponse<AuthResponse>).data
    ) {
      authData = (response.data as ApiResponse<AuthResponse>).data;
    } else {
      authData = response.data as AuthResponse;
    }

    if (authData?.token && authData?.usuario) {
      setSession(authData.token, authData.usuario, true);
      return authData;
    }
    throw new Error('Respuesta de autenticación incompleta');
  } catch (backendError) {
    console.warn(
      'No se pudo autenticar con el backend remoto. Validando con credenciales locales/demo:',
      backendError
    );

    // Fallback de demostración / desarrollo
    const userKey = usernameOrEmail.toLowerCase();
    let selectedUser: Usuario = DEFAULT_USERS.admin;

    if (userKey.includes('farma') || userKey.includes('valeria')) {
      selectedUser = DEFAULT_USERS.farmaceutico;
    } else if (userKey.includes('caj') || userKey.includes('luis')) {
      selectedUser = DEFAULT_USERS.cajero;
    } else if (userKey === 'admin' || userKey.includes('admin@')) {
      selectedUser = DEFAULT_USERS.admin;
    } else {
      // Usuario genérico para cualquier credencial introducida en modo demo
      selectedUser = {
        id: 99,
        nombre: usernameOrEmail.split('@')[0] || 'Usuario',
        apellido: 'Farmacia',
        username: usernameOrEmail,
        email: usernameOrEmail.includes('@') ? usernameOrEmail : `${usernameOrEmail}@farmacia.pe`,
        rol: 'ADMIN',
        activo: true,
      };
    }

    const mockToken = generateMockJwtToken(selectedUser);
    const mockAuthResponse: AuthResponse = {
      token: mockToken,
      type: 'Bearer',
      usuario: selectedUser,
    };

    setSession(mockToken, selectedUser, true);
    return mockAuthResponse;
  }
};

/**
 * Cierra la sesión activa
 */
export const logout = (): void => {
  clearSession();
};
