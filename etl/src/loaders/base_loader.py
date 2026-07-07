"""INSERT en lotes de tamaño fijo.

Nota de diseño: "transacción por hoja" y "batch insert de 500 filas por
commit" se combinan así: cada hoja se procesa dentro de una única
transacción (`src.db.transaccion`, abierta una vez en main.py) que se
confirma (o revierte completa) al final; dentro de esa transacción, los
INSERT se envían al driver en lotes de `batch_size` filas (vía
`executemany`) por eficiencia y para no mandar una sola sentencia gigante
de 30 mil filas. Si algo falla a mitad de la hoja, la transacción entera se
revierte: no queda una hoja "a medio migrar".
"""

from __future__ import annotations

from sqlalchemy import text
from sqlalchemy.engine import Connection


def insertar_por_lotes(conn: Connection, tabla: str, filas: list[dict], batch_size: int, dry_run: bool) -> int:
    if not filas:
        return 0
    if dry_run:
        return len(filas)

    columnas = list(filas[0].keys())
    marcadores = ", ".join(f":{col}" for col in columnas)
    sql = text(f"INSERT INTO {tabla} ({', '.join(columnas)}) VALUES ({marcadores})")

    total = 0
    for inicio in range(0, len(filas), batch_size):
        lote = filas[inicio : inicio + batch_size]
        conn.execute(sql, lote)
        total += len(lote)
    return total
