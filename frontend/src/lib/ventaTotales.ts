/**
 * Cálculo de totales de venta, espejo de VentaServiceImpl.procesarVenta (backend).
 *
 * Convención: el precio del producto (precioBaseVenta) NO incluye IGV.
 *   subtotal  = Σ precio × cantidad
 *   descuento = subtotal × tasa ClienteAmigo
 *   base      = subtotal − descuento        (operación gravada)
 *   igv       = base × 18%
 *   total     = base + igv
 * Cada paso se redondea a 2 decimales con HALF_UP, igual que el backend.
 */

export const TASA_IGV = 0.18;

/** HALF_UP a 2 decimales sobre la representación decimal (igual que BigDecimal.valueOf en Java). */
export const redondear = (valor: number): number => {
  // Valores ínfimos (p. ej. 5.5e-17 tras una resta) ya vienen en notación exponencial
  if (String(valor).includes('e')) return Math.round(valor * 100) / 100;
  return Number(`${Math.round(Number(`${valor}e2`))}e-2`);
};

export const precioConIgv = (precioBase: number): number => redondear(precioBase * (1 + TASA_IGV));

/** Tasa de descuento ClienteAmigo: acepta 5 (porcentaje) o 0.05 (fracción); 5% por defecto. */
export const tasaDescuentoAmigo = (porcentaje?: number | null): number => {
  const p = porcentaje && porcentaje > 0 ? porcentaje : 5;
  return p > 1 ? p / 100 : p;
};

export interface TotalesVenta {
  subtotal: number;
  tasaDescuento: number;
  descuento: number;
  base: number;
  igv: number;
  total: number;
}

export const calcularTotalesVenta = (
  items: { precio: number; cantidad: number }[],
  tasaDescuento = 0
): TotalesVenta => {
  const subtotal = redondear(items.reduce((acc, i) => acc + redondear(i.precio * i.cantidad), 0));
  const descuento = redondear(subtotal * tasaDescuento);
  const base = redondear(Math.max(0, subtotal - descuento));
  const igv = redondear(base * TASA_IGV);
  const total = redondear(base + igv);
  return { subtotal, tasaDescuento, descuento, base, igv, total };
};
