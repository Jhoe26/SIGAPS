package pe.sigaps.acreditado;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import pe.sigaps.paciente.Sexo;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Objects;

@Entity
@Table(name = "poblacion_acreditada")
@Getter
@Setter
@NoArgsConstructor
public class PoblacionAcreditada {

    @Id
    @Column(name = "dni", length = 8)
    private String dni;

    @Column(name = "ap_paterno", length = 60)
    private String apPaterno;

    @Column(name = "ap_materno", length = 60)
    private String apMaterno;

    @Column(name = "nombres", length = 80)
    private String nombres;

    @Column(name = "fecha_nacimiento")
    private LocalDate fechaNacimiento;

    @Enumerated(EnumType.STRING)
    @Column(name = "sexo")
    private Sexo sexo;

    @Column(name = "direccion", length = 200)
    private String direccion;

    @Column(name = "distrito", length = 60)
    private String distrito;

    @Column(name = "parentesco", length = 30)
    private String parentesco;

    @Column(name = "dni_titular", length = 8)
    private String dniTitular;

    @Column(name = "codigo_cas", length = 10)
    private String codigoCas;

    @Column(name = "nombre_cas", length = 120)
    private String nombreCas;

    @CreationTimestamp
    @Column(name = "fecha_carga", updatable = false)
    private LocalDateTime fechaCarga;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof PoblacionAcreditada other)) return false;
        return dni != null && dni.equals(other.dni);
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(dni);
    }
}
