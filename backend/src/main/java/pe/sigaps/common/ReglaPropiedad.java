package pe.sigaps.common;

import pe.sigaps.common.exception.ForbiddenException;

/**
 * Regla de negocio #1 del prompt maestro: solo el creador de un registro clínico
 * puede editarlo/eliminarlo, y los registros históricos son inmutables para todos
 * (incluido ADMIN, que solo tiene lectura global).
 */
public final class ReglaPropiedad {

    private ReglaPropiedad() {
    }

    public static void verificarPropietario(Long registradoPorId, Long usuarioActualId) {
        if (!registradoPorId.equals(usuarioActualId)) {
            throw new ForbiddenException("Solo el creador puede modificar o eliminar este registro");
        }
    }

    public static void verificarNoHistorico(boolean esHistorico) {
        if (esHistorico) {
            throw new ForbiddenException("Los registros históricos son inmutables");
        }
    }
}
