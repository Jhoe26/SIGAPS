package pe.sigaps.centrosalud.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateCentroSaludDto(
        @NotBlank(message = "El nombre es obligatorio")
        @Size(max = 150)
        String nombre,

        @Size(max = 10)
        String ubigeo,

        @Size(max = 200)
        String direccion
) {
}
