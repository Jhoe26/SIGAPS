package pe.sigaps.reporte;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import pe.sigaps.common.ApiResponse;
import pe.sigaps.programa.dto.DistribucionItemDto;

import java.util.List;

@RestController
@RequestMapping("/reportes")
@RequiredArgsConstructor
public class ReporteController {

    private final ReporteService reporteService;

    @GetMapping("/tamizaje-resultados")
    public ApiResponse<List<DistribucionItemDto>> tamizajeResultados(@RequestParam(required = false) Integer anio) {
        return ApiResponse.success(reporteService.tamizajeResultados(anio));
    }
}
