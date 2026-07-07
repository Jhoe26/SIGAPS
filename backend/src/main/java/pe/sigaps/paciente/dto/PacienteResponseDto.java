package pe.sigaps.paciente.dto;

import pe.sigaps.paciente.Sexo;
import pe.sigaps.paciente.TipoSeguro;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record PacienteResponseDto(
        Long id,
        String dni,
        String apPaterno,
        String apMaterno,
        String nombres,
        String nombreCompleto,
        LocalDate fechaNacimiento,
        int edadAnios,
        int edadMeses,
        int edadDias,
        Sexo sexo,
        String telefono,
        String direccion,
        String distrito,
        TipoSeguro tipoSeguro,
        boolean esHistorico,
        boolean activo,
        LocalDateTime createdAt
) {
}
