package pe.sigaps.cred;

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
@Table(name = "cred_menor5")
@Getter
@Setter
@NoArgsConstructor
public class CredMenor5 {

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

    @Column(name = "edad_puntual", length = 20)
    private String edadPuntual;

    @Column(name = "num_control")
    private Integer numControl;

    @Column(name = "peso", precision = 5, scale = 2)
    private BigDecimal peso;

    @Column(name = "talla", precision = 5, scale = 2)
    private BigDecimal talla;

    @Column(name = "perimetro_cefalico", precision = 5, scale = 2)
    private BigDecimal perimetroCefalico;

    @Enumerated(EnumType.STRING)
    @Column(name = "dx_nutricional", nullable = false)
    private DxNutricionalMenor5 dxNutricional;

    @Column(name = "lactancia_hasta_6m")
    private Boolean lactanciaHasta6m;

    @Column(name = "grado_riesgo", length = 50)
    private String gradoRiesgo;

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
        if (!(o instanceof CredMenor5 other)) return false;
        return id != null && id.equals(other.id);
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(id);
    }
}
