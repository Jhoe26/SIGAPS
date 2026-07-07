package pe.sigaps.usuario.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import pe.sigaps.usuario.Rol;

public record UpdateUsuarioDto(
        @NotBlank(message = "El apellido paterno es obligatorio")
        @Size(max = 60)
        String apPaterno,

        @NotBlank(message = "El apellido materno es obligatorio")
        @Size(max = 60)
        String apMaterno,

        @NotBlank(message = "Los nombres son obligatorios")
        @Size(max = 80)
        String nombres,

        @Size(max = 20)
        String colegiatura,

        @Size(max = 20)
        String titulo,

        @NotNull(message = "El rol es obligatorio")
        Rol rol,

        @Email(message = "El email no es válido")
        @Size(max = 120)
        String email,

        @Size(max = 15)
        String telefono,

        Long centroId
) {
}
