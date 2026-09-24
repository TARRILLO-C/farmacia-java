package com.sg.farmacia.service;

import com.sg.farmacia.dto.venta.DetalleItemDTO;
import com.sg.farmacia.dto.venta.VentaRequestDTO;
import com.sg.farmacia.dto.venta.VentaResponseDTO;
import com.sg.farmacia.exception.BadRequestException;
import com.sg.farmacia.model.*;
import com.sg.farmacia.repository.*;
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

    @Mock
    private UsuarioRepository usuarioRepository;

    @Mock
    private MetodoPagoRepository metodoPagoRepository;

    @Mock
    private LoteInventarioRepository loteRepository;

    @Mock
    private FidelizacionCrmService fidelizacionService;

    @InjectMocks
    private VentaServiceImpl ventaService;

    private Producto productoParacetamol;
    private LoteInventario loteParacetamol;
    private Cliente clienteAmigo;
    private FidelizacionCrm fidelizacionAmigo;
    private Usuario usuarioTest;
    private MetodoPago metodoPagoEfectivo;

    @BeforeEach
    void setUp() {
        productoParacetamol = Producto.builder()
                .id(1L)
                .codigo("7750123450012")
                .nombre("Paracetamol 500mg")
                .precioBaseVenta(10.0)
                .requiereReceta(false)
                .activo(true)
                .build();

        loteParacetamol = LoteInventario.builder()
                .id(1L)
                .producto(productoParacetamol)
                .codigoLote("LOT-2026-001")
                .stockActual(20)
                .stockMinimo(5)
                .fechaVencimiento(LocalDate.now().plusMonths(6))
                .activo(true)
                .build();

        fidelizacionAmigo = FidelizacionCrm.builder()
                .id(1L)
                .codigoAfiliado("AMIGO-005")
                .porcentajeDescuento(10.0)
                .puntosAcumulados(0)
                .estadoMembresia("ACTIVO")
                .build();

        clienteAmigo = Cliente.builder()
                .id(5L)
                .tipoDocumento("DNI")
                .numeroDocumento("72881923")
                .nombreCompleto("Juan Perez")
                .fidelizacion(fidelizacionAmigo)
                .activo(true)
                .build();
        fidelizacionAmigo.setCliente(clienteAmigo);

        Empleado empleadoTest = Empleado.builder()
                .id(1L)
                .nombres("Administrador")
                .apellidos("Sistema")
                .dni("00000001")
                .activo(true)
                .build();

        usuarioTest = Usuario.builder()
                .id(1L)
                .username("admin")
                .email("admin@farmacia.com")
                .empleado(empleadoTest)
                .activo(true)
                .build();

        metodoPagoEfectivo = MetodoPago.builder()
                .id(1L)
                .nombre("Efectivo")
                .activo(true)
                .build();

        lenient().when(usuarioRepository.findAll()).thenReturn(List.of(usuarioTest));
        lenient().when(metodoPagoRepository.findByNombre("Efectivo")).thenReturn(Optional.of(metodoPagoEfectivo));
    }

    @Test
    @DisplayName("Debe procesar una venta exitosa para público general, descontar stock FEFO y generar recibo automático")
    void procesarVenta_Exito_PublicoGeneral() {
        VentaRequestDTO request = VentaRequestDTO.builder()
                .requiereReceta(false)
                .items(List.of(
                        DetalleItemDTO.builder().productoId(1L).cantidad(2).build()
                ))
                .build();

        when(productoRepository.findById(1L)).thenReturn(Optional.of(productoParacetamol));
        when(loteRepository.findByProductoIdAndActivoTrueOrderByFechaVencimientoAsc(1L))
                .thenReturn(new ArrayList<>(List.of(loteParacetamol)));
        when(usuarioRepository.findAll()).thenReturn(List.of(usuarioTest));
        when(metodoPagoRepository.findByNombre("Efectivo")).thenReturn(Optional.of(metodoPagoEfectivo));
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
        assertEquals(18, loteParacetamol.getStockActual()); // 20 - 2
        assertNotNull(response.getCodigoComprobante());
        assertTrue(response.getCodigoComprobante().startsWith("B001-"));
        assertEquals(1L, response.getReciboId());

        verify(loteRepository, times(1)).save(loteParacetamol);
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
        when(loteRepository.findByProductoIdAndActivoTrueOrderByFechaVencimientoAsc(1L))
                .thenReturn(new ArrayList<>(List.of(loteParacetamol)));
        when(usuarioRepository.findAll()).thenReturn(List.of(usuarioTest));
        when(metodoPagoRepository.findByNombre("Efectivo")).thenReturn(Optional.of(metodoPagoEfectivo));
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
        assertEquals(10, loteParacetamol.getStockActual()); // 20 - 10
        assertEquals("B001-00000005", response.getCodigoComprobante());

        verify(fidelizacionService, times(1)).acumularPuntos(eq(5L), anyInt());
        verify(loteRepository, times(1)).save(loteParacetamol);
        verify(ventaRepository, times(1)).save(any(Venta.class));
        verify(reciboRepository, times(1)).save(any(Recibo.class));
    }

    @Test
    @DisplayName("Debe lanzar BadRequestException si el stock en lotes es insuficiente")
    void procesarVenta_Falla_StockInsuficiente() {
        VentaRequestDTO request = VentaRequestDTO.builder()
                .requiereReceta(false)
                .items(List.of(
                        DetalleItemDTO.builder().productoId(1L).cantidad(50).build()
                ))
                .build();

        when(productoRepository.findById(1L)).thenReturn(Optional.of(productoParacetamol));
        when(loteRepository.findByProductoIdAndActivoTrueOrderByFechaVencimientoAsc(1L))
                .thenReturn(new ArrayList<>(List.of(loteParacetamol)));

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
        when(loteRepository.findByProductoIdAndActivoTrueOrderByFechaVencimientoAsc(1L))
                .thenReturn(new ArrayList<>(List.of(loteParacetamol)));

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

        Recibo reciboSimulado = Recibo.builder()
                .id(10L)
                .numeroRecibo("REC-2026-00010")
                .montoTotal(59.0)
                .build();

        Venta ventaSimulada = Venta.builder()
                .id(200L)
                .numeroVenta("VTA-2026-000200")
                .fecha(LocalDateTime.now())
                .subtotal(50.0)
                .impuesto(9.0)
                .descuentoTotal(0.0)
                .total(59.0)
                .cliente(clienteAmigo)
                .detalles(new ArrayList<>())
                .recibo(reciboSimulado)
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
