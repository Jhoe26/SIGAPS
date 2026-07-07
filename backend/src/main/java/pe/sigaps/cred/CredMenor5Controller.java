package pe.sigaps.cred;

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
import pe.sigaps.cred.dto.CreateCredMenor5Dto;
import pe.sigaps.cred.dto.CredMenor5ResponseDto;
import pe.sigaps.cred.dto.UpdateCredMenor5Dto;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/cred-menor5")
@RequiredArgsConstructor
public class CredMenor5Controller {

    private final CredMenor5Service credMenor5Service;

    @GetMapping
    public ApiResponse<Page<CredMenor5ResponseDto>> buscar(
            @RequestParam(required = false) Long pacienteId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate desde,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate hasta,
            Pageable pageable) {
        return ApiResponse.success(credMenor5Service.buscar(pacienteId, desde, hasta, pageable));
    }

    @GetMapping("/stats")
    public ApiResponse<StatsDto> stats() {
        return ApiResponse.success(credMenor5Service.stats());
    }

    @GetMapping("/{id}")
    public ApiResponse<CredMenor5ResponseDto> obtenerPorId(@PathVariable Long id) {
        return ApiResponse.success(credMenor5Service.obtenerPorId(id));
    }

    @GetMapping("/paciente/{pacienteId}")
    public ApiResponse<List<CredMenor5ResponseDto>> listarPorPaciente(@PathVariable Long pacienteId) {
        return ApiResponse.success(credMenor5Service.listarPorPaciente(pacienteId));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<CredMenor5ResponseDto> crear(@Valid @RequestBody CreateCredMenor5Dto dto) {
        return ApiResponse.success(credMenor5Service.crear(dto), "Control CRED registrado correctamente");
    }

    @PutMapping("/{id}")
    public ApiResponse<CredMenor5ResponseDto> actualizar(@PathVariable Long id, @Valid @RequestBody UpdateCredMenor5Dto dto) {
        return ApiResponse.success(credMenor5Service.actualizar(id, dto), "Control CRED actualizado correctamente");
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> eliminar(@PathVariable Long id) {
        credMenor5Service.eliminar(id);
        return ApiResponse.success(null, "Control CRED eliminado correctamente");
    }
}
