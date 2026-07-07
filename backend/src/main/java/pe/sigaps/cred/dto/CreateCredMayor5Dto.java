package pe.sigaps.cred.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import pe.sigaps.cred.DxNutricionalMayor5;
import pe.sigaps.cred.RiesgoNutricional;

import java.math.BigDecimal;
import java.time.LocalDate;

public record CreateCredMayor5Dto(
        @NotNull(message = "El paciente es obligatorio")
        Long pacienteId,

        Long profesionalId,

        @NotNull(message = "La fecha es obligatoria")
        LocalDate fecha,

        @Size(max = 20)
        String edadPuntual,

        Integer numControl,

        @NotNull(message = "El peso es obligatorio")
        BigDecimal peso,

        @NotNull(message = "La talla es obligatoria (en metros, para el cálculo del IMC)")
        BigDecimal talla,

        RiesgoNutricional riesgoNutricional,

        @NotNull(message = "El diagnóstico nutricional es obligatorio")
        DxNutricionalMayor5 dxNutricional,

        String observaciones
) {
}
