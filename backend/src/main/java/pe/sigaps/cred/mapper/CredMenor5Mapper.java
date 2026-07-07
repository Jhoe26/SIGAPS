package pe.sigaps.cred.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import pe.sigaps.cred.CredMenor5;
import pe.sigaps.cred.dto.CreateCredMenor5Dto;
import pe.sigaps.cred.dto.CredMenor5ResponseDto;
import pe.sigaps.paciente.dto.PacienteResumenDto;
import pe.sigaps.profesional.dto.ProfesionalResumenDto;
import pe.sigaps.usuario.dto.UsuarioResumenDto;

@Mapper(componentModel = "spring")
public interface CredMenor5Mapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "registradoPorId", ignore = true)
    @Mapping(target = "esHistorico", ignore = true)
    @Mapping(target = "fuenteOrigen", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    CredMenor5 toEntity(CreateCredMenor5Dto dto);

    default CredMenor5ResponseDto toResponseDto(CredMenor5 entidad, PacienteResumenDto paciente,
                                                 UsuarioResumenDto registradoPor,
                                                 ProfesionalResumenDto profesional) {
        return new CredMenor5ResponseDto(
                entidad.getId(),
                paciente,
                registradoPor,
                profesional,
                entidad.getFecha(),
                entidad.getEdadPuntual(),
                entidad.getNumControl(),
                entidad.getPeso(),
                entidad.getTalla(),
                entidad.getPerimetroCefalico(),
                entidad.getDxNutricional(),
                entidad.getLactanciaHasta6m(),
                entidad.getGradoRiesgo(),
                entidad.getObservaciones(),
                entidad.isEsHistorico(),
                entidad.getCreatedAt()
        );
    }
}
