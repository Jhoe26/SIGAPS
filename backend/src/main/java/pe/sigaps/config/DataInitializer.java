package pe.sigaps.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import pe.sigaps.usuario.Usuario;
import pe.sigaps.usuario.UsuarioRepository;
import pe.sigaps.usuario.Rol;

@Component
public class DataInitializer implements CommandLineRunner {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        // Crear usuario admin si no existe
        usuarioRepository.findByDni("12345678").ifPresentOrElse(
            existing -> {
                existing.setPasswordHash(passwordEncoder.encode("Admin1234"));
                existing.setRol(Rol.ADMIN);
                existing.setActivo(true);
                existing.setEsSistema(false);
                usuarioRepository.save(existing);
            },
            () -> {
                Usuario admin = new Usuario();
                admin.setDni("12345678");
                admin.setApPaterno("ADMINISTRADOR");
                admin.setApMaterno("SISTEMA");
                admin.setNombres("ADMIN");
                admin.setRol(Rol.ADMIN);
                admin.setActivo(true);
                admin.setEsSistema(false);
                admin.setPasswordHash(passwordEncoder.encode("Admin1234"));
                usuarioRepository.save(admin);
            }
        );
    }
}
