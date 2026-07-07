from __future__ import annotations

from typing import Optional

from src.extractors.base import ExtraccionHoja
from src.extractors.extract_pai_generic import extraer_pai

HOJA_LOGICA = "pai_7a_15a"


def extraer(path) -> Optional[ExtraccionHoja]:
    return extraer_pai(path, HOJA_LOGICA)
