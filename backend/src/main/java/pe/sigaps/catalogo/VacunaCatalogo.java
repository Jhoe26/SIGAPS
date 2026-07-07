package pe.sigaps.catalogo;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.util.Objects;

@Entity
@Table(name = "vacuna_catalogo")
@Getter
@Setter
@NoArgsConstructor
public class VacunaCatalogo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "codigo", nullable = false, unique = true, length = 20)
    private String codigo;

    @Column(name = "nombre", nullable = false, length = 120)
    private String nombre;

    @Column(name = "grupo_edad", nullable = false)
    private GrupoEdadVacuna grupoEdad;

    @Column(name = "num_dosis_esquema", nullable = false)
    private Integer numDosisEsquema;

    @Column(name = "descripcion", length = 255)
    private String descripcion;

    @Column(name = "activa", nullable = false)
    private boolean activa = true;

    @Column(name = "vigente_desde")
    private LocalDate vigenteDesde;

    @Column(name = "vigente_hasta")
    private LocalDate vigenteHasta;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof VacunaCatalogo other)) return false;
        return id != null && id.equals(other.id);
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(id);
    }
}
