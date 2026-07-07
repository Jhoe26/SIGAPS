package pe.sigaps.usuario;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pe.sigaps.auditoria.AccionAuditoria;
import pe.sigaps.auditoria.Auditable;
import pe.sigaps.common.exception.BusinessException;
import pe.sigaps.common.exception.NotFoundException;
import pe.sigaps.usuario.dto.CreateUsuarioDto;
import pe.sigaps.usuario.dto.UpdateUsuarioDto;
import pe.sigaps.usuario.dto.UsuarioResponseDto;
import pe.sigaps.usuario.dto.UsuarioResumenDto;
import pe.sigaps.usuario.dto.UsuarioStatsDto;
import pe.sigaps.usuario.mapper.UsuarioMapper;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final UsuarioMapper usuarioMapper;
    private final PasswordEncoder passwordEncoder;

    public Page<UsuarioResponseDto> listar(Pageable pageable) {
        return usuarioRepository.findAll(pageable).map(usuarioMapper::toResponseDto);
    }

    public UsuarioResponseDto obtenerPorId(Long id) {
        return usuarioMapper.toResponseDto(buscarEntidad(id));
    }

    public UsuarioStatsDto obtenerStats() {
        long enfermerasObstetras = usuarioRepository.countByRol(Rol.ENFERMERA) + usuarioRepository.countByRol(Rol.OBSTETRA);
        return new UsuarioStatsDto(
                usuarioRepository.countByRol(Rol.ADMIN),
                usuarioRepository.countByRol(Rol.MEDICO),
                enfermerasObstetras,
                usuarioRepository.countByRol(Rol.SUPERVISOR)
        );
    }

    public UsuarioResumenDto obtenerResumen(Long id) {
        Usuario usuario = buscarEntidad(id);
        return new UsuarioResumenDto(usuario.getId(), usuario.getDni(), usuario.getNombreCompleto(),
                usuario.getTitulo(), usuario.getColegiatura());
    }

    @Transactional
    @Auditable(tabla = "usuario", accion = AccionAuditoria.INSERT)
    public UsuarioResponseDto crear(CreateUsuarioDto dto) {
        if (usuarioRepository.existsByDni(dto.dni())) {
            throw new BusinessException("Ya existe un usuario con el DNI " + dto.dni());
        }
        Usuario usuario = usuarioMapper.toEntity(dto);
        usuario.setPasswordHash(passwordEncoder.encode(dto.password()));
        usuario.setActivo(true);
        usuario.setEsSistema(false);
        return usuarioMapper.toResponseDto(usuarioRepository.save(usuario));
    }

    @Transactional
    @Auditable(tabla = "usuario", accion = AccionAuditoria.UPDATE)
    public UsuarioResponseDto actualizar(Long id, UpdateUsuarioDto dto) {
        Usuario usuario = buscarEntidad(id);
        usuario.setApPaterno(dto.apPaterno());
        usuario.setApMaterno(dto.apMaterno());
        usuario.setNombres(dto.nombres());
        usuario.setColegiatura(dto.colegiatura());
        usuario.setTitulo(dto.titulo());
        usuario.setRol(dto.rol());
        usuario.setEmail(dto.email());
        usuario.setTelefono(dto.telefono());
        usuario.setCentroId(dto.centroId());
        return usuarioMapper.toResponseDto(usuarioRepository.save(usuario));
    }

    @Transactional
    @Auditable(tabla = "usuario", accion = AccionAuditoria.UPDATE)
    public UsuarioResponseDto activar(Long id) {
        Usuario usuario = buscarEntidad(id);
        usuario.setActivo(true);
        return usuarioMapper.toResponseDto(usuarioRepository.save(usuario));
    }

    @Transactional
    @Auditable(tabla = "usuario", accion = AccionAuditoria.UPDATE)
    public UsuarioResponseDto desactivar(Long id) {
        Usuario usuario = buscarEntidad(id);
        usuario.setActivo(false);
        return usuarioMapper.toResponseDto(usuarioRepository.save(usuario));
    }

    private Usuario buscarEntidad(Long id) {
        return usuarioRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Usuario no encontrado: " + id));
    }
}
