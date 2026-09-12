package com.sg.farmacia.service;

import com.sg.farmacia.dto.producto.AjusteStockRequestDTO;
import com.sg.farmacia.dto.producto.ProductoRequestDTO;
import com.sg.farmacia.dto.producto.ProductoResponseDTO;
import com.sg.farmacia.exception.BadRequestException;
import com.sg.farmacia.exception.ResourceNotFoundException;
import com.sg.farmacia.model.Categoria;
import com.sg.farmacia.model.Producto;
import com.sg.farmacia.repository.CategoriaRepository;
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

    @InjectMocks
    private ProductoServiceImpl productoService;

    private Categoria categoriaTest;
    private Producto productoTest;
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
                .codigoBarras("7750123450012")
                .nombre("Paracetamol 500mg Forte")
                .precioCompra(5.0)
                .precioVenta(10.0)
                .stock(50)
                .stockMinimo(10)
                .fechaCaducidad(LocalDate.now().plusMonths(6))
                .categoria(categoriaTest)
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
        when(productoRepository.existsByCodigoBarras("7750123450012")).thenReturn(false);
        when(categoriaRepository.findById(1L)).thenReturn(Optional.of(categoriaTest));
        when(productoRepository.save(any(Producto.class))).thenReturn(productoTest);

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
        when(productoRepository.existsByCodigoBarras("7750123450012")).thenReturn(true);

        assertThrows(BadRequestException.class, () -> productoService.crear(requestDtoTest));
        verify(productoRepository, never()).save(any(Producto.class));
    }

    @Test
    @DisplayName("Debe lanzar ResourceNotFoundException cuando la categoría especificada no existe")
    void crearProducto_CategoriaInexistente_LanzaResourceNotFound() {
        when(productoRepository.existsByCodigoBarras("7750123450012")).thenReturn(false);
        when(categoriaRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> productoService.crear(requestDtoTest));
        verify(productoRepository, never()).save(any(Producto.class));
    }

    @Test
    @DisplayName("Debe incrementar el stock cuando el tipo de ajuste es ENTRADA")
    void ajustarStock_Entrada_IncrementaStock() {
        when(productoRepository.findById(10L)).thenReturn(Optional.of(productoTest));
        when(productoRepository.save(any(Producto.class))).thenAnswer(invocation -> invocation.getArgument(0));

        AjusteStockRequestDTO ajusteDto = AjusteStockRequestDTO.builder()
                .cantidad(20)
                .tipo("ENTRADA")
                .motivo("Ingreso de mercadería por compra")
                .build();

        ProductoResponseDTO result = productoService.ajustarStock(10L, ajusteDto);

        assertNotNull(result);
        assertEquals(70, result.getStock()); // 50 + 20 = 70
        verify(productoRepository, times(1)).save(productoTest);
    }

    @Test
    @DisplayName("Debe decrementar el stock cuando el tipo de ajuste es SALIDA")
    void ajustarStock_Salida_DecrementaStock() {
        when(productoRepository.findById(10L)).thenReturn(Optional.of(productoTest));
        when(productoRepository.save(any(Producto.class))).thenAnswer(invocation -> invocation.getArgument(0));

        AjusteStockRequestDTO ajusteDto = AjusteStockRequestDTO.builder()
                .cantidad(15)
                .tipo("SALIDA")
                .motivo("Merma o producto deteriorado")
                .build();

        ProductoResponseDTO result = productoService.ajustarStock(10L, ajusteDto);

        assertNotNull(result);
        assertEquals(35, result.getStock()); // 50 - 15 = 35
        verify(productoRepository, times(1)).save(productoTest);
    }

    @Test
    @DisplayName("Debe lanzar BadRequestException si la salida supera el stock disponible")
    void ajustarStock_SalidaExcesiva_LanzaBadRequest() {
        when(productoRepository.findById(10L)).thenReturn(Optional.of(productoTest));

        AjusteStockRequestDTO ajusteDto = AjusteStockRequestDTO.builder()
                .cantidad(60) // Stock actual es 50
                .tipo("SALIDA")
                .motivo("Intento de salida mayor al stock")
                .build();

        BadRequestException ex = assertThrows(BadRequestException.class,
                () -> productoService.ajustarStock(10L, ajusteDto));

        assertTrue(ex.getMessage().contains("Stock insuficiente"));
        verify(productoRepository, never()).save(any(Producto.class));
    }

    @Test
    @DisplayName("Debe listar productos con stock bajo o igual al límite indicado")
    void listarStockBajo_Exito() {
        when(productoRepository.findByStockLessThanEqual(15)).thenReturn(List.of(productoTest));

        List<ProductoResponseDTO> results = productoService.listarStockBajo(15);

        assertNotNull(results);
        assertEquals(1, results.size());
        assertEquals("7750123450012", results.get(0).getCodigoBarras());
    }
}
