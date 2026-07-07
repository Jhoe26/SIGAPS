package pe.sigaps.catalogo;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface VacunaCatalogoRepository extends JpaRepository<VacunaCatalogo, Long> {

    List<VacunaCatalogo> findByActivaTrueOrderByCodigo();

    List<VacunaCatalogo> findByGrupoEdadAndActivaTrueOrderByCodigo(GrupoEdadVacuna grupoEdad);
}
