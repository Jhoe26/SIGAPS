package pe.sigaps.centrosalud.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import pe.sigaps.centrosalud.CentroSalud;
import pe.sigaps.centrosalud.dto.CentroSaludResponseDto;
import pe.sigaps.centrosalud.dto.CentroSaludResumenDto;
import pe.sigaps.centrosalud.dto.CreateCentroSaludDto;

@Mapper(componentModel = "spring")
public interface CentroSaludMapper {

    CentroSaludResponseDto toResponseDto(CentroSalud centroSalud);

    CentroSaludResumenDto toResumenDto(CentroSalud centroSalud);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "activo", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    CentroSalud toEntity(CreateCentroSaludDto dto);
}
