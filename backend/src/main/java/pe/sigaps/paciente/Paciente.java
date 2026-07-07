package pe.sigaps.paciente;

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

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Objects;

@Entity
@Table(name = "paciente")
@Getter
@Setter
@NoArgsConstructor
public class Paciente {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "dni", nullable = false, unique = true, length = 8)
    private String dni;

    @Column(name = "ap_paterno", nullable = false, length = 60)
    private String apPaterno;

    @Column(name = "ap_materno", nullable = false, length = 60)
    private String apMaterno;

    @Column(name = "nombres", nullable = false, length = 80)
    private String nombres;

    @Column(name = "fecha_nacimiento", nullable = false)
    private LocalDate fechaNacimiento;

    @Enumerated(EnumType.STRING)
    @Column(name = "sexo", nullable = false)
    private Sexo sexo;

    @Column(name = "telefono", length = 15)
    private String telefono;

    @Column(name = "direccion", length = 200)
    private String direccion;

    @Column(name = "distrito", length = 60)
    private String distrito;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_seguro")
    private TipoSeguro tipoSeguro = TipoSeguro.NINGUNO;

    @Column(name = "es_historico", nullable = false)
    private boolean esHistorico = false;

    @Column(name = "fuente_origen", nullable = false, length = 50)
    private String fuenteOrigen = "SISTEMA";

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
        if (!(o instanceof Paciente other)) return false;
        return id != null && id.equals(other.id);
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(id);
    }
}
