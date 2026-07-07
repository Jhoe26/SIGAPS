package pe.sigaps.security.dto;

public record LoginResponse(
        String accessToken,
        String refreshToken,
        UsuarioAuthDto user
) {
}
