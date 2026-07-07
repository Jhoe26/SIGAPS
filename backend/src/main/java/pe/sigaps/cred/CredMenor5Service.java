package pe.sigaps.cred;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pe.sigaps.auditoria.AccionAuditoria;
import pe.sigaps.auditoria.Auditable;
import pe.sigaps.common.FiltrosClinicos;
import pe.sigaps.common.ReglaPropiedad;
import pe.sigaps.common.StatsUtil;
import pe.sigaps.common.dto.StatsDto;
import pe.sigaps.common.exception.NotFoundException;
import pe.sigaps.cred.dto.CreateCredMenor5Dto;
import pe.sigaps.cred.dto.CredMenor5ResponseDto;
import pe.sigaps.cred.dto.UpdateCredMenor5Dto;
import pe.sigaps.cred.mapper.CredMenor5Mapper;
import pe.sigaps.paciente.PacienteService;
import pe.sigaps.profesional.ProfesionalService;
import pe.sigaps.profesional.dto.ProfesionalResumenDto;
import pe.sigaps.security.SecurityUtils;
import pe.sigaps.usuario.UsuarioService;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CredMenor5Service {

    private final CredMenor5Repository credMenor5Repository;
    private final PacienteService pacienteService;
    private final UsuarioService usuarioService;
    private final ProfesionalService profesionalService;
    private final CredMenor5Mapper credMenor5Mapper;

    public Page<CredMenor5ResponseDto> buscar(Long pacienteId, LocalDate desde, LocalDate hasta, Pageable pageable) {
        var spec = FiltrosClinicos.<CredMenor5>porPacienteYRangoFecha(pacienteId, "fecha", desde, hasta);
        return credMenor5Repository.findAll(spec, pageable).map(this::toResponseDto);
    }

    public List<CredMenor5ResponseDto> listarPorPaciente(Long pacienteId) {
        return credMenor5Repository.findByPacienteIdOrderByFechaDesc(pacienteId).stream()
                .map(this::toResponseDto)
                .toList();
    }

    public CredMenor5ResponseDto obtenerPorId(Long id) {
        return toResponseDto(buscarEntidad(id));
    }

    public StatsDto stats() {
        return StatsUtil.calcular(credMenor5Repository);
    }

    @Transactional
    @Auditable(tabla = "cred_menor5", accion = AccionAuditoria.INSERT)
    public CredMenor5ResponseDto crear(CreateCredMenor5Dto dto) {
        CredMenor5 entidad = credMenor5Mapper.toEntity(dto);
        entidad.setRegistradoPorId(SecurityUtils.usuarioActualId());
        return toResponseDto(credMenor5Repository.save(entidad));
    }

    @Transactional
    @Auditable(tabla = "cred_menor5", accion = AccionAuditoria.UPDATE)
    public CredMenor5ResponseDto actualizar(Long id, UpdateCredMenor5Dto dto) {
        CredMenor5 entidad = buscarEntidad(id);
        ReglaPropiedad.verificarPropietario(entidad.getRegistradoPorId(), SecurityUtils.usuarioActualId());
        ReglaPropiedad.verificarNoHistorico(entidad.isEsHistorico());

        entidad.setProfesionalId(dto.profesionalId());
        entidad.setFecha(dto.fecha());
        entidad.setEdadPuntual(dto.edadPuntual());
        entidad.setNumControl(dto.numControl());
        entidad.setPeso(dto.peso());
        entidad.setTalla(dto.talla());
        entidad.setPerimetroCefalico(dto.perimetroCefalico());
        entidad.setDxNutricional(dto.dxNutricional());
        entidad.setLactanciaHasta6m(dto.lactanciaHasta6m());
        entidad.setGradoRiesgo(dto.gradoRiesgo());
        entidad.setObservaciones(dto.observaciones());
        return toResponseDto(credMenor5Repository.save(entidad));
    }

    @Transactional
    @Auditable(tabla = "cred_menor5", accion = AccionAuditoria.DELETE)
    public void eliminar(Long id) {
        CredMenor5 entidad = buscarEntidad(id);
        ReglaPropiedad.verificarPropietario(entidad.getRegistradoPorId(), SecurityUtils.usuarioActualId());
        ReglaPropiedad.verificarNoHistorico(entidad.isEsHistorico());
        credMenor5Repository.delete(entidad);
    }

    private CredMenor5ResponseDto toResponseDto(CredMenor5 entidad) {
        ProfesionalResumenDto profesional = entidad.getProfesionalId() != null
                ? profesionalService.obtenerResumen(entidad.getProfesionalId())
                : null;
        return credMenor5Mapper.toResponseDto(
                entidad,
                pacienteService.obtenerResumen(entidad.getPacienteId()),
                usuarioService.obtenerResumen(entidad.getRegistradoPorId()),
                profesional);
    }

    private CredMenor5 buscarEntidad(Long id) {
        return credMenor5Repository.findById(id)
                .orElseThrow(() -> new NotFoundException("Registro CRED no encontrado: " + id));
    }
}
