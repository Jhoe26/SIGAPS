package pe.sigaps.tamizaje;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = true)
public class GrupoEtarioTamizajeConverter implements AttributeConverter<GrupoEtarioTamizaje, String> {

    @Override
    public String convertToDatabaseColumn(GrupoEtarioTamizaje attribute) {
        return attribute == null ? null : attribute.getValor();
    }

    @Override
    public GrupoEtarioTamizaje convertToEntityAttribute(String dbData) {
        return dbData == null ? null : GrupoEtarioTamizaje.fromValor(dbData);
    }
}
