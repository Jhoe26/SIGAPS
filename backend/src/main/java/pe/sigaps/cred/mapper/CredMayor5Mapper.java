package pe.sigaps.cred.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import pe.sigaps.cred.CredMayor5;
import pe.sigaps.cred.dto.CreateCredMayor5Dto;
import pe.sigaps.cred.dto.CredMayor5ResponseDto;
import pe.sigaps.paciente.dto.PacienteResumenDto;
import pe.sigaps.profesional.dto.ProfesionalResumenDto;
import pe.sigaps.usuario.dto.UsuarioResumenDto;

@Mapper(componentModel = "spring")
public interface CredMayor5Mapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "registradoPorId", ignore = true)
    @Mapping(target = "imc", ignore = true)
    @Mapping(target = "esHistorico", ignore = true)
    @Mapping(target = "fuenteOrigen", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    CredMayor5 toEntity(CreateCredMayor5Dto dto);

    default CredMayor5ResponseDto toResponseDto(CredMayor5 entidad, PacienteResumenDto paciente,
                                                 UsuarioResumenDto registradoPor,
                                                 ProfesionalResumenDto profesional) {
        return new CredMayor5ResponseDto(
                entidad.getId(),
                paciente,
                registradoPor,
                profesional,
                entidad.getFecha(),
                entidad.getEdadPuntual(),
                entidad.getNumControl(),
                entidad.getPeso(),
                entidad.getTalla(),
                entidad.getImc(),
                entidad.getRiesgoNutricional(),
                entidad.getDxNutricional(),
                entidad.getObservaciones(),
                entidad.isEsHistorico(),
                entidad.getCreatedAt()
        );
    }
}
