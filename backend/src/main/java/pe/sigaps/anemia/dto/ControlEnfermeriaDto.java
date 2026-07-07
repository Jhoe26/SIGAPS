package pe.sigaps.anemia.dto;

import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDate;

public record ControlEnfermeriaDto(
        @NotNull(message = "La fecha del control es obligatoria")
        LocalDate fecha,

        @NotNull(message = "La Hb observada es obligatoria")
        BigDecimal hbObservado
) {
}
