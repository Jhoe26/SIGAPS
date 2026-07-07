package pe.sigaps.gestante.dto;

import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public record UpdateGestanteDto(
        Long profesionalId,

        @Size(max = 15)
        String telefono,

        LocalDate influenzaFecha,
        LocalDate dt1Fecha,
        LocalDate dt2Fecha,
        LocalDate dt3Fecha,
        LocalDate hepb1Fecha,
        LocalDate hepb2Fecha,
        LocalDate hepb3Fecha,
        LocalDate tdpaFecha,

        String observaciones
) {
}
