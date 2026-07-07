package pe.sigaps.cred.dto;

import pe.sigaps.cred.DxNutricionalMayor5;
import pe.sigaps.cred.RiesgoNutricional;
import pe.sigaps.paciente.dto.PacienteResumenDto;
import pe.sigaps.profesional.dto.ProfesionalResumenDto;
import pe.sigaps.usuario.dto.UsuarioResumenDto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record CredMayor5ResponseDto(
        Long id,
        PacienteResumenDto paciente,
        UsuarioResumenDto registradoPor,
        ProfesionalResumenDto profesional,
        LocalDate fecha,
        String edadPuntual,
        Integer numControl,
        BigDecimal peso,
        BigDecimal talla,
        BigDecimal imc,
        RiesgoNutricional riesgoNutricional,
        DxNutricionalMayor5 dxNutricional,
        String observaciones,
        boolean esHistorico,
        LocalDateTime createdAt
) {
}
