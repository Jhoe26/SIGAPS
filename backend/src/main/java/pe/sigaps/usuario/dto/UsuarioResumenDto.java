package pe.sigaps.usuario.dto;

/**
 * Vista ligera de usuario embebida en las respuestas de módulos clínicos para mostrar
 * "{titulo} {apPaterno} {apMaterno} {nombres} — DNI {dni} | CEP {colegiatura}".
 */
public record UsuarioResumenDto(
        Long id,
        String dni,
        String nombreCompleto,
        String titulo,
        String colegiatura
) {
}
