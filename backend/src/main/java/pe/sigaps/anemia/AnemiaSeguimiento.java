package pe.sigaps.anemia;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Objects;

@Entity
@Table(name = "anemia_seguimiento")
@Getter
@Setter
@NoArgsConstructor
public class AnemiaSeguimiento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "paciente_id", nullable = false)
    private Long pacienteId;

    @Column(name = "registrado_por_id", nullable = false)
    private Long registradoPorId;

    @Column(name = "profesional_id")
    private Long profesionalId;

    @Column(name = "fecha_inicio", nullable = false)
    private LocalDate fechaInicio;

    @Column(name = "hb_inicial_obs", precision = 4, scale = 2)
    private BigDecimal hbInicialObs;

    @Column(name = "hb_inicial_corr", precision = 4, scale = 2)
    private BigDecimal hbInicialCorr;

    @Enumerated(EnumType.STRING)
    @Column(name = "dx_inicial", nullable = false)
    private DxAnemia dxInicial;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_hierro")
    private TipoHierro tipoHierro;

    @Column(name = "dosis_indicada", length = 100)
    private String dosisIndicada;

    // 1er control
    @Column(name = "reg1_enf_id")
    private Long reg1EnfId;

    @Column(name = "fecha1_enf")
    private LocalDate fecha1Enf;

    @Column(name = "hb1_obs", precision = 4, scale = 2)
    private BigDecimal hb1Obs;

    @Column(name = "hb1_corr", precision = 4, scale = 2)
    private BigDecimal hb1Corr;

    @Column(name = "reg1_med_id")
    private Long reg1MedId;

    @Column(name = "fecha1_med")
    private LocalDate fecha1Med;

    @Column(name = "obs1_med", columnDefinition = "TEXT")
    private String obs1Med;

    // 2do control
    @Column(name = "reg2_enf_id")
    private Long reg2EnfId;

    @Column(name = "fecha2_enf")
    private LocalDate fecha2Enf;

    @Column(name = "hb2_obs", precision = 4, scale = 2)
    private BigDecimal hb2Obs;

    @Column(name = "hb2_corr", precision = 4, scale = 2)
    private BigDecimal hb2Corr;

    @Column(name = "reg2_med_id")
    private Long reg2MedId;

    @Column(name = "fecha2_med")
    private LocalDate fecha2Med;

    @Column(name = "obs2_med", columnDefinition = "TEXT")
    private String obs2Med;

    // 3er control
    @Column(name = "reg3_enf_id")
    private Long reg3EnfId;

    @Column(name = "fecha3_enf")
    private LocalDate fecha3Enf;

    @Column(name = "hb3_obs", precision = 4, scale = 2)
    private BigDecimal hb3Obs;

    @Column(name = "hb3_corr", precision = 4, scale = 2)
    private BigDecimal hb3Corr;

    @Enumerated(EnumType.STRING)
    @Column(name = "estado")
    private EstadoAnemia estado = EstadoAnemia.EN_TRATAMIENTO;

    @Column(name = "observaciones", columnDefinition = "TEXT")
    private String observaciones;

    @Column(name = "es_historico", nullable = false)
    private boolean esHistorico = false;

    @Column(name = "fuente_origen", nullable = false, length = 50)
    private String fuenteOrigen = "SISTEMA";

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof AnemiaSeguimiento other)) return false;
        return id != null && id.equals(other.id);
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(id);
    }
}
