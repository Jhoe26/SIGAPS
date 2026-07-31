package pe.sigaps.acreditado;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import pe.sigaps.acreditado.dto.AcreditadoResponseDto;
import pe.sigaps.common.ApiResponse;

@RestController
@RequestMapping("/acreditados")
@RequiredArgsConstructor
public class PoblacionAcreditadaController {

    private final PoblacionAcreditadaService poblacionAcreditadaService;

    @GetMapping("/{dni}")
    public ApiResponse<AcreditadoResponseDto> obtenerPorDni(@PathVariable String dni) {
        return ApiResponse.success(poblacionAcreditadaService.findByDni(dni));
    }
}
