package com.sg.farmacia.util;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class DocumentoIdentidadTest {

    @Test
    @DisplayName("DNI válido solo con 8 dígitos numéricos")
    void esDniValido() {
        assertTrue(DocumentoIdentidad.esDniValido("75237662"));
        assertFalse(DocumentoIdentidad.esDniValido("7523766"));
        assertFalse(DocumentoIdentidad.esDniValido("752376621"));
        assertFalse(DocumentoIdentidad.esDniValido("7523766A"));
        assertFalse(DocumentoIdentidad.esDniValido(null));
    }

    @Test
    @DisplayName("RUC válido con prefijo y dígito verificador correctos")
    void esRucValido() {
        assertTrue(DocumentoIdentidad.esRucValido("20608386387"));
        assertTrue(DocumentoIdentidad.esRucValido("20000000001"));
        assertFalse(DocumentoIdentidad.esRucValido("20608386388")); // verificador incorrecto
        assertFalse(DocumentoIdentidad.esRucValido("30608386387")); // prefijo inválido
        assertFalse(DocumentoIdentidad.esRucValido("75237662"));
        assertFalse(DocumentoIdentidad.esRucValido(null));
    }
}
