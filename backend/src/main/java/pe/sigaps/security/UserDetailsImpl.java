package pe.sigaps.security;

import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import pe.sigaps.usuario.Usuario;

import java.util.Collection;
import java.util.List;

@Getter
public class UserDetailsImpl implements UserDetails {

    private final Long id;
    private final String dni;
    private final String nombreCompleto;
    private final String rol;
    private final String passwordHash;
    private final boolean activo;

    public UserDetailsImpl(Usuario usuario) {
        this.id = usuario.getId();
        this.dni = usuario.getDni();
        this.nombreCompleto = usuario.getNombreCompleto();
        this.rol = usuario.getRol().name();
        this.passwordHash = usuario.getPasswordHash();
        this.activo = usuario.isActivo();
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + rol));
    }

    @Override
    public String getPassword() {
        return passwordHash;
    }

    @Override
    public String getUsername() {
        return dni;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return activo;
    }
}
