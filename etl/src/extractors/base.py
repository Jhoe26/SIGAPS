"""Utilidades comunes a todos los extractores por hoja."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Optional

import pandas as pd

from src.excel_reader import encontrar_columna


@dataclass
class ExtraccionHoja:
    hoja_logica: str
    hoja_excel: str
    columnas_resueltas: dict[str, Optional[str]]
    df: pd.DataFrame
    advertencias: list[str]


def resolver_columnas(df: pd.DataFrame, aliases: dict[str, list[str]]) -> dict[str, Optional[str]]:
    columnas = list(df.columns)
    return {campo: encontrar_columna(columnas, candidatos) for campo, candidatos in aliases.items()}


def columnas_no_encontradas(columnas_resueltas: dict[str, Optional[str]], obligatorias: list[str]) -> list[str]:
    return [campo for campo in obligatorias if columnas_resueltas.get(campo) is None]


def valor(fila: pd.Series, columnas_resueltas: dict[str, Optional[str]], campo: str):
    columna = columnas_resueltas.get(campo)
    if columna is None:
        return None
    return fila[columna]
