package pe.sigaps.catalogo;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pe.sigaps.catalogo.dto.DxNutricionalCatalogoResponseDto;
import pe.sigaps.catalogo.dto.VacunaCatalogoResponseDto;
import pe.sigaps.catalogo.mapper.DxNutricionalCatalogoMapper;
import pe.sigaps.catalogo.mapper.VacunaCatalogoMapper;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CatalogoService {

    private final VacunaCatalogoRepository vacunaCatalogoRepository;
    private final DxNutricionalCatalogoRepository dxNutricionalCatalogoRepository;
    private final VacunaCatalogoMapper vacunaCatalogoMapper;
    private final DxNutricionalCatalogoMapper dxNutricionalCatalogoMapper;

    public List<VacunaCatalogoResponseDto> listarVacunas(GrupoEdadVacuna grupoEdad) {
        List<VacunaCatalogo> vacunas = grupoEdad == null
                ? vacunaCatalogoRepository.findByActivaTrueOrderByCodigo()
                : vacunaCatalogoRepository.findByGrupoEdadAndActivaTrueOrderByCodigo(grupoEdad);
        return vacunas.stream().map(vacunaCatalogoMapper::toResponseDto).toList();
    }

    public List<DxNutricionalCatalogoResponseDto> listarDxNutricional(GrupoEdadDx grupoEdad) {
        List<DxNutricionalCatalogo> dxs;
        if (grupoEdad == null) {
            dxs = dxNutricionalCatalogoRepository.findByActivoTrueOrderByCodigo();
        } else if (grupoEdad == GrupoEdadDx.AMBOS) {
            dxs = dxNutricionalCatalogoRepository.findByGrupoEdadInAndActivoTrueOrderByCodigo(List.of(GrupoEdadDx.AMBOS));
        } else {
            dxs = dxNutricionalCatalogoRepository.findByGrupoEdadInAndActivoTrueOrderByCodigo(
                    List.of(grupoEdad, GrupoEdadDx.AMBOS));
        }
        return dxs.stream().map(dxNutricionalCatalogoMapper::toResponseDto).toList();
    }
}
