"""Lógica compartida por las 4 hojas PAI (misma estructura: 1 fila = 1 dosis
aplicada). No es una hoja en sí; cada extract_pai_<grupo>.py la invoca con su
propio nombre de hoja lógico. Se mantiene un archivo por hoja (como pide la
Fase F) para que main.py y los reportes tengan un punto de entrada por hoja,
pero sin duplicar 4 veces la misma lectura/resolución de columnas.
"""

from __future__ import annotations

from typing import Optional

import pandas as pd

from src.aliases import ALIASES_PAI_COMUN, NOMBRES_HOJA
from src.config import PAI_MAYOR5A_FILAS_BASURA_UMBRAL
from src.excel_reader import encontrar_hoja, leer_hoja_aplanada, listar_hojas
from src.extractors.base import ExtraccionHoja, columnas_no_encontradas, resolver_columnas
from src.normalizers import normalizar_dni

OBLIGATORIAS = ["dni", "vacuna", "fecha_aplicacion"]


def _filtrar_filas_con_dni_valido(df: pd.DataFrame, columna_dni: Optional[str]) -> tuple[pd.DataFrame, int]:
    """Regla PAI >5A: si la hoja viene con basura (filas vacías/rotas por un
    export corrupto), se conservan solo filas cuyo DNI luce válido."""
    if columna_dni is None:
        return df.iloc[0:0], len(df)

    def _es_dni_potencial(valor: object) -> bool:
        resultado = normalizar_dni(valor)
        return resultado.estado in ("OK", "PADDED")

    mascara = df[columna_dni].apply(_es_dni_potencial)
    filtrado = df[mascara]
    descartadas = len(df) - len(filtrado)
    return filtrado, descartadas


def extraer_pai(path, hoja_logica: str) -> Optional[ExtraccionHoja]:
    hojas = listar_hojas(path)
    hoja_excel = encontrar_hoja(hojas, NOMBRES_HOJA[hoja_logica])
    if hoja_excel is None:
        return None

    df = leer_hoja_aplanada(path, hoja_excel)
    columnas = resolver_columnas(df, ALIASES_PAI_COMUN)
    advertencias = [
        f"Columna no encontrada para '{campo}' en hoja {hoja_excel}"
        for campo in columnas_no_encontradas(columnas, OBLIGATORIAS)
    ]

    if len(df) > PAI_MAYOR5A_FILAS_BASURA_UMBRAL:
        columna_dni = columnas.get("dni")
        if columna_dni is None:
            advertencias.append(
                f"Hoja {hoja_excel} tiene {len(df)} filas (> {PAI_MAYOR5A_FILAS_BASURA_UMBRAL}) y no se "
                "encontró columna de DNI: hoja irrecuperable, se omite por completo."
            )
            return ExtraccionHoja(hoja_logica, hoja_excel, columnas, df.iloc[0:0], advertencias)

        df_filtrado, descartadas = _filtrar_filas_con_dni_valido(df, columna_dni)
        advertencias.append(
            f"Hoja {hoja_excel} tenía {len(df)} filas (> umbral de {PAI_MAYOR5A_FILAS_BASURA_UMBRAL}); "
            f"se filtró a {len(df_filtrado)} filas con DNI potencialmente válido "
            f"({descartadas} descartadas por basura)."
        )
        if df_filtrado.empty:
            advertencias.append(f"Hoja {hoja_excel}: tras filtrar, 0 filas válidas. Hoja irrecuperable, se omite.")
        df = df_filtrado

    return ExtraccionHoja(hoja_logica, hoja_excel, columnas, df, advertencias)
