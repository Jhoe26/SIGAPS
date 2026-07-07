package pe.sigaps.reporte;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pe.sigaps.parametro.ParametroService;
import pe.sigaps.programa.dto.DistribucionItemDto;
import pe.sigaps.tamizaje.TamizajeHbRepository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.Year;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ReporteService {

    private static final String CLAVE_CORTE_HB = "TAMIZAJE_HB_CORTE_ANEMIA";

    private final TamizajeHbRepository tamizajeHbRepository;
    private final ParametroService parametroService;

    public List<DistribucionItemDto> tamizajeResultados(Integer anio) {
        int anioConsulta = anio != null ? anio : Year.now().getValue();
        LocalDate desde = LocalDate.of(anioConsulta, 1, 1);
        LocalDate hasta = LocalDate.of(anioConsulta, 12, 31);
        BigDecimal corte = parametroService.getDecimal(CLAVE_CORTE_HB);

        long positivos = tamizajeHbRepository.contarPositivosEnRango(desde, hasta, corte);
        long negativos = tamizajeHbRepository.contarNegativosEnRango(desde, hasta, corte);
        long pendientes = tamizajeHbRepository.contarPendientesEnRango(desde, hasta);

        return List.of(
                new DistribucionItemDto("Positivos", positivos),
                new DistribucionItemDto("Negativos", negativos),
                new DistribucionItemDto("Pendientes", pendientes)
        );
    }
}
