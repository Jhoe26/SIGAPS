package pe.sigaps.usuario.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import pe.sigaps.usuario.Usuario;
import pe.sigaps.usuario.dto.CreateUsuarioDto;
import pe.sigaps.usuario.dto.UsuarioResponseDto;

@Mapper(componentModel = "spring")
public interface UsuarioMapper {

    @Mapping(target = "nombreCompleto", expression = "java(usuario.getNombreCompleto())")
    UsuarioResponseDto toResponseDto(Usuario usuario);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "passwordHash", ignore = true)
    @Mapping(target = "activo", ignore = true)
    @Mapping(target = "esSistema", ignore = true)
    @Mapping(target = "ultimoAcceso", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    Usuario toEntity(CreateUsuarioDto dto);
}
