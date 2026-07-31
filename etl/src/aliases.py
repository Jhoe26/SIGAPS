"""Alias de columnas y de nombres de vacuna.

Ajustado contra el archivo real de la Fase G (`db/BD_ENF_CAPIIIM_LIMPIO.xlsx`,
encabezados de una sola fila, sin celdas combinadas). Estructura estándar
confirmada por hoja: PROFESIONAL, FECHA, DNI, AP_PATERNO, AP_MATERNO,
NOMBRES, FECHA_NAC, EDAD_A, EDAD_M, EDAD_D, TELEFONO + campos específicos.

Los candidatos se comparan sin tildes/mayúsculas y por sub-string (ver
excel_reader.encontrar_columna), así que no hace falta el texto exacto, solo
una porción reconocible.
"""

from __future__ import annotations

# --- Alias de hoja (nombres reales confirmados en el libro) ---
NOMBRES_HOJA = {
    "tamizaje": ["TAMIZAJE"],
    "anemia": ["ANEMIA"],
    "cred_menor5": ["CRED_MENOR_5", "CRED MENOR 5", "CREDMENOR 5", "CRED MENOR5"],
    "cred_mayor5": ["CRED_MAYOR_5", "CRED MAYOR 5", "CREDMAYOR 5", "CRED MAYOR5"],
    "pai_menor12m": ["PAI_MENOR_12M", "PAI MENOR 12M", "PAI < 12M", "PAI <12M"],
    "pai_12m_5a": ["PAI_12M_A_5A", "PAI 12M A 5A", "PAI > 12M-<5A", "PAI 12M-5A"],
    "pai_mayor5a": ["PAI_MAYOR_5A", "PAI MAYOR 5A", "PAI >5A (corrupta)", "PAI >5A"],
    "pai_7a_15a": ["PAI_7A_A_15A", "PAI 7A A 15A", "PAI>7A-<15A (2)", "PAI>7A-<15A", "PAI 7A-15A"],
    "gestante": ["GESTANTE", "GTE"],
}

# --- Campos de identificación de paciente, comunes a casi todas las hojas ---
COLUMNAS_PACIENTE_COMUN = {
    "dni": ["dni", "documento", "nro documento", "n documento", "numero documento"],
    "nombre_completo": [
        "nombres y apellidos",
        "apellidos y nombres",
        "nombre completo",
        "paciente",
        "nombre del paciente",
    ],
    "ap_paterno": ["ap paterno", "apellido paterno"],
    "ap_materno": ["ap materno", "apellido materno"],
    "nombres": ["nombres"],
    "fecha_nacimiento": ["fecha nac", "fecha nacimiento", "fecha de nacimiento", "f nacimiento", "fec nac"],
    "edad_anios": ["edad a", "edad anios", "edad años"],
    "edad_meses": ["edad m", "edad meses"],
    "edad_dias": ["edad d", "edad dias"],
    "sexo": ["sexo", "genero"],
    "telefono": ["telefono", "celular", "nro celular", "telf", "numero celular"],
    "direccion": ["direccion", "domicilio"],
    "distrito": ["distrito"],
}

# --- Quién atendió (solo primer nombre en el Excel; regla: NO crear profesional) ---
COLUMNA_PROFESIONAL = ["profesional", "responsable", "enfermero", "enfermera", "quien atendio", "atendido por"]

ALIASES_TAMIZAJE = {
    **COLUMNAS_PACIENTE_COMUN,
    "fecha": ["fecha"],
    "hb_observado": ["hb observado", "hb obs", "hemoglobina"],
    "hb_corregido": ["hb corregido", "hb corr"],
    "diagnostico": ["diagnostico", "dx"],
    "tipo_dosaje": ["tipo dosaje", "dosaje", "tipo de dosaje"],
    "observaciones": ["observaciones"],
    "profesional": COLUMNA_PROFESIONAL,
}

ALIASES_ANEMIA = {
    **COLUMNAS_PACIENTE_COMUN,
    "fecha": ["fecha"],
    "hb_observado": ["hb observado", "hb obs", "hemoglobina"],
    "hb_corregido": ["hb corregido", "hb corr"],
    "clasificacion": ["clasificacion", "diagnostico"],
    "observaciones": ["observaciones"],
    "profesional": COLUMNA_PROFESIONAL,
}

