package pe.sigaps.security;

import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import pe.sigaps.usuario.UsuarioRepository;

@Service
@RequiredArgsConstructor
public class UserDetailsServiceImpl implements UserDetailsService {

    private final UsuarioRepository usuarioRepository;

    @Override
    public UserDetailsImpl loadUserByUsername(String dni) throws UsernameNotFoundException {
        return usuarioRepository.findByDni(dni)
                .map(UserDetailsImpl::new)
                .orElseThrow(() -> new UsernameNotFoundException("No existe usuario con DNI " + dni));
    }
}
