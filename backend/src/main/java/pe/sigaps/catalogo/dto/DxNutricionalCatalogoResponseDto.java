package pe.sigaps.catalogo.dto;

import pe.sigaps.catalogo.GrupoEdadDx;

public record DxNutricionalCatalogoResponseDto(
        Long id,
        String codigo,
        String descripcion,
        GrupoEdadDx grupoEdad,
        boolean activo
) {
}
