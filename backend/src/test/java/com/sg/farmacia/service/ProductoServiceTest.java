package com.sg.farmacia.service;

import com.sg.farmacia.dto.producto.AjusteStockRequestDTO;
import com.sg.farmacia.dto.producto.ProductoRequestDTO;
import com.sg.farmacia.dto.producto.ProductoResponseDTO;
import com.sg.farmacia.exception.BadRequestException;
import com.sg.farmacia.exception.ResourceNotFoundException;
import com.sg.farmacia.model.Categoria;
import com.sg.farmacia.model.LoteInventario;
import com.sg.farmacia.model.Producto;
import com.sg.farmacia.repository.CategoriaRepository;
import com.sg.farmacia.repository.LoteInventarioRepository;
import com.sg.farmacia.repository.ProductoRepository;
import com.sg.farmacia.service.impl.ProductoServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProductoServiceTest {

    @Mock
    private ProductoRepository productoRepository;

    @Mock
    private CategoriaRepository categoriaRepository;

    @Mock
    private LaboratorioService laboratorioService;

    @Mock
    private PrincipioActivoService principioActivoService;

    @Mock
    private PresentacionService presentacionService;

    @Mock
    private LoteInventarioRepository loteRepository;

    @InjectMocks
    private ProductoServiceImpl productoService;

    private Categoria categoriaTest;
    private Producto productoTest;
    private LoteInventario loteTest;
    private ProductoRequestDTO requestDtoTest;

    @BeforeEach
    void setUp() {
        categoriaTest = Categoria.builder()
                .id(1L)
                .nombre("Analgésicos")
                .activo(true)
                .build();

        productoTest = Producto.builder()
                .id(10L)
                .codigo("7750123450012")
                .nombre("Paracetamol 500mg Forte")
                .precioBaseVenta(10.0)
                .categoria(categoriaTest)
                .activo(true)
                .lotes(new ArrayList<>())
                .build();

        loteTest = LoteInventario.builder()
                .id(1L)
                .producto(productoTest)
                .codigoLote("LOT-2026-01")
                .stockActual(50)
                .stockMinimo(10)
                .fechaVencimiento(LocalDate.now().plusMonths(6))
                .activo(true)
                .build();

        requestDtoTest = ProductoRequestDTO.builder()
                .codigoBarras("7750123450012")
                .nombre("Paracetamol 500mg Forte")
                .precioCompra(5.0)
                .precioVenta(10.0)
                .stock(50)
                .stockMinimo(10)
                .fechaCaducidad(LocalDate.now().plusMonths(6))
                .categoriaId(1L)
                .activo(true)
                .build();
    }

    @Test
    @DisplayName("Debe registrar un nuevo producto exitosamente asociado a su categoría")
    void crearProducto_Exito() {
        when(productoRepository.existsByCodigo("7750123450012")).thenReturn(false);
        when(categoriaRepository.findById(1L)).thenReturn(Optional.of(categoriaTest));
        when(laboratorioService.resolverEntidad(any(), any())).thenReturn(null);
        when(principioActivoService.resolverEntidad(any(), any())).thenReturn(null);
        when(presentacionService.resolverEntidad(any(), any())).thenReturn(null);
        when(productoRepository.save(any(Producto.class))).thenReturn(productoTest);
        when(loteRepository.save(any(LoteInventario.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ProductoResponseDTO result = productoService.crear(requestDtoTest);

        assertNotNull(result);
        assertEquals("7750123450012", result.getCodigoBarras());
        assertEquals("Paracetamol 500mg Forte", result.getNombre());
        assertEquals(1L, result.getCategoriaId());
        assertEquals("Analgésicos", result.getCategoriaNombre());
        assertEquals(50, result.getStock());

        verify(productoRepository, times(1)).save(any(Producto.class));
    }

    @Test
    @DisplayName("Debe lanzar BadRequestException cuando el código de barras ya existe")
    void crearProducto_CodigoBarrasDuplicado_LanzaBadRequest() {
        when(productoRepository.existsByCodigo("7750123450012")).thenReturn(true);

        assertThrows(BadRequestException.class, () -> productoService.crear(requestDtoTest));
        verify(productoRepository, never()).save(any(Producto.class));
    }

    @Test
    @DisplayName("Debe lanzar ResourceNotFoundException cuando la categoría especificada no existe")
    void crearProducto_CategoriaInexistente_LanzaResourceNotFound() {
        when(productoRepository.existsByCodigo("7750123450012")).thenReturn(false);
        when(categoriaRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> productoService.crear(requestDtoTest));
        verify(productoRepository, never()).save(any(Producto.class));
    }

    @Test
    @DisplayName("Debe incrementar el stock cuando el tipo de ajuste es ENTRADA")
    void ajustarStock_Entrada_IncrementaStock() {
        productoTest.getLotes().add(loteTest);
        when(productoRepository.findById(10L)).thenReturn(Optional.of(productoTest));
        when(loteRepository.findByProductoIdAndActivoTrueOrderByFechaVencimientoAsc(10L))
                .thenReturn(new ArrayList<>(List.of(loteTest)));

        AjusteStockRequestDTO ajusteDto = AjusteStockRequestDTO.builder()
                .cantidad(20)
                .tipo("ENTRADA")
                .motivo("Ingreso de mercadería por compra")
                .build();

        ProductoResponseDTO result = productoService.ajustarStock(10L, ajusteDto);

        assertNotNull(result);
        assertEquals(70, result.getStock()); // 50 + 20 = 70
        verify(loteRepository, times(1)).save(loteTest);
    }

    @Test
    @DisplayName("Debe decrementar el stock cuando el tipo de ajuste es SALIDA")
    void ajustarStock_Salida_DecrementaStock() {
        productoTest.getLotes().add(loteTest);
        when(productoRepository.findById(10L)).thenReturn(Optional.of(productoTest));
        when(loteRepository.findByProductoIdAndActivoTrueOrderByFechaVencimientoAsc(10L))
                .thenReturn(new ArrayList<>(List.of(loteTest)));

        AjusteStockRequestDTO ajusteDto = AjusteStockRequestDTO.builder()
                .cantidad(15)
                .tipo("SALIDA")
                .motivo("Merma o producto deteriorado")
                .build();

        ProductoResponseDTO result = productoService.ajustarStock(10L, ajusteDto);

        assertNotNull(result);
        assertEquals(35, result.getStock()); // 50 - 15 = 35
        verify(loteRepository, times(1)).save(loteTest);
    }

    @Test
    @DisplayName("Debe lanzar BadRequestException si la salida supera el stock disponible")
    void ajustarStock_SalidaExcesiva_LanzaBadRequest() {
        productoTest.getLotes().add(loteTest);
        when(productoRepository.findById(10L)).thenReturn(Optional.of(productoTest));

        AjusteStockRequestDTO ajusteDto = AjusteStockRequestDTO.builder()
                .cantidad(60) // Stock actual es 50
                .tipo("SALIDA")
                .motivo("Intento de salida mayor al stock")
                .build();

        BadRequestException ex = assertThrows(BadRequestException.class,
                () -> productoService.ajustarStock(10L, ajusteDto));

        assertTrue(ex.getMessage().contains("Stock insuficiente"));
        verify(loteRepository, never()).save(any(LoteInventario.class));
    }

    @Test
    @DisplayName("Debe listar productos con stock bajo o igual al límite indicado")
    void listarStockBajo_Exito() {
        productoTest.getLotes().add(loteTest);
        loteTest.setStockActual(12);
        when(productoRepository.findAllWithRelations()).thenReturn(List.of(productoTest));

        List<ProductoResponseDTO> results = productoService.listarStockBajo(15);

        assertNotNull(results);
        assertEquals(1, results.size());
        assertEquals("7750123450012", results.get(0).getCodigoBarras());
    }
}
