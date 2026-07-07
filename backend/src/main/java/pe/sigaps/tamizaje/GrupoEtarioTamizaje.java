package pe.sigaps.tamizaje;

/**
 * Los valores de BD ('6_11M', '12M_23M', '2A'...) no son identificadores Java válidos,
 * por eso cada constante guarda su representación exacta de columna en {@code valor}.
 */
public enum GrupoEtarioTamizaje {
    MENOR_6M("MENOR_6M"),
    DE_6_11M("6_11M"),
    DE_12M_23M("12M_23M"),
    DOS_A("2A"),
    TRES_A("3A"),
    CUATRO_A("4A"),
    CINCO_A_MAS("5A_MAS");

    private final String valor;

    GrupoEtarioTamizaje(String valor) {
        this.valor = valor;
    }

    public String getValor() {
        return valor;
    }

    public static GrupoEtarioTamizaje fromValor(String valor) {
        for (GrupoEtarioTamizaje grupo : values()) {
            if (grupo.valor.equalsIgnoreCase(valor)) {
                return grupo;
            }
        }
        throw new IllegalArgumentException("Grupo etario de tamizaje inválido: " + valor);
    }
}
