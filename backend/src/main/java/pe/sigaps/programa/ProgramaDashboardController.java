package pe.sigaps.programa;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import pe.sigaps.common.ApiResponse;
import pe.sigaps.programa.dto.ProgramaDashboardDto;

@RestController
@RequestMapping("/programas")
@RequiredArgsConstructor
public class ProgramaDashboardController {

    private final ProgramaDashboardService programaDashboardService;

    @GetMapping("/{clave}/dashboard")
    public ApiResponse<ProgramaDashboardDto> dashboard(@PathVariable String clave) {
        ProgramaClave programaClave = ProgramaClave.valueOf(clave.toUpperCase());
        return ApiResponse.success(programaDashboardService.obtenerDashboard(programaClave));
    }
}
