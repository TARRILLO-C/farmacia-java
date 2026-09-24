package com.sg.farmacia.service.impl;

import com.sg.farmacia.dto.recibo.ReciboResponseDTO;
import com.sg.farmacia.exception.ResourceNotFoundException;
import com.sg.farmacia.model.Recibo;
import com.sg.farmacia.repository.ReciboRepository;
import com.sg.farmacia.service.ReciboService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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

        return ReciboResponseDTO.fromEntity(recibo);
    }

    @Override
    @Transactional(readOnly = true)
    public ReciboResponseDTO obtenerPorVentaId(Long ventaId) {
        Recibo recibo = reciboRepository.findByVentaId(ventaId)
                .orElseThrow(() -> new ResourceNotFoundException("Recibo no encontrado para la Venta con ID: " + ventaId));

        return ReciboResponseDTO.fromEntity(recibo);
    }

    @Override
    @Transactional(readOnly = true)
    public ReciboResponseDTO obtenerPorCodigo(String codigoComprobante) {
        Recibo recibo = reciboRepository.findByCodigoConDetalles(codigoComprobante)
                .orElseThrow(() -> new ResourceNotFoundException("Recibo no encontrado con código: " + codigoComprobante));

        return ReciboResponseDTO.fromEntity(recibo);
    }
}
