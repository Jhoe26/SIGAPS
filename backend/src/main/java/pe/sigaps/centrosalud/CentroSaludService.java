package pe.sigaps.centrosalud;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pe.sigaps.centrosalud.dto.CentroSaludResponseDto;
import pe.sigaps.centrosalud.dto.CentroSaludResumenDto;
import pe.sigaps.centrosalud.dto.CreateCentroSaludDto;
import pe.sigaps.centrosalud.dto.UpdateCentroSaludDto;
import pe.sigaps.centrosalud.mapper.CentroSaludMapper;
import pe.sigaps.common.exception.NotFoundException;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CentroSaludService {

    private final CentroSaludRepository centroSaludRepository;
    private final CentroSaludMapper centroSaludMapper;

    public List<CentroSaludResponseDto> listar() {
        return centroSaludRepository.findAll().stream().map(centroSaludMapper::toResponseDto).toList();
    }

    public CentroSaludResponseDto obtenerPorId(Long id) {
        return centroSaludMapper.toResponseDto(buscarEntidad(id));
    }

    public CentroSaludResumenDto obtenerResumen(Long id) {
        return centroSaludMapper.toResumenDto(buscarEntidad(id));
    }

    @Transactional
    public CentroSaludResponseDto crear(CreateCentroSaludDto dto) {
        CentroSalud centroSalud = centroSaludMapper.toEntity(dto);
        return centroSaludMapper.toResponseDto(centroSaludRepository.save(centroSalud));
    }

    @Transactional
    public CentroSaludResponseDto actualizar(Long id, UpdateCentroSaludDto dto) {
        CentroSalud centroSalud = buscarEntidad(id);
        centroSalud.setNombre(dto.nombre());
        centroSalud.setUbigeo(dto.ubigeo());
        centroSalud.setDireccion(dto.direccion());
        centroSalud.setActivo(dto.activo());
        return centroSaludMapper.toResponseDto(centroSaludRepository.save(centroSalud));
    }

    private CentroSalud buscarEntidad(Long id) {
        return centroSaludRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Centro de salud no encontrado: " + id));
    }
}
