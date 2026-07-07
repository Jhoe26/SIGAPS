package pe.sigaps.cred.dto;

import pe.sigaps.cred.DxNutricionalMenor5;
import pe.sigaps.paciente.dto.PacienteResumenDto;
import pe.sigaps.profesional.dto.ProfesionalResumenDto;
import pe.sigaps.usuario.dto.UsuarioResumenDto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record CredMenor5ResponseDto(
        Long id,
        PacienteResumenDto paciente,
        UsuarioResumenDto registradoPor,
        ProfesionalResumenDto profesional,
        LocalDate fecha,
        String edadPuntual,
        Integer numControl,
        BigDecimal peso,
        BigDecimal talla,
        BigDecimal perimetroCefalico,
        DxNutricionalMenor5 dxNutricional,
        Boolean lactanciaHasta6m,
        String gradoRiesgo,
        String observaciones,
        boolean esHistorico,
        LocalDateTime createdAt
) {
}
