package pe.sigaps.sistema.dto;

import java.time.LocalDateTime;

public record SistemaInfoDto(
        String version,
        String baseDatos,
        String entorno,
        LocalDateTime ultimaActualizacion
) {
}
