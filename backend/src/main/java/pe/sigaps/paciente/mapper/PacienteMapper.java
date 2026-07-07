package pe.sigaps.paciente.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import pe.sigaps.paciente.Paciente;
import pe.sigaps.paciente.dto.CreatePacienteDto;
import pe.sigaps.paciente.dto.PacienteResponseDto;

import java.time.LocalDate;
import java.time.Period;

@Mapper(componentModel = "spring")
public interface PacienteMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "esHistorico", ignore = true)
    @Mapping(target = "fuenteOrigen", ignore = true)
    @Mapping(target = "activo", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    Paciente toEntity(CreatePacienteDto dto);

    default PacienteResponseDto toResponseDto(Paciente paciente) {
        Period edad = Period.between(paciente.getFechaNacimiento(), LocalDate.now());
        return new PacienteResponseDto(
                paciente.getId(),
                paciente.getDni(),
                paciente.getApPaterno(),
                paciente.getApMaterno(),
                paciente.getNombres(),
                paciente.getNombreCompleto(),
                paciente.getFechaNacimiento(),
                edad.getYears(),
                edad.getMonths(),
                edad.getDays(),
                paciente.getSexo(),
                paciente.getTelefono(),
                paciente.getDireccion(),
                paciente.getDistrito(),
                paciente.getTipoSeguro(),
                paciente.isEsHistorico(),
                paciente.isActivo(),
                paciente.getCreatedAt()
        );
    }
}
