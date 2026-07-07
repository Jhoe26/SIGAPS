package pe.sigaps.parametro;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.Objects;

@Entity
@Table(name = "parametro_sistema")
@Getter
@Setter
@NoArgsConstructor
public class ParametroSistema {

    @Id
    @Column(name = "clave", length = 60)
    private String clave;

    @Column(name = "valor", nullable = false, length = 255)
    private String valor;

    @Column(name = "descripcion", length = 255)
    private String descripcion;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_dato")
    private TipoDato tipoDato = TipoDato.STRING;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof ParametroSistema other)) return false;
        return clave != null && clave.equals(other.clave);
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(clave);
    }
}
