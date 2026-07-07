package pe.sigaps.gestante.dto;

import pe.sigaps.paciente.dto.PacienteResumenDto;
import pe.sigaps.profesional.dto.ProfesionalResumenDto;
import pe.sigaps.usuario.dto.UsuarioResumenDto;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record GestanteResponseDto(
        Long id,
        PacienteResumenDto paciente,
        UsuarioResumenDto registradoPor,
        ProfesionalResumenDto profesional,
        String telefono,
        LocalDate influenzaFecha,
        LocalDate dt1Fecha,
        LocalDate dt2Fecha,
        LocalDate dt3Fecha,
        LocalDate hepb1Fecha,
        LocalDate hepb2Fecha,
        LocalDate hepb3Fecha,
        LocalDate tdpaFecha,
        String observaciones,
        boolean esHistorico,
        LocalDateTime createdAt
) {
}
