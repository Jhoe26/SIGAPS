"""Utilidades compartidas por los scripts de la Fase J (datos faltantes del
Excel original `BD ENF CAPIIIM 1.xlsx`, con encabezados multi-fila fusionados
-- distinto del `BD_ENF_CAPIIIM_LIMPIO.xlsx` usado en la Fase G).

Todas las columnas que leen estos scripts fueron verificadas contra datos
reales (no contra los nombres de columna solamente) antes de escribir
cualquier UPDATE.
"""

from __future__ import annotations

import datetime as dt
import os
import re
from pathlib import Path
from typing import Optional

import pandas as pd

from src.config import ANIO_MAX, ANIO_MIN, ETL_DIR

ORIGINAL_EXCEL_PATH = Path(
    os.getenv("ORIGINAL_EXCEL_PATH", str(ETL_DIR / ".." / "db" / "BD ENF CAPIIIM 1.xlsx"))
).resolve()


def limpiar_fecha(valor: object) -> Optional[dt.date]:
    if valor is None or (isinstance(valor, str) and not valor.strip()):
        return None
    fecha = pd.to_datetime(valor, errors="coerce")
    if pd.isna(fecha) or not (ANIO_MIN <= fecha.year <= ANIO_MAX):
        return None
    return fecha.date()


def limpiar_hb(valor: object) -> Optional[float]:
    if valor is None or (isinstance(valor, str) and not valor.strip()):
        return None
    try:
        texto = str(valor).strip().replace(",", ".")
        numero = float(texto)
    except ValueError:
        return None
    if numero <= 0 or numero > 25:
        return None
    return round(numero, 2)


def limpiar_texto(valor: object) -> Optional[str]:
    if valor is None:
        return None
    texto = str(valor).strip()
    if not texto or texto.lower() == "nan":
        return None
    return texto


def limpiar_dni(valor: object) -> Optional[str]:
    if valor is None:
        return None
    texto = str(valor).strip()
    if texto.endswith(".0"):
        texto = texto[:-2]
    solo_digitos = re.sub(r"\D", "", texto)
    if not solo_digitos or len(solo_digitos) > 8:
        return None
    return solo_digitos.zfill(8)
