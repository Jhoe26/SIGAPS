package pe.sigaps.tamizaje;

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
import pe.sigaps.paciente.Paciente;
import pe.sigaps.paciente.PacienteRepository;
import pe.sigaps.paciente.PacienteService;
import pe.sigaps.parametro.ParametroService;
import pe.sigaps.profesional.ProfesionalService;
import pe.sigaps.profesional.dto.ProfesionalResumenDto;
import pe.sigaps.security.SecurityUtils;
import pe.sigaps.tamizaje.dto.CreateTamizajeDto;
import pe.sigaps.tamizaje.dto.TamizajeHbResponseDto;
import pe.sigaps.tamizaje.dto.UpdateTamizajeDto;
import pe.sigaps.tamizaje.mapper.TamizajeHbMapper;
import pe.sigaps.usuario.UsuarioService;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.Period;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class TamizajeHbService {

    private static final String CLAVE_CORRECCION_HB = "HB_CORRECCION_AYACUCHO";

    private final TamizajeHbRepository tamizajeHbRepository;
    private final PacienteRepository pacienteRepository;
    private final PacienteService pacienteService;
    private final UsuarioService usuarioService;
    private final ProfesionalService profesionalService;
    private final ParametroService parametroService;
    private final TamizajeHbMapper tamizajeHbMapper;

    public Page<TamizajeHbResponseDto> buscar(Long pacienteId, LocalDate desde, LocalDate hasta, Pageable pageable) {
        var spec = FiltrosClinicos.<TamizajeHb>porPacienteYRangoFecha(pacienteId, "fecha", desde, hasta);
        return tamizajeHbRepository.findAll(spec, pageable).map(this::toResponseDto);
    }

    public List<TamizajeHbResponseDto> listarPorPaciente(Long pacienteId) {
        return tamizajeHbRepository.findByPacienteIdOrderByFechaDesc(pacienteId).stream()
                .map(this::toResponseDto)
                .toList();
    }

    public TamizajeHbResponseDto obtenerPorId(Long id) {
        return toResponseDto(buscarEntidad(id));
    }

    public StatsDto stats() {
        return StatsUtil.calcular(tamizajeHbRepository);
    }

    @Transactional
    @Auditable(tabla = "tamizaje_hb", accion = AccionAuditoria.INSERT)
    public TamizajeHbResponseDto crear(CreateTamizajeDto dto) {
        Paciente paciente = buscarPaciente(dto.pacienteId());
        TamizajeHb entidad = tamizajeHbMapper.toEntity(dto);
        entidad.setGrupoEtario(GrupoEtarioTamizaje.fromValor(dto.grupoEtario()));
        entidad.setRegistradoPorId(SecurityUtils.usuarioActualId());
        calcularCamposDerivados(entidad, paciente);
        return toResponseDto(tamizajeHbRepository.save(entidad));
    }

    @Transactional
    @Auditable(tabla = "tamizaje_hb", accion = AccionAuditoria.UPDATE)
    public TamizajeHbResponseDto actualizar(Long id, UpdateTamizajeDto dto) {
        TamizajeHb entidad = buscarEntidad(id);
        ReglaPropiedad.verificarPropietario(entidad.getRegistradoPorId(), SecurityUtils.usuarioActualId());
        ReglaPropiedad.verificarNoHistorico(entidad.isEsHistorico());

        Paciente paciente = buscarPaciente(entidad.getPacienteId());
        entidad.setProfesionalId(dto.profesionalId());
        entidad.setFecha(dto.fecha());
        entidad.setGrupoEtario(GrupoEtarioTamizaje.fromValor(dto.grupoEtario()));
        entidad.setTipoDosaje(dto.tipoDosaje());
        entidad.setHbObservado(dto.hbObservado());
        entidad.setObservaciones(dto.observaciones());
        calcularCamposDerivados(entidad, paciente);
        return toResponseDto(tamizajeHbRepository.save(entidad));
    }

    @Transactional
    @Auditable(tabla = "tamizaje_hb", accion = AccionAuditoria.DELETE)
    public void eliminar(Long id) {
        TamizajeHb entidad = buscarEntidad(id);
        ReglaPropiedad.verificarPropietario(entidad.getRegistradoPorId(), SecurityUtils.usuarioActualId());
        ReglaPropiedad.verificarNoHistorico(entidad.isEsHistorico());
        tamizajeHbRepository.delete(entidad);
    }

    private void calcularCamposDerivados(TamizajeHb entidad, Paciente paciente) {
        Period edad = Period.between(paciente.getFechaNacimiento(), entidad.getFecha());
        entidad.setEdadAnios(edad.getYears());
        entidad.setEdadMeses(edad.getMonths());
        entidad.setEdadDias(edad.getDays());
        if (entidad.getHbObservado() != null) {
            BigDecimal correccion = parametroService.getDecimal(CLAVE_CORRECCION_HB);
            entidad.setHbCorregido(entidad.getHbObservado().subtract(correccion));
        }
    }

    private TamizajeHbResponseDto toResponseDto(TamizajeHb entidad) {
        ProfesionalResumenDto profesional = entidad.getProfesionalId() != null
                ? profesionalService.obtenerResumen(entidad.getProfesionalId())
                : null;
        return tamizajeHbMapper.toResponseDto(
                entidad,
                pacienteService.obtenerResumen(entidad.getPacienteId()),
                usuarioService.obtenerResumen(entidad.getRegistradoPorId()),
                profesional);
    }

    private TamizajeHb buscarEntidad(Long id) {
        return tamizajeHbRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Registro de tamizaje no encontrado: " + id));
    }

    private Paciente buscarPaciente(Long pacienteId) {
        return pacienteRepository.findById(pacienteId)
                .orElseThrow(() -> new NotFoundException("Paciente no encontrado: " + pacienteId));
    }
}
