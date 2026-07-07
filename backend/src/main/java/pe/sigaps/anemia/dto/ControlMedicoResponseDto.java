package pe.sigaps.anemia.dto;

import pe.sigaps.usuario.dto.UsuarioResumenDto;

import java.time.LocalDate;

public record ControlMedicoResponseDto(
        UsuarioResumenDto registradoPor,
        LocalDate fecha,
        String observaciones
) {
    public static final ControlMedicoResponseDto VACIO = new ControlMedicoResponseDto(null, null, null);
}
