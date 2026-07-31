package pe.sigaps.dashboard.dto;

public record StatCardDto(
        String clave,
        String label,
        long valor,
        String subtexto,
        long total
) {
}
