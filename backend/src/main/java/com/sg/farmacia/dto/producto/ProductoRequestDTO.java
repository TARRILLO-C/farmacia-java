package com.sg.farmacia.dto.producto;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductoRequestDTO {

    @NotBlank(message = "El código del producto es obligatorio")
    @Size(min = 2, max = 50, message = "El código debe tener entre 2 y 50 caracteres")
    @JsonAlias({"codigo", "codigoBarras", "sku"})
    private String codigoBarras;

    @NotBlank(message = "El nombre del producto es obligatorio")
    @Size(min = 2, max = 150, message = "El nombre debe contener entre 2 y 150 caracteres")
    private String nombre;

    @Size(max = 500, message = "La descripción no puede exceder los 500 caracteres")
    private String descripcion;

    @NotNull(message = "El precio de venta es obligatorio")
    @Positive(message = "El precio de venta debe ser mayor a 0")
    @JsonAlias({"precio", "precioVenta", "precioBaseVenta"})
    private Double precioVenta;

    @NotNull(message = "El ID de la categoría es obligatorio")
    @Positive(message = "El ID de la categoría debe ser un número positivo")
    private Long categoriaId;

    private Long laboratorioId;
    private String laboratorio; // nombre o alias

    private Long principioActivoId;
    private String principioActivo; // nombre o alias

    private Long presentacionId;
    private String presentacion; // nombre o alias

    // Datos iniciales de lote (opcionales al crear el producto)
    private String lote;
    private Double precioCompra;
    private Integer stock;
    private Integer stockMinimo;

    @JsonFormat(pattern = "yyyy-MM-dd")
    @JsonAlias({"fechaVencimiento", "fechaCaducidad"})
    private LocalDate fechaCaducidad;

    @Builder.Default
    private Boolean requiereReceta = false;

    @Builder.Default
    private Boolean activo = true;

    public String obtenerCodigo() {
        return this.codigoBarras != null ? this.codigoBarras.trim() : "";
    }

    public String obtenerNombre() {
        return this.nombre != null ? this.nombre.trim() : "";
    }
}
