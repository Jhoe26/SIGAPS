"""Fase J4 — PAI <12M: fechas por dosis.

Este script NO actualiza nada. Se investigó si era seguro asignar las fechas
de dosis del Excel original (columnas "1a PTV,RTV,IPV,NEU", "2a ...", "3a
...", "1a/2a INFLUENZA PEDIATRICA") a los registros ya migrados en
`pai_menor12m`, y no lo es:

  - La Fase G migró cada fila del Excel limpio como un registro de
    `pai_menor12m` con `num_dosis = 1` fijo para TODAS (el limpio no traía
    número de dosis ni identidad de vacuna).
  - En BD hay 1,601 registros para 684 pacientes (~2.3 registros/paciente)
    y el 100% tiene num_dosis=1: no existe ninguna columna que distinga
    cuál registro corresponde a cuál dosis real.
  - El Excel original, en cambio, es una tarjeta acumulada por niño (una
    fila por niño, con hasta 5 columnas de fecha para distintas dosis/
    vacunas), no un registro por dosis aplicada.

Sin una clave de unión confiable entre "fila de pai_menor12m ya migrada" y
"columna de fecha del Excel", asignar fechas por posición/orden sería
adivinar -- y una fecha de vacunación incorrecta es un dato clínico
delicado. Se prefiere dejarlo sin completar antes que inventar la relación.

Este script solo verifica y muestra esa evidencia; no escribe en la BD.
"""

from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except (AttributeError, ValueError):
        pass

from sqlalchemy import text

from src.config import cargar_config
from src.db import crear_engine


def main() -> int:
    config = cargar_config()
    engine = crear_engine(config)

    with engine.connect() as conn:
        total = conn.execute(text("SELECT COUNT(*) FROM pai_menor12m WHERE es_historico = TRUE")).scalar_one()
        pacientes = conn.execute(
            text("SELECT COUNT(DISTINCT paciente_id) FROM pai_menor12m WHERE es_historico = TRUE")
        ).scalar_one()
        dosis_1 = conn.execute(
            text("SELECT COUNT(*) FROM pai_menor12m WHERE es_historico = TRUE AND num_dosis = 1")
        ).scalar_one()

    print("PAI <12M -- diagnóstico (no se modifica nada):")
    print(f"  Registros históricos:            {total}")
    print(f"  Pacientes distintos:              {pacientes}")
    print(f"  Registros con num_dosis = 1:       {dosis_1} ({'100%' if total == dosis_1 else f'{dosis_1/total:.0%}'})")
    print(
        "\n  Sin una columna que identifique la dosis/vacuna real de cada registro,\n"
        "  no hay forma confiable de saber a cuál fila del Excel original\n"
        "  corresponde cada uno. Se omite esta migración -- ver docstring."
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
