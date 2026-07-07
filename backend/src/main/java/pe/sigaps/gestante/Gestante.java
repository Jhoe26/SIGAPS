package pe.sigaps.gestante;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Objects;

@Entity
@Table(name = "gestante")
@Getter
@Setter
@NoArgsConstructor
public class Gestante {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "paciente_id", nullable = false)
    private Long pacienteId;

    @Column(name = "registrado_por_id", nullable = false)
    private Long registradoPorId;

    @Column(name = "profesional_id")
    private Long profesionalId;

    @Column(name = "telefono", length = 15)
    private String telefono;

    @Column(name = "influenza_fecha")
    private LocalDate influenzaFecha;

    @Column(name = "dt_1_fecha")
    private LocalDate dt1Fecha;

    @Column(name = "dt_2_fecha")
    private LocalDate dt2Fecha;

    @Column(name = "dt_3_fecha")
    private LocalDate dt3Fecha;

    @Column(name = "hepb_1_fecha")
    private LocalDate hepb1Fecha;

    @Column(name = "hepb_2_fecha")
    private LocalDate hepb2Fecha;

    @Column(name = "hepb_3_fecha")
    private LocalDate hepb3Fecha;

    @Column(name = "tdpa_fecha")
    private LocalDate tdpaFecha;

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
        if (!(o instanceof Gestante other)) return false;
        return id != null && id.equals(other.id);
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(id);
    }
}
