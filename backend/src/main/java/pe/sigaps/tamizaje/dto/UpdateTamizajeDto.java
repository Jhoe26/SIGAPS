package pe.sigaps.tamizaje.dto;

import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import pe.sigaps.tamizaje.TipoDosaje;

import java.math.BigDecimal;
import java.time.LocalDate;

public record UpdateTamizajeDto(
        Long profesionalId,

        @NotNull(message = "La fecha es obligatoria")
        LocalDate fecha,

        @NotBlank(message = "El grupo etario es obligatorio")
        String grupoEtario,

        @NotNull(message = "El tipo de dosaje es obligatorio")
        TipoDosaje tipoDosaje,

        @Digits(integer = 2, fraction = 2, message = "La Hb observada debe tener máximo 2 decimales")
        BigDecimal hbObservado,

        String observaciones
) {
}
