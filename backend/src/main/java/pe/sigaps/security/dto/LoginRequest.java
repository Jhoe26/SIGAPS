package pe.sigaps.security.dto;

import jakarta.validation.constraints.NotBlank;

public record LoginRequest(
        @NotBlank(message = "El DNI o correo es obligatorio")
        String dni,

        @NotBlank(message = "La contraseña es obligatoria")
        String password
) {
}
