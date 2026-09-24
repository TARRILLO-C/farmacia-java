package com.sg.farmacia.dto.compra;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CompraRequestDTO {

    @NotNull(message = "El proveedor es obligatorio")
    private Long proveedorId;

    private Long usuarioId;

    @NotBlank(message = "El número de factura es obligatorio")
    private String numeroFactura;

    @NotEmpty(message = "La compra debe tener al menos un detalle de producto")
    @Valid
    private List<DetalleCompraRequestDTO> detalles;
}
