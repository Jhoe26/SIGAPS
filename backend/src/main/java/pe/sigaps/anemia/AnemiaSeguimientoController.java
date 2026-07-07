package pe.sigaps.anemia;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import pe.sigaps.anemia.dto.AnemiaResponseDto;
import pe.sigaps.anemia.dto.ControlEnfermeriaDto;
import pe.sigaps.anemia.dto.ControlMedicoDto;
import pe.sigaps.anemia.dto.CreateAnemiaDto;
import pe.sigaps.anemia.dto.UpdateAnemiaDto;
import pe.sigaps.common.ApiResponse;
import pe.sigaps.common.dto.StatsDto;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/anemia")
@RequiredArgsConstructor
public class AnemiaSeguimientoController {

    private final AnemiaSeguimientoService anemiaSeguimientoService;

    @GetMapping
    public ApiResponse<Page<AnemiaResponseDto>> buscar(
            @RequestParam(required = false) Long pacienteId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate desde,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate hasta,
            Pageable pageable) {
        return ApiResponse.success(anemiaSeguimientoService.buscar(pacienteId, desde, hasta, pageable));
    }

    @GetMapping("/stats")
    public ApiResponse<StatsDto> stats() {
        return ApiResponse.success(anemiaSeguimientoService.stats());
    }

    @GetMapping("/{id}")
    public ApiResponse<AnemiaResponseDto> obtenerPorId(@PathVariable Long id) {
        return ApiResponse.success(anemiaSeguimientoService.obtenerPorId(id));
    }

    @GetMapping("/paciente/{pacienteId}")
    public ApiResponse<List<AnemiaResponseDto>> listarPorPaciente(@PathVariable Long pacienteId) {
        return ApiResponse.success(anemiaSeguimientoService.listarPorPaciente(pacienteId));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<AnemiaResponseDto> crear(@Valid @RequestBody CreateAnemiaDto dto) {
        return ApiResponse.success(anemiaSeguimientoService.crear(dto), "Caso de anemia registrado correctamente");
    }

    @PutMapping("/{id}")
    public ApiResponse<AnemiaResponseDto> actualizar(@PathVariable Long id, @Valid @RequestBody UpdateAnemiaDto dto) {
        return ApiResponse.success(anemiaSeguimientoService.actualizar(id, dto), "Caso de anemia actualizado correctamente");
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> eliminar(@PathVariable Long id) {
        anemiaSeguimientoService.eliminar(id);
        return ApiResponse.success(null, "Caso de anemia eliminado correctamente");
    }

    @PatchMapping("/{id}/control1/enfermeria")
    public ApiResponse<AnemiaResponseDto> registrarControl1Enfermeria(@PathVariable Long id, @Valid @RequestBody ControlEnfermeriaDto dto) {
        return ApiResponse.success(anemiaSeguimientoService.registrarControl1Enfermeria(id, dto), "Control de enfermería registrado");
    }

    @PatchMapping("/{id}/control1/medico")
    public ApiResponse<AnemiaResponseDto> registrarControl1Medico(@PathVariable Long id, @Valid @RequestBody ControlMedicoDto dto) {
        return ApiResponse.success(anemiaSeguimientoService.registrarControl1Medico(id, dto), "Control médico registrado");
    }

    @PatchMapping("/{id}/control2/enfermeria")
    public ApiResponse<AnemiaResponseDto> registrarControl2Enfermeria(@PathVariable Long id, @Valid @RequestBody ControlEnfermeriaDto dto) {
        return ApiResponse.success(anemiaSeguimientoService.registrarControl2Enfermeria(id, dto), "Control de enfermería registrado");
    }

    @PatchMapping("/{id}/control2/medico")
    public ApiResponse<AnemiaResponseDto> registrarControl2Medico(@PathVariable Long id, @Valid @RequestBody ControlMedicoDto dto) {
        return ApiResponse.success(anemiaSeguimientoService.registrarControl2Medico(id, dto), "Control médico registrado");
    }

    @PatchMapping("/{id}/control3/enfermeria")
    public ApiResponse<AnemiaResponseDto> registrarControl3Enfermeria(@PathVariable Long id, @Valid @RequestBody ControlEnfermeriaDto dto) {
        return ApiResponse.success(anemiaSeguimientoService.registrarControl3Enfermeria(id, dto), "Control de enfermería registrado");
    }
}
