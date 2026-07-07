package pe.sigaps.catalogo.mapper;

import org.mapstruct.Mapper;
import pe.sigaps.catalogo.DxNutricionalCatalogo;
import pe.sigaps.catalogo.dto.DxNutricionalCatalogoResponseDto;

@Mapper(componentModel = "spring")
public interface DxNutricionalCatalogoMapper {

    DxNutricionalCatalogoResponseDto toResponseDto(DxNutricionalCatalogo dxNutricionalCatalogo);
}
