package pe.sigaps.profesional.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UpdateProfesionalDto(
        @NotBlank(message = "Los nombres son obligatorios")
        @Size(max = 80)
        String nombres,

        @NotBlank(message = "El apellido paterno es obligatorio")
        @Size(max = 60)
        String apPaterno,

        @NotBlank(message = "El apellido materno es obligatorio")
        @Size(max = 60)
        String apMaterno,

        @Size(max = 80)
        String especialidad,

        @Size(max = 20)
        String colegiatura,

        @Size(max = 20)
        String tipoColegio,

        Long centroId,

        boolean activo
) {
}
