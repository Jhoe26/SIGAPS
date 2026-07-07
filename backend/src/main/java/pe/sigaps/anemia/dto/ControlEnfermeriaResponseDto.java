package pe.sigaps.anemia.dto;

import pe.sigaps.usuario.dto.UsuarioResumenDto;

import java.math.BigDecimal;
import java.time.LocalDate;

public record ControlEnfermeriaResponseDto(
        UsuarioResumenDto registradoPor,
        LocalDate fecha,
        BigDecimal hbObservado,
        BigDecimal hbCorregido
) {
    public static final ControlEnfermeriaResponseDto VACIO =
            new ControlEnfermeriaResponseDto(null, null, null, null);
}
