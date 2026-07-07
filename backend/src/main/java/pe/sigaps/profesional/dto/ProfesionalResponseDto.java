package pe.sigaps.profesional.dto;

import java.time.LocalDateTime;

public record ProfesionalResponseDto(
        Long id,
        String dni,
        String nombres,
        String apPaterno,
        String apMaterno,
        String nombreCompleto,
        String especialidad,
        String colegiatura,
        String tipoColegio,
        Long centroId,
        boolean activo,
        long totalPacientesAtendidos,
        LocalDateTime createdAt
) {
}
