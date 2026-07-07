"""Hoja 'PAI >5A (corrupta)': la más grande y sucia del libro. La lógica de
filtrado por umbral de filas basura vive en extract_pai_generic (compartida
por si otra hoja llega igual de corrupta), este archivo solo la referencia
explícitamente porque es la hoja documentada como corrupta en la Fase F.
"""

from __future__ import annotations

from typing import Optional

from src.extractors.base import ExtraccionHoja
from src.extractors.extract_pai_generic import extraer_pai

HOJA_LOGICA = "pai_mayor5a"


def extraer(path) -> Optional[ExtraccionHoja]:
    return extraer_pai(path, HOJA_LOGICA)
