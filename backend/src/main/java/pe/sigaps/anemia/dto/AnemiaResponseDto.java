package pe.sigaps.anemia.dto;

import pe.sigaps.anemia.DxAnemia;
import pe.sigaps.anemia.EstadoAnemia;
import pe.sigaps.anemia.TipoHierro;
import pe.sigaps.paciente.dto.PacienteResumenDto;
import pe.sigaps.profesional.dto.ProfesionalResumenDto;
import pe.sigaps.usuario.dto.UsuarioResumenDto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record AnemiaResponseDto(
        Long id,
        PacienteResumenDto paciente,
        UsuarioResumenDto registradoPor,
        ProfesionalResumenDto profesional,
        LocalDate fechaInicio,
        BigDecimal hbInicialObs,
        BigDecimal hbInicialCorr,
        DxAnemia dxInicial,
        TipoHierro tipoHierro,
        String dosisIndicada,
        ControlEnfermeriaResponseDto control1Enfermeria,
        ControlMedicoResponseDto control1Medico,
        ControlEnfermeriaResponseDto control2Enfermeria,
        ControlMedicoResponseDto control2Medico,
        ControlEnfermeriaResponseDto control3Enfermeria,
        EstadoAnemia estado,
        String observaciones,
        boolean esHistorico,
        LocalDateTime createdAt
) {
}
