package com.sg.farmacia.dto.venta;

import com.fasterxml.jackson.annotation.JsonSetter;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VentaRequestDTO {

    private Long clienteId;

    private String numeroClienteAmigo;

    private boolean requiereReceta;

    @NotEmpty(message = "La lista de items no puede estar vacía")
    @Valid
    private List<DetalleItemDTO> items;

    @JsonSetter("detalles")
    public void setDetalles(List<DetalleItemDTO> detalles) {
        if (this.items == null || this.items.isEmpty()) {
            this.items = detalles;
        }
    }
}
