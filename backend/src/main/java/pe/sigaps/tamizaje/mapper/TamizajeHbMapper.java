package pe.sigaps.tamizaje.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import pe.sigaps.paciente.dto.PacienteResumenDto;
import pe.sigaps.profesional.dto.ProfesionalResumenDto;
import pe.sigaps.tamizaje.TamizajeHb;
import pe.sigaps.tamizaje.dto.CreateTamizajeDto;
import pe.sigaps.tamizaje.dto.TamizajeHbResponseDto;
import pe.sigaps.usuario.dto.UsuarioResumenDto;

@Mapper(componentModel = "spring")
public interface TamizajeHbMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "registradoPorId", ignore = true)
    @Mapping(target = "grupoEtario", ignore = true)
    @Mapping(target = "edadAnios", ignore = true)
    @Mapping(target = "edadMeses", ignore = true)
    @Mapping(target = "edadDias", ignore = true)
    @Mapping(target = "hbCorregido", ignore = true)
    @Mapping(target = "esHistorico", ignore = true)
    @Mapping(target = "fuenteOrigen", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    TamizajeHb toEntity(CreateTamizajeDto dto);

    default TamizajeHbResponseDto toResponseDto(TamizajeHb entidad, PacienteResumenDto paciente,
                                                 UsuarioResumenDto registradoPor,
                                                 ProfesionalResumenDto profesional) {
        return new TamizajeHbResponseDto(
                entidad.getId(),
                paciente,
                registradoPor,
                profesional,
                entidad.getFecha(),
                entidad.getEdadAnios(),
                entidad.getEdadMeses(),
                entidad.getEdadDias(),
                entidad.getGrupoEtario().getValor(),
                entidad.getTipoDosaje(),
                entidad.getHbObservado(),
                entidad.getHbCorregido(),
                entidad.getObservaciones(),
                entidad.isEsHistorico(),
                entidad.getCreatedAt()
        );
    }
}
