package pe.sigaps.auditoria;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Marca un método de servicio para que {@link AuditAspect} registre automáticamente
 * la operación en audit_log. La captura del estado "antes" (para UPDATE/DELETE) usa
 * como convención un bean de repositorio llamado "{tabla}Repository".
 */
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface Auditable {

    String tabla();

    AccionAuditoria accion();
}
