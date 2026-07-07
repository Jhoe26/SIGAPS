package pe.sigaps.usuario;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import pe.sigaps.common.ApiResponse;
import pe.sigaps.usuario.dto.CreateUsuarioDto;
import pe.sigaps.usuario.dto.UpdateUsuarioDto;
import pe.sigaps.usuario.dto.UsuarioResponseDto;
import pe.sigaps.usuario.dto.UsuarioStatsDto;

@RestController
@RequestMapping("/usuarios")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class UsuarioController {

    private final UsuarioService usuarioService;

    @GetMapping
    public ApiResponse<Page<UsuarioResponseDto>> listar(Pageable pageable) {
        return ApiResponse.success(usuarioService.listar(pageable));
    }

    @GetMapping("/stats")
    public ApiResponse<UsuarioStatsDto> stats() {
        return ApiResponse.success(usuarioService.obtenerStats());
    }

    @GetMapping("/{id}")
    public ApiResponse<UsuarioResponseDto> obtenerPorId(@PathVariable Long id) {
        return ApiResponse.success(usuarioService.obtenerPorId(id));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<UsuarioResponseDto> crear(@Valid @RequestBody CreateUsuarioDto dto) {
        return ApiResponse.success(usuarioService.crear(dto), "Usuario creado correctamente");
    }

    @PutMapping("/{id}")
    public ApiResponse<UsuarioResponseDto> actualizar(@PathVariable Long id, @Valid @RequestBody UpdateUsuarioDto dto) {
        return ApiResponse.success(usuarioService.actualizar(id, dto), "Usuario actualizado correctamente");
    }

    @PatchMapping("/{id}/activar")
    public ApiResponse<UsuarioResponseDto> activar(@PathVariable Long id) {
        return ApiResponse.success(usuarioService.activar(id), "Usuario activado");
    }

    @PatchMapping("/{id}/desactivar")
    public ApiResponse<UsuarioResponseDto> desactivar(@PathVariable Long id) {
        return ApiResponse.success(usuarioService.desactivar(id), "Usuario desactivado");
    }
}
