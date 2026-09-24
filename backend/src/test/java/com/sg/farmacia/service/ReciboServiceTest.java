package com.sg.farmacia.service;

import com.sg.farmacia.dto.recibo.ReciboResponseDTO;
import com.sg.farmacia.exception.ResourceNotFoundException;
import com.sg.farmacia.model.*;
import com.sg.farmacia.repository.ReciboRepository;
import com.sg.farmacia.service.impl.ReciboServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ReciboServiceTest {

    @Mock
    private ReciboRepository reciboRepository;

    @InjectMocks
    private ReciboServiceImpl reciboService;

    private Recibo reciboTest;
    private Venta ventaTest;
    private Cliente clienteTest;

    @BeforeEach
    void setUp() {
        clienteTest = Cliente.builder()
                .id(1L)
                .tipoDocumento("DNI")
                .numeroDocumento("45892341")
                .nombreCompleto("Maria Lopez")
                .direccion("Av. Arequipa 500")
                .activo(true)
                .build();

        Producto producto = Producto.builder()
                .id(10L)
                .nombre("Amoxicilina 500mg")
                .codigo("7759999001")
                .precioBaseVenta(15.0)
                .activo(true)
                .build();

        LoteInventario lote = LoteInventario.builder()
                .id(1L)
                .producto(producto)
                .codigoLote("LOT-AMOX-01")
                .stockActual(20)
                .activo(true)
                .build();

        DetalleVenta detalle = DetalleVenta.builder()
                .id(101L)
                .lote(lote)
                .cantidad(2)
                .precioUnitario(15.0)
                .subtotal(30.0)
                .build();

        ventaTest = Venta.builder()
                .id(50L)
                .numeroVenta("VTA-2026-000001")
                .fecha(LocalDateTime.now())
                .subtotal(30.0)
                .impuesto(5.4)
                .descuentoTotal(0.0)
                .total(35.4)
                .cliente(clienteTest)
                .detalles(new ArrayList<>(List.of(detalle)))
                .build();

        reciboTest = Recibo.builder()
                .id(1L)
                .numeroRecibo("REC-2026-00001")
                .serie("B001")
                .correlativo("00000001")
                .tipoComprobante("BOLETA")
                .fechaEmision(LocalDateTime.now())
                .montoSubtotal(30.0)
                .montoImpuesto(5.4)
                .montoDescuento(0.0)
                .montoTotal(35.4)
                .metodoPago("EFECTIVO")
                .clienteNombre("Maria Lopez")
                .clienteDocumento("45892341")
                .clienteDireccion("Av. Arequipa 500")
                .venta(ventaTest)
                .build();
    }

    @Test
    @DisplayName("Debe obtener un recibo estructurado por su ID")
    void obtenerPorId_Exito() {
        when(reciboRepository.findByIdConDetalles(1L)).thenReturn(Optional.of(reciboTest));

        ReciboResponseDTO response = reciboService.obtenerPorId(1L);

        assertNotNull(response);
        assertEquals("REC-2026-00001", response.getCodigoComprobante());
        assertEquals(35.4, response.getTotalPagado());
        assertEquals("Maria Lopez", response.getClienteNombre());
        assertEquals("45892341", response.getClienteDniRuc());
        assertEquals(1, response.getItems().size());
        assertEquals("Amoxicilina 500mg", response.getItems().get(0).getProductoNombre());
        assertEquals("SGF FARMACIA CENTRAL", response.getNombreEstablecimiento());

        verify(reciboRepository, times(1)).findByIdConDetalles(1L);
    }

    @Test
    @DisplayName("Debe lanzar ResourceNotFoundException si el recibo no existe")
    void obtenerPorId_NoExiste() {
        when(reciboRepository.findByIdConDetalles(99L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () ->
                reciboService.obtenerPorId(99L)
        );

        verify(reciboRepository, times(1)).findByIdConDetalles(99L);
    }

    @Test
    @DisplayName("Debe obtener un recibo por su código de comprobante")
    void obtenerPorCodigo_Exito() {
        when(reciboRepository.findByCodigoConDetalles("REC-2026-00001")).thenReturn(Optional.of(reciboTest));

        ReciboResponseDTO response = reciboService.obtenerPorCodigo("REC-2026-00001");

        assertNotNull(response);
        assertEquals(1L, response.getId());
        assertEquals("REC-2026-00001", response.getCodigoComprobante());

        verify(reciboRepository, times(1)).findByCodigoConDetalles("REC-2026-00001");
    }

    @Test
    @DisplayName("Debe obtener un recibo por el ID de la venta")
    void obtenerPorVentaId_Exito() {
        when(reciboRepository.findByVentaId(50L)).thenReturn(Optional.of(reciboTest));

        ReciboResponseDTO response = reciboService.obtenerPorVentaId(50L);

        assertNotNull(response);
        assertEquals(50L, response.getVentaId());
        assertEquals(35.4, response.getTotalPagado());

        verify(reciboRepository, times(1)).findByVentaId(50L);
    }
}
