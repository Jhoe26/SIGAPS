package pe.sigaps.security;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import pe.sigaps.common.ApiResponse;
import pe.sigaps.security.dto.LoginRequest;
import pe.sigaps.security.dto.LoginResponse;
import pe.sigaps.security.dto.RefreshRequest;
import pe.sigaps.security.dto.UsuarioAuthDto;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ApiResponse<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        return ApiResponse.success(authService.login(request), "Login exitoso");
    }

    @PostMapping("/refresh")
    public ApiResponse<LoginResponse> refresh(@Valid @RequestBody RefreshRequest request) {
        return ApiResponse.success(authService.refrescar(request.refreshToken()), "Token renovado");
    }

    @PostMapping("/logout")
    public ApiResponse<Void> logout() {
        return ApiResponse.success(null, "Sesión cerrada");
    }

    @GetMapping("/me")
    public ApiResponse<UsuarioAuthDto> me(Authentication authentication) {
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        return ApiResponse.success(authService.obtenerActual(userDetails.getDni()));
    }
}
