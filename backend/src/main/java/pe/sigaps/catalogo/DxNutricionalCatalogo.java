package pe.sigaps.catalogo;

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

import java.util.Objects;

@Entity
@Table(name = "dx_nutricional_catalogo")
@Getter
@Setter
@NoArgsConstructor
public class DxNutricionalCatalogo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "codigo", nullable = false, unique = true, length = 20)
    private String codigo;

    @Column(name = "descripcion", nullable = false, length = 120)
    private String descripcion;

    @Enumerated(EnumType.STRING)
    @Column(name = "grupo_edad", nullable = false)
    private GrupoEdadDx grupoEdad;

    @Column(name = "activo", nullable = false)
    private boolean activo = true;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof DxNutricionalCatalogo other)) return false;
        return id != null && id.equals(other.id);
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(id);
    }
}
