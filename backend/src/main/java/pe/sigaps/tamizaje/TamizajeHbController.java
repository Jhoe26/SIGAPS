package pe.sigaps.tamizaje;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
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
import pe.sigaps.tamizaje.dto.CreateTamizajeDto;
import pe.sigaps.tamizaje.dto.TamizajeHbResponseDto;
import pe.sigaps.tamizaje.dto.UpdateTamizajeDto;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/tamizaje")
@RequiredArgsConstructor
public class TamizajeHbController {

    private final TamizajeHbService tamizajeHbService;

    @GetMapping
    public ApiResponse<Page<TamizajeHbResponseDto>> buscar(
            @RequestParam(required = false) Long pacienteId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate desde,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate hasta,
            Pageable pageable) {
        return ApiResponse.success(tamizajeHbService.buscar(pacienteId, desde, hasta, pageable));
    }

    @GetMapping("/stats")
    public ApiResponse<StatsDto> stats() {
        return ApiResponse.success(tamizajeHbService.stats());
    }

    @GetMapping("/{id}")
    public ApiResponse<TamizajeHbResponseDto> obtenerPorId(@PathVariable Long id) {
        return ApiResponse.success(tamizajeHbService.obtenerPorId(id));
    }

    @GetMapping("/paciente/{pacienteId}")
    public ApiResponse<List<TamizajeHbResponseDto>> listarPorPaciente(@PathVariable Long pacienteId) {
        return ApiResponse.success(tamizajeHbService.listarPorPaciente(pacienteId));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<TamizajeHbResponseDto> crear(@Valid @RequestBody CreateTamizajeDto dto) {
        return ApiResponse.success(tamizajeHbService.crear(dto), "Tamizaje registrado correctamente");
    }

    @PutMapping("/{id}")
    public ApiResponse<TamizajeHbResponseDto> actualizar(@PathVariable Long id, @Valid @RequestBody UpdateTamizajeDto dto) {
        return ApiResponse.success(tamizajeHbService.actualizar(id, dto), "Tamizaje actualizado correctamente");
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> eliminar(@PathVariable Long id) {
        tamizajeHbService.eliminar(id);
        return ApiResponse.success(null, "Tamizaje eliminado correctamente");
    }
}
