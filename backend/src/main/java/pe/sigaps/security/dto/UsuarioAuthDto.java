package pe.sigaps.security.dto;

import pe.sigaps.centrosalud.dto.CentroSaludResumenDto;
import pe.sigaps.usuario.Rol;

public record UsuarioAuthDto(
        Long id,
        String dni,
        String nombreCompleto,
        String titulo,
        String colegiatura,
        String email,
        Rol rol,
        CentroSaludResumenDto centro
) {
}
