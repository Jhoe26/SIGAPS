package pe.sigaps.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import pe.sigaps.usuario.Rol;
import pe.sigaps.usuario.Usuario;
import pe.sigaps.usuario.UsuarioRepository;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        try {
            if (usuarioRepository.findByDni("12345678").isPresent()) {
                log.info("Admin user already exists, skipping creation");
                return;
            }
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
            log.info("Admin user created successfully (DNI: 12345678)");
        } catch (Exception e) {
            log.warn("Could not initialize admin user: {}", e.getMessage());
        }
    }
}
