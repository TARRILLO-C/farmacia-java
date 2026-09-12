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

    @NotBlank(message = "El código de barras es obligatorio")
    @Size(min = 2, max = 100, message = "El código de barras debe tener entre 2 y 100 caracteres")
    @JsonAlias({"codigo", "codigoBarras", "sku"})
    private String codigoBarras;

    @NotBlank(message = "El nombre del producto es obligatorio")
    @Size(min = 2, max = 150, message = "El nombre debe contener entre 2 y 150 caracteres")
    private String nombre;

    @Size(max = 500, message = "La descripción no puede exceder los 500 caracteres")
    private String descripcion;

    @Size(max = 150, message = "El principio activo no puede exceder los 150 caracteres")
    private String principioActivo;

    @Size(max = 100, message = "La presentación no puede exceder los 100 caracteres")
    private String presentacion;

    @Size(max = 100, message = "El nombre del laboratorio no puede exceder los 100 caracteres")
    private String laboratorio;

    @Size(max = 50, message = "El número de lote no puede exceder los 50 caracteres")
    private String lote;

    @PositiveOrZero(message = "El precio de compra no puede ser negativo")
    private Double precioCompra;

    @NotNull(message = "El precio de venta es obligatorio")
    @Positive(message = "El precio de venta debe ser mayor a 0")
    @JsonAlias({"precio", "precioVenta"})
    private Double precioVenta;

    @NotNull(message = "El stock inicial es obligatorio")
    @Min(value = 0, message = "El stock no puede ser negativo")
    private Integer stock;

    @Min(value = 0, message = "El stock mínimo no puede ser negativo")
    @Builder.Default
    private Integer stockMinimo = 10;

    @JsonFormat(pattern = "yyyy-MM-dd")
    @JsonAlias({"fechaVencimiento", "fechaCaducidad"})
    private LocalDate fechaCaducidad;

    @NotNull(message = "El ID de la categoría es obligatorio")
    @Positive(message = "El ID de la categoría debe ser un número positivo")
    private Long categoriaId;

    @Builder.Default
    private Boolean requiereReceta = false;

    @Builder.Default
    private Boolean activo = true;

    public String obtenerCodigoBarras() {
        return this.codigoBarras != null ? this.codigoBarras.trim() : "";
    }

    public String obtenerNombre() {
        return this.nombre != null ? this.nombre.trim() : "";
    }
}