ALIASES_CRED_MENOR5 = {
    **COLUMNAS_PACIENTE_COMUN,
    "fecha": ["fecha control", "fecha de control", "fecha"],
    "edad_puntual": ["edad puntual"],
    "num_control": ["nro control", "n control", "numero de control"],
    "peso": ["peso kg", "peso"],
    "talla": ["talla cm", "talla"],
    "perimetro_cefalico": ["perimetro cefalico", "pc"],
    "dx_nutricional": ["dx nutricional", "diagnostico nutricional"],
    "lactancia_hasta_6m": ["lactancia", "lactancia materna exclusiva"],
    "grado_riesgo": ["grado riesgo", "riesgo"],
    "observaciones": ["observaciones"],
    "profesional": COLUMNA_PROFESIONAL,
}

ALIASES_CRED_MAYOR5 = {
    **COLUMNAS_PACIENTE_COMUN,
    "fecha": ["fecha control", "fecha de control", "fecha"],
    "edad_puntual": ["edad puntual"],
    "num_control": ["nro control", "n control", "numero de control"],
    "peso": ["peso kg", "peso"],
    "talla": ["talla m", "talla"],
    "imc": ["imc"],
    "riesgo_nutricional": ["riesgo nutricional"],
    "dx_nutricional": ["dx nutricional", "diagnostico nutricional"],
    "observaciones": ["observaciones"],
    "profesional": COLUMNA_PROFESIONAL,
}

# Las 4 hojas PAI comparten estructura (una fila = una dosis aplicada).
ALIASES_PAI_COMUN = {
    **COLUMNAS_PACIENTE_COMUN,
    "vacuna": ["vacuna aplicada", "vacuna", "biologico"],
    "num_dosis": ["nro dosis", "n dosis", "dosis"],
    "fecha_aplicacion": ["fecha aplicacion", "fecha de aplicacion", "fecha"],
    "lote": ["lote"],
    "tipo_aplicacion": ["tipo aplicacion", "regular barrido"],
    "observaciones": ["observaciones"],
    "profesional": COLUMNA_PROFESIONAL,
}

ALIASES_GESTANTE = {
    **COLUMNAS_PACIENTE_COMUN,
    "influenza_fecha": ["influenza"],
    "dt_1_fecha": ["dt 1", "dt1", "difteria tetano 1"],
    "dt_2_fecha": ["dt 2", "dt2", "difteria tetano 2"],
    "dt_3_fecha": ["dt 3", "dt3", "difteria tetano 3"],
    "hepb_1_fecha": ["hepb 1", "hepatitis b 1"],
    "hepb_2_fecha": ["hepb 2", "hepatitis b 2"],
    "hepb_3_fecha": ["hepb 3", "hepatitis b 3"],
    "tdpa_fecha": ["tdpa"],
    "observaciones": ["observaciones"],
    "profesional": COLUMNA_PROFESIONAL,
}

# --- Vacuna Excel (texto libre) -> codigo de vacuna_catalogo ---
# Cada extractor de PAI solo busca dentro del subconjunto de su grupo_edad,
# así "DPT" no se confunde entre DPT_REF (12M_5A) y DPT_BAR (7A_15A). El
# texto real (PAI_12M_A_5A.VACUNA_APLICADA) es libre y muy heterogéneo
# (combos "1°SPR-VARICELA-3°NEUMOCOCO", abreviaturas, errores de tipeo); lo
# que no matchea ningún alias cae a la vacuna SIN_CLAS (ver V5 migration)
# conservando el texto original en observaciones, no se descarta la fila.
VACUNA_ALIASES: dict[str, list[str]] = {
    "PTV": ["pentavalente", "penta"],
    "RTV": ["rotavirus", "rota"],
    "IPV": ["ipv", "polio inactivada", "antipolio inactivada"],
    "NEU": ["neumococo", "neumo"],
    "INF_PED": ["influenza pediatrica", "influenza"],
    "SPR": ["spr", "sarampion paperas rubeola", "sarampion"],
    "AMA": ["antiamarilica", "fiebre amarilla", "amarilica", "ama"],
    "DPT_REF": ["dpt refuerzo", "dpt"],
    "VAR": ["varicela"],
    "VPH": ["vph", "papiloma"],
    "HEPB_PED": ["hepatitis b", "hepb"],
    "DT_ADULTO": ["dt adulto", "dt"],
    "PENTA_BAR": ["pentavalente barrido", "penta barrido", "pentavalente"],
    "DPT_BAR": ["dpt barrido", "dpt"],
    "INF_GTE": ["influenza gestante", "influenza"],
    "DT_GTE": ["dt gestante", "difteria tetano gestante"],
    "HEPB_GTE": ["hepatitis b gestante"],
    "TDPA": ["tdpa", "tdpa celular"],
}
