package pe.sigaps.programa;

import lombok.RequiredArgsConstructor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pe.sigaps.anemia.AnemiaSeguimientoRepository;
import pe.sigaps.catalogo.VacunaCatalogo;
import pe.sigaps.catalogo.VacunaCatalogoRepository;
import pe.sigaps.common.StatsUtil;
import pe.sigaps.cred.CredMayor5Repository;
import pe.sigaps.cred.CredMenor5Repository;
import pe.sigaps.gestante.GestanteRepository;
import pe.sigaps.paciente.PacienteRepository;
import pe.sigaps.pai.Pai12m5aRepository;
import pe.sigaps.pai.Pai7a15aRepository;
import pe.sigaps.pai.PaiJpaRepository;
import pe.sigaps.pai.PaiMayor5aRepository;
import pe.sigaps.pai.PaiMenor12mRepository;
import pe.sigaps.pai.PaiRegistro;
import pe.sigaps.parametro.ParametroService;
import pe.sigaps.programa.dto.DistribucionItemDto;
import pe.sigaps.programa.dto.IndicadorDto;
import pe.sigaps.programa.dto.ProgramaDashboardDto;
import pe.sigaps.programa.dto.SerieMensualPuntoDto;
import pe.sigaps.tamizaje.GrupoEtarioTamizaje;
import pe.sigaps.tamizaje.TamizajeHbRepository;

import java.time.LocalTime;
import java.time.YearMonth;
import java.time.format.TextStyle;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

