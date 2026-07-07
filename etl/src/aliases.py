"""Alias de columnas y de nombres de vacuna.

IMPORTANTE: no tenemos el Excel real disponible al escribir este ETL (no
está presente en el repo todavía). Estas listas son el mejor esfuerzo según
las convenciones típicas de planillas de enfermería en Perú y los nombres
de columna del schema. **Revisar y ajustar tras el primer `--dry-run`**
contra el archivo real: si una hoja reporta muchas filas en
"requiere_revision_manual" por "columna no encontrada", casi siempre es
cuestión de agregar el texto exacto del encabezado aquí.

Los candidatos se comparan sin tildes/mayúsculas y por sub-string (ver
excel_reader.encontrar_columna), así que no hace falta el texto exacto, solo
una porción reconocible.
"""

from __future__ import annotations

# --- Alias de hoja (nombre real del libro puede variar levemente) ---
NOMBRES_HOJA = {
    "tamizaje": ["TAMIZAJE"],
    "anemia": ["ANEMIA"],
    "cred_menor5": ["CREDMENOR 5", "CRED MENOR 5", "CRED MENOR5"],
    "cred_mayor5": ["CRED MAYOR 5", "CREDMAYOR 5", "CRED MAYOR5"],
    "pai_menor12m": ["PAI < 12M", "PAI <12M", "PAI MENOR 12M"],
    "pai_12m_5a": ["PAI > 12M-<5A", "PAI 12M-5A", "PAI >12M-<5A"],
    "pai_mayor5a": ["PAI >5A (corrupta)", "PAI >5A", "PAI MAYOR 5A"],
    "pai_7a_15a": ["PAI>7A-<15A (2)", "PAI>7A-<15A", "PAI 7A-15A"],
    "gestante": ["GTE", "GESTANTE"],
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
    "ap_paterno": ["apellido paterno", "ap paterno"],
    "ap_materno": ["apellido materno", "ap materno"],
    "nombres": ["nombres"],
    "fecha_nacimiento": ["fecha nacimiento", "fecha de nacimiento", "f nacimiento", "fec nac", "nacio"],
    "sexo": ["sexo", "genero"],
    "telefono": ["telefono", "celular", "nro celular", "telf", "numero celular"],
    "direccion": ["direccion", "domicilio"],
    "distrito": ["distrito"],
}

# --- Quién atendió (solo primer nombre en el Excel; regla: NO crear profesional) ---
COLUMNA_PROFESIONAL = ["responsable", "profesional", "enfermero", "enfermera", "quien atendio", "atendido por"]

ALIASES_TAMIZAJE = {
    **COLUMNAS_PACIENTE_COMUN,
    "fecha": ["fecha tamizaje", "fecha de tamizaje", "fecha"],
    "edad_anios": ["edad anios", "edad años", "anios"],
    "edad_meses": ["edad meses", "meses"],
    "edad_dias": ["edad dias", "dias"],
    "tipo_dosaje": ["tipo dosaje", "dosaje", "tipo de dosaje"],
    "hb_observado": ["hb observado", "hb obs", "hemoglobina", "hb"],
    "observaciones": ["observaciones", "obs"],
    "profesional": COLUMNA_PROFESIONAL,
}

