"""Carga genérica para cualquiera de las 9 tablas clínicas.

Idempotencia: antes de insertar, cuenta cuántas filas de esa tabla ya
tienen `fuente_origen = 'EXCEL_2024_2025'`. Si ya hay alguna, asume que esa
hoja ya se migró en una corrida anterior y no vuelve a insertar nada (evita
duplicar 33 mil filas si el script se corre dos veces por error).
"""

from __future__ import annotations

from dataclasses import dataclass

from sqlalchemy.engine import Connection

from src.config import FUENTE_ORIGEN
from src.db import contar_filas_migradas
from src.loaders.base_loader import insertar_por_lotes


@dataclass
class ResultadoCarga:
    migrados: int
    omitido_por_idempotencia: bool
    filas_ya_existentes: int
    sin_paciente_resuelto: int


def cargar_tabla_clinica(
    conn: Connection,
    tabla: str,
    filas: list[dict],
    mapa_dni_a_paciente_id: dict[str, int],
    batch_size: int,
    dry_run: bool,
) -> ResultadoCarga:
    ya_migradas = contar_filas_migradas(conn, tabla, FUENTE_ORIGEN)
    if ya_migradas > 0:
        return ResultadoCarga(migrados=0, omitido_por_idempotencia=True, filas_ya_existentes=ya_migradas, sin_paciente_resuelto=0)

    filas_finales = []
    sin_paciente = 0
    for fila in filas:
        fila = dict(fila)
        dni = fila.pop("_dni")
        paciente_id = mapa_dni_a_paciente_id.get(dni)
        if paciente_id is None:
            sin_paciente += 1
            continue
        fila["paciente_id"] = paciente_id
        filas_finales.append(fila)

    migrados = insertar_por_lotes(conn, tabla, filas_finales, batch_size, dry_run)
    return ResultadoCarga(
        migrados=migrados, omitido_por_idempotencia=False, filas_ya_existentes=0, sin_paciente_resuelto=sin_paciente
    )
