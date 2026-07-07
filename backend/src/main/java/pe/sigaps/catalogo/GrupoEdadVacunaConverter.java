package pe.sigaps.catalogo;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = true)
public class GrupoEdadVacunaConverter implements AttributeConverter<GrupoEdadVacuna, String> {

    @Override
    public String convertToDatabaseColumn(GrupoEdadVacuna attribute) {
        return attribute == null ? null : attribute.getValor();
    }

    @Override
    public GrupoEdadVacuna convertToEntityAttribute(String dbData) {
        return dbData == null ? null : GrupoEdadVacuna.fromValor(dbData);
    }
}
