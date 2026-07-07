package pe.sigaps.centrosalud;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import pe.sigaps.centrosalud.dto.CentroSaludResponseDto;
import pe.sigaps.centrosalud.dto.CreateCentroSaludDto;
import pe.sigaps.centrosalud.dto.UpdateCentroSaludDto;
import pe.sigaps.common.ApiResponse;

import java.util.List;

@RestController
@RequestMapping("/centros-salud")
@RequiredArgsConstructor
public class CentroSaludController {

    private final CentroSaludService centroSaludService;

    @GetMapping
    public ApiResponse<List<CentroSaludResponseDto>> listar() {
        return ApiResponse.success(centroSaludService.listar());
    }

    @GetMapping("/{id}")
    public ApiResponse<CentroSaludResponseDto> obtenerPorId(@PathVariable Long id) {
        return ApiResponse.success(centroSaludService.obtenerPorId(id));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<CentroSaludResponseDto> crear(@Valid @RequestBody CreateCentroSaludDto dto) {
        return ApiResponse.success(centroSaludService.crear(dto), "Centro de salud creado correctamente");
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<CentroSaludResponseDto> actualizar(@PathVariable Long id, @Valid @RequestBody UpdateCentroSaludDto dto) {
        return ApiResponse.success(centroSaludService.actualizar(id, dto), "Centro de salud actualizado correctamente");
    }
}
