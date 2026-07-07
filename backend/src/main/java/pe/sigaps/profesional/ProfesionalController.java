package pe.sigaps.profesional;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
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
import pe.sigaps.profesional.dto.CreateProfesionalDto;
import pe.sigaps.profesional.dto.ProfesionalResponseDto;
import pe.sigaps.profesional.dto.UpdateProfesionalDto;

@RestController
@RequestMapping("/profesionales")
@RequiredArgsConstructor
public class ProfesionalController {

    private final ProfesionalService profesionalService;

    @GetMapping
    public ApiResponse<Page<ProfesionalResponseDto>> listar(
            @RequestParam(required = false) String q,
            Pageable pageable) {
        return ApiResponse.success(profesionalService.listar(q, pageable));
    }

    @GetMapping("/{id}")
    public ApiResponse<ProfesionalResponseDto> obtenerPorId(@PathVariable Long id) {
        return ApiResponse.success(profesionalService.obtenerPorId(id));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<ProfesionalResponseDto> crear(@Valid @RequestBody CreateProfesionalDto dto) {
        return ApiResponse.success(profesionalService.crear(dto), "Profesional registrado correctamente");
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<ProfesionalResponseDto> actualizar(@PathVariable Long id, @Valid @RequestBody UpdateProfesionalDto dto) {
        return ApiResponse.success(profesionalService.actualizar(id, dto), "Profesional actualizado correctamente");
    }
}
