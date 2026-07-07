package pe.sigaps.common.dto;

/**
 * Forma común de respuesta para GET /{modulo}/stats. Zero-safe por diseño:
 * COUNT sobre una tabla vacía siempre devuelve 0, nunca null.
 */
public record StatsDto(long total, long esteMes) {
}
