package pe.sigaps.auditoria;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.context.ApplicationContext;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;
import pe.sigaps.security.UserDetailsImpl;

import java.lang.reflect.Method;
import java.util.Optional;

/**
 * Intercepta métodos anotados con {@link Auditable} y registra la operación en audit_log
 * sin requerir código adicional en cada servicio. Para capturar el estado "antes" en
 * UPDATE/DELETE, busca por convención un bean de repositorio llamado "{tabla}Repository".
 */
@Aspect
@Component
@RequiredArgsConstructor
@Slf4j
public class AuditAspect {

    private static final Long USUARIO_SISTEMA_ID = 1L;

    private final AuditoriaService auditoriaService;
    private final ObjectMapper objectMapper;
    private final ApplicationContext applicationContext;

    @Around("@annotation(auditable)")
    public Object auditar(ProceedingJoinPoint joinPoint, Auditable auditable) throws Throwable {
        Long idDeArgumentos = extraerIdDeArgumentos(joinPoint.getArgs());

        String valoresAntes = null;
        if (auditable.accion() != AccionAuditoria.INSERT && idDeArgumentos != null) {
            valoresAntes = capturarSnapshot(auditable.tabla(), idDeArgumentos);
        }

        Object resultado = joinPoint.proceed();

        Long registroId = auditable.accion() == AccionAuditoria.INSERT
                ? extraerId(resultado)
                : idDeArgumentos;

        if (registroId == null) {
            log.warn("No se pudo determinar registroId para auditar {}.{}", auditable.tabla(), auditable.accion());
            return resultado;
        }

        String valoresDespues = auditable.accion() == AccionAuditoria.DELETE ? null : serializar(resultado);

        auditoriaService.registrar(auditable.tabla(), registroId, auditable.accion(),
                valoresAntes, valoresDespues, usuarioActualId(), ip(), userAgent());

        return resultado;
    }

    private Long extraerIdDeArgumentos(Object[] args) {
        for (Object arg : args) {
            if (arg instanceof Long id) {
                return id;
            }
        }
        return null;
    }

    private Long extraerId(Object resultado) {
        if (resultado == null) {
            return null;
        }
        // "getId" para entidades/Lombok, "id" para accessors de record (p.ej. XxxResponseDto)
        for (String metodo : new String[]{"getId", "id"}) {
            try {
                Method accessor = resultado.getClass().getMethod(metodo);
                Object id = accessor.invoke(resultado);
                if (id instanceof Long l) {
                    return l;
                }
            } catch (ReflectiveOperationException ignored) {
                // se intenta el siguiente nombre de accessor
            }
        }
        log.warn("El resultado de tipo {} no expone getId() ni id()", resultado.getClass().getSimpleName());
        return null;
    }

    private String capturarSnapshot(String tabla, Long id) {
        String beanName = repositoryBeanName(tabla);
        try {
            Object repositorio = applicationContext.getBean(beanName);
            Method findById = repositorio.getClass().getMethod("findById", Object.class);
            Optional<?> entidad = (Optional<?>) findById.invoke(repositorio, id);
            return entidad.map(this::serializar).orElse(null);
        } catch (Exception ex) {
            log.warn("No se pudo capturar snapshot 'antes' para tabla={} id={}: {}", tabla, id, ex.getMessage());
            return null;
        }
    }

    /**
     * Convierte el nombre de tabla en snake_case (p.ej. "pai_menor12m") al nombre de bean
     * Spring Data del repositorio correspondiente ("paiMenor12mRepository").
     */
    private String repositoryBeanName(String tabla) {
        StringBuilder nombre = new StringBuilder();
        boolean siguienteEnMayuscula = false;
        for (char c : tabla.toCharArray()) {
            if (c == '_') {
                siguienteEnMayuscula = true;
            } else {
                nombre.append(siguienteEnMayuscula ? Character.toUpperCase(c) : c);
                siguienteEnMayuscula = false;
            }
        }
        return nombre + "Repository";
    }

    private String serializar(Object objeto) {
        if (objeto == null) {
            return null;
        }
        try {
            return objectMapper.writeValueAsString(objeto);
        } catch (JsonProcessingException ex) {
            log.warn("No se pudo serializar objeto para auditoría: {}", ex.getMessage());
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
