package pe.sigaps.auditoria;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import pe.sigaps.auditoria.dto.AuditLogResponseDto;
import pe.sigaps.common.ApiResponse;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/auditoria")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AuditoriaController {

    private final AuditoriaService auditoriaService;

    @GetMapping
    public ApiResponse<Page<AuditLogResponseDto>> buscar(
            @RequestParam(required = false) String tabla,
            @RequestParam(required = false) Long registroId,
            @RequestParam(required = false) Long usuarioId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime desde,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime hasta,
            Pageable pageable) {
        return ApiResponse.success(auditoriaService.buscar(tabla, registroId, usuarioId, desde, hasta, pageable));
    }
}
