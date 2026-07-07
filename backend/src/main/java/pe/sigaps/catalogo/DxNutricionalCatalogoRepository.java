package pe.sigaps.catalogo;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DxNutricionalCatalogoRepository extends JpaRepository<DxNutricionalCatalogo, Long> {

    List<DxNutricionalCatalogo> findByActivoTrueOrderByCodigo();

    List<DxNutricionalCatalogo> findByGrupoEdadInAndActivoTrueOrderByCodigo(List<GrupoEdadDx> grupos);
}
