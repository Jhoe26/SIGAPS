package pe.sigaps.sistema;

import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import pe.sigaps.common.ApiResponse;
import pe.sigaps.sistema.dto.SistemaInfoDto;

@RestController
@RequestMapping("/sistema")
@RequiredArgsConstructor
public class SistemaController {

    private final SistemaService sistemaService;

    @GetMapping("/info")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<SistemaInfoDto> info() {
        return ApiResponse.success(sistemaService.obtenerInfo());
    }
}
