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
import pe.sigaps.cred.dto.CreateCredMayor5Dto;
import pe.sigaps.cred.dto.CredMayor5ResponseDto;
import pe.sigaps.cred.dto.UpdateCredMayor5Dto;
import pe.sigaps.cred.mapper.CredMayor5Mapper;
import pe.sigaps.paciente.PacienteService;
import pe.sigaps.profesional.ProfesionalService;
import pe.sigaps.profesional.dto.ProfesionalResumenDto;
import pe.sigaps.security.SecurityUtils;
import pe.sigaps.usuario.UsuarioService;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CredMayor5Service {

    private final CredMayor5Repository credMayor5Repository;
    private final PacienteService pacienteService;
    private final UsuarioService usuarioService;
    private final ProfesionalService profesionalService;
    private final CredMayor5Mapper credMayor5Mapper;

    public Page<CredMayor5ResponseDto> buscar(Long pacienteId, LocalDate desde, LocalDate hasta, Pageable pageable) {
        var spec = FiltrosClinicos.<CredMayor5>porPacienteYRangoFecha(pacienteId, "fecha", desde, hasta);
        return credMayor5Repository.findAll(spec, pageable).map(this::toResponseDto);
    }

    public List<CredMayor5ResponseDto> listarPorPaciente(Long pacienteId) {
        return credMayor5Repository.findByPacienteIdOrderByFechaDesc(pacienteId).stream()
                .map(this::toResponseDto)
                .toList();
    }

    public CredMayor5ResponseDto obtenerPorId(Long id) {
        return toResponseDto(buscarEntidad(id));
    }

    public StatsDto stats() {
        return StatsUtil.calcular(credMayor5Repository);
    }

    @Transactional
    @Auditable(tabla = "cred_mayor5", accion = AccionAuditoria.INSERT)
    public CredMayor5ResponseDto crear(CreateCredMayor5Dto dto) {
        CredMayor5 entidad = credMayor5Mapper.toEntity(dto);
        entidad.setRegistradoPorId(SecurityUtils.usuarioActualId());
        calcularImc(entidad);
        return toResponseDto(credMayor5Repository.save(entidad));
    }

    @Transactional
    @Auditable(tabla = "cred_mayor5", accion = AccionAuditoria.UPDATE)
    public CredMayor5ResponseDto actualizar(Long id, UpdateCredMayor5Dto dto) {
        CredMayor5 entidad = buscarEntidad(id);
        ReglaPropiedad.verificarPropietario(entidad.getRegistradoPorId(), SecurityUtils.usuarioActualId());
        ReglaPropiedad.verificarNoHistorico(entidad.isEsHistorico());

        entidad.setProfesionalId(dto.profesionalId());
        entidad.setFecha(dto.fecha());
        entidad.setEdadPuntual(dto.edadPuntual());
        entidad.setNumControl(dto.numControl());
        entidad.setPeso(dto.peso());
        entidad.setTalla(dto.talla());
        entidad.setRiesgoNutricional(dto.riesgoNutricional());
        entidad.setDxNutricional(dto.dxNutricional());
        entidad.setObservaciones(dto.observaciones());
        calcularImc(entidad);
        return toResponseDto(credMayor5Repository.save(entidad));
    }

    @Transactional
    @Auditable(tabla = "cred_mayor5", accion = AccionAuditoria.DELETE)
    public void eliminar(Long id) {
        CredMayor5 entidad = buscarEntidad(id);
        ReglaPropiedad.verificarPropietario(entidad.getRegistradoPorId(), SecurityUtils.usuarioActualId());
        ReglaPropiedad.verificarNoHistorico(entidad.isEsHistorico());
        credMayor5Repository.delete(entidad);
    }

    private void calcularImc(CredMayor5 entidad) {
        if (entidad.getPeso() != null && entidad.getTalla() != null
                && entidad.getTalla().compareTo(BigDecimal.ZERO) != 0) {
            BigDecimal tallaAlCuadrado = entidad.getTalla().multiply(entidad.getTalla());
            entidad.setImc(entidad.getPeso().divide(tallaAlCuadrado, 2, RoundingMode.HALF_UP));
        }
    }

    private CredMayor5ResponseDto toResponseDto(CredMayor5 entidad) {
        ProfesionalResumenDto profesional = entidad.getProfesionalId() != null
                ? profesionalService.obtenerResumen(entidad.getProfesionalId())
                : null;
        return credMayor5Mapper.toResponseDto(
                entidad,
                pacienteService.obtenerResumen(entidad.getPacienteId()),
                usuarioService.obtenerResumen(entidad.getRegistradoPorId()),
                profesional);
    }

    private CredMayor5 buscarEntidad(Long id) {
        return credMayor5Repository.findById(id)
                .orElseThrow(() -> new NotFoundException("Registro CRED no encontrado: " + id));
    }
}
