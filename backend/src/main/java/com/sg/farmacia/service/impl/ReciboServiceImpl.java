package com.sg.farmacia.service.impl;

import com.sg.farmacia.dto.recibo.ReciboResponseDTO;
import com.sg.farmacia.dto.venta.DetalleVentaResponseDTO;
import com.sg.farmacia.exception.ResourceNotFoundException;
import com.sg.farmacia.model.Cliente;
import com.sg.farmacia.model.Recibo;
import com.sg.farmacia.model.Venta;
import com.sg.farmacia.repository.ReciboRepository;
import com.sg.farmacia.service.ReciboService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ReciboServiceImpl implements ReciboService {

    private final ReciboRepository reciboRepository;

    @Override
    @Transactional(readOnly = true)
    public ReciboResponseDTO obtenerPorId(Long id) {
        Recibo recibo = reciboRepository.findByIdConDetalles(id)
                .orElseThrow(() -> new ResourceNotFoundException("Recibo no encontrado con ID: " + id));

        return mapearAReciboResponse(recibo);
    }

    @Override
    @Transactional(readOnly = true)
    public ReciboResponseDTO obtenerPorVentaId(Long ventaId) {
        Recibo recibo = reciboRepository.findByVentaId(ventaId)
                .orElseThrow(() -> new ResourceNotFoundException("Recibo no encontrado para la Venta con ID: " + ventaId));

        return mapearAReciboResponse(recibo);
    }

    @Override
    @Transactional(readOnly = true)
    public ReciboResponseDTO obtenerPorCodigo(String codigoComprobante) {
        Recibo recibo = reciboRepository.findByCodigoConDetalles(codigoComprobante)
                .orElseThrow(() -> new ResourceNotFoundException("Recibo no encontrado con código: " + codigoComprobante));

        return mapearAReciboResponse(recibo);
    }

    private ReciboResponseDTO mapearAReciboResponse(Recibo recibo) {
        Venta venta = recibo.getVenta();
        Cliente cliente = (venta != null) ? venta.getCliente() : null;

        List<DetalleVentaResponseDTO> itemsDTO = (venta != null && venta.getDetalles() != null)
                ? venta.getDetalles().stream()
                .map(d -> DetalleVentaResponseDTO.builder()
                        .id(d.getId())
                        .productoId(d.getProducto() != null ? d.getProducto().getId() : null)
                        .productoNombre(d.getProducto() != null ? d.getProducto().getNombre() : "")
                        .codigoBarras(d.getProducto() != null ? d.getProducto().getCodigoBarras() : "")
                        .cantidad(d.getCantidad())
                        .precioUnitario(d.getPrecioUnitario())
                        .subtotalItem(d.getSubtotalItem())
                        .build())
                .collect(Collectors.toList())
                : Collections.emptyList();

        boolean esAmigo = cliente != null && (cliente.isEsClienteAmigo() ||
                (cliente.getNumeroClienteAmigo() != null && !cliente.getNumeroClienteAmigo().isBlank()));

        return ReciboResponseDTO.builder()
                .id(recibo.getId())
                .codigoComprobante(recibo.getCodigoComprobante())
                .fechaEmision(recibo.getFechaEmision())
                .ventaId(venta != null ? venta.getId() : null)
                .subtotal(venta != null ? venta.getSubtotal() : 0.0)
                .descuentoTotal(venta != null ? venta.getDescuentoTotal() : 0.0)
                .igv(venta != null ? venta.getIgv() : 0.0)
                .totalPagado(recibo.getTotalPagado())
                .requiereReceta(venta != null && venta.isRequiereReceta())
                .clienteId(cliente != null ? cliente.getId() : null)
                .clienteNombre(cliente != null ? cliente.getNombreCompleto() : "Público General")
                .clienteDniRuc(cliente != null ? cliente.getDniRuc() : "Sin Documento")
                .clienteDireccion(cliente != null && cliente.getDireccion() != null ? cliente.getDireccion() : "Lima, Perú")
                .esClienteAmigo(esAmigo)
                .puntosAcumulados(cliente != null ? cliente.getPuntosFidelidad() : 0)
                .items(itemsDTO)
                .build();
    }
}
