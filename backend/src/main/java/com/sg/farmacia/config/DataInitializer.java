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

    private final RoleRepository roleRepository;
    private final MetodoPagoRepository metodoPagoRepository;
    private final CategoriaRepository categoriaRepository;
    private final LaboratorioRepository laboratorioRepository;
    private final PrincipioActivoRepository principioActivoRepository;
    private final PresentacionRepository presentacionRepository;
    private final ProveedorRepository proveedorRepository;
    private final EmpleadoRepository empleadoRepository;
    private final UsuarioRepository usuarioRepository;
    private final ClienteRepository clienteRepository;
    private final FidelizacionCrmRepository fidelizacionRepository;
    private final ProductoRepository productoRepository;
    private final LoteInventarioRepository loteRepository;
    private final CompraRepository compraRepository;
    private final VentaRepository ventaRepository;
    private final ReciboRepository reciboRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        log.info("Inicializando catálogo base y sembrado del sistema de farmacia...");
        inicializarRoles();
        inicializarMetodosPago();
        inicializarMicroCatalogos();
        inicializarPersonalYUsuarios();
        inicializarProveedores();
        inicializarClientesYFidelizacion();
        inicializarProductosYLotes();
        inicializarComprasHistoricas();
        inicializarVentasHistoricas();
        log.info("Sembrado de datos finalizado exitosamente.");
    }

    private void inicializarRoles() {
        crearRolSiNoExiste("ADMIN", "Administrador global del sistema");
        crearRolSiNoExiste("FARMACEUTICO", "Supervisión técnica, inventario y dispensación");
        crearRolSiNoExiste("CAJERO", "Operador de punto de venta en mostrador");
    }

    private void crearRolSiNoExiste(String nombre, String desc) {
        if (!roleRepository.existsByNombre(nombre)) {
            roleRepository.save(Role.builder().nombre(nombre).descripcion(desc).build());
        }
    }

    private void inicializarMetodosPago() {
        crearMetodoPagoSiNoExiste("Efectivo");
        crearMetodoPagoSiNoExiste("Tarjeta de Crédito/Débito");
        crearMetodoPagoSiNoExiste("Yape");
        crearMetodoPagoSiNoExiste("Plin");
    }

    private void crearMetodoPagoSiNoExiste(String nombre) {
        if (!metodoPagoRepository.existsByNombre(nombre)) {
            metodoPagoRepository.save(MetodoPago.builder().nombre(nombre).activo(true).build());
        }
    }

    private void inicializarMicroCatalogos() {
        // 1. Categorías
        if (categoriaRepository.count() == 0) {
            categoriaRepository.saveAll(Arrays.asList(
                    Categoria.builder().nombre("Analgésicos y Antipiréticos").descripcion("Medicamentos para el alivio del dolor y fiebre").activo(true).build(),
                    Categoria.builder().nombre("Antibióticos y Antimicrobianos").descripcion("Fármacos bajo estricta prescripción médica").activo(true).build(),
                    Categoria.builder().nombre("Antiinflamatorios").descripcion("Medicamentos no esteroideos (AINEs)").activo(true).build(),
                    Categoria.builder().nombre("Antihistamínicos").descripcion("Tratamiento de reacciones alérgicas").activo(true).build(),
                    Categoria.builder().nombre("Gastrointestinales").descripcion("Antiácidos y protectores gástricos").activo(true).build(),
                    Categoria.builder().nombre("Vitaminas y Suplementos").descripcion("Complejos nutricionales y multivitamínicos").activo(true).build()
            ));
        }

        // 2. Presentaciones
        if (presentacionRepository.count() == 0) {
            presentacionRepository.saveAll(Arrays.asList(
                    Presentacion.builder().nombre("Tableta").build(),
                    Presentacion.builder().nombre("Jarabe").build(),
                    Presentacion.builder().nombre("Ampolla").build(),
                    Presentacion.builder().nombre("Cápsula Blanda").build()
            ));
        }

        // 3. Laboratorios
        if (laboratorioRepository.count() == 0) {
            laboratorioRepository.saveAll(Arrays.asList(
                    Laboratorio.builder().nombre("Genfar").paisOrigen("Colombia").activo(true).build(),
                    Laboratorio.builder().nombre("Medifarma").paisOrigen("Perú").activo(true).build(),
                    Laboratorio.builder().nombre("Bayer").paisOrigen("Alemania").activo(true).build(),
                    Laboratorio.builder().nombre("Portugal").paisOrigen("Perú").activo(true).build(),
                    Laboratorio.builder().nombre("Bagó").paisOrigen("Argentina").activo(true).build()
            ));
        }

        // 4. Principios Activos
        if (principioActivoRepository.count() == 0) {
            principioActivoRepository.saveAll(Arrays.asList(
                    PrincipioActivo.builder().nombre("Paracetamol").descripcion("Analgésico y antipirético").build(),
                    PrincipioActivo.builder().nombre("Amoxicilina / Ácido Clavulánico").descripcion("Antibiótico betalactámico").build(),
                    PrincipioActivo.builder().nombre("Ibuprofeno").descripcion("Antiinflamatorio no esteroideo").build(),
                    PrincipioActivo.builder().nombre("Loratadina").descripcion("Antihistamínico H1 no sedante").build(),
                    PrincipioActivo.builder().nombre("Omeprazol").descripcion("Inhibidor de bomba de protones").build()
            ));
        }
    }

    private void inicializarPersonalYUsuarios() {
        Role rolAdmin = roleRepository.findByNombre("ADMIN").orElseThrow();
        Role rolFarma = roleRepository.findByNombre("FARMACEUTICO").orElseThrow();
        Role rolCajero = roleRepository.findByNombre("CAJERO").orElseThrow();

        // 1. Admin
        if (!usuarioRepository.existsByUsername("admin")) {
            Empleado empAdmin = empleadoRepository.findByDni("70000001").orElseGet(() ->
                    empleadoRepository.save(Empleado.builder()
                            .dni("70000001")
                            .nombres("Juan")
                            .apellidos("Pérez Administrador")
                            .telefono("987654321")
                            .activo(true)
                            .build()));

            Usuario admin = Usuario.builder()
                    .username("admin")
                    .email("admin@farmacia.pe")
                    .passwordHash(passwordEncoder.encode("admin123"))
                    .empleado(empAdmin)
                    .rol(rolAdmin)
                    .activo(true)
                    .build();
            usuarioRepository.save(admin);
            log.info("Usuario 'admin' creado exitosamente (pass: admin123)");
        }

        // 2. Farmacéutico
        if (!usuarioRepository.existsByUsername("farmaceutico")) {
            Empleado empFarma = empleadoRepository.findByDni("70000002").orElseGet(() ->
                    empleadoRepository.save(Empleado.builder()
                            .dni("70000002")
                            .nombres("María")
                            .apellidos("López Farmacéutica")
                            .telefono("987654322")
                            .activo(true)
                            .build()));

            Usuario farma = Usuario.builder()
                    .username("farmaceutico")
                    .email("farma@farmacia.pe")
                    .passwordHash(passwordEncoder.encode("farma123"))
                    .empleado(empFarma)
                    .rol(rolFarma)
                    .activo(true)
                    .build();
            usuarioRepository.save(farma);
            log.info("Usuario 'farmaceutico' creado exitosamente (pass: farma123)");
        }

        // 3. Cajero
        if (!usuarioRepository.existsByUsername("cajero")) {
            Empleado empCajero = empleadoRepository.findByDni("70000003").orElseGet(() ->
                    empleadoRepository.save(Empleado.builder()
                            .dni("70000003")
                            .nombres("Pedro")
                            .apellidos("Gómez Cajero")
                            .telefono("987654323")
                            .activo(true)
                            .build()));

            Usuario cajero = Usuario.builder()
                    .username("cajero")
                    .email("cajero@farmacia.pe")
                    .passwordHash(passwordEncoder.encode("cajero123"))
                    .empleado(empCajero)
                    .rol(rolCajero)
                    .activo(true)
                    .build();
            usuarioRepository.save(cajero);
            log.info("Usuario 'cajero' creado exitosamente (pass: cajero123)");
        }
    }

    private void inicializarProveedores() {
        if (proveedorRepository.count() == 0) {
            proveedorRepository.saveAll(Arrays.asList(
                    Proveedor.builder()
                            .ruc("20100123456")
                            .razonSocial("Droguería y Distribuidora Continental S.A.C.")
                            .contacto("Ing. Roberto Silva")
                            .telefono("014332211")
                            .email("ventas@continental.com.pe")
                            .activo(true)
                            .build(),
                    Proveedor.builder()
                            .ruc("20501234567")
                            .razonSocial("Farmacéutica Panamericana S.A.")
                            .contacto("Lic. Lucía Torres")
                            .telefono("015443322")
                            .email("contacto@panamericana.pe")
                            .activo(true)
                            .build()
            ));
        }
    }

    private void inicializarClientesYFidelizacion() {
        if (clienteRepository.count() > 0) return;

        // Cliente 1 - Amigo
        Cliente c1 = clienteRepository.save(Cliente.builder()
                .tipoDocumento("DNI")
                .numeroDocumento("45678912")
                .nombreCompleto("Carlos Morales Mendoza")
                .direccion("Av. José Pardo 450, Miraflores")
                .telefono("987654321")
                .email("cmorales@gmail.com")
                .activo(true)
                .build());

        fidelizacionRepository.save(FidelizacionCrm.builder()
                .cliente(c1)
                .codigoAfiliado("CA-10025")
                .estadoMembresia("ACTIVO")
                .porcentajeDescuento(10.0)
                .puntosAcumulados(140)
                .fechaAfiliacion(LocalDate.now().minusMonths(6))
                .build());

        // Cliente 2 - Amigo
        Cliente c2 = clienteRepository.save(Cliente.builder()
                .tipoDocumento("DNI")
                .numeroDocumento("71234567")
                .nombreCompleto("Valeria Bendezú Huamán")
                .direccion("Jr. Los Sauces 280, San Isidro")
                .telefono("976543210")
                .email("valeria.bendezu@gmail.com")
                .activo(true)
                .build());

        fidelizacionRepository.save(FidelizacionCrm.builder()
                .cliente(c2)
                .codigoAfiliado("CA-10026")
                .estadoMembresia("ACTIVO")
                .porcentajeDescuento(10.0)
                .puntosAcumulados(85)
                .fechaAfiliacion(LocalDate.now().minusMonths(4))
                .build());

        // Cliente 3 - Regular
        clienteRepository.save(Cliente.builder()
                .tipoDocumento("DNI")
                .numeroDocumento("10456789")
                .nombreCompleto("Jorge Luis Quispe")
                .direccion("Calle Las Flores 112, Lince")
                .telefono("965432109")
                .email("jorge.quispe@outlook.com")
                .activo(true)
                .build());

        // Cliente 4 - Empresa RUC
        Cliente c4 = clienteRepository.save(Cliente.builder()
                .tipoDocumento("RUC")
                .numeroDocumento("20601234567")
                .nombreCompleto("Clínica Salud Integral S.A.C.")
                .direccion("Av. Javier Prado Este 2450, San Borja")
                .telefono("014228990")
                .email("adquisiciones@saludintegral.pe")
                .activo(true)
                .build());

        fidelizacionRepository.save(FidelizacionCrm.builder()
                .cliente(c4)
                .codigoAfiliado("CA-90001")
                .estadoMembresia("ACTIVO")
                .porcentajeDescuento(15.0)
                .puntosAcumulados(420)
                .fechaAfiliacion(LocalDate.now().minusMonths(10))
                .build());
    }

    private void inicializarProductosYLotes() {
        if (productoRepository.count() > 0) return;

        Categoria catAnalgesicos = categoriaRepository.findAll().stream().filter(c -> c.getNombre().contains("Analgésicos")).findFirst().orElseThrow();
        Categoria catAntibioticos = categoriaRepository.findAll().stream().filter(c -> c.getNombre().contains("Antibióticos")).findFirst().orElseThrow();
        Categoria catAntiinflamatorios = categoriaRepository.findAll().stream().filter(c -> c.getNombre().contains("Antiinflamatorios")).findFirst().orElseThrow();
        Categoria catAntihistaminicos = categoriaRepository.findAll().stream().filter(c -> c.getNombre().contains("Antihistamínicos")).findFirst().orElseThrow();
        Categoria catGastro = categoriaRepository.findAll().stream().filter(c -> c.getNombre().contains("Gastrointestinales")).findFirst().orElseThrow();

        Laboratorio labGenfar = laboratorioRepository.findByNombre("Genfar").orElse(null);
        Laboratorio labMedifarma = laboratorioRepository.findByNombre("Medifarma").orElse(null);
        Laboratorio labBayer = laboratorioRepository.findByNombre("Bayer").orElse(null);
        Laboratorio labPortugal = laboratorioRepository.findByNombre("Portugal").orElse(null);

        PrincipioActivo paParacetamol = principioActivoRepository.findByNombre("Paracetamol").orElse(null);
        PrincipioActivo paAmoxicilina = principioActivoRepository.findByNombre("Amoxicilina / Ácido Clavulánico").orElse(null);
        PrincipioActivo paIbuprofeno = principioActivoRepository.findByNombre("Ibuprofeno").orElse(null);
        PrincipioActivo paLoratadina = principioActivoRepository.findByNombre("Loratadina").orElse(null);
        PrincipioActivo paOmeprazol = principioActivoRepository.findByNombre("Omeprazol").orElse(null);

        Presentacion presTableta = presentacionRepository.findByNombre("Tableta").orElse(null);
        Presentacion presCapsula = presentacionRepository.findByNombre("Cápsula Blanda").orElse(null);

        // 1. Paracetamol
        Producto p1 = productoRepository.save(Producto.builder()
                .codigo("7750123456781")
                .nombre("Paracetamol 500mg Forte")
                .descripcion("Caja con 100 tabletas para dolor y fiebre")
                .precioBaseVenta(0.50)
                .requiereReceta(false)
                .categoria(catAnalgesicos)
                .laboratorio(labGenfar)
                .principioActivo(paParacetamol)
                .presentacion(presTableta)
                .activo(true)
                .build());

        loteRepository.save(LoteInventario.builder()
                .producto(p1)
                .codigoLote("LOT-2026-A1")
                .fechaVencimiento(LocalDate.now().plusMonths(18))
                .stockActual(180)
                .stockMinimo(25)
                .precioCompra(0.12)
                .activo(true)
                .build());

        // 2. Amoxicilina
        Producto p2 = productoRepository.save(Producto.builder()
                .codigo("7750123456782")
                .nombre("Amoxicilina + Clavulánico 500/125mg")
                .descripcion("Tratamiento de infecciones respiratorias")
                .precioBaseVenta(32.00)
                .requiereReceta(true)
                .categoria(catAntibioticos)
                .laboratorio(labMedifarma)
                .principioActivo(paAmoxicilina)
                .presentacion(presTableta)
                .activo(true)
                .build());

        loteRepository.save(LoteInventario.builder()
                .producto(p2)
                .codigoLote("LOT-2026-B4")
                .fechaVencimiento(LocalDate.now().plusMonths(14))
                .stockActual(45)
                .stockMinimo(15)
                .precioCompra(18.50)
                .activo(true)
                .build());

        // 3. Ibuprofeno
        Producto p3 = productoRepository.save(Producto.builder()
                .codigo("7750123456783")
                .nombre("Ibuprofeno 400mg Cápsulas")
                .descripcion("Cápsulas blandas de rápida absorción")
                .precioBaseVenta(1.20)
                .requiereReceta(false)
                .categoria(catAntiinflamatorios)
                .laboratorio(labBayer)
                .principioActivo(paIbuprofeno)
                .presentacion(presCapsula)
                .activo(true)
                .build());

        loteRepository.save(LoteInventario.builder()
                .producto(p3)
                .codigoLote("LOT-2026-C2")
                .fechaVencimiento(LocalDate.now().plusMonths(24))
                .stockActual(120)
                .stockMinimo(20)
                .precioCompra(0.35)
                .activo(true)
                .build());

        // 4. Loratadina
        Producto p4 = productoRepository.save(Producto.builder()
                .codigo("7750123456784")
                .nombre("Loratadina 10mg")
                .descripcion("Antialérgico no sedante para rinitis")
                .precioBaseVenta(9.50)
                .requiereReceta(false)
                .categoria(catAntihistaminicos)
                .laboratorio(labPortugal)
                .principioActivo(paLoratadina)
                .presentacion(presTableta)
                .activo(true)
                .build());

        loteRepository.save(LoteInventario.builder()
                .producto(p4)
                .codigoLote("LOT-2026-D8")
                .fechaVencimiento(LocalDate.now().plusMonths(20))
                .stockActual(80)
                .stockMinimo(15)
                .precioCompra(4.20)
                .activo(true)
                .build());

        // 5. Omeprazol
        Producto p5 = productoRepository.save(Producto.builder()
                .codigo("7750123456785")
                .nombre("Omeprazol 20mg Cápsulas")
                .descripcion("Protector de mucosa gástrica y antiácido")
                .precioBaseVenta(8.50)
                .requiereReceta(false)
                .categoria(catGastro)
                .laboratorio(labGenfar)
                .principioActivo(paOmeprazol)
                .presentacion(presCapsula)
                .activo(true)
                .build());

        loteRepository.save(LoteInventario.builder()
                .producto(p5)
                .codigoLote("LOT-2026-E5")
                .fechaVencimiento(LocalDate.now().plusMonths(16))
                .stockActual(95)
                .stockMinimo(20)
                .precioCompra(3.80)
                .activo(true)
                .build());
    }

    private void inicializarComprasHistoricas() {
        if (compraRepository.count() > 0) return;

        Proveedor prov = proveedorRepository.findAll().stream().findFirst().orElse(null);
        Usuario usuario = usuarioRepository.findByUsername("admin").orElse(null);
        Producto paracetamol = productoRepository.findByCodigo("7750123456781").orElse(null);

        if (prov != null && usuario != null && paracetamol != null) {
            Compra compra = Compra.builder()
                    .proveedor(prov)
                    .usuario(usuario)
                    .numeroFactura("FAC-2026-00452")
                    .fechaCompra(LocalDateTime.now().minusDays(10))
                    .total(120.00)
                    .estado("COMPLETADA")
                    .build();

            DetalleCompra det = DetalleCompra.builder()
                    .compra(compra)
                    .producto(paracetamol)
                    .loteAsignado("LOT-2026-A1")
                    .fechaVencimiento(LocalDate.now().plusMonths(18))
                    .cantidad(1000)
                    .precioUnitario(0.12)
                    .subtotal(120.00)
                    .build();

            compra.addDetalle(det);
            compraRepository.save(compra);
        }
    }

    private void inicializarVentasHistoricas() {
        if (ventaRepository.count() > 0) return;

        Cliente clienteAmigo = clienteRepository.findByNumeroDocumento("45678912").orElse(null);
        Usuario cajero = usuarioRepository.findByUsername("cajero").orElseGet(() -> usuarioRepository.findAll().get(0));
        MetodoPago efectivo = metodoPagoRepository.findByNombre("Efectivo").orElseGet(() -> metodoPagoRepository.findAll().get(0));
        List<LoteInventario> lotes = loteRepository.findAll();

        if (clienteAmigo != null && !lotes.isEmpty()) {
            LoteInventario lote1 = lotes.get(0);
            double precio = lote1.getProducto().getPrecioBaseVenta();
            int cant = 4;
            double subtotal = precio * cant;
            double descuento = subtotal * 0.10; // 10% amigo
            double base = subtotal - descuento;
            double igv = Math.round(base * 0.18 * 100.0) / 100.0;
            double total = Math.round((base + igv) * 100.0) / 100.0;

            Venta venta = Venta.builder()
                    .numeroVenta("VTA-2026-000001")
                    .fecha(LocalDateTime.now().minusDays(1))
                    .cliente(clienteAmigo)
                    .usuario(cajero)
                    .metodoPago(efectivo)
                    .subtotal(subtotal)
                    .descuentoTotal(descuento)
                    .impuesto(igv)
                    .total(total)
                    .estado("COMPLETADA")
                    .observaciones("Venta inicial de prueba")
                    .detalles(new ArrayList<>())
                    .build();

            DetalleVenta det = DetalleVenta.builder()
                    .lote(lote1)
                    .cantidad(cant)
                    .precioUnitario(precio)
                    .descuento(descuento)
                    .subtotal(subtotal)
                    .build();

            venta.addDetalle(det);
            Venta guardada = ventaRepository.save(venta);

            Recibo recibo = Recibo.builder()
                    .numeroRecibo("B001-00000001")
                    .serie("B001")
                    .correlativo("00000001")
                    .tipoComprobante("BOLETA")
                    .fechaEmision(guardada.getFecha())
                    .montoSubtotal(subtotal)
                    .montoImpuesto(igv)
                    .montoDescuento(descuento)
                    .montoTotal(total)
                    .metodoPago(efectivo.getNombre())
                    .venta(guardada)
                    .clienteNombre(clienteAmigo.getNombreCompleto())
                    .clienteDocumento(clienteAmigo.getNumeroDocumento())
                    .clienteDireccion(clienteAmigo.getDireccion())
                    .build();

            reciboRepository.save(recibo);
        }
    }
}
