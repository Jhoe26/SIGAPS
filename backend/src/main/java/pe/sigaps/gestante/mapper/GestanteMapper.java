package pe.sigaps.gestante.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import pe.sigaps.gestante.Gestante;
import pe.sigaps.gestante.dto.CreateGestanteDto;
import pe.sigaps.gestante.dto.GestanteResponseDto;
import pe.sigaps.paciente.dto.PacienteResumenDto;
import pe.sigaps.profesional.dto.ProfesionalResumenDto;
import pe.sigaps.usuario.dto.UsuarioResumenDto;

@Mapper(componentModel = "spring")
public interface GestanteMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "registradoPorId", ignore = true)
    @Mapping(target = "esHistorico", ignore = true)
    @Mapping(target = "fuenteOrigen", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    Gestante toEntity(CreateGestanteDto dto);

    default GestanteResponseDto toResponseDto(Gestante entidad, PacienteResumenDto paciente,
                                               UsuarioResumenDto registradoPor,
                                               ProfesionalResumenDto profesional) {
        return new GestanteResponseDto(
                entidad.getId(),
                paciente,
                registradoPor,
                profesional,
                entidad.getTelefono(),
                entidad.getInfluenzaFecha(),
                entidad.getDt1Fecha(),
                entidad.getDt2Fecha(),
                entidad.getDt3Fecha(),
                entidad.getHepb1Fecha(),
                entidad.getHepb2Fecha(),
                entidad.getHepb3Fecha(),
                entidad.getTdpaFecha(),
                entidad.getObservaciones(),
                entidad.isEsHistorico(),
                entidad.getCreatedAt()
        );
    }
}
