"""Carga de pacientes: idempotente por DNI (si el paciente ya existe en BD,
no se reinserta, solo se reutiliza su id para enlazar los registros clínicos)."""

from __future__ import annotations

from sqlalchemy.engine import Connection

from src.db import obtener_pacientes_por_dni
from src.loaders.base_loader import insertar_por_lotes


def cargar_pacientes(
    conn: Connection, filas_paciente: list[dict], batch_size: int, dry_run: bool
) -> tuple[int, dict[str, int]]:
    """Devuelve (cantidad_insertada, mapa dni -> paciente_id) incluyendo tanto
    los que ya existían como los recién insertados."""
    if not filas_paciente:
        return 0, {}

    dnis = [fila["dni"] for fila in filas_paciente]
    existentes = obtener_pacientes_por_dni(conn, dnis)
    nuevos = [fila for fila in filas_paciente if fila["dni"] not in existentes]

    insertados = insertar_por_lotes(conn, "paciente", nuevos, batch_size, dry_run)

    if not nuevos:
        return insertados, existentes

    if dry_run:
        # No hay ids reales (no se insertó nada): se asignan ids sintéticos
        # negativos para que el resto del pipeline pueda "resolver" el DNI y
        # el dry-run reporte cuántas filas clínicas se migrarían de verdad,
        # en vez de contarlas como "sin paciente resuelto".
        existentes.update({fila["dni"]: -(i + 1) for i, fila in enumerate(nuevos)})
        return insertados, existentes

    recien_creados = obtener_pacientes_por_dni(conn, [fila["dni"] for fila in nuevos])
    existentes.update(recien_creados)
    return insertados, existentes
