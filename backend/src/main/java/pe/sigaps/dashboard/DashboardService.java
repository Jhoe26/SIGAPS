package pe.sigaps.dashboard;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pe.sigaps.anemia.AnemiaSeguimientoRepository;
import pe.sigaps.anemia.EstadoAnemia;
import pe.sigaps.auditoria.AccionAuditoria;
import pe.sigaps.auditoria.AuditLog;
import pe.sigaps.auditoria.AuditLogRepository;
import pe.sigaps.common.StatsUtil;
import pe.sigaps.cred.CredMayor5Repository;
import pe.sigaps.cred.CredMenor5Repository;
import pe.sigaps.dashboard.dto.ActividadRecienteDto;
import pe.sigaps.dashboard.dto.CoberturaVacunaDto;
import pe.sigaps.dashboard.dto.DashboardResumenDto;
import pe.sigaps.dashboard.dto.SerieProgramaDto;
import pe.sigaps.dashboard.dto.StatCardDto;
import pe.sigaps.gestante.GestanteRepository;
import pe.sigaps.paciente.PacienteRepository;
import pe.sigaps.pai.Pai12m5aRepository;
import pe.sigaps.pai.Pai7a15aRepository;
import pe.sigaps.pai.PaiJpaRepository;
import pe.sigaps.pai.PaiMayor5aRepository;
import pe.sigaps.pai.PaiMenor12mRepository;
import pe.sigaps.pai.PaiRegistro;
import pe.sigaps.parametro.ParametroService;
import pe.sigaps.programa.ProgramaClave;
import pe.sigaps.programa.ProgramaDashboardService;
import pe.sigaps.tamizaje.TamizajeHbRepository;
import pe.sigaps.usuario.UsuarioRepository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.YearMonth;
import java.time.format.TextStyle;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Map;

