package pe.sigaps.tamizaje;

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
@Table(name = "tamizaje_hb")
@Getter
@Setter
@NoArgsConstructor
public class TamizajeHb {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "paciente_id", nullable = false)
    private Long pacienteId;

    @Column(name = "registrado_por_id", nullable = false)
    private Long registradoPorId;

    @Column(name = "profesional_id")
    private Long profesionalId;

    @Column(name = "fecha", nullable = false)
    private LocalDate fecha;

    @Column(name = "edad_anios")
    private Integer edadAnios;

    @Column(name = "edad_meses")
    private Integer edadMeses;

    @Column(name = "edad_dias")
    private Integer edadDias;

    @Column(name = "grupo_etario", nullable = false)
    private GrupoEtarioTamizaje grupoEtario;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_dosaje", nullable = false)
    private TipoDosaje tipoDosaje;

    @Column(name = "hb_observado", precision = 4, scale = 2)
    private BigDecimal hbObservado;

    @Column(name = "hb_corregido", precision = 4, scale = 2)
    private BigDecimal hbCorregido;

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
        if (!(o instanceof TamizajeHb other)) return false;
        return id != null && id.equals(other.id);
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(id);
    }
}
