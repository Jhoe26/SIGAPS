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
import pe.sigaps.cred.dto.CreateCredMayor5Dto;
import pe.sigaps.cred.dto.CredMayor5ResponseDto;
import pe.sigaps.cred.dto.UpdateCredMayor5Dto;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/cred-mayor5")
@RequiredArgsConstructor
public class CredMayor5Controller {

    private final CredMayor5Service credMayor5Service;

    @GetMapping
    public ApiResponse<Page<CredMayor5ResponseDto>> buscar(
            @RequestParam(required = false) Long pacienteId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate desde,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate hasta,
            Pageable pageable) {
        return ApiResponse.success(credMayor5Service.buscar(pacienteId, desde, hasta, pageable));
    }

    @GetMapping("/stats")
    public ApiResponse<StatsDto> stats() {
        return ApiResponse.success(credMayor5Service.stats());
    }

    @GetMapping("/{id}")
    public ApiResponse<CredMayor5ResponseDto> obtenerPorId(@PathVariable Long id) {
        return ApiResponse.success(credMayor5Service.obtenerPorId(id));
    }

    @GetMapping("/paciente/{pacienteId}")
    public ApiResponse<List<CredMayor5ResponseDto>> listarPorPaciente(@PathVariable Long pacienteId) {
        return ApiResponse.success(credMayor5Service.listarPorPaciente(pacienteId));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<CredMayor5ResponseDto> crear(@Valid @RequestBody CreateCredMayor5Dto dto) {
        return ApiResponse.success(credMayor5Service.crear(dto), "Control CRED registrado correctamente");
    }

    @PutMapping("/{id}")
    public ApiResponse<CredMayor5ResponseDto> actualizar(@PathVariable Long id, @Valid @RequestBody UpdateCredMayor5Dto dto) {
        return ApiResponse.success(credMayor5Service.actualizar(id, dto), "Control CRED actualizado correctamente");
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> eliminar(@PathVariable Long id) {
        credMayor5Service.eliminar(id);
        return ApiResponse.success(null, "Control CRED eliminado correctamente");
    }
}
