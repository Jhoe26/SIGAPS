package pe.sigaps.security;

import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pe.sigaps.centrosalud.CentroSaludService;
import pe.sigaps.centrosalud.dto.CentroSaludResumenDto;
import pe.sigaps.security.dto.LoginRequest;
import pe.sigaps.security.dto.LoginResponse;
import pe.sigaps.security.dto.UsuarioAuthDto;
import pe.sigaps.usuario.Usuario;
import pe.sigaps.usuario.UsuarioRepository;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AuthService {

    private final UsuarioRepository usuarioRepository;
    private final CentroSaludService centroSaludService;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    @Transactional
    public LoginResponse login(LoginRequest request) {
        Usuario usuario = buscarPorDniOCorreo(request.dni())
                .orElseThrow(() -> new BadCredentialsException("Credenciales inválidas"));

        if (usuario.isEsSistema() || !usuario.isActivo()
                || !passwordEncoder.matches(request.password(), usuario.getPasswordHash())) {
            throw new BadCredentialsException("Credenciales inválidas");
        }

        usuario.setUltimoAcceso(LocalDateTime.now());
        usuarioRepository.save(usuario);

        return construirRespuesta(usuario);
    }

    public LoginResponse refrescar(String refreshToken) {
        if (!jwtService.esTokenValido(refreshToken) || !jwtService.esRefreshToken(refreshToken)) {
            throw new BadCredentialsException("Refresh token inválido o expirado");
        }
        String dni = jwtService.extraerDni(refreshToken);
        Usuario usuario = usuarioRepository.findByDni(dni)
                .orElseThrow(() -> new BadCredentialsException("Usuario no encontrado"));
        if (!usuario.isActivo()) {
            throw new BadCredentialsException("Usuario inactivo");
        }
        return construirRespuesta(usuario);
    }

    public UsuarioAuthDto obtenerActual(String dni) {
        Usuario usuario = usuarioRepository.findByDni(dni)
                .orElseThrow(() -> new BadCredentialsException("Usuario no encontrado"));
        return mapUsuario(usuario);
    }

    private LoginResponse construirRespuesta(Usuario usuario) {
        String accessToken = jwtService.generarAccessToken(usuario);
        String refreshToken = jwtService.generarRefreshToken(usuario);
        return new LoginResponse(accessToken, refreshToken, mapUsuario(usuario));
    }

    private UsuarioAuthDto mapUsuario(Usuario usuario) {
        CentroSaludResumenDto centro = usuario.getCentroId() != null
                ? centroSaludService.obtenerResumen(usuario.getCentroId())
                : null;
        return new UsuarioAuthDto(usuario.getId(), usuario.getDni(), usuario.getNombreCompleto(),
                usuario.getTitulo(), usuario.getColegiatura(), usuario.getEmail(), usuario.getRol(), centro);
    }

    /**
     * Fase B: el login acepta tanto DNI (8 dígitos) como correo electrónico en el
     * mismo campo, para soportar el formulario rediseñado sin duplicar endpoints.
     */
    private Optional<Usuario> buscarPorDniOCorreo(String identificador) {
        if (identificador.contains("@")) {
            return usuarioRepository.findByEmail(identificador);
        }
        return usuarioRepository.findByDni(identificador);
    }
}
