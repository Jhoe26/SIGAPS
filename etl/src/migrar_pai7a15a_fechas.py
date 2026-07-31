"""Fase J6 — completa `observaciones` de `pai_7a_15a` con las fechas de dosis
de las vacunas específicas de barrido (Hepatitis B Pediátrica, DT Adulto,
Hepatitis B 7A-15A), leyendo el Excel ORIGINAL (`BD ENF CAPIIIM 1.xlsx`, hoja
'PAI>7A-<15A (2)', header=None, skiprows=2): el limpio de la Fase G solo trajo
una fecha de aplicación por paciente (la primera fecha no vacía que encontró
entre estas mismas columnas) y clasificó el registro como "Vacuna sin
clasificar (histórico)" -- no hay forma de saber, solo con lo ya migrado, a
cuál de estas vacunas/dosis corresponde esa fecha. Este script no toca
`vacuna_id` (habría que re-clasificarlo, fuera de alcance de esta migración
de campos faltantes); solo agrega a `observaciones` el detalle completo de
fechas por dosis que si trae el Excel original, para no perder ese dato.

Mapeo de columnas (verificado contra datos reales con pandas
header=None, skiprows=2):
    1  DNI                                          -> cruce con paciente.dni
    8  Hepatitis B Pediátrica (4M a 7A) -- 2da dosis
    9  Hepatitis B Pediátrica (4M a 7A) -- 3ra dosis
    10 DT Adulto (>=7A) -- 1ra dosis
    11 DT Adulto (>=7A) -- 2da dosis
    12 DT Adulto (>=7A) -- 3ra dosis
    13 Hepatitis B (7A a 15A) -- 1ra dosis
    14 Hepatitis B (7A a 15A) -- 2da dosis
    15 Hepatitis B (7A a 15A) -- 3ra dosis

Se ignoran fechas fuera de 1900-2026 (regla explícita de esta migración,
más estricta que el rango general del ETL). `observaciones` se actualiza
con COALESCE: nunca se pisa un valor que ya exista en BD.
"""

from __future__ import annotations

import argparse
import sys
import warnings
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
warnings.filterwarnings("ignore", category=UserWarning, module="openpyxl")

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except (AttributeError, ValueError):
        pass

import pandas as pd
from sqlalchemy import text

from src.config import cargar_config
from src.db import crear_engine
from src.fase_j_common import ORIGINAL_EXCEL_PATH, limpiar_dni, limpiar_fecha

HOJA = "PAI>7A-<15A (2)"
ANIO_MAX_ESTRICTO = 2026

COLUMNAS_VACUNA = [
    (8, "Hepatitis B Pediatrica 2da dosis"),
    (9, "Hepatitis B Pediatrica 3ra dosis"),
    (10, "DT Adulto 1ra dosis"),
    (11, "DT Adulto 2da dosis"),
    (12, "DT Adulto 3ra dosis"),
    (13, "Hepatitis B 7A-15A 1ra dosis"),
    (14, "Hepatitis B 7A-15A 2da dosis"),
    (15, "Hepatitis B 7A-15A 3ra dosis"),
]


def _fecha_estricta(valor: object):
    fecha = limpiar_fecha(valor)
    if fecha is not None and fecha.year > ANIO_MAX_ESTRICTO:
        return None
    return fecha


def construir_actualizacion(fila) -> dict | None:
    dni = limpiar_dni(fila.iloc[1])
    if dni is None:
        return None

    partes = []
    for col, etiqueta in COLUMNAS_VACUNA:
        fecha = _fecha_estricta(fila.iloc[col])
        if fecha is not None:
            partes.append(f"{etiqueta}: {fecha.isoformat()}")

    if not partes:
        return None

    return {"dni": dni, "observaciones": "; ".join(partes)}


def main() -> int:
    parser = argparse.ArgumentParser(description="Fase J6: completa observaciones (fechas de dosis) de pai_7a_15a")
    parser.add_argument("--dry-run", action="store_true", help="Solo reporta, no escribe en la BD")
    args = parser.parse_args()

    if not ORIGINAL_EXCEL_PATH.exists():
        print(f"ERROR: no se encontró el Excel original en: {ORIGINAL_EXCEL_PATH}")
        return 1

    print(f"Excel original: {ORIGINAL_EXCEL_PATH}")
    df = pd.read_excel(ORIGINAL_EXCEL_PATH, sheet_name=HOJA, header=None, skiprows=2)
    print(f"Filas leídas de '{HOJA}': {len(df)}")

    config = cargar_config()
    engine = crear_engine(config)

    actualizados = 0
    sin_paciente = 0
    sin_registro_pai = 0
    con_dato_nuevo = 0
    pendientes: list[dict] = []

    def _volcar_lote(lote: list[dict]) -> None:
        nonlocal actualizados, sin_paciente, sin_registro_pai
        if not lote:
            return
        with engine.begin() as conn:
            for datos in lote:
                paciente = conn.execute(
                    text("SELECT id FROM paciente WHERE dni = :dni"), {"dni": datos["dni"]}
                ).fetchone()
                if paciente is None:
                    sin_paciente += 1
                    continue

                registro = conn.execute(
                    text("SELECT id FROM pai_7a_15a WHERE paciente_id = :pid LIMIT 1"),
                    {"pid": paciente[0]},
                ).fetchone()
                if registro is None:
                    sin_registro_pai += 1
                    continue

                if not args.dry_run:
                    conn.execute(
                        text(
                            """
                            UPDATE pai_7a_15a SET
                                observaciones = COALESCE(observaciones, :observaciones)
                            WHERE id = :id
                            """
                        ),
                        {**datos, "id": registro[0]},
                    )
                actualizados += 1

    for _, fila in df.iterrows():
        datos = construir_actualizacion(fila)
        if datos is None:
            continue
        con_dato_nuevo += 1
        pendientes.append(datos)

        if len(pendientes) >= 100:
            _volcar_lote(pendientes)
            pendientes = []

    _volcar_lote(pendientes)

    print(f"\nFilas con al menos una fecha de dosis en el Excel: {con_dato_nuevo}")
    print(f"Sin paciente en BD (DNI no encontrado):             {sin_paciente}")
    print(f"Sin registro previo en pai_7a_15a:                   {sin_registro_pai}")
    print(f"{'Se actualizarían' if args.dry_run else 'Actualizados'}: {actualizados}")

    if not args.dry_run:
        with engine.connect() as conn:
            n_obs = conn.execute(text("SELECT COUNT(*) FROM pai_7a_15a WHERE observaciones IS NOT NULL")).scalar_one()
        print(f"Verificación: pai_7a_15a.observaciones no-NULL = {n_obs}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
