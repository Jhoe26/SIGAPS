package pe.sigaps.dashboard.dto;

import pe.sigaps.programa.dto.DistribucionItemDto;

import java.util.List;

/**
 * Zero-safe: en un sistema recién instalado todos los valores salen en 0/listas vacías,
 * nunca null ni datos inventados.
 */
public record DashboardResumenDto(
        List<StatCardDto> statCards,
        List<SerieProgramaDto> atencionesPorPrograma,
        List<DistribucionItemDto> distribucionAnemia,
        List<CoberturaVacunaDto> coberturaVacunal,
        List<ActividadRecienteDto> actividadReciente
) {
}
