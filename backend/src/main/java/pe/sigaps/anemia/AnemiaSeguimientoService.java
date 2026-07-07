package pe.sigaps.anemia;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pe.sigaps.anemia.dto.AnemiaResponseDto;
import pe.sigaps.anemia.dto.ControlEnfermeriaDto;
import pe.sigaps.anemia.dto.ControlMedicoDto;
import pe.sigaps.anemia.dto.CreateAnemiaDto;
import pe.sigaps.anemia.dto.UpdateAnemiaDto;
import pe.sigaps.anemia.mapper.AnemiaSeguimientoMapper;
import pe.sigaps.auditoria.AccionAuditoria;
import pe.sigaps.auditoria.Auditable;
import pe.sigaps.common.FiltrosClinicos;
import pe.sigaps.common.ReglaPropiedad;
import pe.sigaps.common.StatsUtil;
import pe.sigaps.common.dto.StatsDto;
import pe.sigaps.common.exception.ForbiddenException;
import pe.sigaps.common.exception.NotFoundException;
import pe.sigaps.paciente.PacienteService;
import pe.sigaps.parametro.ParametroService;
import pe.sigaps.profesional.ProfesionalService;
import pe.sigaps.profesional.dto.ProfesionalResumenDto;
import pe.sigaps.security.SecurityUtils;
import pe.sigaps.usuario.UsuarioService;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AnemiaSeguimientoService {

    private static final String CLAVE_CORRECCION_HB = "HB_CORRECCION_AYACUCHO";

    private final AnemiaSeguimientoRepository anemiaSeguimientoRepository;
    private final PacienteService pacienteService;
    private final UsuarioService usuarioService;
    private final ProfesionalService profesionalService;
    private final ParametroService parametroService;
    private final AnemiaSeguimientoMapper anemiaSeguimientoMapper;

    public Page<AnemiaResponseDto> buscar(Long pacienteId, LocalDate desde, LocalDate hasta, Pageable pageable) {
        var spec = FiltrosClinicos.<AnemiaSeguimiento>porPacienteYRangoFecha(pacienteId, "fechaInicio", desde, hasta);
        return anemiaSeguimientoRepository.findAll(spec, pageable).map(this::toResponseDto);
    }

    public List<AnemiaResponseDto> listarPorPaciente(Long pacienteId) {
        return anemiaSeguimientoRepository.findByPacienteIdOrderByFechaInicioDesc(pacienteId).stream()
                .map(this::toResponseDto)
                .toList();
    }

    public StatsDto stats() {
        return StatsUtil.calcular(anemiaSeguimientoRepository);
    }

    public AnemiaResponseDto obtenerPorId(Long id) {
        return toResponseDto(buscarEntidad(id));
    }

    @Transactional
    @Auditable(tabla = "anemia_seguimiento", accion = AccionAuditoria.INSERT)
    public AnemiaResponseDto crear(CreateAnemiaDto dto) {
        AnemiaSeguimiento entidad = anemiaSeguimientoMapper.toEntity(dto);
        entidad.setRegistradoPorId(SecurityUtils.usuarioActualId());
        entidad.setEstado(EstadoAnemia.EN_TRATAMIENTO);
        entidad.setHbInicialCorr(corregir(dto.hbInicialObs()));
        return toResponseDto(anemiaSeguimientoRepository.save(entidad));
    }

    @Transactional
    @Auditable(tabla = "anemia_seguimiento", accion = AccionAuditoria.UPDATE)
    public AnemiaResponseDto actualizar(Long id, UpdateAnemiaDto dto) {
        AnemiaSeguimiento entidad = buscarEntidad(id);
        ReglaPropiedad.verificarPropietario(entidad.getRegistradoPorId(), SecurityUtils.usuarioActualId());
        ReglaPropiedad.verificarNoHistorico(entidad.isEsHistorico());

        entidad.setProfesionalId(dto.profesionalId());
        entidad.setFechaInicio(dto.fechaInicio());
        entidad.setHbInicialObs(dto.hbInicialObs());
        entidad.setHbInicialCorr(corregir(dto.hbInicialObs()));
        entidad.setDxInicial(dto.dxInicial());
        entidad.setTipoHierro(dto.tipoHierro());
        entidad.setDosisIndicada(dto.dosisIndicada());
        entidad.setEstado(dto.estado());
        entidad.setObservaciones(dto.observaciones());
        return toResponseDto(anemiaSeguimientoRepository.save(entidad));
    }

    @Transactional
    @Auditable(tabla = "anemia_seguimiento", accion = AccionAuditoria.DELETE)
    public void eliminar(Long id) {
        AnemiaSeguimiento entidad = buscarEntidad(id);
        ReglaPropiedad.verificarPropietario(entidad.getRegistradoPorId(), SecurityUtils.usuarioActualId());
        ReglaPropiedad.verificarNoHistorico(entidad.isEsHistorico());
        anemiaSeguimientoRepository.delete(entidad);
    }

    @Transactional
    @Auditable(tabla = "anemia_seguimiento", accion = AccionAuditoria.UPDATE)
    public AnemiaResponseDto registrarControl1Enfermeria(Long id, ControlEnfermeriaDto dto) {
        AnemiaSeguimiento entidad = buscarEntidad(id);
        ReglaPropiedad.verificarNoHistorico(entidad.isEsHistorico());
        verificarPropiedadControl(entidad.getReg1EnfId());
        entidad.setReg1EnfId(SecurityUtils.usuarioActualId());
        entidad.setFecha1Enf(dto.fecha());
        entidad.setHb1Obs(dto.hbObservado());
        entidad.setHb1Corr(corregir(dto.hbObservado()));
        return toResponseDto(anemiaSeguimientoRepository.save(entidad));
    }

    @Transactional
    @Auditable(tabla = "anemia_seguimiento", accion = AccionAuditoria.UPDATE)
    public AnemiaResponseDto registrarControl1Medico(Long id, ControlMedicoDto dto) {
        AnemiaSeguimiento entidad = buscarEntidad(id);
        ReglaPropiedad.verificarNoHistorico(entidad.isEsHistorico());
        verificarPropiedadControl(entidad.getReg1MedId());
        entidad.setReg1MedId(SecurityUtils.usuarioActualId());
        entidad.setFecha1Med(dto.fecha());
        entidad.setObs1Med(dto.observaciones());
        return toResponseDto(anemiaSeguimientoRepository.save(entidad));
    }

    @Transactional
    @Auditable(tabla = "anemia_seguimiento", accion = AccionAuditoria.UPDATE)
    public AnemiaResponseDto registrarControl2Enfermeria(Long id, ControlEnfermeriaDto dto) {
        AnemiaSeguimiento entidad = buscarEntidad(id);
        ReglaPropiedad.verificarNoHistorico(entidad.isEsHistorico());
        verificarPropiedadControl(entidad.getReg2EnfId());
        entidad.setReg2EnfId(SecurityUtils.usuarioActualId());
        entidad.setFecha2Enf(dto.fecha());
        entidad.setHb2Obs(dto.hbObservado());
        entidad.setHb2Corr(corregir(dto.hbObservado()));
        return toResponseDto(anemiaSeguimientoRepository.save(entidad));
    }

    @Transactional
    @Auditable(tabla = "anemia_seguimiento", accion = AccionAuditoria.UPDATE)
    public AnemiaResponseDto registrarControl2Medico(Long id, ControlMedicoDto dto) {
        AnemiaSeguimiento entidad = buscarEntidad(id);
        ReglaPropiedad.verificarNoHistorico(entidad.isEsHistorico());
        verificarPropiedadControl(entidad.getReg2MedId());
        entidad.setReg2MedId(SecurityUtils.usuarioActualId());
        entidad.setFecha2Med(dto.fecha());
        entidad.setObs2Med(dto.observaciones());
        return toResponseDto(anemiaSeguimientoRepository.save(entidad));
    }

    @Transactional
    @Auditable(tabla = "anemia_seguimiento", accion = AccionAuditoria.UPDATE)
    public AnemiaResponseDto registrarControl3Enfermeria(Long id, ControlEnfermeriaDto dto) {
        AnemiaSeguimiento entidad = buscarEntidad(id);
        ReglaPropiedad.verificarNoHistorico(entidad.isEsHistorico());
        verificarPropiedadControl(entidad.getReg3EnfId());
        entidad.setReg3EnfId(SecurityUtils.usuarioActualId());
        entidad.setFecha3Enf(dto.fecha());
        entidad.setHb3Obs(dto.hbObservado());
        entidad.setHb3Corr(corregir(dto.hbObservado()));
        return toResponseDto(anemiaSeguimientoRepository.save(entidad));
    }

    /**
     * A diferencia de ReglaPropiedad.verificarPropietario, un control aún no registrado
     * (id nulo) puede ser tomado por cualquier profesional; una vez registrado, solo
     * quien lo registró puede corregirlo.
     */
    private void verificarPropiedadControl(Long registradoPorIdExistente) {
        if (registradoPorIdExistente != null
                && !registradoPorIdExistente.equals(SecurityUtils.usuarioActualId())) {
            throw new ForbiddenException("Este control ya fue registrado por otro profesional");
        }
    }

    private BigDecimal corregir(BigDecimal hbObservado) {
        if (hbObservado == null) {
            return null;
        }
        return hbObservado.subtract(parametroService.getDecimal(CLAVE_CORRECCION_HB));
    }

    private AnemiaResponseDto toResponseDto(AnemiaSeguimiento entidad) {
        ProfesionalResumenDto profesional = entidad.getProfesionalId() != null
                ? profesionalService.obtenerResumen(entidad.getProfesionalId())
                : null;
        return anemiaSeguimientoMapper.toResponseDto(
                entidad,
                pacienteService.obtenerResumen(entidad.getPacienteId()),
                usuarioService.obtenerResumen(entidad.getRegistradoPorId()),
                profesional,
                usuarioService::obtenerResumen);
    }

    private AnemiaSeguimiento buscarEntidad(Long id) {
        return anemiaSeguimientoRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Caso de anemia no encontrado: " + id));
    }
}
