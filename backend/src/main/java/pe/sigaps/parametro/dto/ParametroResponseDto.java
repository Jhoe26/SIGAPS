package pe.sigaps.parametro.dto;

public record ParametroResponseDto(
        String clave,
        String valor,
        String descripcion,
        String tipoDato
) {
}
