package pe.sigaps.anemia.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import pe.sigaps.anemia.AnemiaSeguimiento;
import pe.sigaps.anemia.dto.AnemiaResponseDto;
import pe.sigaps.anemia.dto.ControlEnfermeriaResponseDto;
import pe.sigaps.anemia.dto.ControlMedicoResponseDto;
import pe.sigaps.anemia.dto.CreateAnemiaDto;
import pe.sigaps.paciente.dto.PacienteResumenDto;
import pe.sigaps.profesional.dto.ProfesionalResumenDto;
import pe.sigaps.usuario.dto.UsuarioResumenDto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.function.Function;

@Mapper(componentModel = "spring")
public interface AnemiaSeguimientoMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "registradoPorId", ignore = true)
    @Mapping(target = "hbInicialCorr", ignore = true)
    @Mapping(target = "reg1EnfId", ignore = true)
    @Mapping(target = "fecha1Enf", ignore = true)
    @Mapping(target = "hb1Obs", ignore = true)
    @Mapping(target = "hb1Corr", ignore = true)
    @Mapping(target = "reg1MedId", ignore = true)
    @Mapping(target = "fecha1Med", ignore = true)
    @Mapping(target = "obs1Med", ignore = true)
    @Mapping(target = "reg2EnfId", ignore = true)
    @Mapping(target = "fecha2Enf", ignore = true)
    @Mapping(target = "hb2Obs", ignore = true)
    @Mapping(target = "hb2Corr", ignore = true)
    @Mapping(target = "reg2MedId", ignore = true)
    @Mapping(target = "fecha2Med", ignore = true)
    @Mapping(target = "obs2Med", ignore = true)
    @Mapping(target = "reg3EnfId", ignore = true)
    @Mapping(target = "fecha3Enf", ignore = true)
    @Mapping(target = "hb3Obs", ignore = true)
    @Mapping(target = "hb3Corr", ignore = true)
    @Mapping(target = "estado", ignore = true)
    @Mapping(target = "observaciones", ignore = true)
    @Mapping(target = "esHistorico", ignore = true)
    @Mapping(target = "fuenteOrigen", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    AnemiaSeguimiento toEntity(CreateAnemiaDto dto);

    default AnemiaResponseDto toResponseDto(AnemiaSeguimiento e, PacienteResumenDto paciente,
                                             UsuarioResumenDto registradoPor,
                                             ProfesionalResumenDto profesional,
                                             Function<Long, UsuarioResumenDto> resolverUsuario) {
        return new AnemiaResponseDto(
                e.getId(),
                paciente,
                registradoPor,
                profesional,
                e.getFechaInicio(),
                e.getHbInicialObs(),
                e.getHbInicialCorr(),
                e.getDxInicial(),
                e.getTipoHierro(),
                e.getDosisIndicada(),
                mapControlEnfermeria(resolverUsuario, e.getReg1EnfId(), e.getFecha1Enf(), e.getHb1Obs(), e.getHb1Corr()),
                mapControlMedico(resolverUsuario, e.getReg1MedId(), e.getFecha1Med(), e.getObs1Med()),
                mapControlEnfermeria(resolverUsuario, e.getReg2EnfId(), e.getFecha2Enf(), e.getHb2Obs(), e.getHb2Corr()),
                mapControlMedico(resolverUsuario, e.getReg2MedId(), e.getFecha2Med(), e.getObs2Med()),
                mapControlEnfermeria(resolverUsuario, e.getReg3EnfId(), e.getFecha3Enf(), e.getHb3Obs(), e.getHb3Corr()),
                e.getEstado(),
                e.getObservaciones(),
                e.isEsHistorico(),
                e.getCreatedAt()
        );
    }

    /** registradoPorId puede ser null en registros históricos migrados (el Excel no traía un
     * usuario real, solo un rol genérico como "LIC ENFERMERIA"), pero igual traen fecha/valores
     * reales -- por eso el gate es "hay algún dato", no solo "hay un usuario que lo registró". */
    private ControlEnfermeriaResponseDto mapControlEnfermeria(Function<Long, UsuarioResumenDto> resolverUsuario,
                                                               Long registradoPorId, LocalDate fecha,
                                                               BigDecimal hbObservado, BigDecimal hbCorregido) {
        if (registradoPorId == null && fecha == null && hbObservado == null && hbCorregido == null) {
            return ControlEnfermeriaResponseDto.VACIO;
        }
        UsuarioResumenDto registradoPor = registradoPorId == null ? null : resolverUsuario.apply(registradoPorId);
        return new ControlEnfermeriaResponseDto(registradoPor, fecha, hbObservado, hbCorregido);
    }

    private ControlMedicoResponseDto mapControlMedico(Function<Long, UsuarioResumenDto> resolverUsuario,
                                                        Long registradoPorId, LocalDate fecha, String observaciones) {
        if (registradoPorId == null && fecha == null && observaciones == null) {
            return ControlMedicoResponseDto.VACIO;
        }
        UsuarioResumenDto registradoPor = registradoPorId == null ? null : resolverUsuario.apply(registradoPorId);
        return new ControlMedicoResponseDto(registradoPor, fecha, observaciones);
    }
}
