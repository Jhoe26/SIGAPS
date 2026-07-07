package pe.sigaps.anemia.dto;

import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public record ControlMedicoDto(
        @NotNull(message = "La fecha del control es obligatoria")
        LocalDate fecha,

        String observaciones
) {
}
