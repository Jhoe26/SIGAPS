package pe.sigaps.catalogo.mapper;

import org.mapstruct.Mapper;
import pe.sigaps.catalogo.VacunaCatalogo;
import pe.sigaps.catalogo.dto.VacunaCatalogoResponseDto;

@Mapper(componentModel = "spring")
public interface VacunaCatalogoMapper {

    VacunaCatalogoResponseDto toResponseDto(VacunaCatalogo vacunaCatalogo);
}
