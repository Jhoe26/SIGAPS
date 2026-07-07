package pe.sigaps.centrosalud.dto;

public record CentroSaludResponseDto(
        Long id,
        String nombre,
        String ubigeo,
        String direccion,
        boolean activo
) {
}
