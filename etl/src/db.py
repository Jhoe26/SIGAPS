"""Acceso a MySQL vía SQLAlchemy Core (sin ORM: el ETL solo hace INSERT/SELECT
de bajo nivel contra tablas ya creadas por Flyway, no necesita mapear entidades)."""

from __future__ import annotations

from contextlib import contextmanager
from typing import Iterator

from sqlalchemy import Engine, bindparam, create_engine, text
from sqlalchemy.engine import Connection

from src.config import Config


def crear_engine(config: Config) -> Engine:
    return create_engine(config.db_url, pool_pre_ping=True, future=True)


@contextmanager
def transaccion(engine: Engine) -> Iterator[Connection]:
    """Una transacción por hoja: si algo falla a mitad de la hoja, se revierte
    completa (rule: 'transacción por hoja')."""
    with engine.begin() as conn:
        yield conn


def contar_filas_migradas(conn: Connection, tabla: str, fuente_origen: str) -> int:
    """Idempotencia: cuántas filas de esta tabla ya vienen de esta fuente."""
    resultado = conn.execute(
        text(f"SELECT COUNT(*) FROM {tabla} WHERE fuente_origen = :fuente"),  # nosec: tabla viene de código, no de input externo
        {"fuente": fuente_origen},
    )
    return int(resultado.scalar_one())


def obtener_pacientes_por_dni(conn: Connection, dnis: list[str]) -> dict[str, int]:
    """Mapea DNI -> id de paciente para los DNI ya existentes en la BD."""
    if not dnis:
        return {}
    resultado = conn.execute(
        text("SELECT dni, id FROM paciente WHERE dni IN :dnis").bindparams(
            bindparam("dnis", expanding=True)
        ),
        {"dnis": dnis},
    )
    return {fila.dni: fila.id for fila in resultado}


def obtener_vacunas_catalogo(conn: Connection) -> list[dict]:
    resultado = conn.execute(text("SELECT id, codigo, nombre, grupo_edad FROM vacuna_catalogo"))
    return [dict(fila._mapping) for fila in resultado]
