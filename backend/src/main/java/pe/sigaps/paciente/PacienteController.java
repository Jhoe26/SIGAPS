package pe.sigaps.paciente;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
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
import pe.sigaps.paciente.dto.CreatePacienteDto;
import pe.sigaps.paciente.dto.PacienteResponseDto;
import pe.sigaps.paciente.dto.UpdatePacienteDto;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

@RestController
@RequestMapping("/pacientes")
@RequiredArgsConstructor
public class PacienteController {

    private final PacienteService pacienteService;

    @GetMapping
    public ApiResponse<Page<PacienteResponseDto>> buscar(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String estado,
            @RequestParam(required = false) String programa,
            Pageable pageable) {
        return ApiResponse.success(pacienteService.buscar(search, estado, programa, pageable));
    }

    @GetMapping("/exportar")
    public ResponseEntity<byte[]> exportar(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String estado,
            @RequestParam(required = false) String programa) {
        byte[] csv = pacienteService.exportarCsv(search, estado, programa);
        String nombreArchivo = "pacientes_" + LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd")) + ".csv";
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType("text/csv;charset=UTF-8"))
                .header(HttpHeaders.CONTENT_DISPOSITION, ContentDisposition.attachment().filename(nombreArchivo).build().toString())
                .body(csv);
    }

    @GetMapping("/{id}")
    public ApiResponse<PacienteResponseDto> obtenerPorId(@PathVariable Long id) {
        return ApiResponse.success(pacienteService.obtenerPorId(id));
    }

    @GetMapping("/dni/{dni}")
    public ApiResponse<PacienteResponseDto> obtenerPorDni(@PathVariable String dni) {
        return ApiResponse.success(pacienteService.obtenerPorDni(dni));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<PacienteResponseDto> crear(@Valid @RequestBody CreatePacienteDto dto) {
        return ApiResponse.success(pacienteService.crear(dto), "Paciente registrado correctamente");
    }

    @PutMapping("/{id}")
    public ApiResponse<PacienteResponseDto> actualizar(@PathVariable Long id, @Valid @RequestBody UpdatePacienteDto dto) {
        return ApiResponse.success(pacienteService.actualizar(id, dto), "Paciente actualizado correctamente");
    }
}
