package pe.sigaps.pai.dto;

import pe.sigaps.catalogo.dto.VacunaCatalogoResponseDto;
import pe.sigaps.paciente.dto.PacienteResumenDto;
import pe.sigaps.pai.TipoAplicacion;
import pe.sigaps.profesional.dto.ProfesionalResumenDto;
import pe.sigaps.usuario.dto.UsuarioResumenDto;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record PaiResponseDto(
        Long id,
        PacienteResumenDto paciente,
        UsuarioResumenDto registradoPor,
        ProfesionalResumenDto profesional,
        VacunaCatalogoResponseDto vacuna,
        Integer numDosis,
        LocalDate fechaAplicacion,
        String lote,
        TipoAplicacion tipoAplicacion,
        String observaciones,
        boolean esHistorico,
        LocalDateTime createdAt
) {
}
