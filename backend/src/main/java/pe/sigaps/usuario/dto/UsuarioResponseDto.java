package pe.sigaps.usuario.dto;

import pe.sigaps.usuario.Rol;

import java.time.LocalDateTime;

public record UsuarioResponseDto(
        Long id,
        String dni,
        String apPaterno,
        String apMaterno,
        String nombres,
        String nombreCompleto,
        String colegiatura,
        String titulo,
        Rol rol,
        String email,
        String telefono,
        boolean activo,
        boolean esSistema,
        Long centroId,
        LocalDateTime ultimoAcceso,
        LocalDateTime createdAt
) {
}
