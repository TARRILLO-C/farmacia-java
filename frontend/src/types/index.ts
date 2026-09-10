// ============================================================================
// 1. TIPO DE CLIENTE (ENUM)
// ============================================================================

export enum TipoCliente {
  BENEFICIARIO = 'BENEFICIARIO',
  REGULAR = 'REGULAR',
  NUEVO = 'NUEVO',
}

// ============================================================================
// 2. USUARIO Y AUTENTICACIÓN
// ============================================================================

export type RolUsuario = 'ADMIN' | 'FARMACEUTICO' | 'CAJERO';

export interface Usuario {
  id: number;
  nombre: string;
  apellido: string;
  username: string;
  email: string;
  rol: RolUsuario;
  activo: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthResponse {
  token: string;
  type?: string;
  usuario: Usuario;
}

export interface LoginCredentials {
  username?: string;
  email?: string;
  password?: string;
}

// ============================================================================
// 3. CATEGORÍA
// ============================================================================

export interface Categoria {
  id: number;
  nombre: string;
  descripcion?: string;
  activo?: boolean;
  cantidadProductos?: number;
  createdAt?: string;
  updatedAt?: string;
}

export type CreateCategoriaDTO = Omit<Categoria, 'id' | 'createdAt' | 'updatedAt' | 'cantidadProductos'>;
export type UpdateCategoriaDTO = Partial<CreateCategoriaDTO>;

// ============================================================================
// 4. PRODUCTO / MEDICAMENTO
// ============================================================================

export interface Producto {
  id: number;
  codigo: string;
  nombre: string;
  descripcion?: string;
  principioActivo?: string;
  presentacion?: string; // Ej: Tabletas, Jarabe, Ampollas
  laboratorio?: string;
  lote?: string;
  fechaVencimiento?: string;
  precio: number;
  precioCompra?: number;
  stock: number;
  stockMinimo: number;
  requiereReceta: boolean;
  activo: boolean;
  categoriaId: number;
  categoria?: Categoria;
  createdAt?: string;
  updatedAt?: string;
}

export type CreateProductoDTO = Omit<Producto, 'id' | 'categoria' | 'createdAt' | 'updatedAt'>;
export type UpdateProductoDTO = Partial<CreateProductoDTO>;

// ============================================================================
// 5. CLIENTE
// ============================================================================

export interface Cliente {
  id: number;
  documentoIdentidad: string; // DNI, RUC, Pasaporte
  tipoDocumento?: 'DNI' | 'RUC' | 'CE' | 'PASAPORTE';
  nombre: string;
  apellido: string;
  email?: string;
  telefono?: string;
  direccion?: string;
  tipoCliente: TipoCliente;
  esClienteAmigo?: boolean;
  codigoClienteAmigo?: string;
  puntosFidelidad?: number;
  totalCompras?: number;
  montoTotalComprado?: number;
  activo: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export type CreateClienteDTO = Omit<Cliente, 'id' | 'createdAt' | 'updatedAt' | 'totalCompras' | 'montoTotalComprado'>;
export type UpdateClienteDTO = Partial<CreateClienteDTO>;

// ============================================================================
// 6. DETALLE DE VENTA
// ============================================================================

export interface DetalleVenta {
  id?: number;
  ventaId?: number;
  productoId: number;
  producto?: Producto;
  cantidad: number;
  precioUnitario: number;
  descuento: number;
  subtotal: number;
}

export interface CreateDetalleVentaDTO {
  productoId: number;
  cantidad: number;
  precioUnitario: number;
  descuento?: number;
}

// ============================================================================
// 7. RECIBO / COMPROBANTE DE PAGO
// ============================================================================

export type TipoComprobante = 'BOLETA' | 'FACTURA' | 'TICKET';
export type MetodoPago = 'EFECTIVO' | 'TARJETA_DEBITO' | 'TARJETA_CREDITO' | 'TRANSFERENCIA' | 'YAPE' | 'PLIN';

export interface Recibo {
  id: number;
  numeroRecibo: string;
  serie?: string;
  correlativo?: string;
  tipoComprobante: TipoComprobante;
  fechaEmision: string;
  montoSubtotal: number;
  montoImpuesto: number; // IGV / IVA (18%)
  montoDescuento: number;
  montoTotal: number;
  metodoPago: MetodoPago;
  ventaId: number;
  clienteNombre: string;
  clienteDocumento: string;
  clienteDireccion?: string;
  observaciones?: string;
  createdAt?: string;
}

// ============================================================================
// 8. VENTA
// ============================================================================

export type EstadoVenta = 'COMPLETADA' | 'PENDIENTE' | 'ANULADA';

export interface Venta {
  id: number;
  numeroVenta: string;
  fecha: string;
  clienteId?: number;
  cliente?: Cliente;
  usuarioId: number;
  usuario?: Usuario;
  detalles: DetalleVenta[];
  subtotal: number;
  descuentoTotal: number;
  impuesto: number;
  total: number;
  metodoPago: MetodoPago;
  estado: EstadoVenta;
  recibo?: Recibo;
  observaciones?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateVentaDTO {
  clienteId?: number;
  usuarioId: number;
  metodoPago: MetodoPago;
  tipoComprobante: TipoComprobante;
  detalles: CreateDetalleVentaDTO[];
  observaciones?: string;
}

// ============================================================================
// 9. RESPUESTAS GENÉRICAS DE LA API REST (Spring Boot)
// ============================================================================

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  timestamp?: string;
}

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

export interface ApiErrorResponse {
  message: string;
  status: number;
  error?: string;
  timestamp?: string;
  errors?: Record<string, string>;
}
