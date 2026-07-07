package pe.sigaps.parametro;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import pe.sigaps.common.ApiResponse;
import pe.sigaps.parametro.dto.ParametroResponseDto;

@RestController
@RequestMapping("/parametros")
@RequiredArgsConstructor
public class ParametroController {

    private final ParametroService parametroService;

    @GetMapping("/{clave}")
    public ApiResponse<ParametroResponseDto> obtener(@PathVariable String clave) {
        return ApiResponse.success(parametroService.obtener(clave));
    }
}
