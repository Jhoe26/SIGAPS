package pe.sigaps.catalogo.dto;

import pe.sigaps.catalogo.GrupoEdadVacuna;

import java.time.LocalDate;

public record VacunaCatalogoResponseDto(
        Long id,
        String codigo,
        String nombre,
        GrupoEdadVacuna grupoEdad,
        Integer numDosisEsquema,
        String descripcion,
        boolean activa,
        LocalDate vigenteDesde,
        LocalDate vigenteHasta
) {
}
