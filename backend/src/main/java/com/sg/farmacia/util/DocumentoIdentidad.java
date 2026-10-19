package com.sg.farmacia.util;

import java.util.Set;

/**
 * Validaciones de formato para documentos de identidad peruanos (DNI y RUC).
 */
public final class DocumentoIdentidad {

    public static final String DNI = "DNI";
    public static final String RUC = "RUC";

    private static final Set<String> PREFIJOS_RUC = Set.of("10", "15", "16", "17", "20");
    private static final int[] FACTORES_RUC = {5, 4, 3, 2, 7, 6, 5, 4, 3, 2};

    private DocumentoIdentidad() {
    }

    public static String normalizar(String numero) {
        return numero == null ? "" : numero.trim();
    }

    public static boolean esDniValido(String numero) {
        return numero != null && numero.matches("\\d{8}");
    }

    /**
     * RUC de 11 dígitos con prefijo válido y dígito verificador (módulo 11) correcto.
     */
    public static boolean esRucValido(String numero) {
        if (numero == null || !numero.matches("\\d{11}") || !PREFIJOS_RUC.contains(numero.substring(0, 2))) {
            return false;
        }
        int suma = 0;
        for (int i = 0; i < FACTORES_RUC.length; i++) {
            suma += Character.getNumericValue(numero.charAt(i)) * FACTORES_RUC[i];
        }
        int verificador = 11 - (suma % 11);
        if (verificador == 10) verificador = 0;
        if (verificador == 11) verificador = 1;
        return verificador == Character.getNumericValue(numero.charAt(10));
    }
}
