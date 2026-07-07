package pe.sigaps.catalogo;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import pe.sigaps.catalogo.dto.DxNutricionalCatalogoResponseDto;
import pe.sigaps.catalogo.dto.VacunaCatalogoResponseDto;
import pe.sigaps.common.ApiResponse;

import java.util.List;

@RestController
@RequestMapping("/catalogos")
@RequiredArgsConstructor
public class CatalogoController {

    private final CatalogoService catalogoService;

    @GetMapping("/vacunas")
    public ApiResponse<List<VacunaCatalogoResponseDto>> listarVacunas(
            @RequestParam(required = false) String grupoEdad) {
        GrupoEdadVacuna grupo = grupoEdad != null ? GrupoEdadVacuna.fromValor(grupoEdad) : null;
        return ApiResponse.success(catalogoService.listarVacunas(grupo));
    }

    @GetMapping("/dx-nutricional")
    public ApiResponse<List<DxNutricionalCatalogoResponseDto>> listarDxNutricional(
            @RequestParam(required = false) GrupoEdadDx grupoEdad) {
        return ApiResponse.success(catalogoService.listarDxNutricional(grupoEdad));
    }
}
