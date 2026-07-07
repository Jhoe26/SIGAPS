package pe.sigaps.usuario.dto;

public record UsuarioStatsDto(
        long administradores,
        long medicos,
        long enfermerasObstetras,
        long supervisores
) {
}
