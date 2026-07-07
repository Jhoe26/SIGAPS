package pe.sigaps.usuario;

import com.fasterxml.jackson.annotation.JsonIgnore;
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

import java.time.LocalDateTime;
import java.util.Objects;

@Entity
@Table(name = "usuario")
@Getter
@Setter
@NoArgsConstructor
public class Usuario {

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

    @Column(name = "colegiatura", length = 20)
    private String colegiatura;

    @Column(name = "titulo", length = 20)
    private String titulo;

    @Enumerated(EnumType.STRING)
    @Column(name = "rol", nullable = false)
    private Rol rol;

    @Column(name = "email", length = 120)
    private String email;

    @Column(name = "telefono", length = 15)
    private String telefono;

    @JsonIgnore
    @Column(name = "password_hash", length = 255)
    private String passwordHash;

    @Column(name = "activo", nullable = false)
    private boolean activo = true;

    @Column(name = "es_sistema", nullable = false)
    private boolean esSistema = false;

    @Column(name = "centro_id")
    private Long centroId;

    @Column(name = "ultimo_acceso")
    private LocalDateTime ultimoAcceso;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public String getNombreCompleto() {
        String tituloPrefix = (titulo != null && !titulo.isBlank()) ? titulo + " " : "";
        return tituloPrefix + apPaterno + " " + apMaterno + " " + nombres;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Usuario other)) return false;
        return id != null && id.equals(other.id);
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(id);
    }
}
