package pe.sigaps.profesional.dto;

/**
 * Vista ligera embebida en las respuestas de módulos clínicos para mostrar
 * quién atendió el acto clínico (distinto de "registradoPor", quién lo tecleó).
 */
public record ProfesionalResumenDto(
        Long id,
        String dni,
        String nombreCompleto,
        String especialidad,
        String colegiatura
) {
}
