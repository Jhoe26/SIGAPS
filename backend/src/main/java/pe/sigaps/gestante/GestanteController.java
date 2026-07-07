package pe.sigaps.gestante;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import pe.sigaps.common.ApiResponse;
import pe.sigaps.common.dto.StatsDto;
import pe.sigaps.gestante.dto.CreateGestanteDto;
import pe.sigaps.gestante.dto.GestanteResponseDto;
import pe.sigaps.gestante.dto.UpdateGestanteDto;

import java.util.List;

@RestController
@RequestMapping("/gestante")
@RequiredArgsConstructor
public class GestanteController {

    private final GestanteService gestanteService;

    @GetMapping
    public ApiResponse<Page<GestanteResponseDto>> buscar(
            @RequestParam(required = false) Long pacienteId, Pageable pageable) {
        return ApiResponse.success(gestanteService.buscar(pacienteId, pageable));
    }

    @GetMapping("/stats")
    public ApiResponse<StatsDto> stats() {
        return ApiResponse.success(gestanteService.stats());
    }

    @GetMapping("/{id}")
    public ApiResponse<GestanteResponseDto> obtenerPorId(@PathVariable Long id) {
        return ApiResponse.success(gestanteService.obtenerPorId(id));
    }

    @GetMapping("/paciente/{pacienteId}")
    public ApiResponse<List<GestanteResponseDto>> listarPorPaciente(@PathVariable Long pacienteId) {
        return ApiResponse.success(gestanteService.listarPorPaciente(pacienteId));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<GestanteResponseDto> crear(@Valid @RequestBody CreateGestanteDto dto) {
        return ApiResponse.success(gestanteService.crear(dto), "Registro de gestante creado correctamente");
    }

    @PutMapping("/{id}")
    public ApiResponse<GestanteResponseDto> actualizar(@PathVariable Long id, @Valid @RequestBody UpdateGestanteDto dto) {
        return ApiResponse.success(gestanteService.actualizar(id, dto), "Registro de gestante actualizado correctamente");
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> eliminar(@PathVariable Long id) {
        gestanteService.eliminar(id);
        return ApiResponse.success(null, "Registro de gestante eliminado correctamente");
    }
}
