// ============================================================================
// 1. ROLES Y USUARIOS DEL SISTEMA (RBAC 3 NIVELES)
// ============================================================================

export type RolUsuario = 'ADMIN' | 'FARMACEUTICO' | 'CAJERO';

export interface Role {
  id: number;
  nombre: string;
  descripcion?: string;
  activo?: boolean;
  createdAt?: string;
}

export interface Empleado {
  id: number;
  dni: string;
  nombres: string;
  apellidos: string;
  telefono?: string;
  activo?: boolean;
  nombreCompleto?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type CreateEmpleadoDTO = Omit<Empleado, 'id' | 'createdAt' | 'updatedAt' | 'nombreCompleto'>;
export type UpdateEmpleadoDTO = Partial<CreateEmpleadoDTO>;

export interface Usuario {
  id: number;
  nombre: string;
  apellido?: string;
  username: string;
  email?: string;
  rol: RolUsuario | string;
  rolId?: number;
  rolNombre?: string;
  empleadoId?: number;
  empleado?: Empleado;
  activo: boolean;
  modulosPermitidos?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateUsuarioDTO {
  username: string;
  password?: string;
  nombre?: string;
  email?: string;
  rolId?: number;
  rol?: RolUsuario | string;
  empleadoId?: number;
  activo?: boolean;
  modulosPermitidos?: string[];
}

export type UpdateUsuarioDTO = Partial<CreateUsuarioDTO>;

export interface AuthResponse {
  token: string;
  type?: string;
  username?: string;
  nombre?: string;
  rol?: string;
  modulosPermitidos?: string[];
  usuario?: Usuario;
}

export interface LoginCredentials {
  username?: string;
  email?: string;
  password?: string;
}

// ============================================================================
// 2. CATÁLOGOS FARMACÉUTICOS (CATEGORÍAS, LABORATORIOS, PRINCIPIOS, PRESENTACIÓN)
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

export interface Laboratorio {
  id: number;
  nombre: string;
  codigo?: string;
  telefono?: string;
  email?: string;
  activo?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export type CreateLaboratorioDTO = Omit<Laboratorio, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateLaboratorioDTO = Partial<CreateLaboratorioDTO>;

export interface PrincipioActivo {
  id: number;
  nombre: string;
  codigo?: string;
  descripcion?: string;
  activo?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export type CreatePrincipioActivoDTO = Omit<PrincipioActivo, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdatePrincipioActivoDTO = Partial<CreatePrincipioActivoDTO>;

export interface Presentacion {
  id: number;
  nombre: string;
  descripcion?: string;
  activo?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export type CreatePresentacionDTO = Omit<Presentacion, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdatePresentacionDTO = Partial<CreatePresentacionDTO>;

// ============================================================================
// 3. PROVEEDORES
// ============================================================================

export interface Proveedor {
  id: number;
  ruc: string;
  razonSocial: string;
  nombreContacto?: string;
  telefono?: string;
  email?: string;
  direccion?: string;
  activo?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export type CreateProveedorDTO = Omit<Proveedor, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateProveedorDTO = Partial<CreateProveedorDTO>;

// ============================================================================
// 4. LOTES DE INVENTARIO (FEFO)
// ============================================================================

export interface LoteInventario {
  id: number;
  productoId: number;
  productoNombre?: string;
  productoCodigo?: string;
  codigoLote: string;
  fechaVencimiento: string;
  stockActual: number;
  stockMinimo?: number;
  precioCompra?: number;
  activo?: boolean;
  producto?: Producto;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateLoteDTO {
  productoId: number;
  codigoLote: string;
  fechaVencimiento: string;
  stockActual: number;
  stockMinimo?: number;
  precioCompra?: number;
  activo?: boolean;
}

export type UpdateLoteDTO = Partial<CreateLoteDTO>;

export interface AjusteStockDTO {
  cantidad: number;
  tipo: 'ENTRADA' | 'SALIDA' | 'AJUSTE' | string;
  motivo?: string;
  loteId?: number;
}

// ============================================================================
// 5. PRODUCTO / MEDICAMENTO
// ============================================================================

export interface Producto {
  id: number;
  codigo: string;
  codigoBarras?: string;
  nombre: string;
  descripcion?: string;
  principioActivoId?: number;
  principioActivo?: string;
  principioActivoNombre?: string;
  presentacionId?: number;
  presentacion?: string;
  presentacionNombre?: string;
  laboratorioId?: number;
  laboratorio?: string;
  laboratorioNombre?: string;
  lote?: string;
  fechaVencimiento?: string;
  fechaCaducidad?: string;
  precio: number;
  precioVenta?: number;
  precioBaseVenta?: number;
  precioCompra?: number;
  stock: number;
  stockMinimo: number;
  requiereReceta: boolean;
  activo: boolean;
  categoriaId: number;
  categoriaNombre?: string;
  categoria?: Categoria;
  lotes?: LoteInventario[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateProductoDTO {
  codigo?: string;
  codigoBarras?: string;
  nombre: string;
  descripcion?: string;
  precioVenta?: number;
  precio?: number; // Compatible con ProductoModal
  precioCompra?: number;
  stock?: number;
  stockMinimo?: number;
  lote?: string;
  fechaCaducidad?: string;
  fechaVencimiento?: string; // Compatible con ProductoModal
  categoriaId: number;
  laboratorioId?: number;
  laboratorio?: string;
  principioActivoId?: number;
  principioActivo?: string;
  presentacionId?: number;
  presentacion?: string;
  requiereReceta?: boolean;
  activo?: boolean;
}

export type UpdateProductoDTO = Partial<CreateProductoDTO>;

// ============================================================================
// 6. CLIENTE Y FIDELIZACIÓN CRM (CLIENTE AMIGO)
// ============================================================================

export enum TipoCliente {
  BENEFICIARIO = 'BENEFICIARIO',
  REGULAR = 'REGULAR',
  NUEVO = 'NUEVO',
}

export interface FidelizacionCrm {
  id?: number;
  clienteId?: number;
  codigoAfiliado: string;
  puntosAcumulados: number;
  porcentajeDescuento: number;
  estadoMembresia: string;
  fechaAfiliacion?: string;
  observaciones?: string;
}

export interface Cliente {
  id: number;
  documentoIdentidad: string;
  dniRuc?: string;
  numeroDocumento?: string;
  tipoDocumento?: 'DNI' | 'RUC' | 'CE' | 'PASAPORTE' | string;
  nombre: string;
  apellido: string;
  nombreCompleto?: string;
  email?: string;
  telefono?: string;
  direccion?: string;
  tipoCliente?: TipoCliente;
  esClienteAmigo?: boolean;
  codigoClienteAmigo?: string;
  numeroClienteAmigo?: string;
  porcentajeDescuento?: number;
  puntosFidelidad?: number;
  fidelizacion?: FidelizacionCrm;
  totalCompras?: number;
  montoTotalComprado?: number;
  activo: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateClienteDTO {
  tipoDocumento?: string;
  numeroDocumento?: string;
  documentoIdentidad?: string;
  nombreCompleto?: string;
  nombre?: string;
  apellido?: string;
  direccion?: string;
  telefono?: string;
  email?: string;
  activo?: boolean;
  tipoCliente?: TipoCliente | string;
  esClienteAmigo?: boolean;
  codigoClienteAmigo?: string;
  numeroClienteAmigo?: string;
  porcentajeDescuento?: number;
  puntosFidelidad?: number;
}

export type UpdateClienteDTO = Partial<CreateClienteDTO>;

// ============================================================================
// 7. COMPRAS A PROVEEDORES
// ============================================================================

export interface DetalleCompra {
  id?: number;
  compraId?: number;
  productoId: number;
  productoNombre?: string;
  loteId?: number;
  codigoLote?: string;
  fechaVencimiento?: string;
  cantidad: number;
  precioCompraUnitario: number;
  subtotal?: number;
}

export interface Compra {
  id: number;
  numeroCompra: string;
  proveedorId: number;
  proveedorNombre?: string;
  proveedorRuc?: string;
  usuarioId?: number;
  usuarioNombre?: string;
  fecha?: string;
  montoTotal: number;
  tipoComprobante?: string;
  numeroComprobante?: string;
  observaciones?: string;
  detalles: DetalleCompra[];
  createdAt?: string;
}

export interface CreateDetalleCompraDTO {
  productoId: number;
  codigoLote?: string;
  fechaVencimiento?: string;
  cantidad: number;
  precioCompraUnitario: number;
}

export interface CreateCompraDTO {
  proveedorId: number;
  usuarioId?: number;
  tipoComprobante?: string;
  numeroComprobante?: string;
  observaciones?: string;
  detalles: CreateDetalleCompraDTO[];
}

// ============================================================================
// 8. MÉTODOS DE PAGO Y RECIBOS FISCALES
// ============================================================================

export interface MetodoPagoItem {
  id: number;
  nombre: string;
  descripcion?: string;
  activo?: boolean;
}

export type TipoComprobante = 'BOLETA' | 'FACTURA' | 'TICKET';
export type MetodoPago = 'EFECTIVO' | 'TARJETA_DEBITO' | 'TARJETA_CREDITO' | 'TRANSFERENCIA' | 'YAPE' | 'PLIN' | string;

export interface ReciboItem {
  productoId?: number;
  productoNombre: string;
  codigoBarras?: string;
  cantidad: number;
  precioUnitario: number;
  subtotalItem: number;
}

export interface Recibo {
  id: number;
  numeroRecibo: string;
  codigoComprobante?: string;
  serie?: string;
  correlativo?: string;
  tipoComprobante: TipoComprobante | string;
  fechaEmision: string;
  montoSubtotal: number;
  montoImpuesto: number; // IGV 18%
  montoDescuento: number;
  montoTotal: number;
  totalPagado?: number;
  metodoPago: string;
  ventaId: number;
  clienteNombre: string;
  clienteDocumento: string;
  clienteDireccion?: string;
  nombreEstablecimiento?: string;
  rucEstablecimiento?: string;
  direccionEstablecimiento?: string;
  items?: ReciboItem[];
  observaciones?: string;
  createdAt?: string;
}

// ============================================================================
// 9. VENTAS Y DETALLE DE VENTAS
// ============================================================================

export type EstadoVenta = 'COMPLETADA' | 'PENDIENTE' | 'ANULADA';

export interface DetalleVenta {
  id?: number;
  ventaId?: number;
  productoId: number;
  productoNombre?: string;
  codigoBarras?: string;
  loteId?: number;
  codigoLote?: string;
  producto?: Producto;
  cantidad: number;
  precioUnitario: number;
  descuento?: number;
  subtotal?: number;
  subtotalItem?: number;
}

export interface CreateDetalleVentaDTO {
  productoId: number;
  loteId?: number;
  cantidad: number;
  precioUnitario?: number;
  descuento?: number;
}

export interface Venta {
  id: number;
  numeroVenta?: string;
  codigoComprobante?: string;
  fecha?: string;
  fechaVenta?: string;
  clienteId?: number;
  clienteNombre?: string;
  clienteDocumento?: string;
  esClienteAmigo?: boolean;
  cliente?: Cliente;
  usuarioId?: number;
  usuarioNombre?: string;
  usuario?: Usuario;
  detalles: DetalleVenta[];
  subtotal: number;
  descuentoTotal: number;
  igv?: number;
  impuesto?: number;
  total: number;
  requiereReceta?: boolean;
  metodoPagoId?: number;
  metodoPago?: string;
  tipoComprobante?: TipoComprobante | string;
  estado?: EstadoVenta | string;
  reciboId?: number;
  recibo?: Recibo;
  observaciones?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateVentaDTO {
  clienteId?: number;
  numeroClienteAmigo?: string;
  usuarioId?: number;
  metodoPagoId?: number;
  metodoPago?: string;
  tipoComprobante?: TipoComprobante | string;
  requiereReceta?: boolean;
  detalles?: CreateDetalleVentaDTO[];
  items?: CreateDetalleVentaDTO[];
  observaciones?: string;
}

// ============================================================================
// 10. RESPUESTAS GENÉRICAS DE LA API REST (Spring Boot)
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
