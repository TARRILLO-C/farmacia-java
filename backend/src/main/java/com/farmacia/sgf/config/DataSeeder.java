package com.farmacia.sgf.config;

import com.farmacia.sgf.model.*;
import com.farmacia.sgf.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final CategoriaRepository categoriaRepository;
    private final ProductoRepository productoRepository;
    private final ClienteRepository clienteRepository;
    private final UsuarioRepository usuarioRepository;
    private final ProveedorRepository proveedorRepository;

    @Override
    public void run(String... args) throws Exception {
        // Seed Categorías
        if (categoriaRepository.count() == 0) {
            categoriaRepository.save(Categoria.builder().nombre("Analgésicos").descripcion("Alivio del dolor e inflamación").activo(true).build());
            categoriaRepository.save(Categoria.builder().nombre("Antibióticos").descripcion("Tratamiento de infecciones bacterianas").activo(true).build());
            categoriaRepository.save(Categoria.builder().nombre("Antihistamínicos").descripcion("Tratamiento de alergias").activo(true).build());
            categoriaRepository.save(Categoria.builder().nombre("Gastrointestinales").descripcion("Salud digestiva y antiácidos").activo(true).build());
            categoriaRepository.save(Categoria.builder().nombre("Vitaminas").descripcion("Suplementos vitamínicos y minerales").activo(true).build());
        }

        // Seed Proveedores
        if (proveedorRepository.count() == 0) {
            proveedorRepository.save(Proveedor.builder().ruc("20100018625").razonSocial("Laboratorios Bafar S.A.").contacto("Juan Pérez").telefono("987654321").email("ventas@bafar.pe").direccion("Av. Industrial 450, Lima").activo(true).build());
            proveedorRepository.save(Proveedor.builder().ruc("20501234567").razonSocial("Droguería Farmacéutica del Norte EIRL").contacto("Maria Gomez").telefono("912345678").email("contacto@farmanorte.pe").direccion("Calle Real 120, Chiclayo").activo(true).build());
        }

        // Seed Usuarios por defecto
        if (usuarioRepository.count() == 0) {
            usuarioRepository.save(Usuario.builder().nombre("Carlos").apellido("Tarrillo").username("admin").email("admin@farmacia.com").password("admin123").rol(RolUsuario.ADMIN).activo(true).build());
            usuarioRepository.save(Usuario.builder().nombre("Carlos").apellido("Vendedor").username("carlos").email("carlos@gmail.com").password("123456").rol(RolUsuario.CAJERO).activo(true).build());
        }

        // Seed Clientes por defecto
        if (clienteRepository.count() == 0) {
            clienteRepository.save(Cliente.builder().documentoIdentidad("74218934").tipoDocumento("DNI").nombre("Elena").apellido("Mendoza Paredes").tipoCliente(TipoCliente.BENEFICIARIO).esClienteAmigo(true).codigoClienteAmigo("CA-48291").activo(true).build());
            clienteRepository.save(Cliente.builder().documentoIdentidad("41982341").tipoDocumento("DNI").nombre("Carlos Manuel").apellido("Arroyo Vega").tipoCliente(TipoCliente.REGULAR).esClienteAmigo(true).codigoClienteAmigo("CA-10294").activo(true).build());
        }

        // Seed Productos
        if (productoRepository.count() == 0) {
            Categoria catAnalgesico = categoriaRepository.findAll().get(0);
            Proveedor provBafar = proveedorRepository.findAll().get(0);

            productoRepository.save(Producto.builder()
                    .codigo("7750123450012")
                    .nombre("Paracetamol 500mg Forte")
                    .principioActivo("Paracetamol")
                    .presentacion("Caja x 100 Tabletas")
                    .laboratorio("Bafar")
                    .precio(new BigDecimal("14.50"))
                    .precioCompra(new BigDecimal("8.00"))
                    .stock(145)
                    .stockMinimo(20)
                    .requiereReceta(false)
                    .activo(true)
                    .categoria(catAnalgesico)
                    .proveedor(provBafar)
                    .build());
        }
    }
}
