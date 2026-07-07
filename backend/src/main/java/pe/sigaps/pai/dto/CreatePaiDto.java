package pe.sigaps.pai.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import pe.sigaps.pai.TipoAplicacion;

import java.time.LocalDate;

public record CreatePaiDto(
        @NotNull(message = "El paciente es obligatorio")
        Long pacienteId,

        Long profesionalId,

        @NotNull(message = "La vacuna es obligatoria")
        Long vacunaId,

        @NotNull(message = "El número de dosis es obligatorio")
        Integer numDosis,

        @NotNull(message = "La fecha de aplicación es obligatoria")
        LocalDate fechaAplicacion,

        @Size(max = 50)
        String lote,

        @NotNull(message = "El tipo de aplicación es obligatorio")
        TipoAplicacion tipoAplicacion,

        String observaciones
) {
}
