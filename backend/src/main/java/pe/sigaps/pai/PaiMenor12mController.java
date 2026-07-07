package pe.sigaps.pai;

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
import pe.sigaps.pai.dto.CreatePaiDto;
import pe.sigaps.pai.dto.PaiResponseDto;
import pe.sigaps.pai.dto.UpdatePaiDto;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/pai-menor12m")
@RequiredArgsConstructor
public class PaiMenor12mController {

    private final PaiMenor12mService paiMenor12mService;

    @GetMapping
    public ApiResponse<Page<PaiResponseDto>> buscar(
            @RequestParam(required = false) Long pacienteId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate desde,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate hasta,
            Pageable pageable) {
        return ApiResponse.success(paiMenor12mService.buscar(pacienteId, desde, hasta, pageable));
    }

    @GetMapping("/stats")
    public ApiResponse<StatsDto> stats() {
        return ApiResponse.success(paiMenor12mService.stats());
    }

    @GetMapping("/{id}")
    public ApiResponse<PaiResponseDto> obtenerPorId(@PathVariable Long id) {
        return ApiResponse.success(paiMenor12mService.obtenerPorId(id));
    }

    @GetMapping("/paciente/{pacienteId}")
    public ApiResponse<List<PaiResponseDto>> listarPorPaciente(@PathVariable Long pacienteId) {
        return ApiResponse.success(paiMenor12mService.listarPorPaciente(pacienteId));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<PaiResponseDto> crear(@Valid @RequestBody CreatePaiDto dto) {
        return ApiResponse.success(paiMenor12mService.crear(dto), "Dosis registrada correctamente");
    }

    @PutMapping("/{id}")
    public ApiResponse<PaiResponseDto> actualizar(@PathVariable Long id, @Valid @RequestBody UpdatePaiDto dto) {
        return ApiResponse.success(paiMenor12mService.actualizar(id, dto), "Dosis actualizada correctamente");
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> eliminar(@PathVariable Long id) {
        paiMenor12mService.eliminar(id);
        return ApiResponse.success(null, "Dosis eliminada correctamente");
    }
}
