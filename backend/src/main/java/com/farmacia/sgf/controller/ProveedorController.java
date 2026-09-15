package com.farmacia.sgf.controller;

import com.farmacia.sgf.model.Proveedor;
import com.farmacia.sgf.repository.ProveedorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/proveedores")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class ProveedorController {

    private final ProveedorRepository proveedorRepository;

    @GetMapping
    public ResponseEntity<List<Proveedor>> getAll() {
        return ResponseEntity.ok(proveedorRepository.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Proveedor> getById(@PathVariable Long id) {
        return proveedorRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Proveedor> create(@RequestBody Proveedor proveedor) {
        return ResponseEntity.ok(proveedorRepository.save(proveedor));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Proveedor> update(@PathVariable Long id, @RequestBody Proveedor req) {
        return proveedorRepository.findById(id).map(prov -> {
            prov.setRuc(req.getRuc());
            prov.setRazonSocial(req.getRazonSocial());
            prov.setContacto(req.getContacto());
            prov.setTelefono(req.getTelefono());
            prov.setEmail(req.getEmail());
            prov.setDireccion(req.getDireccion());
            prov.setActivo(req.getActivo());
            return ResponseEntity.ok(proveedorRepository.save(prov));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (proveedorRepository.existsById(id)) {
            proveedorRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}
