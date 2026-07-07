package pe.sigaps.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;
import pe.sigaps.common.ApiResponse;

import java.io.IOException;
import java.nio.charset.StandardCharsets;

/**
 * Sin este entry point, Spring Security responde 403 por defecto ante peticiones sin
 * autenticar (no hay formLogin/httpBasic configurado). Lo forzamos a 401 para ser
 * consistentes con GlobalExceptionHandler, que reserva 403 para fallos de propiedad.
 */
@Component
@RequiredArgsConstructor
public class RestAuthenticationEntryPoint implements AuthenticationEntryPoint {

    private final ObjectMapper objectMapper;

    @Override
    public void commence(HttpServletRequest request, HttpServletResponse response,
                          AuthenticationException authException) throws IOException {
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding(StandardCharsets.UTF_8.name());
        response.getWriter().write(
                objectMapper.writeValueAsString(ApiResponse.error("No autenticado: se requiere un token válido")));
    }
}
