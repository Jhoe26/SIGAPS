package pe.sigaps.acreditado.dto;

import pe.sigaps.paciente.Sexo;

import java.time.LocalDate;

public record AcreditadoResponseDto(
        String dni,
        String apPaterno,
        String apMaterno,
        String nombres,
        LocalDate fechaNacimiento,
        Sexo sexo,
        String direccion,
        String distrito,
        String parentesco,
        String dniTitular,
        String codigoCas,
        String nombreCas
) {
}