/**
 * Agrega datos reales de los 9 módulos clínicos en la forma que necesitan las
 * 5 páginas de programa del frontend (CRED y PAI combinan varias tablas backend
 * bajo un solo "programa" de UI). Todo cero-safe: sin datos, todo sale en 0.
 *
 * Los 4 "indicadores" (semáforo) son proxies calculados con datos reales, no
 * fórmulas clínicas oficiales — su definición exacta queda pendiente de
 * confirmación clínica (ver PROMPT_MAESTRO.md, "Pendientes clínicos no bloqueantes").
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProgramaDashboardService {

    private static final int MESES_SERIE = 6;
    private static final Locale ES = Locale.forLanguageTag("es");

    private final PacienteRepository pacienteRepository;
    private final ParametroService parametroService;
    private final TamizajeHbRepository tamizajeHbRepository;
    private final CredMenor5Repository credMenor5Repository;
    private final CredMayor5Repository credMayor5Repository;
    private final AnemiaSeguimientoRepository anemiaSeguimientoRepository;
    private final GestanteRepository gestanteRepository;
    private final PaiMenor12mRepository paiMenor12mRepository;
    private final Pai12m5aRepository pai12m5aRepository;
    private final PaiMayor5aRepository paiMayor5aRepository;
    private final Pai7a15aRepository pai7a15aRepository;
    private final VacunaCatalogoRepository vacunaCatalogoRepository;

    public ProgramaDashboardDto obtenerDashboard(ProgramaClave clave) {
        return switch (clave) {
            case CRED -> dashboardCred();
            case PAI -> dashboardPai();
            case TAMIZAJE -> dashboardTamizaje();
            case ANEMIA -> dashboardAnemia();
            case GESTACIONAL -> dashboardGestacional();
        };
    }

    private ProgramaDashboardDto dashboardCred() {
        long totalConHistoricos = credMenor5Repository.count() + credMayor5Repository.count();
        long noHistoricos = StatsUtil.contarNoHistoricos(credMenor5Repository) + StatsUtil.contarNoHistoricos(credMayor5Repository);
        long conProfesional = StatsUtil.contarConProfesional(credMenor5Repository) + StatsUtil.contarConProfesional(credMayor5Repository);

        List<YearMonth> meses = ultimosMeses(MESES_SERIE);
        long esteMes = contarMes(meses.getLast(), credMenor5Repository) + contarMes(meses.getLast(), credMayor5Repository);
        long mesAnterior = contarMes(meses.get(meses.size() - 2), credMenor5Repository) + contarMes(meses.get(meses.size() - 2), credMayor5Repository);

        List<SerieMensualPuntoDto> serie = meses.stream()
                .map(ym -> new SerieMensualPuntoDto(nombreMes(ym),
                        contarMes(ym, credMenor5Repository) + contarMes(ym, credMayor5Repository)))
                .toList();

        Map<String, Long> distribucionMapa = new LinkedHashMap<>();
        acumularConteo(distribucionMapa, credMenor5Repository.contarPorDxNutricional());
        acumularConteo(distribucionMapa, credMayor5Repository.contarPorDxNutricional());
        List<DistribucionItemDto> distribucion = aDistribucion(distribucionMapa);

        List<IndicadorDto> indicadores = construirIndicadores("CRED", totalConHistoricos, noHistoricos, conProfesional, esteMes, mesAnterior);
        return new ProgramaDashboardDto(noHistoricos, esteMes, mesAnterior, tendencia(esteMes, mesAnterior), serie, distribucion, indicadores);
    }

    private ProgramaDashboardDto dashboardPai() {
        List<PaiJpaRepository<? extends PaiRegistro>> repos = List.of(
                paiMenor12mRepository, pai12m5aRepository, paiMayor5aRepository, pai7a15aRepository);

        long totalConHistoricos = repos.stream().mapToLong(JpaRepository::count).sum();
        long noHistoricos = repos.stream().mapToLong(StatsUtil::contarNoHistoricos).sum();
        long conProfesional = repos.stream().mapToLong(StatsUtil::contarConProfesional).sum();

        List<YearMonth> meses = ultimosMeses(MESES_SERIE);
        long esteMes = sumarMes(meses.getLast(), repos);
        long mesAnterior = sumarMes(meses.get(meses.size() - 2), repos);

        List<SerieMensualPuntoDto> serie = meses.stream()
                .map(ym -> new SerieMensualPuntoDto(nombreMes(ym), sumarMes(ym, repos)))
                .toList();

        Map<Long, VacunaCatalogo> catalogoPorId = new LinkedHashMap<>();
        vacunaCatalogoRepository.findAll().forEach(v -> catalogoPorId.put(v.getId(), v));

        Map<String, Long> distribucionMapa = new LinkedHashMap<>();
        for (PaiJpaRepository<? extends PaiRegistro> repo : repos) {
            for (Object[] fila : repo.contarPorVacuna()) {
                Long vacunaId = (Long) fila[0];
                Long total = (Long) fila[1];
                String nombre = catalogoPorId.containsKey(vacunaId) ? catalogoPorId.get(vacunaId).getNombre() : "Otra";
                distribucionMapa.merge(nombre, total, Long::sum);
            }
        }
        List<DistribucionItemDto> distribucion = aDistribucion(distribucionMapa);

        List<IndicadorDto> indicadores = construirIndicadores("PAI", totalConHistoricos, noHistoricos, conProfesional, esteMes, mesAnterior);
        return new ProgramaDashboardDto(noHistoricos, esteMes, mesAnterior, tendencia(esteMes, mesAnterior), serie, distribucion, indicadores);
    }

    private ProgramaDashboardDto dashboardTamizaje() {
        long totalConHistoricos = tamizajeHbRepository.count();
        long noHistoricos = StatsUtil.contarNoHistoricos(tamizajeHbRepository);
        long conProfesional = StatsUtil.contarConProfesional(tamizajeHbRepository);

        List<YearMonth> meses = ultimosMeses(MESES_SERIE);
        long esteMes = contarMes(meses.getLast(), tamizajeHbRepository);
        long mesAnterior = contarMes(meses.get(meses.size() - 2), tamizajeHbRepository);
        List<SerieMensualPuntoDto> serie = meses.stream()
                .map(ym -> new SerieMensualPuntoDto(nombreMes(ym), contarMes(ym, tamizajeHbRepository)))
                .toList();

        Map<String, Long> distribucionMapa = new LinkedHashMap<>();
        for (Object[] fila : tamizajeHbRepository.contarPorGrupoEtario()) {
            GrupoEtarioTamizaje grupo = (GrupoEtarioTamizaje) fila[0];
            Long total = (Long) fila[1];
            distribucionMapa.merge(etiquetaGrupoEtario(grupo), total, Long::sum);
        }
        List<DistribucionItemDto> distribucion = aDistribucion(distribucionMapa);

        List<IndicadorDto> indicadores = construirIndicadores("TAMIZAJE", totalConHistoricos, noHistoricos, conProfesional, esteMes, mesAnterior);
        return new ProgramaDashboardDto(noHistoricos, esteMes, mesAnterior, tendencia(esteMes, mesAnterior), serie, distribucion, indicadores);
    }

    private ProgramaDashboardDto dashboardAnemia() {
        long totalConHistoricos = anemiaSeguimientoRepository.count();
        long noHistoricos = StatsUtil.contarNoHistoricos(anemiaSeguimientoRepository);
        long conProfesional = StatsUtil.contarConProfesional(anemiaSeguimientoRepository);

        List<YearMonth> meses = ultimosMeses(MESES_SERIE);
        long esteMes = contarMes(meses.getLast(), anemiaSeguimientoRepository);
        long mesAnterior = contarMes(meses.get(meses.size() - 2), anemiaSeguimientoRepository);
        List<SerieMensualPuntoDto> serie = meses.stream()
                .map(ym -> new SerieMensualPuntoDto(nombreMes(ym), contarMes(ym, anemiaSeguimientoRepository)))
                .toList();

        Map<String, Long> distribucionMapa = new LinkedHashMap<>();
        for (Object[] fila : anemiaSeguimientoRepository.contarPorDxInicial()) {
            distribucionMapa.merge(capitalizar(fila[0].toString()), (Long) fila[1], Long::sum);
        }
        List<DistribucionItemDto> distribucion = aDistribucion(distribucionMapa);

        List<IndicadorDto> indicadores = construirIndicadores("ANEMIA", totalConHistoricos, noHistoricos, conProfesional, esteMes, mesAnterior);
        return new ProgramaDashboardDto(noHistoricos, esteMes, mesAnterior, tendencia(esteMes, mesAnterior), serie, distribucion, indicadores);
    }

    private ProgramaDashboardDto dashboardGestacional() {
        long totalConHistoricos = gestanteRepository.count();
        long noHistoricos = StatsUtil.contarNoHistoricos(gestanteRepository);
        long conProfesional = StatsUtil.contarConProfesional(gestanteRepository);

        List<YearMonth> meses = ultimosMeses(MESES_SERIE);
        long esteMes = contarMes(meses.getLast(), gestanteRepository);
        long mesAnterior = contarMes(meses.get(meses.size() - 2), gestanteRepository);
        List<SerieMensualPuntoDto> serie = meses.stream()
                .map(ym -> new SerieMensualPuntoDto(nombreMes(ym), contarMes(ym, gestanteRepository)))
                .toList();

        // Sin campo de "riesgo" en el esquema: se sustituye por vacunación de influenza
        // (dato real disponible) como proxy de distribución.
        List<DistribucionItemDto> distribucion = List.of(
                new DistribucionItemDto("Influenza aplicada", gestanteRepository.countByInfluenzaFechaIsNotNull()),
                new DistribucionItemDto("Influenza pendiente", gestanteRepository.countByInfluenzaFechaIsNull())
        );

        List<IndicadorDto> indicadores = construirIndicadores("GESTACIONAL", totalConHistoricos, noHistoricos, conProfesional, esteMes, mesAnterior);
        return new ProgramaDashboardDto(noHistoricos, esteMes, mesAnterior, tendencia(esteMes, mesAnterior), serie, distribucion, indicadores);
    }

    // ---------- utilidades compartidas ----------

    private long contarMes(YearMonth mes, pe.sigaps.tamizaje.TamizajeHbRepository repo) {
        return StatsUtil.contarEnRango(repo, mes.atDay(1).atStartOfDay(), mes.atEndOfMonth().atTime(LocalTime.MAX));
    }

    private long contarMes(YearMonth mes, CredMenor5Repository repo) {
        return StatsUtil.contarEnRango(repo, mes.atDay(1).atStartOfDay(), mes.atEndOfMonth().atTime(LocalTime.MAX));
    }

    private long contarMes(YearMonth mes, CredMayor5Repository repo) {
        return StatsUtil.contarEnRango(repo, mes.atDay(1).atStartOfDay(), mes.atEndOfMonth().atTime(LocalTime.MAX));
    }

    private long contarMes(YearMonth mes, AnemiaSeguimientoRepository repo) {
        return StatsUtil.contarEnRango(repo, mes.atDay(1).atStartOfDay(), mes.atEndOfMonth().atTime(LocalTime.MAX));
    }

    private long contarMes(YearMonth mes, GestanteRepository repo) {
        return StatsUtil.contarEnRango(repo, mes.atDay(1).atStartOfDay(), mes.atEndOfMonth().atTime(LocalTime.MAX));
    }

    private long contarMes(YearMonth mes, PaiJpaRepository<? extends PaiRegistro> repo) {
        return StatsUtil.contarEnRango(repo, mes.atDay(1).atStartOfDay(), mes.atEndOfMonth().atTime(LocalTime.MAX));
    }

    private long sumarMes(YearMonth mes, List<PaiJpaRepository<? extends PaiRegistro>> repos) {
        return repos.stream().mapToLong(r -> contarMes(mes, r)).sum();
    }

    private List<YearMonth> ultimosMeses(int cantidad) {
        YearMonth actual = YearMonth.now();
        List<YearMonth> meses = new ArrayList<>();
        for (int i = cantidad - 1; i >= 0; i--) {
            meses.add(actual.minusMonths(i));
        }
        return meses;
    }

    private String nombreMes(YearMonth ym) {
        String nombre = ym.getMonth().getDisplayName(TextStyle.SHORT, ES);
        return capitalizar(nombre);
    }

    private String capitalizar(String texto) {
        if (texto == null || texto.isBlank()) {
            return texto;
        }
        return Character.toUpperCase(texto.charAt(0)) + texto.substring(1).toLowerCase(ES);
    }

    private String etiquetaGrupoEtario(GrupoEtarioTamizaje grupo) {
        return switch (grupo) {
            case MENOR_6M -> "Menor de 6 meses";
            case DE_6_11M -> "6 a 11 meses";
            case DE_12M_23M -> "12 a 23 meses";
            case DOS_A -> "2 años";
            case TRES_A -> "3 años";
            case CUATRO_A -> "4 años";
            case CINCO_A_MAS -> "5 años a más";
        };
    }

    private void acumularConteo(Map<String, Long> mapa, List<Object[]> filas) {
        for (Object[] fila : filas) {
            mapa.merge(capitalizar(fila[0].toString().replace('_', ' ')), (Long) fila[1], Long::sum);
        }
    }

    private List<DistribucionItemDto> aDistribucion(Map<String, Long> mapa) {
        List<DistribucionItemDto> resultado = new ArrayList<>();
        mapa.forEach((categoria, valor) -> resultado.add(new DistribucionItemDto(categoria, valor)));
        return resultado;
    }

    private double tendencia(long esteMes, long mesAnterior) {
        if (mesAnterior == 0) {
            return esteMes > 0 ? 100.0 : 0.0;
        }
        return redondear(((esteMes - mesAnterior) * 100.0) / mesAnterior);
    }

    private List<IndicadorDto> construirIndicadores(String prefijo, long totalConHistoricos, long noHistoricos,
                                                      long conProfesional, long esteMes, long mesAnterior) {
        long totalPacientesSistema = pacienteRepository.count();

        double cobertura = totalPacientesSistema == 0 ? 0 : Math.min(100.0, (noHistoricos * 100.0) / totalPacientesSistema);
        double controles = noHistoricos == 0 ? 0 : Math.min(100.0, (conProfesional * 100.0) / noHistoricos);
        double seguimiento = mesAnterior == 0 ? (esteMes > 0 ? 100.0 : 0.0) : Math.min(100.0, (esteMes * 100.0) / mesAnterior);
        double deteccion = totalConHistoricos == 0 ? 0 : Math.min(100.0, (noHistoricos * 100.0) / totalConHistoricos);

        return List.of(
                new IndicadorDto("Cobertura programática", metaDe(prefijo, "COBERTURA"), redondear(cobertura)),
                new IndicadorDto("Controles completos", metaDe(prefijo, "CONTROLES"), redondear(controles)),
                new IndicadorDto("Seguimiento oportuno", metaDe(prefijo, "SEGUIMIENTO"), redondear(seguimiento)),
                new IndicadorDto("Detección temprana", metaDe(prefijo, "DETECCION"), redondear(deteccion))
        );
    }

    private double metaDe(String prefijo, String sufijo) {
        return parametroService.getDecimal(prefijo + "_META_" + sufijo).doubleValue();
    }

    private double redondear(double valor) {
        return Math.round(valor * 10) / 10.0;
    }
}
