package com.sg.farmacia.dto.lote;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.*;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LoteRequestDTO {

    @NotNull(message = "El ID del producto es obligatorio")
    private Long productoId;

    @NotBlank(message = "El código del lote es obligatorio")
    private String codigoLote;

    @NotNull(message = "La fecha de vencimiento es obligatoria")
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate fechaVencimiento;

    @NotNull(message = "El stock actual es obligatorio")
    @Min(value = 0, message = "El stock actual no puede ser negativo")
    private Integer stockActual;

    @Min(value = 0, message = "El stock mínimo no puede ser negativo")
    @Builder.Default
    private Integer stockMinimo = 5;

    @PositiveOrZero(message = "El precio de compra no puede ser negativo")
    @Builder.Default
    private Double precioCompra = 0.00;

    @Builder.Default
    private Boolean activo = true;
}
