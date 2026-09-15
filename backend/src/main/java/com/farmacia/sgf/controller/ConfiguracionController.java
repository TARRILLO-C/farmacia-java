package com.farmacia.sgf.controller;

import com.farmacia.sgf.model.Configuracion;
import com.farmacia.sgf.repository.ConfiguracionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/configuracion")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class ConfiguracionController {

    private final ConfiguracionRepository configuracionRepository;

    @GetMapping
    public ResponseEntity<Configuracion> getConfiguracion() {
        return configuracionRepository.findAll().stream().findFirst()
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.ok(Configuracion.builder().build()));
    }

    @PostMapping
    public ResponseEntity<Configuracion> saveConfiguracion(@RequestBody Configuracion req) {
        Configuracion config = configuracionRepository.findAll().stream().findFirst()
                .orElse(Configuracion.builder().build());

        if (req.getLogoUrl() != null) config.setLogoUrl(req.getLogoUrl());
        if (req.getSliderJson() != null) config.setSliderJson(req.getSliderJson());

        return ResponseEntity.ok(configuracionRepository.save(config));
    }
}
