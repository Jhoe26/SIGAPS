from __future__ import annotations

from typing import Optional

from src.aliases import ALIASES_CRED_MAYOR5, NOMBRES_HOJA
from src.excel_reader import encontrar_hoja, leer_hoja_aplanada, listar_hojas
from src.extractors.base import ExtraccionHoja, columnas_no_encontradas, resolver_columnas

HOJA_LOGICA = "cred_mayor5"
OBLIGATORIAS = ["dni", "fecha"]  # dx_nutricional no viene en el Excel real (default 'NORMAL', ver cred_transformer)


def extraer(path) -> Optional[ExtraccionHoja]:
    hojas = listar_hojas(path)
    hoja_excel = encontrar_hoja(hojas, NOMBRES_HOJA[HOJA_LOGICA])
    if hoja_excel is None:
        return None

    df = leer_hoja_aplanada(path, hoja_excel)
    columnas = resolver_columnas(df, ALIASES_CRED_MAYOR5)
    advertencias = [
        f"Columna no encontrada para '{campo}' en hoja {hoja_excel}"
        for campo in columnas_no_encontradas(columnas, OBLIGATORIAS)
    ]
    return ExtraccionHoja(HOJA_LOGICA, hoja_excel, columnas, df, advertencias)
