package pe.sigaps.profesional;

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

import java.time.LocalDateTime;
import java.util.Objects;

/**
 * Registro de profesionales de salud que ATIENDEN actos clínicos (campo profesional_id),
 * distinto de {@code usuario} que son las cuentas que TECLEAN en el sistema
 * (campo registrado_por_id). Un profesional puede no tener cuenta de acceso
 * (p.ej. personal migrado de Excel o médicos que no usan SIGAPS directamente).
 */
@Entity
@Table(name = "profesional")
@Getter
@Setter
@NoArgsConstructor
public class Profesional {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "dni", nullable = false, unique = true, length = 8)
    private String dni;

    @Column(name = "nombres", nullable = false, length = 80)
    private String nombres;

    @Column(name = "ap_paterno", nullable = false, length = 60)
    private String apPaterno;

    @Column(name = "ap_materno", nullable = false, length = 60)
    private String apMaterno;

    @Column(name = "especialidad", length = 80)
    private String especialidad;

    @Column(name = "colegiatura", length = 20)
    private String colegiatura;

    @Column(name = "tipo_colegio", length = 20)
    private String tipoColegio;

    @Column(name = "centro_id")
    private Long centroId;

    @Column(name = "activo", nullable = false)
    private boolean activo = true;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public String getNombreCompleto() {
        return apPaterno + " " + apMaterno + " " + nombres;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Profesional other)) return false;
        return id != null && id.equals(other.id);
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(id);
    }
}