ALIASES_ANEMIA = {
    **COLUMNAS_PACIENTE_COMUN,
    "fecha_inicio": ["fecha inicio", "fecha de inicio", "fecha"],
    "hb_inicial_obs": ["hb inicial", "hb inicial observado", "hb obs inicial"],
    "dx_inicial": ["dx inicial", "diagnostico inicial", "clasificacion"],
    "tipo_hierro": ["tipo hierro", "tipo de hierro", "hierro indicado"],
    "dosis_indicada": ["dosis indicada", "dosis"],
    # Control 1
    "c1_enf_fecha": ["1er control enfermeria fecha", "control 1 enfermeria fecha", "1 control fecha"],
    "c1_hb_obs": ["1er control enfermeria hb", "control 1 hb", "1 control hb observado"],
    "c1_med_fecha": ["1er control medico fecha", "control 1 medico fecha"],
    "c1_med_obs": ["1er control medico observaciones", "control 1 medico obs"],
    # Control 2
    "c2_enf_fecha": ["2do control enfermeria fecha", "control 2 enfermeria fecha", "2 control fecha"],
    "c2_hb_obs": ["2do control enfermeria hb", "control 2 hb"],
    "c2_med_fecha": ["2do control medico fecha", "control 2 medico fecha"],
    "c2_med_obs": ["2do control medico observaciones", "control 2 medico obs"],
    # Control 3
    "c3_enf_fecha": ["3er control enfermeria fecha", "control 3 enfermeria fecha", "3 control fecha"],
    "c3_hb_obs": ["3er control enfermeria hb", "control 3 hb"],
    "estado": ["estado", "condicion"],
    "observaciones": ["observaciones", "obs"],
    "profesional": COLUMNA_PROFESIONAL,
}

ALIASES_CRED_MENOR5 = {
    **COLUMNAS_PACIENTE_COMUN,
    "fecha": ["fecha control", "fecha de control", "fecha"],
    "edad_puntual": ["edad puntual", "edad"],
    "num_control": ["nro control", "n control", "numero de control"],
    "peso": ["peso"],
    "talla": ["talla"],
    "perimetro_cefalico": ["perimetro cefalico", "pc"],
    "dx_nutricional": ["dx nutricional", "diagnostico nutricional"],
    "lactancia_hasta_6m": ["lactancia", "lactancia materna exclusiva"],
    "grado_riesgo": ["grado riesgo", "riesgo"],
    "observaciones": ["observaciones", "obs"],
    "profesional": COLUMNA_PROFESIONAL,
}

ALIASES_CRED_MAYOR5 = {
    **COLUMNAS_PACIENTE_COMUN,
    "fecha": ["fecha control", "fecha de control", "fecha"],
    "edad_puntual": ["edad puntual", "edad"],
    "num_control": ["nro control", "n control", "numero de control"],
    "peso": ["peso"],
    "talla": ["talla"],
    "riesgo_nutricional": ["riesgo nutricional"],
    "dx_nutricional": ["dx nutricional", "diagnostico nutricional"],
    "observaciones": ["observaciones", "obs"],
    "profesional": COLUMNA_PROFESIONAL,
}

# Las 4 hojas PAI comparten estructura (una fila = una dosis aplicada).
ALIASES_PAI_COMUN = {
    **COLUMNAS_PACIENTE_COMUN,
    "vacuna": ["vacuna", "biologico"],
    "num_dosis": ["nro dosis", "n dosis", "dosis"],
    "fecha_aplicacion": ["fecha aplicacion", "fecha de aplicacion", "fecha"],
    "lote": ["lote"],
    "tipo_aplicacion": ["tipo aplicacion", "regular barrido"],
    "observaciones": ["observaciones", "obs"],
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
    "observaciones": ["observaciones", "obs"],
    "profesional": COLUMNA_PROFESIONAL,
}

# --- Vacuna Excel (texto libre) -> codigo de vacuna_catalogo ---
# Cada extractor de PAI solo busca dentro del subconjunto de su grupo_edad,
# así "DPT" no se confunde entre DPT_REF (12M_5A) y DPT_BAR (7A_15A).
VACUNA_ALIASES: dict[str, list[str]] = {
    "PTV": ["pentavalente", "penta"],
    "RTV": ["rotavirus", "rota"],
    "IPV": ["ipv", "polio inactivada", "antipolio inactivada"],
    "NEU": ["neumococo", "neumo"],
    "INF_PED": ["influenza pediatrica", "influenza"],
    "SPR": ["spr", "sarampion paperas rubeola", "sarampion"],
    "AMA": ["antiamarilica", "fiebre amarilla", "amarilica"],
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
