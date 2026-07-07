package pe.sigaps.catalogo;

/**
 * Los valores de BD ('12M_5A', '7A_15A') no son identificadores Java válidos,
 * por eso cada constante guarda su representación exacta de columna en {@code valor}.
 */
public enum GrupoEdadVacuna {
    MENOR_12M("MENOR_12M"),
    DE_12M_A_5A("12M_5A"),
    MAYOR_5A("MAYOR_5A"),
    DE_7A_A_15A("7A_15A"),
    GESTANTE("GESTANTE");

    private final String valor;

    GrupoEdadVacuna(String valor) {
        this.valor = valor;
    }

    public String getValor() {
        return valor;
    }

    public static GrupoEdadVacuna fromValor(String valor) {
        for (GrupoEdadVacuna grupo : values()) {
            if (grupo.valor.equalsIgnoreCase(valor)) {
                return grupo;
            }
        }
        throw new IllegalArgumentException("Grupo etario de vacuna inválido: " + valor);
    }
}
