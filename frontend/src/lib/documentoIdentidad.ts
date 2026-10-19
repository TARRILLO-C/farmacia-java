/**
 * Validaciones de documentos peruanos (espejo de DocumentoIdentidad.java en el backend).
 */

const PREFIJOS_RUC = ['10', '15', '16', '17', '20'];
const FACTORES_RUC = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2];

export const soloDigitos = (valor: string, max = 11): string =>
  valor.replace(/\D/g, '').slice(0, max);

export const esDniValido = (numero?: string | null): boolean =>
  !!numero && /^\d{8}$/.test(numero);

/** RUC de 11 dígitos con prefijo válido y dígito verificador (módulo 11) correcto. */
export const esRucValido = (numero?: string | null): boolean => {
  if (!numero || !/^\d{11}$/.test(numero) || !PREFIJOS_RUC.includes(numero.slice(0, 2))) {
    return false;
  }
  const suma = FACTORES_RUC.reduce((acc, factor, i) => acc + Number(numero[i]) * factor, 0);
  let verificador = 11 - (suma % 11);
  if (verificador === 10) verificador = 0;
  if (verificador === 11) verificador = 1;
  return verificador === Number(numero[10]);
};

/** Boleta exige DNI, factura exige RUC y el ticket admite cualquier documento o ninguno. */
export const documentoCumpleComprobante = (tipoComprobante: string, numero?: string | null): boolean => {
  if (tipoComprobante === 'BOLETA') return esDniValido(numero);
  if (tipoComprobante === 'FACTURA') return esRucValido(numero);
  return true;
};
