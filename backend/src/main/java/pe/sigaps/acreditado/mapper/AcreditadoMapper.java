package pe.sigaps.acreditado.mapper;

import org.mapstruct.Mapper;
import pe.sigaps.acreditado.PoblacionAcreditada;
import pe.sigaps.acreditado.dto.AcreditadoResponseDto;

@Mapper(componentModel = "spring")
public interface AcreditadoMapper {

    AcreditadoResponseDto toResponseDto(PoblacionAcreditada acreditado);
}