/**
 * Nota de honestidad: "Citas Hoy", "Vacunas Pendientes" y "Alertas Activas" del
 * diseño original no tienen respaldo real (no existen módulos de citas, esquema de
 * vencimientos ni alertas en el sistema). Se sustituyen por métricas equivalentes
 * calculadas con datos reales: Atenciones Hoy, Vacunas Este Mes y Anemia en
 * Tratamiento, respectivamente.
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DashboardService {

    private static final Locale ES = Locale.forLanguageTag("es");
    private static final Map<String, String> DESCRIPCION_TABLA = Map.ofEntries(
            Map.entry("usuario", "un usuario"),
            Map.entry("paciente", "un paciente"),
            Map.entry("tamizaje_hb", "un tamizaje de hemoglobina"),
            Map.entry("cred_menor5", "un control CRED"),
            Map.entry("cred_mayor5", "un control CRED"),
            Map.entry("anemia_seguimiento", "un caso de anemia"),
            Map.entry("pai_menor12m", "una dosis de vacuna"),
            Map.entry("pai_12m_5a", "una dosis de vacuna"),
            Map.entry("pai_mayor5a", "una dosis de vacuna"),
            Map.entry("pai_7a_15a", "una dosis de vacuna"),
            Map.entry("gestante", "un registro de gestante")
    );
    private static final Map<AccionAuditoria, String> VERBO_ACCION = Map.of(
            AccionAuditoria.INSERT, "registró",
            AccionAuditoria.UPDATE, "actualizó",
            AccionAuditoria.DELETE, "eliminó"
    );

    private final PacienteRepository pacienteRepository;
    private final UsuarioRepository usuarioRepository;
    private final TamizajeHbRepository tamizajeHbRepository;
    private final CredMenor5Repository credMenor5Repository;
    private final CredMayor5Repository credMayor5Repository;
    private final AnemiaSeguimientoRepository anemiaSeguimientoRepository;
    private final PaiMenor12mRepository paiMenor12mRepository;
    private final Pai12m5aRepository pai12m5aRepository;
    private final PaiMayor5aRepository paiMayor5aRepository;
    private final Pai7a15aRepository pai7a15aRepository;
    private final GestanteRepository gestanteRepository;
    private final AuditLogRepository auditLogRepository;
    private final ParametroService parametroService;
    private final ProgramaDashboardService programaDashboardService;

    public DashboardResumenDto resumen() {
        return new DashboardResumenDto(
                construirStatCards(),
                construirAtencionesPorPrograma(),
                programaDashboardService.obtenerDashboard(ProgramaClave.ANEMIA).distribucion(),
                construirCoberturaVacunal(),
                construirActividadReciente()
        );
    }

    private List<StatCardDto> construirStatCards() {
        LocalDateTime inicioHoy = LocalDate.now().atStartOfDay();
        LocalDateTime finHoy = LocalDate.now().atTime(LocalTime.MAX);

        YearMonth mesActual = YearMonth.now();
        LocalDateTime inicioMes = mesActual.atDay(1).atStartOfDay();
        LocalDateTime finMes = mesActual.atEndOfMonth().atTime(LocalTime.MAX);

        long pacientesHoy = StatsUtil.contarEnRango(pacienteRepository, inicioHoy, finHoy);
        long atencionesHoy = contarTodasHoyOAyer(inicioHoy, finHoy);

        long vacunasEsteMes = StatsUtil.contarEnRango(paiMenor12mRepository, inicioMes, finMes)
                + StatsUtil.contarEnRango(pai12m5aRepository, inicioMes, finMes)
                + StatsUtil.contarEnRango(paiMayor5aRepository, inicioMes, finMes)
                + StatsUtil.contarEnRango(pai7a15aRepository, inicioMes, finMes);

        long controlesCred = credMenor5Repository.count() + credMayor5Repository.count();
        long gestantesActivas = StatsUtil.contarNoHistoricos(gestanteRepository);
        long anemiaEnTratamiento = anemiaSeguimientoRepository.countByEstado(EstadoAnemia.EN_TRATAMIENTO);

        return List.of(
                new StatCardDto("pacientesHoy", "Pacientes Hoy", pacientesHoy,
                        "Pacientes nuevos registrados hoy", pacienteRepository.count()),
                new StatCardDto("atencionesHoy", "Atenciones Hoy", atencionesHoy,
                        "Registros clínicos de hoy (sustituye \"Citas\": no hay módulo de citas)",
                        contarTodasTotal()),
                new StatCardDto("vacunasEsteMes", "Vacunas Este Mes", vacunasEsteMes,
                        "Dosis PAI aplicadas este mes (sustituye \"pendientes\": no hay esquema de vencimientos)",
                        paiMenor12mRepository.count() + pai12m5aRepository.count()
                                + paiMayor5aRepository.count() + pai7a15aRepository.count()),
                new StatCardDto("controlesCred", "Controles CRED", controlesCred,
                        "Total histórico de controles CRED", controlesCred),
                new StatCardDto("gestantesActivas", "Gestantes Activas", gestantesActivas,
                        "Registros de gestante vigentes", gestanteRepository.count()),
                new StatCardDto("anemiaEnTratamiento", "Anemia en Tratamiento", anemiaEnTratamiento,
                        "Casos activos (sustituye \"Alertas\": no hay módulo de alertas)",
                        anemiaSeguimientoRepository.count())
        );
    }

    private long contarTodasHoyOAyer(LocalDateTime inicio, LocalDateTime fin) {
        return StatsUtil.contarEnRango(tamizajeHbRepository, inicio, fin)
                + StatsUtil.contarEnRango(credMenor5Repository, inicio, fin)
                + StatsUtil.contarEnRango(credMayor5Repository, inicio, fin)
                + StatsUtil.contarEnRango(anemiaSeguimientoRepository, inicio, fin)
                + StatsUtil.contarEnRango(paiMenor12mRepository, inicio, fin)
                + StatsUtil.contarEnRango(pai12m5aRepository, inicio, fin)
                + StatsUtil.contarEnRango(paiMayor5aRepository, inicio, fin)
                + StatsUtil.contarEnRango(pai7a15aRepository, inicio, fin)
                + StatsUtil.contarEnRango(gestanteRepository, inicio, fin);
    }

    private long contarTodasTotal() {
        return tamizajeHbRepository.count()
                + credMenor5Repository.count()
                + credMayor5Repository.count()
                + anemiaSeguimientoRepository.count()
                + paiMenor12mRepository.count()
                + pai12m5aRepository.count()
                + paiMayor5aRepository.count()
                + pai7a15aRepository.count()
                + gestanteRepository.count();
    }

    private List<SerieProgramaDto> construirAtencionesPorPrograma() {
        List<PaiJpaRepository<? extends PaiRegistro>> paiRepos = List.of(
                paiMenor12mRepository, pai12m5aRepository, paiMayor5aRepository, pai7a15aRepository);

        List<SerieProgramaDto> resultado = new ArrayList<>();
        YearMonth actual = YearMonth.now();
        for (int i = 5; i >= 0; i--) {
            YearMonth ym = actual.minusMonths(i);
            LocalDateTime inicio = ym.atDay(1).atStartOfDay();
            LocalDateTime fin = ym.atEndOfMonth().atTime(LocalTime.MAX);

            long cred = StatsUtil.contarEnRango(credMenor5Repository, inicio, fin)
                    + StatsUtil.contarEnRango(credMayor5Repository, inicio, fin);
            long vacunacion = paiRepos.stream().mapToLong(r -> StatsUtil.contarEnRango(r, inicio, fin)).sum();
            long anemia = StatsUtil.contarEnRango(anemiaSeguimientoRepository, inicio, fin);
            long gestacional = StatsUtil.contarEnRango(gestanteRepository, inicio, fin);

            resultado.add(new SerieProgramaDto(nombreMes(ym), cred, vacunacion, anemia, gestacional));
        }
        return resultado;
    }

    private List<CoberturaVacunaDto> construirCoberturaVacunal() {
        long totalPacientes = pacienteRepository.count();
        double meta = parametroService.getDecimal("PAI_META_COBERTURA").doubleValue();

        return programaDashboardService.obtenerDashboard(ProgramaClave.PAI).distribucion().stream()
                .map(item -> {
                    double real = totalPacientes == 0 ? 0
                            : Math.round(Math.min(100.0, (item.valor() * 100.0) / totalPacientes) * 10) / 10.0;
                    return new CoberturaVacunaDto(item.categoria(), meta, real);
                })
                .toList();
    }

    private List<ActividadRecienteDto> construirActividadReciente() {
        List<ActividadRecienteDto> resultado = new ArrayList<>();
        for (AuditLog log : auditLogRepository.findTop5ByOrderByTimestampDesc()) {
            String nombreUsuario = usuarioRepository.findById(log.getUsuarioId())
                    .map(u -> u.getNombreCompleto())
                    .orElse("Usuario del sistema");
            String verbo = VERBO_ACCION.getOrDefault(log.getAccion(), "modificó");
            String objeto = DESCRIPCION_TABLA.getOrDefault(log.getTabla(), "un registro");
            resultado.add(new ActividadRecienteDto(
                    log.getUsuarioId(), nombreUsuario, verbo + " " + objeto, log.getTimestamp()));
        }
        return resultado;
    }

    private String nombreMes(YearMonth ym) {
        String nombre = ym.getMonth().getDisplayName(TextStyle.SHORT, ES);
        return Character.toUpperCase(nombre.charAt(0)) + nombre.substring(1).toLowerCase(ES);
    }

}
