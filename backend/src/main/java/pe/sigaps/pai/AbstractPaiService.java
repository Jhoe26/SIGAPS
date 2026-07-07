package pe.sigaps.pai;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.transaction.annotation.Transactional;
import pe.sigaps.catalogo.VacunaCatalogo;
import pe.sigaps.catalogo.VacunaCatalogoRepository;
import pe.sigaps.catalogo.mapper.VacunaCatalogoMapper;
import pe.sigaps.common.FiltrosClinicos;
import pe.sigaps.common.ReglaPropiedad;
import pe.sigaps.common.StatsUtil;
import pe.sigaps.common.dto.StatsDto;
import pe.sigaps.common.exception.NotFoundException;
import pe.sigaps.paciente.PacienteService;
import pe.sigaps.pai.dto.CreatePaiDto;
import pe.sigaps.pai.dto.PaiResponseDto;
import pe.sigaps.pai.dto.UpdatePaiDto;
import pe.sigaps.profesional.ProfesionalService;
import pe.sigaps.profesional.dto.ProfesionalResumenDto;
import pe.sigaps.security.SecurityUtils;
import pe.sigaps.usuario.UsuarioService;

import java.time.LocalDate;
import java.util.List;

/**
 * Lógica común a las 4 tablas PAI. Cada subclase concreta es un @Service delgado que
 * expone métodos públicos anotados con @Auditable (el nombre de tabla es distinto por
 * subclase, y la anotación exige un valor constante, así que no puede vivir aquí).
 */
public abstract class AbstractPaiService<T extends PaiRegistro> {

    protected final PaiJpaRepository<T> repositorio;
    private final PacienteService pacienteService;
    private final UsuarioService usuarioService;
    private final ProfesionalService profesionalService;
    private final VacunaCatalogoRepository vacunaCatalogoRepository;
    private final VacunaCatalogoMapper vacunaCatalogoMapper;

    protected AbstractPaiService(PaiJpaRepository<T> repositorio, PacienteService pacienteService,
                                  UsuarioService usuarioService,
                                  ProfesionalService profesionalService,
                                  VacunaCatalogoRepository vacunaCatalogoRepository,
                                  VacunaCatalogoMapper vacunaCatalogoMapper) {
        this.repositorio = repositorio;
        this.pacienteService = pacienteService;
        this.usuarioService = usuarioService;
        this.profesionalService = profesionalService;
        this.vacunaCatalogoRepository = vacunaCatalogoRepository;
        this.vacunaCatalogoMapper = vacunaCatalogoMapper;
    }

    protected abstract T nuevaInstancia();

    protected abstract String nombreEntidad();

    @Transactional(readOnly = true)
    public Page<PaiResponseDto> buscar(Long pacienteId, LocalDate desde, LocalDate hasta, Pageable pageable) {
        var spec = FiltrosClinicos.<T>porPacienteYRangoFecha(pacienteId, "fechaAplicacion", desde, hasta);
        return repositorio.findAll(spec, pageable).map(this::toResponseDto);
    }

    @Transactional(readOnly = true)
    public List<PaiResponseDto> listarPorPaciente(Long pacienteId) {
        return repositorio.findByPacienteIdOrderByFechaAplicacionDesc(pacienteId).stream()
                .map(this::toResponseDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public PaiResponseDto obtenerPorId(Long id) {
        return toResponseDto(buscarEntidad(id));
    }

    @Transactional(readOnly = true)
    public StatsDto stats() {
        return StatsUtil.calcular(repositorio);
    }

    protected PaiResponseDto crearInterno(CreatePaiDto dto) {
        buscarVacuna(dto.vacunaId());
        T entidad = nuevaInstancia();
        entidad.setPacienteId(dto.pacienteId());
        entidad.setVacunaId(dto.vacunaId());
        entidad.setNumDosis(dto.numDosis());
        entidad.setFechaAplicacion(dto.fechaAplicacion());
        entidad.setLote(dto.lote());
        entidad.setTipoAplicacion(dto.tipoAplicacion());
        entidad.setObservaciones(dto.observaciones());
        entidad.setRegistradoPorId(SecurityUtils.usuarioActualId());
        entidad.setProfesionalId(dto.profesionalId());
        return toResponseDto(repositorio.save(entidad));
    }

    protected PaiResponseDto actualizarInterno(Long id, UpdatePaiDto dto) {
        T entidad = buscarEntidad(id);
        ReglaPropiedad.verificarPropietario(entidad.getRegistradoPorId(), SecurityUtils.usuarioActualId());
        ReglaPropiedad.verificarNoHistorico(entidad.isEsHistorico());
        buscarVacuna(dto.vacunaId());

        entidad.setProfesionalId(dto.profesionalId());
        entidad.setVacunaId(dto.vacunaId());
        entidad.setNumDosis(dto.numDosis());
        entidad.setFechaAplicacion(dto.fechaAplicacion());
        entidad.setLote(dto.lote());
        entidad.setTipoAplicacion(dto.tipoAplicacion());
        entidad.setObservaciones(dto.observaciones());
        return toResponseDto(repositorio.save(entidad));
    }

    protected void eliminarInterno(Long id) {
        T entidad = buscarEntidad(id);
        ReglaPropiedad.verificarPropietario(entidad.getRegistradoPorId(), SecurityUtils.usuarioActualId());
        ReglaPropiedad.verificarNoHistorico(entidad.isEsHistorico());
        repositorio.delete(entidad);
    }

    private VacunaCatalogo buscarVacuna(Long vacunaId) {
        return vacunaCatalogoRepository.findById(vacunaId)
                .orElseThrow(() -> new NotFoundException("Vacuna no encontrada: " + vacunaId));
    }

    private PaiResponseDto toResponseDto(T entidad) {
        VacunaCatalogo vacuna = vacunaCatalogoRepository.findById(entidad.getVacunaId()).orElse(null);
        ProfesionalResumenDto profesional = entidad.getProfesionalId() != null
                ? profesionalService.obtenerResumen(entidad.getProfesionalId())
                : null;
        return new PaiResponseDto(
                entidad.getId(),
                pacienteService.obtenerResumen(entidad.getPacienteId()),
                usuarioService.obtenerResumen(entidad.getRegistradoPorId()),
                profesional,
                vacuna != null ? vacunaCatalogoMapper.toResponseDto(vacuna) : null,
                entidad.getNumDosis(),
                entidad.getFechaAplicacion(),
                entidad.getLote(),
                entidad.getTipoAplicacion(),
                entidad.getObservaciones(),
                entidad.isEsHistorico(),
                entidad.getCreatedAt()
        );
    }

    private T buscarEntidad(Long id) {
        return repositorio.findById(id)
                .orElseThrow(() -> new NotFoundException(nombreEntidad() + " no encontrado: " + id));
    }
}
