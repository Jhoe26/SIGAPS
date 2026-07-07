package pe.sigaps.paciente;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pe.sigaps.auditoria.AccionAuditoria;
import pe.sigaps.auditoria.Auditable;
import pe.sigaps.common.exception.BusinessException;
import pe.sigaps.common.exception.ForbiddenException;
import pe.sigaps.common.exception.NotFoundException;
import pe.sigaps.paciente.dto.CreatePacienteDto;
import pe.sigaps.paciente.dto.PacienteResponseDto;
import pe.sigaps.paciente.dto.PacienteResumenDto;
import pe.sigaps.paciente.dto.UpdatePacienteDto;
import pe.sigaps.paciente.mapper.PacienteMapper;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PacienteService {

    private final PacienteRepository pacienteRepository;
    private final PacienteMapper pacienteMapper;

    public Page<PacienteResponseDto> buscar(String search, Pageable pageable) {
        Specification<Paciente> spec = construirFiltro(search);
        return pacienteRepository.findAll(spec, pageable).map(pacienteMapper::toResponseDto);
    }

    public PacienteResponseDto obtenerPorId(Long id) {
        return pacienteMapper.toResponseDto(buscarEntidad(id));
    }

    public PacienteResumenDto obtenerResumen(Long id) {
        Paciente paciente = buscarEntidad(id);
        return new PacienteResumenDto(paciente.getId(), paciente.getDni(), paciente.getNombreCompleto(),
                paciente.getFechaNacimiento());
    }

    public PacienteResponseDto obtenerPorDni(String dni) {
        return pacienteRepository.findByDni(dni)
                .map(pacienteMapper::toResponseDto)
                .orElseThrow(() -> new NotFoundException("Paciente no encontrado con DNI " + dni));
    }

    @Transactional
    @Auditable(tabla = "paciente", accion = AccionAuditoria.INSERT)
    public PacienteResponseDto crear(CreatePacienteDto dto) {
        if (pacienteRepository.existsByDni(dto.dni())) {
            throw new BusinessException("Ya existe un paciente con el DNI " + dto.dni());
        }
        Paciente paciente = pacienteMapper.toEntity(dto);
        return pacienteMapper.toResponseDto(pacienteRepository.save(paciente));
    }

    @Transactional
    @Auditable(tabla = "paciente", accion = AccionAuditoria.UPDATE)
    public PacienteResponseDto actualizar(Long id, UpdatePacienteDto dto) {
        Paciente paciente = buscarEntidad(id);
        if (paciente.isEsHistorico()) {
            throw new ForbiddenException("Los registros históricos son inmutables");
        }
        paciente.setApPaterno(dto.apPaterno());
        paciente.setApMaterno(dto.apMaterno());
        paciente.setNombres(dto.nombres());
        paciente.setFechaNacimiento(dto.fechaNacimiento());
        paciente.setSexo(dto.sexo());
        paciente.setTelefono(dto.telefono());
        paciente.setDireccion(dto.direccion());
        paciente.setDistrito(dto.distrito());
        paciente.setTipoSeguro(dto.tipoSeguro());
        return pacienteMapper.toResponseDto(pacienteRepository.save(paciente));
    }

    private Paciente buscarEntidad(Long id) {
        return pacienteRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Paciente no encontrado: " + id));
    }

    private Specification<Paciente> construirFiltro(String search) {
        return (root, query, cb) -> {
            if (search == null || search.isBlank()) {
                return cb.isTrue(root.get("activo"));
            }
            String like = "%" + search.toLowerCase() + "%";
            return cb.and(
                    cb.isTrue(root.get("activo")),
                    cb.or(
                            cb.equal(root.get("dni"), search),
                            cb.like(cb.lower(root.get("apPaterno")), like),
                            cb.like(cb.lower(root.get("apMaterno")), like),
                            cb.like(cb.lower(root.get("nombres")), like)
                    )
            );
        };
    }
}
