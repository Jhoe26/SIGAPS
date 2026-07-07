package pe.sigaps.paciente.dto;

import java.time.LocalDate;

/**
 * Vista ligera embebida en las respuestas de módulos clínicos para mostrar
 * el paciente (nombre, DNI, edad) sin duplicar toda la respuesta de /pacientes.
 */
public record PacienteResumenDto(
        Long id,
        String dni,
        String nombreCompleto,
        LocalDate fechaNacimiento
) {
}
