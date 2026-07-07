package pe.sigaps.paciente.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.Size;
import pe.sigaps.paciente.Sexo;
import pe.sigaps.paciente.TipoSeguro;

import java.time.LocalDate;

public record UpdatePacienteDto(
        @NotBlank(message = "El apellido paterno es obligatorio")
        @Size(max = 60)
        String apPaterno,

        @NotBlank(message = "El apellido materno es obligatorio")
        @Size(max = 60)
        String apMaterno,

        @NotBlank(message = "Los nombres son obligatorios")
        @Size(max = 80)
        String nombres,

        @NotNull(message = "La fecha de nacimiento es obligatoria")
        @Past(message = "La fecha de nacimiento debe ser anterior a hoy")
        LocalDate fechaNacimiento,

        @NotNull(message = "El sexo es obligatorio")
        Sexo sexo,

        @Size(max = 15)
        String telefono,

        @Size(max = 200)
        String direccion,

        @Size(max = 60)
        String distrito,

        TipoSeguro tipoSeguro
) {
}
