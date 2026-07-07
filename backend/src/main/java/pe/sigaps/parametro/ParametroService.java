package pe.sigaps.parametro;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pe.sigaps.common.exception.NotFoundException;
import pe.sigaps.parametro.dto.ParametroResponseDto;

import java.math.BigDecimal;

/**
 * Punto único de lectura de parametro_sistema. Los módulos clínicos (Fase 1C) lo usan
 * para constantes como HB_CORRECCION_AYACUCHO, evitando valores fijos ("magic numbers") en el código.
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ParametroService {

    private final ParametroSistemaRepository parametroSistemaRepository;

    public ParametroResponseDto obtener(String clave) {
        return toResponseDto(buscarEntidad(clave));
    }

    public String getString(String clave) {
        return buscarEntidad(clave).getValor();
    }

    public BigDecimal getDecimal(String clave) {
        return new BigDecimal(buscarEntidad(clave).getValor());
    }

    public Integer getInteger(String clave) {
        return Integer.valueOf(buscarEntidad(clave).getValor());
    }

    public Boolean getBoolean(String clave) {
        return Boolean.valueOf(buscarEntidad(clave).getValor());
    }

    private ParametroSistema buscarEntidad(String clave) {
        return parametroSistemaRepository.findById(clave)
                .orElseThrow(() -> new NotFoundException("Parámetro no encontrado: " + clave));
    }

    private ParametroResponseDto toResponseDto(ParametroSistema parametro) {
        return new ParametroResponseDto(
                parametro.getClave(),
                parametro.getValor(),
                parametro.getDescripcion(),
                parametro.getTipoDato().name()
        );
    }
}
