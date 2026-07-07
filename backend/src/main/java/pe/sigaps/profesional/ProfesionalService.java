package pe.sigaps.profesional;

import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import pe.sigaps.common.exception.BusinessException;
import pe.sigaps.common.exception.NotFoundException;
import pe.sigaps.profesional.dto.CreateProfesionalDto;
import pe.sigaps.profesional.dto.ProfesionalResponseDto;
import pe.sigaps.profesional.dto.ProfesionalResumenDto;
import pe.sigaps.profesional.dto.UpdateProfesionalDto;
import pe.sigaps.profesional.mapper.ProfesionalMapper;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProfesionalService {

    private final ProfesionalRepository profesionalRepository;
    private final ProfesionalMapper profesionalMapper;

    public Page<ProfesionalResponseDto> listar(String q, Pageable pageable) {
        Specification<Profesional> spec = construirBusqueda(q);
        return profesionalRepository.findAll(spec, pageable).map(this::toResponseDtoConConteo);
    }

    public ProfesionalResponseDto obtenerPorId(Long id) {
        return toResponseDtoConConteo(buscarEntidad(id));
    }

    public ProfesionalResumenDto obtenerResumen(Long id) {
        return profesionalMapper.toResumenDto(buscarEntidad(id));
    }

    @Transactional
    public ProfesionalResponseDto crear(CreateProfesionalDto dto) {
        if (profesionalRepository.existsByDni(dto.dni())) {
            throw new BusinessException("Ya existe un profesional con el DNI " + dto.dni());
        }
        Profesional profesional = profesionalMapper.toEntity(dto);
        return toResponseDtoConConteo(profesionalRepository.save(profesional));
    }

    @Transactional
    public ProfesionalResponseDto actualizar(Long id, UpdateProfesionalDto dto) {
        Profesional profesional = buscarEntidad(id);
        profesional.setNombres(dto.nombres());
        profesional.setApPaterno(dto.apPaterno());
        profesional.setApMaterno(dto.apMaterno());
        profesional.setEspecialidad(dto.especialidad());
        profesional.setColegiatura(dto.colegiatura());
        profesional.setTipoColegio(dto.tipoColegio());
        profesional.setCentroId(dto.centroId());
        profesional.setActivo(dto.activo());
        return toResponseDtoConConteo(profesionalRepository.save(profesional));
    }

    private ProfesionalResponseDto toResponseDtoConConteo(Profesional profesional) {
        long totalPacientes = profesionalRepository.contarPacientesDistintos(profesional.getId());
        return profesionalMapper.toResponseDto(profesional, totalPacientes);
    }

    private Specification<Profesional> construirBusqueda(String q) {
        if (!StringUtils.hasText(q)) {
            return null;
        }
        String patron = "%" + q.trim().toLowerCase() + "%";
        return (root, query, cb) -> {
            List<Predicate> predicados = new ArrayList<>();
            predicados.add(cb.like(cb.lower(root.get("nombres")), patron));
            predicados.add(cb.like(cb.lower(root.get("apPaterno")), patron));
            predicados.add(cb.like(cb.lower(root.get("apMaterno")), patron));
            predicados.add(cb.like(root.get("dni"), patron));
            return cb.or(predicados.toArray(new Predicate[0]));
        };
    }

    private Profesional buscarEntidad(Long id) {
        return profesionalRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Profesional no encontrado: " + id));
    }
}
