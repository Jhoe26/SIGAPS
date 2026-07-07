package pe.sigaps.tamizaje.dto;

import pe.sigaps.paciente.dto.PacienteResumenDto;
import pe.sigaps.profesional.dto.ProfesionalResumenDto;
import pe.sigaps.tamizaje.TipoDosaje;
import pe.sigaps.usuario.dto.UsuarioResumenDto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record TamizajeHbResponseDto(
        Long id,
        PacienteResumenDto paciente,
        UsuarioResumenDto registradoPor,
        ProfesionalResumenDto profesional,
        LocalDate fecha,
        Integer edadAnios,
        Integer edadMeses,
        Integer edadDias,
        String grupoEtario,
        TipoDosaje tipoDosaje,
        BigDecimal hbObservado,
        BigDecimal hbCorregido,
        String observaciones,
        boolean esHistorico,
        LocalDateTime createdAt
) {
}
