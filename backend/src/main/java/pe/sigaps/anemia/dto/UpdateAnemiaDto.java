package pe.sigaps.anemia.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import pe.sigaps.anemia.DxAnemia;
import pe.sigaps.anemia.EstadoAnemia;
import pe.sigaps.anemia.TipoHierro;

import java.math.BigDecimal;
import java.time.LocalDate;

public record UpdateAnemiaDto(
        Long profesionalId,

        @NotNull(message = "La fecha de inicio es obligatoria")
        LocalDate fechaInicio,

        BigDecimal hbInicialObs,

        @NotNull(message = "El diagnóstico inicial es obligatorio")
        DxAnemia dxInicial,

        TipoHierro tipoHierro,

        @Size(max = 100)
        String dosisIndicada,

        @NotNull(message = "El estado es obligatorio")
        EstadoAnemia estado,

        String observaciones
) {
}
