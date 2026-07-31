package pe.sigaps.paciente;

import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import jakarta.persistence.criteria.Subquery;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pe.sigaps.anemia.AnemiaSeguimiento;
import pe.sigaps.auditoria.AccionAuditoria;
import pe.sigaps.auditoria.Auditable;
import pe.sigaps.common.exception.BusinessException;
import pe.sigaps.common.exception.ForbiddenException;
import pe.sigaps.common.exception.NotFoundException;
import pe.sigaps.cred.CredMayor5;
import pe.sigaps.cred.CredMenor5;
import pe.sigaps.gestante.Gestante;
import pe.sigaps.pai.Pai12m5a;
import pe.sigaps.pai.Pai7a15a;
import pe.sigaps.pai.PaiMayor5a;
import pe.sigaps.pai.PaiMenor12m;
import pe.sigaps.paciente.dto.CreatePacienteDto;
import pe.sigaps.paciente.dto.PacienteResponseDto;
import pe.sigaps.paciente.dto.PacienteResumenDto;
import pe.sigaps.paciente.dto.UpdatePacienteDto;
import pe.sigaps.paciente.mapper.PacienteMapper;
import pe.sigaps.tamizaje.TamizajeHb;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PacienteService {

    private final PacienteRepository pacienteRepository;
    private final PacienteMapper pacienteMapper;

    public Page<PacienteResponseDto> buscar(String search, String estado, String programa, Pageable pageable) {
        Specification<Paciente> spec = construirFiltro(search, estado, programa);
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

    /** Tablas clínicas donde un paciente puede tener registros; usadas tanto por el
     * filtro "programa" (una tabla a la vez) como por el estado "ACTIVO" (cualquiera). */
    private static final List<Class<?>> TABLAS_CLINICAS = List.of(
            TamizajeHb.class, AnemiaSeguimiento.class, CredMenor5.class, CredMayor5.class,
            PaiMenor12m.class, Pai12m5a.class, PaiMayor5a.class, Pai7a15a.class, Gestante.class
    );

    public byte[] exportarCsv(String search, String estado, String programa) {
        Specification<Paciente> spec = construirFiltro(search, estado, programa);
        List<Paciente> pacientes = pacienteRepository.findAll(spec);

        StringBuilder sb = new StringBuilder("\uFEFF");
        sb.append("DNI,AP_PATERNO,AP_MATERNO,NOMBRES,FECHA_NAC,SEXO,TELEFONO,DISTRITO\r\n");
        for (Paciente p : pacientes) {
            sb.append(csv(p.getDni())).append(',')
                    .append(csv(p.getApPaterno())).append(',')
                    .append(csv(p.getApMaterno())).append(',')
                    .append(csv(p.getNombres())).append(',')
                    .append(csv(p.getFechaNacimiento() == null ? null : p.getFechaNacimiento().toString())).append(',')
                    .append(csv(p.getSexo() == null ? null : p.getSexo().name())).append(',')
                    .append(csv(p.getTelefono())).append(',')
                    .append(csv(p.getDistrito()))
                    .append("\r\n");
        }
        return sb.toString().getBytes(java.nio.charset.StandardCharsets.UTF_8);
    }

    private String csv(String valor) {
        if (valor == null) {
            return "";
        }
        return "\"" + valor.replace("\"", "\"\"") + "\"";
    }

    /**
     * "estado" y "programa" son filtros derivados: paciente no tiene columnas propias para
     * ellos, así que se resuelven contra los datos reales que sí existen:
     * - ACTIVO: EXISTS en cualquiera de las 9 tablas clínicas migradas (no la columna
     *   paciente.activo, que es un flag operativo distinto).
     * - EN_TRATAMIENTO / RECUPERADO: EXISTS en anemia_seguimiento con ese estado.
     * - HISTORICO: columna paciente.es_historico.
     * - programa: EXISTS en la tabla clínica correspondiente.
     */
    private Specification<Paciente> construirFiltro(String search, String estado, String programa) {
        return (root, query, cb) -> {
            List<Predicate> predicados = new ArrayList<>();

            if (search != null && !search.isBlank()) {
                String like = "%" + search.toLowerCase() + "%";
                predicados.add(cb.or(
                        cb.like(root.get("dni"), "%" + search + "%"),
                        cb.like(cb.lower(root.get("apPaterno")), like),
                        cb.like(cb.lower(root.get("apMaterno")), like),
                        cb.like(cb.lower(root.get("nombres")), like)
                ));
            }

            if (estado != null && !estado.isBlank()) {
                switch (estado.toUpperCase()) {
                    case "ACTIVO" -> predicados.add(existeEnCualquierModulo(root, query, cb));
                    case "EN_TRATAMIENTO" -> predicados.add(existeConEstadoAnemia(root, query, cb, pe.sigaps.anemia.EstadoAnemia.EN_TRATAMIENTO));
                    case "RECUPERADO" -> predicados.add(existeConEstadoAnemia(root, query, cb, pe.sigaps.anemia.EstadoAnemia.RECUPERADO));
                    case "HISTORICO" -> predicados.add(cb.isTrue(root.get("esHistorico")));
                    default -> { /* valor desconocido: no se agrega predicado */ }
                }
            }

            if (programa != null && !programa.isBlank()) {
                Predicate predicadoPrograma = construirPredicadoPrograma(programa, root, query, cb);
                if (predicadoPrograma != null) {
                    predicados.add(predicadoPrograma);
                }
            }

            return cb.and(predicados.toArray(new Predicate[0]));
        };
    }

    private Predicate existeConEstadoAnemia(Root<Paciente> root, CriteriaQuery<?> query, CriteriaBuilder cb, pe.sigaps.anemia.EstadoAnemia estadoAnemia) {
        Subquery<Long> sub = query.subquery(Long.class);
        Root<AnemiaSeguimiento> subRoot = sub.from(AnemiaSeguimiento.class);
        sub.select(cb.literal(1L));
        sub.where(
                cb.equal(subRoot.get("pacienteId"), root.get("id")),
                cb.equal(subRoot.get("estado"), estadoAnemia)
        );
        return cb.exists(sub);
    }

    private Predicate existeEnCualquierModulo(Root<Paciente> root, CriteriaQuery<?> query, CriteriaBuilder cb) {
        Predicate[] existencias = TABLAS_CLINICAS.stream()
                .map(tabla -> existeEnTabla(tabla, root, query, cb))
                .toArray(Predicate[]::new);
        return cb.or(existencias);
    }

    private Predicate construirPredicadoPrograma(String programa, Root<Paciente> root, CriteriaQuery<?> query, CriteriaBuilder cb) {
        return switch (programa.toUpperCase()) {
            case "TAMIZAJE" -> existeEnTabla(TamizajeHb.class, root, query, cb);
            case "ANEMIA" -> existeEnTabla(AnemiaSeguimiento.class, root, query, cb);
            case "CRED_MENOR5" -> existeEnTabla(CredMenor5.class, root, query, cb);
            case "CRED_MAYOR5" -> existeEnTabla(CredMayor5.class, root, query, cb);
            case "PAI_MENOR12M" -> existeEnTabla(PaiMenor12m.class, root, query, cb);
            case "PAI_12M_5A" -> existeEnTabla(Pai12m5a.class, root, query, cb);
            case "PAI_MAYOR5A" -> existeEnTabla(PaiMayor5a.class, root, query, cb);
            case "PAI_7A_15A" -> existeEnTabla(Pai7a15a.class, root, query, cb);
            case "GESTACIONAL" -> existeEnTabla(Gestante.class, root, query, cb);
            default -> null;
        };
    }

    private Predicate existeEnTabla(Class<?> entidad, Root<Paciente> root, CriteriaQuery<?> query, CriteriaBuilder cb) {
        Subquery<Long> sub = query.subquery(Long.class);
        Root<?> subRoot = sub.from(entidad);
        sub.select(cb.literal(1L));
        sub.where(cb.equal(subRoot.get("pacienteId"), root.get("id")));
        return cb.exists(sub);
    }
}
