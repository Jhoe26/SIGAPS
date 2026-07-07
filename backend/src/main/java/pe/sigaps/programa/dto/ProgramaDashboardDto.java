package pe.sigaps.programa.dto;

import java.util.List;

public record ProgramaDashboardDto(
        long totalActivos,
        long esteMes,
        long mesAnterior,
        double tendenciaPct,
        List<SerieMensualPuntoDto> serieMensual,
        List<DistribucionItemDto> distribucion,
        List<IndicadorDto> indicadores
) {
}
