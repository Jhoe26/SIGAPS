package pe.sigaps.cred.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import pe.sigaps.cred.DxNutricionalMenor5;

import java.math.BigDecimal;
import java.time.LocalDate;

public record CreateCredMenor5Dto(
        @NotNull(message = "El paciente es obligatorio")
        Long pacienteId,

        Long profesionalId,

        @NotNull(message = "La fecha es obligatoria")
        LocalDate fecha,

        @Size(max = 20)
        String edadPuntual,

        Integer numControl,

        BigDecimal peso,

        BigDecimal talla,

        BigDecimal perimetroCefalico,

        @NotNull(message = "El diagnóstico nutricional es obligatorio")
        DxNutricionalMenor5 dxNutricional,

        Boolean lactanciaHasta6m,

        @Size(max = 50)
        String gradoRiesgo,

        String observaciones
) {
}
