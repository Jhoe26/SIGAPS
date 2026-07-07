package pe.sigaps.gestante;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pe.sigaps.auditoria.AccionAuditoria;
import pe.sigaps.auditoria.Auditable;
import pe.sigaps.common.ReglaPropiedad;
import pe.sigaps.common.StatsUtil;
import pe.sigaps.common.dto.StatsDto;
import pe.sigaps.common.exception.NotFoundException;
import pe.sigaps.gestante.dto.CreateGestanteDto;
import pe.sigaps.gestante.dto.GestanteResponseDto;
import pe.sigaps.gestante.dto.UpdateGestanteDto;
import pe.sigaps.gestante.mapper.GestanteMapper;
import pe.sigaps.paciente.PacienteService;
import pe.sigaps.profesional.ProfesionalService;
import pe.sigaps.profesional.dto.ProfesionalResumenDto;
import pe.sigaps.security.SecurityUtils;
import pe.sigaps.usuario.UsuarioService;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class GestanteService {

    private final GestanteRepository gestanteRepository;
    private final PacienteService pacienteService;
    private final UsuarioService usuarioService;
    private final ProfesionalService profesionalService;
    private final GestanteMapper gestanteMapper;

    public Page<GestanteResponseDto> buscar(Long pacienteId, Pageable pageable) {
        Specification<Gestante> spec = (root, query, cb) -> pacienteId == null
                ? cb.conjunction()
                : cb.equal(root.get("pacienteId"), pacienteId);
        return gestanteRepository.findAll(spec, pageable).map(this::toResponseDto);
    }

    public List<GestanteResponseDto> listarPorPaciente(Long pacienteId) {
        return gestanteRepository.findByPacienteIdOrderByCreatedAtDesc(pacienteId).stream()
                .map(this::toResponseDto)
                .toList();
    }

    public GestanteResponseDto obtenerPorId(Long id) {
        return toResponseDto(buscarEntidad(id));
    }

    public StatsDto stats() {
        return StatsUtil.calcular(gestanteRepository);
    }

    @Transactional
    @Auditable(tabla = "gestante", accion = AccionAuditoria.INSERT)
    public GestanteResponseDto crear(CreateGestanteDto dto) {
        Gestante entidad = gestanteMapper.toEntity(dto);
        entidad.setRegistradoPorId(SecurityUtils.usuarioActualId());
        return toResponseDto(gestanteRepository.save(entidad));
    }

    @Transactional
    @Auditable(tabla = "gestante", accion = AccionAuditoria.UPDATE)
    public GestanteResponseDto actualizar(Long id, UpdateGestanteDto dto) {
        Gestante entidad = buscarEntidad(id);
        ReglaPropiedad.verificarPropietario(entidad.getRegistradoPorId(), SecurityUtils.usuarioActualId());
        ReglaPropiedad.verificarNoHistorico(entidad.isEsHistorico());

        entidad.setProfesionalId(dto.profesionalId());
        entidad.setTelefono(dto.telefono());
        entidad.setInfluenzaFecha(dto.influenzaFecha());
        entidad.setDt1Fecha(dto.dt1Fecha());
        entidad.setDt2Fecha(dto.dt2Fecha());
        entidad.setDt3Fecha(dto.dt3Fecha());
        entidad.setHepb1Fecha(dto.hepb1Fecha());
        entidad.setHepb2Fecha(dto.hepb2Fecha());
        entidad.setHepb3Fecha(dto.hepb3Fecha());
        entidad.setTdpaFecha(dto.tdpaFecha());
        entidad.setObservaciones(dto.observaciones());
        return toResponseDto(gestanteRepository.save(entidad));
    }

    @Transactional
    @Auditable(tabla = "gestante", accion = AccionAuditoria.DELETE)
    public void eliminar(Long id) {
        Gestante entidad = buscarEntidad(id);
        ReglaPropiedad.verificarPropietario(entidad.getRegistradoPorId(), SecurityUtils.usuarioActualId());
        ReglaPropiedad.verificarNoHistorico(entidad.isEsHistorico());
        gestanteRepository.delete(entidad);
    }

    private GestanteResponseDto toResponseDto(Gestante entidad) {
        ProfesionalResumenDto profesional = entidad.getProfesionalId() != null
                ? profesionalService.obtenerResumen(entidad.getProfesionalId())
                : null;
        return gestanteMapper.toResponseDto(
                entidad,
                pacienteService.obtenerResumen(entidad.getPacienteId()),
                usuarioService.obtenerResumen(entidad.getRegistradoPorId()),
                profesional);
    }

    private Gestante buscarEntidad(Long id) {
        return gestanteRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Registro de gestante no encontrado: " + id));
    }
}
