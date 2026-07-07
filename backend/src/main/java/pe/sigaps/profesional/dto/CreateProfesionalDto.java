package pe.sigaps.profesional.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record CreateProfesionalDto(
        @NotBlank(message = "El DNI es obligatorio")
        @Pattern(regexp = "\\d{8}", message = "El DNI debe tener 8 dígitos")
        String dni,

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

        Long centroId
) {
}
