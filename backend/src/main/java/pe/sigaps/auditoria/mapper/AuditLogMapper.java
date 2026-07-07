package pe.sigaps.auditoria.mapper;

import org.mapstruct.Mapper;
import pe.sigaps.auditoria.AuditLog;
import pe.sigaps.auditoria.dto.AuditLogResponseDto;

@Mapper(componentModel = "spring")
public interface AuditLogMapper {

    AuditLogResponseDto toResponseDto(AuditLog auditLog);
}
