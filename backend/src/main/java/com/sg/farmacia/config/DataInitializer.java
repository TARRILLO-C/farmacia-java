package com.sg.farmacia.config;

import com.sg.farmacia.model.*;
import com.sg.farmacia.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final CategoriaRepository categoriaRepository;
    private final ProductoRepository productoRepository;
    private final ClienteRepository clienteRepository;
    private final VentaRepository ventaRepository;
    private final ReciboRepository reciboRepository;

    @Override
    @Transactional
    public void run(String... args) {
        inicializarUsuarios();
        inicializarCategoriasYProductos();
        inicializarClientes();
        inicializarVentasHistoricas();
    }

    private void inicializarUsuarios() {
        Set<String> todosLosModulos = new HashSet<>(Arrays.asList(
                "dashboard", "pos", "inventario", "categorias", "clientes", "ventas", "reportes", "usuarios"
        ));

        Set<String> modulosCajero = new HashSet<>(Arrays.asList(
                "dashboard", "pos", "clientes", "ventas"
        ));

        // Inicializar usuario Administrador si no existe
        if (!usuarioRepository.existsByUsername("admin")) {
            Usuario admin = Usuario.builder()
                    .username("admin")
                    .password(passwordEncoder.encode("admin123"))
                    .nombre("Administrador Principal")
                    .rol(Role.ADMIN)
                    .activo(true)
                    .modulosPermitidos(todosLosModulos)
                    .build();
            usuarioRepository.save(admin);
            log.info("Usuario 'admin' creado exitosamente con rol ADMIN (pass: admin123)");
        } else {
            usuarioRepository.findByUsername("admin").ifPresent(u -> {
                if (u.getModulosPermitidos() == null || u.getModulosPermitidos().isEmpty()) {
                    u.setModulosPermitidos(todosLosModulos);
                    usuarioRepository.save(u);
                }
            });
        }

        // Inicializar usuario Cajero si no existe
        if (!usuarioRepository.existsByUsername("cajero")) {
            Usuario cajero = Usuario.builder()
                    .username("cajero")
                    .password(passwordEncoder.encode("cajero123"))
                    .nombre("Cajero de Turno")
                    .rol(Role.CAJERO)
                    .activo(true)
                    .modulosPermitidos(modulosCajero)
                    .build();
            usuarioRepository.save(cajero);
            log.info("Usuario 'cajero' creado exitosamente con rol CAJERO (pass: cajero123)");
        } else {
            usuarioRepository.findByUsername("cajero").ifPresent(u -> {
                if (u.getModulosPermitidos() == null || u.getModulosPermitidos().isEmpty()) {
                    u.setModulosPermitidos(modulosCajero);
                    usuarioRepository.save(u);
                }
            });
        }
    }

    private void inicializarCategoriasYProductos() {
        if (categoriaRepository.count() > 0 && productoRepository.count() > 0) {
            return;
        }

        log.info("Iniciando sembrado de categorías y catálogo de medicamentos...");

        // 1. Categorías
        Categoria catAnalgesicos = categoriaRepository.save(Categoria.builder()
                .nombre("Analgésicos y Antipiréticos")
                .descripcion("Medicamentos para el alivio del dolor y control de la fiebre")
                .activo(true)
                .build());

        Categoria catAntibioticos = categoriaRepository.save(Categoria.builder()
                .nombre("Antibióticos y Antimicrobianos")
                .descripcion("Fármacos antibacterianos bajo estricta prescripción médica")
                .activo(true)
                .build());

        Categoria catAntiinflamatorios = categoriaRepository.save(Categoria.builder()
                .nombre("Antiinflamatorios")
                .descripcion("Medicamentos no esteroideos (AINEs) para inflamación y dolor articular")
                .activo(true)
                .build());

        Categoria catAntihistaminicos = categoriaRepository.save(Categoria.builder()
                .nombre("Antihistamínicos")
                .descripcion("Tratamiento de reacciones alérgicas, rinitis y urticaria")
                .activo(true)
                .build());

        Categoria catGastro = categoriaRepository.save(Categoria.builder()
                .nombre("Gastrointestinales")
                .descripcion("Antiácidos, inhibidores de bomba de protones y protectores gástricos")
                .activo(true)
                .build());

        Categoria catVitaminas = categoriaRepository.save(Categoria.builder()
                .nombre("Vitaminas y Suplementos")
                .descripcion("Complejos vitamínicos, minerales y suplementación nutricional")
                .activo(true)
                .build());

        // 2. Productos
        List<Producto> productos = Arrays.asList(
                Producto.builder()
                        .codigoBarras("7750123456781")
                        .nombre("Paracetamol 500mg Forte")
                        .descripcion("Caja con 100 tabletas para alivio rápido de dolor de cabeza y fiebre")
                        .principioActivo("Paracetamol")
                        .presentacion("Tabletas 500mg")
                        .laboratorio("Genfar")
                        .lote("LOT-2026-A1")
                        .precioCompra(0.12)
                        .precioVenta(0.50)
                        .stock(180)
                        .stockMinimo(25)
                        .fechaCaducidad(LocalDate.now().plusMonths(18))
                        .requiereReceta(false)
                        .activo(true)
                        .categoria(catAnalgesicos)
                        .build(),

                Producto.builder()
                        .codigoBarras("7750123456782")
                        .nombre("Amoxicilina + Clavulánico 500/125mg")
                        .descripcion("Tratamiento de infecciones bacterianas de vías respiratorias")
                        .principioActivo("Amoxicilina / Ácido Clavulánico")
                        .presentacion("Caja x 14 tabletas recubiertas")
                        .laboratorio("Medifarma")
                        .lote("LOT-2026-B4")
                        .precioCompra(18.50)
                        .precioVenta(32.00)
                        .stock(45)
                        .stockMinimo(15)
                        .fechaCaducidad(LocalDate.now().plusMonths(14))
                        .requiereReceta(true)
                        .activo(true)
                        .categoria(catAntibioticos)
                        .build(),

                Producto.builder()
                        .codigoBarras("7750123456783")
                        .nombre("Ibuprofeno 400mg Cápsulas")
                        .descripcion("Cápsulas blandas de rápida absorción para inflamación muscular y dolor")
                        .principioActivo("Ibuprofeno")
                        .presentacion("Blíster x 10 cápsulas blandas")
                        .laboratorio("Bayer")
                        .lote("LOT-2026-C2")
                        .precioCompra(0.35)
                        .precioVenta(1.20)
                        .stock(120)
                        .stockMinimo(20)
                        .fechaCaducidad(LocalDate.now().plusMonths(24))
                        .requiereReceta(false)
                        .activo(true)
                        .categoria(catAntiinflamatorios)
                        .build(),

                Producto.builder()
                        .codigoBarras("7750123456784")
                        .nombre("Loratadina 10mg")
                        .descripcion("Antialérgico no sedante para rinitis y conjuntivitis alérgica")
                        .principioActivo("Loratadina")
                        .presentacion("Caja x 30 tabletas")
                        .laboratorio("Portugal")
                        .lote("LOT-2026-D8")
                        .precioCompra(4.20)
                        .precioVenta(9.50)
                        .stock(80)
                        .stockMinimo(15)
                        .fechaCaducidad(LocalDate.now().plusMonths(20))
                        .requiereReceta(false)
                        .activo(true)
                        .categoria(catAntihistaminicos)
                        .build(),

                Producto.builder()
                        .codigoBarras("7750123456785")
                        .nombre("Omeprazol 20mg Cápsulas")
                        .descripcion("Protector de mucosa gástrica y tratamiento de gastritis o reflujo")
                        .principioActivo("Omeprazol")
                        .presentacion("Frasco x 30 cápsulas")
                        .laboratorio("Genfar")
                        .lote("LOT-2026-E5")
                        .precioCompra(3.80)
                        .precioVenta(8.50)
                        .stock(95)
                        .stockMinimo(20)
                        .fechaCaducidad(LocalDate.now().plusMonths(16))
                        .requiereReceta(false)
                        .activo(true)
                        .categoria(catGastro)
                        .build(),

                Producto.builder()
                        .codigoBarras("7750123456786")
                        .nombre("Azitromicina 500mg")
                        .descripcion("Antibiótico macrólido de amplio espectro para infecciones respiratorias")
                        .principioActivo("Azitromicina")
                        .presentacion("Caja x 3 tabletas")
                        .laboratorio("Bagó")
                        .lote("LOT-2026-F9")
                        .precioCompra(9.00)
                        .precioVenta(18.00)
                        .stock(60)
                        .stockMinimo(15)
                        .fechaCaducidad(LocalDate.now().plusMonths(12))
                        .requiereReceta(true)
                        .activo(true)
                        .categoria(catAntibioticos)
                        .build(),

                Producto.builder()
                        .codigoBarras("7750123456787")
                        .nombre("Vitamina C 1g Efervescente")
                        .descripcion("Suplemento de ácido ascórbico con sabor a naranja para defensas")
                        .principioActivo("Ácido Ascórbico 1000mg")
                        .presentacion("Tubo x 10 tabletas efervescentes")
                        .laboratorio("Bayer")
                        .lote("LOT-2026-G3")
                        .precioCompra(8.50)
                        .precioVenta(16.50)
                        .stock(75)
                        .stockMinimo(15)
                        .fechaCaducidad(LocalDate.now().plusMonths(22))
                        .requiereReceta(false)
                        .activo(true)
                        .categoria(catVitaminas)
                        .build(),

                Producto.builder()
                        .codigoBarras("7750123456788")
                        .nombre("Ceftriaxona 1g Inyectable")
                        .descripcion("Cefalosporina de 3ra generación para infecciones bacterianas severas")
                        .principioActivo("Ceftriaxona Sódica")
                        .presentacion("Vial polvo + ampolla diluyente")
                        .laboratorio("Medifarma")
                        .lote("LOT-2026-H7")
                        .precioCompra(12.00)
                        .precioVenta(24.00)
                        .stock(30)
                        .stockMinimo(10)
                        .fechaCaducidad(LocalDate.now().plusMonths(15))
                        .requiereReceta(true)
                        .activo(true)
                        .categoria(catAntibioticos)
                        .build()
        );

        productoRepository.saveAll(productos);
        log.info("Catálogo de {} productos registrado correctamente.", productos.size());
    }

    private void inicializarClientes() {
        if (clienteRepository.count() > 0) {
            return;
        }

        log.info("Sembrando clientes iniciales...");

        List<Cliente> clientes = Arrays.asList(
                Cliente.builder()
                        .dniRuc("45678912")
                        .nombreCompleto("Carlos Morales Mendoza")
                        .direccion("Av. José Pardo 450, Miraflores")
                        .telefono("987654321")
                        .email("cmorales@gmail.com")
                        .tipoCliente(TipoCliente.BENEFICIARIO)
                        .esClienteAmigo(true)
                        .numeroClienteAmigo("CA-10025")
                        .porcentajeDescuento(10.0)
                        .puntosFidelidad(140)
                        .activo(true)
                        .build(),

                Cliente.builder()
                        .dniRuc("71234567")
                        .nombreCompleto("Valeria Bendezú Huamán")
                        .direccion("Jr. Los Sauces 280, San Isidro")
                        .telefono("976543210")
                        .email("valeria.bendezu@gmail.com")
                        .tipoCliente(TipoCliente.BENEFICIARIO)
                        .esClienteAmigo(true)
                        .numeroClienteAmigo("CA-10026")
                        .porcentajeDescuento(10.0)
                        .puntosFidelidad(85)
                        .activo(true)
                        .build(),

                Cliente.builder()
                        .dniRuc("10456789")
                        .nombreCompleto("Jorge Luis Quispe")
                        .direccion("Calle Las Flores 112, Lince")
                        .telefono("965432109")
                        .email("jorge.quispe@outlook.com")
                        .tipoCliente(TipoCliente.REGULAR)
                        .esClienteAmigo(false)
                        .porcentajeDescuento(0.0)
                        .puntosFidelidad(0)
                        .activo(true)
                        .build(),

                Cliente.builder()
                        .dniRuc("20601234567")
                        .nombreCompleto("Clínica Salud Integral S.A.C.")
                        .direccion("Av. Javier Prado Este 2450, San Borja")
                        .telefono("014228990")
                        .email("adquisiciones@saludintegral.pe")
                        .tipoCliente(TipoCliente.BENEFICIARIO)
                        .esClienteAmigo(true)
                        .numeroClienteAmigo("CA-90001")
                        .porcentajeDescuento(15.0)
                        .puntosFidelidad(420)
                        .activo(true)
                        .build()
        );

        clienteRepository.saveAll(clientes);
        log.info("{} clientes registrados exitosamente.", clientes.size());
    }

    private void inicializarVentasHistoricas() {
        if (ventaRepository.count() > 0) {
            return;
        }

        log.info("Generando transacciones históricas de prueba para reportes y curvas de ventas...");

        List<Producto> productos = productoRepository.findAll();
        List<Cliente> clientes = clienteRepository.findAll();

        if (productos.isEmpty() || clientes.isEmpty()) {
            return;
        }

        Producto paracetamol = productos.stream().filter(p -> p.getNombre().contains("Paracetamol")).findFirst().orElse(productos.get(0));
        Producto ibuprofeno = productos.stream().filter(p -> p.getNombre().contains("Ibuprofeno")).findFirst().orElse(productos.get(0));
        Producto omeprazol = productos.stream().filter(p -> p.getNombre().contains("Omeprazol")).findFirst().orElse(productos.get(0));
        Producto amoxicilina = productos.stream().filter(p -> p.getNombre().contains("Amoxicilina")).findFirst().orElse(productos.get(0));

        Cliente clienteAmigo = clientes.stream().filter(Cliente::isEsClienteAmigo).findFirst().orElse(clientes.get(0));
        Cliente clienteRegular = clientes.stream().filter(c -> !c.isEsClienteAmigo()).findFirst().orElse(clientes.get(0));

        // 1. Venta de hace 4 días
        crearVentaHistorica(clienteAmigo, LocalDateTime.now().minusDays(4).withHour(10).withMinute(30),
                Arrays.asList(
                        new DetalleItem(paracetamol, 10, paracetamol.getPrecioVenta()),
                        new DetalleItem(ibuprofeno, 6, ibuprofeno.getPrecioVenta())
                ), "REC-2026-00001");

        // 2. Venta de hace 3 días
        crearVentaHistorica(clienteRegular, LocalDateTime.now().minusDays(3).withHour(15).withMinute(45),
                Arrays.asList(
                        new DetalleItem(omeprazol, 2, omeprazol.getPrecioVenta()),
                        new DetalleItem(paracetamol, 8, paracetamol.getPrecioVenta())
                ), "REC-2026-00002");

        // 3. Venta de hace 2 días (bajo receta)
        crearVentaHistorica(clienteAmigo, LocalDateTime.now().minusDays(2).withHour(11).withMinute(15),
                Arrays.asList(
                        new DetalleItem(amoxicilina, 1, amoxicilina.getPrecioVenta()),
                        new DetalleItem(ibuprofeno, 4, ibuprofeno.getPrecioVenta())
                ), "REC-2026-00003");

        // 4. Venta de ayer
        crearVentaHistorica(clienteRegular, LocalDateTime.now().minusDays(1).withHour(18).withMinute(20),
                Arrays.asList(
                        new DetalleItem(paracetamol, 15, paracetamol.getPrecioVenta()),
                        new DetalleItem(omeprazol, 1, omeprazol.getPrecioVenta())
                ), "REC-2026-00004");

        // 5. Venta de hoy
        crearVentaHistorica(clienteAmigo, LocalDateTime.now().withHour(9).withMinute(10),
                Arrays.asList(
                        new DetalleItem(amoxicilina, 2, amoxicilina.getPrecioVenta()),
                        new DetalleItem(paracetamol, 12, paracetamol.getPrecioVenta()),
                        new DetalleItem(ibuprofeno, 5, ibuprofeno.getPrecioVenta())
                ), "REC-2026-00005");

        log.info("Ventas y recibos históricos creados satisfactoriamente.");
    }

    private void crearVentaHistorica(Cliente cliente, LocalDateTime fecha, List<DetalleItem> items, String codigoRecibo) {
        double subtotal = 0.0;
        boolean requiereReceta = false;

        Venta venta = Venta.builder()
                .fechaVenta(fecha)
                .cliente(cliente)
                .descuentoTotal(0.0)
                .build();

        for (DetalleItem item : items) {
            double sub = item.cantidad * item.precioUnitario;
            subtotal += sub;
            if (Boolean.TRUE.equals(item.producto.getRequiereReceta())) {
                requiereReceta = true;
            }

            DetalleVenta det = DetalleVenta.builder()
                    .producto(item.producto)
                    .cantidad(item.cantidad)
                    .precioUnitario(item.precioUnitario)
                    .subtotalItem(sub)
                    .build();
            venta.addDetalle(det);

            // Descontar stock
            if (item.producto.getStock() != null && item.producto.getStock() >= item.cantidad) {
                item.producto.setStock(item.producto.getStock() - item.cantidad);
                productoRepository.save(item.producto);
            }
        }

        double descuento = 0.0;
        if (cliente != null && cliente.isEsClienteAmigo() && cliente.getPorcentajeDescuento() != null) {
            descuento = subtotal * (cliente.getPorcentajeDescuento() / 100.0);
        }

        double baseImponible = subtotal - descuento;
        double igv = baseImponible * 0.18;
        double total = baseImponible + igv;

        venta.setSubtotal(Math.round(subtotal * 100.0) / 100.0);
        venta.setDescuentoTotal(Math.round(descuento * 100.0) / 100.0);
        venta.setIgv(Math.round(igv * 100.0) / 100.0);
        venta.setTotal(Math.round(total * 100.0) / 100.0);
        venta.setRequiereReceta(requiereReceta);

        Venta ventaGuardada = ventaRepository.save(venta);

        Recibo recibo = Recibo.builder()
                .codigoComprobante(codigoRecibo)
                .fechaEmision(fecha)
                .venta(ventaGuardada)
                .totalPagado(ventaGuardada.getTotal())
                .build();
        reciboRepository.save(recibo);
    }

    private static class DetalleItem {
        Producto producto;
        int cantidad;
        double precioUnitario;

        DetalleItem(Producto producto, int cantidad, double precioUnitario) {
            this.producto = producto;
            this.cantidad = cantidad;
            this.precioUnitario = precioUnitario;
        }
    }
}
