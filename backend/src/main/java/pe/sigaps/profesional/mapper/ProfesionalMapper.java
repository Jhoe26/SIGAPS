package pe.sigaps.profesional.mapper;

import org.mapstruct.Mapping;
import org.mapstruct.Mapper;
import pe.sigaps.profesional.Profesional;
import pe.sigaps.profesional.dto.CreateProfesionalDto;
import pe.sigaps.profesional.dto.ProfesionalResponseDto;
import pe.sigaps.profesional.dto.ProfesionalResumenDto;

@Mapper(componentModel = "spring")
public interface ProfesionalMapper {

    default ProfesionalResponseDto toResponseDto(Profesional profesional, long totalPacientesAtendidos) {
        return new ProfesionalResponseDto(
                profesional.getId(),
                profesional.getDni(),
                profesional.getNombres(),
                profesional.getApPaterno(),
                profesional.getApMaterno(),
                profesional.getNombreCompleto(),
                profesional.getEspecialidad(),
                profesional.getColegiatura(),
                profesional.getTipoColegio(),
                profesional.getCentroId(),
                profesional.isActivo(),
                totalPacientesAtendidos,
                profesional.getCreatedAt()
        );
    }

    @Mapping(target = "nombreCompleto", expression = "java(profesional.getNombreCompleto())")
    ProfesionalResumenDto toResumenDto(Profesional profesional);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "activo", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    Profesional toEntity(CreateProfesionalDto dto);
}
