package com.sg.farmacia.service;

import com.sg.farmacia.dto.consulta.DocumentoConsultaDTO;
import com.sg.farmacia.exception.BadRequestException;
import com.sg.farmacia.integration.apiperu.ApiPeruClient;
import com.sg.farmacia.integration.apiperu.ApiPeruDniData;
import com.sg.farmacia.integration.apiperu.ApiPeruRucData;
import com.sg.farmacia.model.Cliente;
import com.sg.farmacia.repository.ClienteRepository;
import com.sg.farmacia.service.impl.ConsultaDocumentoServiceImpl;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ConsultaDocumentoServiceTest {

    @Mock
    private ApiPeruClient apiPeruClient;

    @Mock
    private ClienteRepository clienteRepository;

    @InjectMocks
    private ConsultaDocumentoServiceImpl consultaService;

    private final ApiPeruDniData dniRonal = new ApiPeruDniData("75237662", "LLAPAPASCA MONTES, RONAL JAMES",
            "RONAL JAMES", "LLAPAPASCA", "MONTES", "");

    private final ApiPeruRucData rucDrago = new ApiPeruRucData("20608386387",
            "CORPORACION GRUPO DRAGO S.A.C. - DRAGO S.A.C.",
            "CAL. MANUEL MATTOS NRO. 427 URB. SAN AMADEO DE GARAGAY",
            "CAL. MANUEL MATTOS NRO. 427 URB. SAN AMADEO DE GARAGAY, LIMA - LIMA - SAN MARTIN DE PORRES",
            "ACTIVO", "HABIDO", "LIMA", "LIMA", "SAN MARTIN DE PORRES");

    @Test
    @DisplayName("Consulta DNI en RENIEC cuando no es cliente registrado")
    void consultarDni_DesdeReniec() {
        when(clienteRepository.findByNumeroDocumento("75237662")).thenReturn(Optional.empty());
        when(apiPeruClient.consultarDni("75237662")).thenReturn(dniRonal);

        DocumentoConsultaDTO dto = consultaService.consultarDni(" 75237662 ");

        assertEquals("RENIEC", dto.getFuente());
        assertEquals("DNI", dto.getTipoDocumento());
        assertEquals("RONAL JAMES LLAPAPASCA MONTES", dto.getNombreCompleto());
        assertNull(dto.getDireccion());
        assertFalse(dto.isRegistrado());
    }

    @Test
    @DisplayName("Consulta DNI desde la BD sin llamar a la API si ya es cliente")
    void consultarDni_DesdeLocal() {
        Cliente local = Cliente.builder().id(3L).numeroDocumento("75237662")
                .nombreCompleto("RONAL JAMES LLAPAPASCA MONTES").activo(true).build();
        when(clienteRepository.findByNumeroDocumento("75237662")).thenReturn(Optional.of(local));

        DocumentoConsultaDTO dto = consultaService.consultarDni("75237662");

        assertEquals("LOCAL", dto.getFuente());
        assertTrue(dto.isRegistrado());
        assertEquals(3L, dto.getClienteId());
        verifyNoInteractions(apiPeruClient);
    }

    @Test
    @DisplayName("Rechaza DNI con formato inválido sin consultar la API")
    void consultarDni_FormatoInvalido() {
        assertThrows(BadRequestException.class, () -> consultaService.consultarDni("1234"));
        verifyNoInteractions(apiPeruClient);
    }

    @Test
    @DisplayName("Consulta RUC en SUNAT con estado y condición")
    void consultarRuc_DesdeSunat() {
        when(clienteRepository.findByNumeroDocumento("20608386387")).thenReturn(Optional.empty());
        when(apiPeruClient.consultarRuc("20608386387")).thenReturn(rucDrago);

        DocumentoConsultaDTO dto = consultaService.consultarRuc("20608386387");

        assertEquals("SUNAT", dto.getFuente());
        assertEquals("CORPORACION GRUPO DRAGO S.A.C. - DRAGO S.A.C.", dto.getNombreCompleto());
        assertEquals("ACTIVO", dto.getEstado());
        assertEquals("HABIDO", dto.getCondicion());
        assertTrue(dto.getDireccion().endsWith("SAN MARTIN DE PORRES"));
    }

    @Test
    @DisplayName("Rechaza RUC con dígito verificador inválido")
    void consultarRuc_Invalido() {
        assertThrows(BadRequestException.class, () -> consultaService.consultarRuc("20608386388"));
        verifyNoInteractions(apiPeruClient);
    }

    @Test
    @DisplayName("Registra automáticamente un cliente RUC con datos de SUNAT")
    void obtenerORegistrarCliente_RegistraRuc() {
        when(clienteRepository.findByNumeroDocumento("20608386387")).thenReturn(Optional.empty());
        when(apiPeruClient.consultarRuc("20608386387")).thenReturn(rucDrago);
        when(clienteRepository.save(any(Cliente.class))).thenAnswer(inv -> inv.getArgument(0));

        Cliente cliente = consultaService.obtenerORegistrarCliente("20608386387");

        assertEquals("RUC", cliente.getTipoDocumento());
        assertEquals("CORPORACION GRUPO DRAGO S.A.C. - DRAGO S.A.C.", cliente.getNombreCompleto());
        assertTrue(cliente.getDireccion().startsWith("CAL. MANUEL MATTOS"));
        verify(clienteRepository).save(any(Cliente.class));
    }

    @Test
    @DisplayName("Devuelve el cliente existente sin registrar ni consultar la API")
    void obtenerORegistrarCliente_Existente() {
        Cliente local = Cliente.builder().id(3L).numeroDocumento("75237662").nombreCompleto("X").activo(true).build();
        when(clienteRepository.findByNumeroDocumento("75237662")).thenReturn(Optional.of(local));

        assertSame(local, consultaService.obtenerORegistrarCliente("75237662"));
        verify(clienteRepository, never()).save(any());
        verifyNoInteractions(apiPeruClient);
    }
}
