package com.sg.farmacia.service.impl;

import com.sg.farmacia.dto.caja.*;
import com.sg.farmacia.exception.BadRequestException;
import com.sg.farmacia.exception.ResourceNotFoundException;
import com.sg.farmacia.model.Caja;
import com.sg.farmacia.model.MovimientoCaja;
import com.sg.farmacia.model.Usuario;
import com.sg.farmacia.repository.CajaRepository;
import com.sg.farmacia.repository.MovimientoCajaRepository;
import com.sg.farmacia.repository.UsuarioRepository;
import com.sg.farmacia.service.CajaService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class CajaServiceImpl implements CajaService {

    private final CajaRepository cajaRepository;
    private final MovimientoCajaRepository movimientoCajaRepository;
    private final UsuarioRepository usuarioRepository;

    @Override
    @Transactional(readOnly = true)
    public Optional<CajaResponseDTO> obtenerCajaActiva() {
        return cajaRepository.findFirstByEstadoOrderByFechaAperturaDesc("ABIERTA")
                .map(this::mapearACajaResponse);
    }

    @Override
    @Transactional
    public CajaResponseDTO abrirCaja(AperturaCajaDTO dto) {
        // Validar que no exista ya una caja abierta
        Optional<Caja> cajaExistente = cajaRepository.findFirstByEstadoOrderByFechaAperturaDesc("ABIERTA");
        if (cajaExistente.isPresent()) {
            throw new BadRequestException("Ya existe una caja abierta en el sistema (ID: " + cajaExistente.get().getId() + "). Debe cerrarla antes de abrir una nueva.");
        }

        Usuario usuario = resolverUsuario(dto.getUsuarioId());
        double montoInicial = Math.max(0.0, dto.getMontoInicial() != null ? dto.getMontoInicial() : 0.0);

        Caja caja = Caja.builder()
                .fechaApertura(LocalDateTime.now())
                .montoInicial(montoInicial)
                .saldoEsperadoEfectivo(montoInicial)
                .totalVentasEfectivo(0.0)
                .totalVentasTarjeta(0.0)
                .totalVentasDigital(0.0)
                .totalIngresosManuales(0.0)
                .totalEgresosManuales(0.0)
                .diferencia(0.0)
                .estado("ABIERTA")
                .usuarioApertura(usuario)
                .observacionesApertura(dto.getObservaciones())
                .build();

        Caja guardada = cajaRepository.save(caja);

        // Registrar movimiento de apertura
        if (montoInicial > 0) {
            MovimientoCaja movApertura = MovimientoCaja.builder()
                    .caja(guardada)
                    .tipo("INGRESO")
                    .concepto("Fondo Inicial de Caja")
                    .monto(montoInicial)
                    .metodoPago("EFECTIVO")
                    .fecha(LocalDateTime.now())
                    .usuario(usuario)
                    .build();
            movimientoCajaRepository.save(movApertura);
        }

        log.info("Caja abierta exitosamente con ID: {} por usuario: {}", guardada.getId(), usuario.getUsername());
        return mapearACajaResponse(guardada);
    }

    @Override
    @Transactional
    public CajaResponseDTO cerrarCaja(Long id, CierreCajaDTO dto) {
        Caja caja = cajaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Caja no encontrada con ID: " + id));

        if (!"ABIERTA".equalsIgnoreCase(caja.getEstado())) {
            throw new BadRequestException("La caja seleccionada ya se encuentra cerrada.");
        }

        Usuario usuario = resolverUsuario(dto.getUsuarioId());
        double montoCierre = Math.max(0.0, dto.getMontoCierre() != null ? dto.getMontoCierre() : 0.0);

        // Recalcular saldo esperado en efectivo:
        // Monto Inicial + Ventas Efectivo + Ingresos Manuales - Egresos Manuales
        double esperado = (caja.getMontoInicial() != null ? caja.getMontoInicial() : 0.0)
                + (caja.getTotalVentasEfectivo() != null ? caja.getTotalVentasEfectivo() : 0.0)
                + (caja.getTotalIngresosManuales() != null ? caja.getTotalIngresosManuales() : 0.0)
                - (caja.getTotalEgresosManuales() != null ? caja.getTotalEgresosManuales() : 0.0);

        esperado = Math.round(esperado * 100.0) / 100.0;
        double diferencia = Math.round((montoCierre - esperado) * 100.0) / 100.0;

        caja.setFechaCierre(LocalDateTime.now());
        caja.setMontoCierre(montoCierre);
        caja.setSaldoEsperadoEfectivo(esperado);
        caja.setDiferencia(diferencia);
        caja.setEstado("CERRADA");
        caja.setUsuarioCierre(usuario);
        caja.setObservacionesCierre(dto.getObservaciones());

        Caja guardada = cajaRepository.save(caja);
        log.info("Caja ID: {} cerrada exitosamente. Esperado: {}, Real: {}, Diferencia: {}",
                guardada.getId(), esperado, montoCierre, diferencia);

        return mapearACajaResponse(guardada);
    }

    @Override
    @Transactional
    public MovimientoCajaResponseDTO registrarMovimiento(Long cajaId, MovimientoCajaRequestDTO dto) {
        Caja caja = cajaRepository.findById(cajaId)
                .orElseThrow(() -> new ResourceNotFoundException("Caja no encontrada con ID: " + cajaId));

        if (!"ABIERTA".equalsIgnoreCase(caja.getEstado())) {
            throw new BadRequestException("No se pueden registrar movimientos en una caja cerrada.");
        }

        Usuario usuario = resolverUsuario(dto.getUsuarioId());
        String tipo = dto.getTipo() != null ? dto.getTipo().trim().toUpperCase() : "INGRESO";
        double monto = Math.max(0.0, dto.getMonto() != null ? dto.getMonto() : 0.0);
        String metodo = (dto.getMetodoPago() != null && !dto.getMetodoPago().isBlank())
                ? dto.getMetodoPago().trim().toUpperCase() : "EFECTIVO";

        MovimientoCaja movimiento = MovimientoCaja.builder()
                .caja(caja)
                .tipo(tipo)
                .concepto(dto.getConcepto())
                .monto(monto)
                .metodoPago(metodo)
                .fecha(LocalDateTime.now())
                .usuario(usuario)
                .referenciaId(dto.getReferenciaId())
                .build();

        MovimientoCaja guardado = movimientoCajaRepository.save(movimiento);

        // Actualizar acumuladores de la caja
        if ("INGRESO".equals(tipo)) {
            caja.setTotalIngresosManuales((caja.getTotalIngresosManuales() != null ? caja.getTotalIngresosManuales() : 0.0) + monto);
            if ("EFECTIVO".equals(metodo)) {
                caja.setSaldoEsperadoEfectivo((caja.getSaldoEsperadoEfectivo() != null ? caja.getSaldoEsperadoEfectivo() : 0.0) + monto);
            }
        } else if ("EGRESO".equals(tipo)) {
            caja.setTotalEgresosManuales((caja.getTotalEgresosManuales() != null ? caja.getTotalEgresosManuales() : 0.0) + monto);
            if ("EFECTIVO".equals(metodo)) {
                caja.setSaldoEsperadoEfectivo((caja.getSaldoEsperadoEfectivo() != null ? caja.getSaldoEsperadoEfectivo() : 0.0) - monto);
            }
        }

        cajaRepository.save(caja);
        return mapearAMovimientoResponse(guardado);
    }

    @Override
    @Transactional
    public void registrarVentaEnCajaActiva(Long ventaId, Double monto, String metodoPago) {
        Optional<Caja> cajaOpt = cajaRepository.findFirstByEstadoOrderByFechaAperturaDesc("ABIERTA");
        if (cajaOpt.isEmpty()) {
            log.debug("No hay caja abierta para registrar la venta ID: {}", ventaId);
            return;
        }

        Caja caja = cajaOpt.get();
        double valor = monto != null ? monto : 0.0;
        String metodo = metodoPago != null ? metodoPago.trim().toUpperCase() : "EFECTIVO";

        if (metodo.contains("TARJETA")) {
            caja.setTotalVentasTarjeta((caja.getTotalVentasTarjeta() != null ? caja.getTotalVentasTarjeta() : 0.0) + valor);
        } else if (metodo.contains("YAPE") || metodo.contains("PLIN") || metodo.contains("DIGITAL")) {
            caja.setTotalVentasDigital((caja.getTotalVentasDigital() != null ? caja.getTotalVentasDigital() : 0.0) + valor);
        } else {
            // Efectivo por defecto
            caja.setTotalVentasEfectivo((caja.getTotalVentasEfectivo() != null ? caja.getTotalVentasEfectivo() : 0.0) + valor);
            caja.setSaldoEsperadoEfectivo((caja.getSaldoEsperadoEfectivo() != null ? caja.getSaldoEsperadoEfectivo() : 0.0) + valor);
        }

        MovimientoCaja movVenta = MovimientoCaja.builder()
                .caja(caja)
                .tipo("VENTA")
                .concepto("Venta POS #" + ventaId)
                .monto(valor)
                .metodoPago(metodo)
                .fecha(LocalDateTime.now())
                .usuario(caja.getUsuarioApertura())
                .referenciaId(ventaId)
                .build();

        movimientoCajaRepository.save(movVenta);
        cajaRepository.save(caja);
        log.info("Venta ID: {} por S/ {} registrada en Caja activa ID: {}", ventaId, valor, caja.getId());
    }

    @Override
    @Transactional(readOnly = true)
    public List<CajaResponseDTO> listarHistorial(LocalDate fechaInicio, LocalDate fechaFin) {
        LocalDateTime desde = fechaInicio != null ? fechaInicio.atStartOfDay() : null;
        LocalDateTime hasta = fechaFin != null ? fechaFin.atTime(LocalTime.MAX) : null;

        return cajaRepository.buscarHistorial(desde, hasta).stream()
                .map(this::mapearACajaResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public CajaResponseDTO obtenerPorId(Long id) {
        Caja caja = cajaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Caja no encontrada con ID: " + id));
        return mapearACajaResponse(caja);
    }

    // =========================================================================
    // Helpers
    // =========================================================================

    private Usuario resolverUsuario(Long usuarioId) {
        if (usuarioId != null) {
            return usuarioRepository.findById(usuarioId)
                    .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado con ID: " + usuarioId));
        }

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated() && !auth.getName().equalsIgnoreCase("anonymousUser")) {
            return usuarioRepository.findByUsername(auth.getName())
                    .orElseGet(() -> usuarioRepository.findAll().stream().findFirst()
                            .orElseThrow(() -> new BadRequestException("No hay usuarios registrados en el sistema.")));
        }

        return usuarioRepository.findAll().stream().findFirst()
                .orElseThrow(() -> new BadRequestException("No hay usuarios en el sistema para asociar la caja."));
    }

    private CajaResponseDTO mapearACajaResponse(Caja c) {
        double ve = c.getTotalVentasEfectivo() != null ? c.getTotalVentasEfectivo() : 0.0;
        double vt = c.getTotalVentasTarjeta() != null ? c.getTotalVentasTarjeta() : 0.0;
        double vd = c.getTotalVentasDigital() != null ? c.getTotalVentasDigital() : 0.0;
        double totalVentas = ve + vt + vd;

        List<MovimientoCajaResponseDTO> movimientosDTO = Collections.emptyList();
        if (c.getId() != null) {
            movimientosDTO = movimientoCajaRepository.findByCajaIdOrderByFechaDesc(c.getId()).stream()
                    .map(this::mapearAMovimientoResponse)
                    .collect(Collectors.toList());
        }

        return CajaResponseDTO.builder()
                .id(c.getId())
                .fechaApertura(c.getFechaApertura())
                .fechaCierre(c.getFechaCierre())
                .montoInicial(c.getMontoInicial() != null ? c.getMontoInicial() : 0.0)
                .montoCierre(c.getMontoCierre())
                .totalVentasEfectivo(ve)
                .totalVentasTarjeta(vt)
                .totalVentasDigital(vd)
                .totalVentasTotal(totalVentas)
                .totalIngresosManuales(c.getTotalIngresosManuales() != null ? c.getTotalIngresosManuales() : 0.0)
                .totalEgresosManuales(c.getTotalEgresosManuales() != null ? c.getTotalEgresosManuales() : 0.0)
                .saldoEsperadoEfectivo(c.getSaldoEsperadoEfectivo() != null ? c.getSaldoEsperadoEfectivo() : 0.0)
                .diferencia(c.getDiferencia() != null ? c.getDiferencia() : 0.0)
                .estado(c.getEstado())
                .usuarioAperturaId(c.getUsuarioApertura() != null ? c.getUsuarioApertura().getId() : null)
                .usuarioAperturaNombre(c.getUsuarioApertura() != null ? c.getUsuarioApertura().getNombre() : "Sistema")
                .usuarioCierreId(c.getUsuarioCierre() != null ? c.getUsuarioCierre().getId() : null)
                .usuarioCierreNombre(c.getUsuarioCierre() != null ? c.getUsuarioCierre().getNombre() : null)
                .observacionesApertura(c.getObservacionesApertura())
                .observacionesCierre(c.getObservacionesCierre())
                .movimientos(movimientosDTO)
                .build();
    }

    private MovimientoCajaResponseDTO mapearAMovimientoResponse(MovimientoCaja m) {
        return MovimientoCajaResponseDTO.builder()
                .id(m.getId())
                .cajaId(m.getCaja() != null ? m.getCaja().getId() : null)
                .tipo(m.getTipo())
                .concepto(m.getConcepto())
                .monto(m.getMonto())
                .metodoPago(m.getMetodoPago())
                .fecha(m.getFecha())
                .usuarioId(m.getUsuario() != null ? m.getUsuario().getId() : null)
                .usuarioNombre(m.getUsuario() != null ? m.getUsuario().getNombre() : "Sistema")
                .referenciaId(m.getReferenciaId())
                .build();
    }
}
