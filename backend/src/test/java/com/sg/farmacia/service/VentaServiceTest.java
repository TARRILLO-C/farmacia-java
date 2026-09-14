package com.sg.farmacia.service;

import com.sg.farmacia.dto.venta.DetalleItemDTO;
import com.sg.farmacia.dto.venta.VentaRequestDTO;
import com.sg.farmacia.dto.venta.VentaResponseDTO;
import com.sg.farmacia.exception.BadRequestException;
import com.sg.farmacia.exception.ResourceNotFoundException;
import com.sg.farmacia.model.*;
import com.sg.farmacia.repository.ClienteRepository;
import com.sg.farmacia.repository.ProductoRepository;
import com.sg.farmacia.repository.ReciboRepository;
import com.sg.farmacia.repository.VentaRepository;
import com.sg.farmacia.service.impl.VentaServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class VentaServiceTest {

    @Mock
    private VentaRepository ventaRepository;

    @Mock
    private ProductoRepository productoRepository;

    @Mock
    private ClienteRepository clienteRepository;

    @Mock
    private ReciboRepository reciboRepository;

    @InjectMocks
    private VentaServiceImpl ventaService;

    private Producto productoParacetamol;
    private Cliente clienteAmigo;

    @BeforeEach
    void setUp() {
        productoParacetamol = Producto.builder()
                .id(1L)
                .codigoBarras("7750123450012")
                .nombre("Paracetamol 500mg")
                .precioVenta(10.0)
                .stock(20)
                .requiereReceta(false)
                .activo(true)
                .build();

        clienteAmigo = Cliente.builder()
                .id(5L)
                .dniRuc("72881923")
                .nombreCompleto("Juan Perez")
                .tipoCliente(TipoCliente.BENEFICIARIO)
                .esClienteAmigo(true)
                .numeroClienteAmigo("AMIGO-005")
                .porcentajeDescuento(10.0) // 10%
                .puntosFidelidad(0)
                .activo(true)
                .build();
    }

    @Test
    @DisplayName("Debe procesar una venta exitosa para público general, descontar stock y generar recibo automático")
    void procesarVenta_Exito_PublicoGeneral() {
        VentaRequestDTO request = VentaRequestDTO.builder()
                .requiereReceta(false)
                .items(List.of(
                        DetalleItemDTO.builder().productoId(1L).cantidad(2).build()
                ))
                .build();

        when(productoRepository.findById(1L)).thenReturn(Optional.of(productoParacetamol));
        when(ventaRepository.save(any(Venta.class))).thenAnswer(invocation -> {
            Venta v = invocation.getArgument(0);
            v.setId(100L);
            return v;
        });
        when(reciboRepository.findMaxId()).thenReturn(0L);
        when(reciboRepository.save(any(Recibo.class))).thenAnswer(invocation -> {
            Recibo r = invocation.getArgument(0);
            r.setId(1L);
            return r;
        });

        VentaResponseDTO response = ventaService.procesarVenta(request);

        assertNotNull(response);
        assertEquals(100L, response.getId());
        assertEquals(20.0, response.getSubtotal()); // 2 * 10
        assertEquals(0.0, response.getDescuentoTotal());
        assertEquals(3.6, response.getIgv()); // 20 * 0.18
        assertEquals(23.6, response.getTotal()); // 20 + 3.6
        assertEquals(18, productoParacetamol.getStock()); // 20 - 2
        assertNotNull(response.getCodigoComprobante());
        assertTrue(response.getCodigoComprobante().startsWith("REC-"));
        assertEquals(1L, response.getReciboId());

        verify(productoRepository, times(1)).save(productoParacetamol);
        verify(ventaRepository, times(1)).save(any(Venta.class));
        verify(reciboRepository, times(1)).save(any(Recibo.class));
    }

    @Test
    @DisplayName("Debe aplicar descuento de Cliente Amigo, generar recibo y acumular puntos")
    void procesarVenta_Exito_ClienteAmigo() {
        VentaRequestDTO request = VentaRequestDTO.builder()
                .clienteId(5L)
                .requiereReceta(false)
                .items(List.of(
                        DetalleItemDTO.builder().productoId(1L).cantidad(10).build()
                ))
                .build();

        when(clienteRepository.findById(5L)).thenReturn(Optional.of(clienteAmigo));
        when(productoRepository.findById(1L)).thenReturn(Optional.of(productoParacetamol));
        when(ventaRepository.save(any(Venta.class))).thenAnswer(invocation -> {
            Venta v = invocation.getArgument(0);
            v.setId(101L);
            return v;
        });
        when(reciboRepository.findMaxId()).thenReturn(4L);
        when(reciboRepository.save(any(Recibo.class))).thenAnswer(invocation -> {
            Recibo r = invocation.getArgument(0);
            r.setId(5L);
            return r;
        });

        VentaResponseDTO response = ventaService.procesarVenta(request);

        assertNotNull(response);
        assertEquals(100.0, response.getSubtotal()); // 10 * 10
        assertEquals(10.0, response.getDescuentoTotal()); // 10% de 100
        assertEquals(16.2, response.getIgv()); // (100 - 10) * 0.18 = 90 * 0.18 = 16.2
        assertEquals(106.2, response.getTotal()); // 90 + 16.2
        assertTrue(response.isEsClienteAmigo());
        assertEquals(10, productoParacetamol.getStock()); // 20 - 10
        assertEquals("REC-2026-00005", response.getCodigoComprobante());

        verify(clienteRepository, times(1)).save(clienteAmigo);
        verify(productoRepository, times(1)).save(productoParacetamol);
        verify(ventaRepository, times(1)).save(any(Venta.class));
        verify(reciboRepository, times(1)).save(any(Recibo.class));
    }

    @Test
    @DisplayName("Debe lanzar BadRequestException si el stock es insuficiente")
    void procesarVenta_Falla_StockInsuficiente() {
        VentaRequestDTO request = VentaRequestDTO.builder()
                .requiereReceta(false)
                .items(List.of(
                        DetalleItemDTO.builder().productoId(1L).cantidad(50).build()
                ))
                .build();

        when(productoRepository.findById(1L)).thenReturn(Optional.of(productoParacetamol));

        BadRequestException exception = assertThrows(BadRequestException.class, () ->
                ventaService.procesarVenta(request)
        );

        assertTrue(exception.getMessage().contains("Stock insuficiente"));
        verify(ventaRepository, never()).save(any(Venta.class));
        verify(reciboRepository, never()).save(any(Recibo.class));
    }

    @Test
    @DisplayName("Debe exigir clienteId cuando la venta requiere receta médica")
    void procesarVenta_Falla_RequiereReceta_SinCliente() {
        VentaRequestDTO request = VentaRequestDTO.builder()
                .requiereReceta(true)
                .clienteId(null)
                .items(List.of(
                        DetalleItemDTO.builder().productoId(1L).cantidad(1).build()
                ))
                .build();

        when(productoRepository.findById(1L)).thenReturn(Optional.of(productoParacetamol));

        BadRequestException exception = assertThrows(BadRequestException.class, () ->
                ventaService.procesarVenta(request)
        );

        assertTrue(exception.getMessage().contains("receta médica"));
        verify(ventaRepository, never()).save(any(Venta.class));
        verify(reciboRepository, never()).save(any(Recibo.class));
    }

    @Test
    @DisplayName("Debe listar historial con filtros de fecha y DNI")
    void listarHistorial_ConFiltros() {
        LocalDate inicio = LocalDate.now().minusDays(5);
        LocalDate fin = LocalDate.now();
        String dni = "72881923";

        Venta ventaSimulada = Venta.builder()
                .id(200L)
                .fechaVenta(LocalDateTime.now())
                .subtotal(50.0)
                .igv(9.0)
                .descuentoTotal(0.0)
                .total(59.0)
                .cliente(clienteAmigo)
                .detalles(new ArrayList<>())
                .recibo(Recibo.builder().id(10L).codigoComprobante("REC-2026-00010").totalPagado(59.0).build())
                .build();

        when(ventaRepository.buscarHistorial(any(), any(), eq(dni))).thenReturn(List.of(ventaSimulada));

        List<VentaResponseDTO> historial = ventaService.listarHistorial(inicio, fin, dni);

        assertNotNull(historial);
        assertEquals(1, historial.size());
        assertEquals("REC-2026-00010", historial.get(0).getCodigoComprobante());
        assertEquals("72881923", historial.get(0).getClienteDocumento());

        verify(ventaRepository, times(1)).buscarHistorial(any(), any(), eq(dni));
    }
}
