package pe.sigaps.acreditado;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;
import pe.sigaps.acreditado.dto.AcreditadoResponseDto;
import pe.sigaps.acreditado.mapper.AcreditadoMapper;
import pe.sigaps.auditoria.AuditoriaService;
import pe.sigaps.common.exception.NotFoundException;
import pe.sigaps.security.UserDetailsImpl;

import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
@Slf4j
public class PoblacionAcreditadaService {

    private static final Long USUARIO_SISTEMA_ID = 1L;

    private final PoblacionAcreditadaRepository poblacionAcreditadaRepository;
    private final AcreditadoMapper acreditadoMapper;
    private final AuditoriaService auditoriaService;
    private final ObjectMapper objectMapper;

    public AcreditadoResponseDto findByDni(String dni) {
        Optional<PoblacionAcreditada> acreditado = poblacionAcreditadaRepository.findById(dni);
        registrarConsulta(dni, acreditado.orElse(null));
        return acreditado
                .map(acreditadoMapper::toResponseDto)
                .orElseThrow(() -> new NotFoundException("DNI no encontrado en padrón EsSalud"));
    }

    private void registrarConsulta(String dni, PoblacionAcreditada acreditado) {
        String valoresDespues = acreditado == null ? null : serializar(acreditadoMapper.toResponseDto(acreditado));
        auditoriaService.registrarConsulta("poblacion_acreditada", Long.parseLong(dni),
                valoresDespues, usuarioActualId(), ip(), userAgent());
    }

    private String serializar(Object objeto) {
        try {
            return objectMapper.writeValueAsString(objeto);
        } catch (JsonProcessingException ex) {
            log.warn("No se pudo serializar acreditado para auditoría: {}", ex.getMessage());
            return null;
        }
    }

    private Long usuarioActualId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof UserDetailsImpl userDetails) {
            return userDetails.getId();
        }
        return USUARIO_SISTEMA_ID;
    }

    private String ip() {
        return obtenerRequestActual()
                .map(request -> request.getRemoteAddr())
                .orElse(null);
    }

    private String userAgent() {
        return obtenerRequestActual()
                .map(request -> request.getHeader("User-Agent"))
                .orElse(null);
    }

    private Optional<jakarta.servlet.http.HttpServletRequest> obtenerRequestActual() {
        if (RequestContextHolder.getRequestAttributes() instanceof ServletRequestAttributes attrs) {
            return Optional.of(attrs.getRequest());
        }
        return Optional.empty();
    }
}
