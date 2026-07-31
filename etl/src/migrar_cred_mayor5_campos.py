"""Fase J5 — completa número de control, observaciones y (solo cuando el
código es inambiguo) el diagnóstico nutricional real de `cred_mayor5`,
leyendo el Excel ORIGINAL (`BD ENF CAPIIIM 1.xlsx`, hoja 'CRED MAYOR 5 ',
header=3): el limpio de la Fase G no traía estas columnas y `dx_nutricional`
quedó con 'NORMAL' como placeholder obligatorio (columna NOT NULL) en el
100% de los 2526 registros.

Mapeo de columnas (verificado contra datos reales con pandas header=3; se
referencia por NOMBRE de columna, no por índice, porque son estables y
únicas tras el header multi-fila -- los índices numéricos NO coinciden con
los que trae cualquier descripción previa del Excel, hay que verificar
siempre contra el archivo real):
    DNI          -> cruce con paciente.dni
    CTRL         -> num_control (se toman los dígitos iniciales del texto,
                    ej. "1°" -> 1, "2°" -> 2; se descartan valores fuera de
                    1-9 por ser error de tipeo, ej. "55.3" o "M")
    DX           -> dx_nutricional, SOLO para los códigos inambiguos vistos
                    en los datos: OB/ob -> OBESO, SP/sp -> SOBREPESO. El
                    resto de códigos (RTB, RDELG, ALTO, DELG, BP, GIP,
                    "1", "2"...) no tiene un mapeo confiable al ENUM
                    (DESNUTRICION_CRONICA/SOBREPESO/OBESO/NORMAL/RECUPERADO)
                    -- se prefiere dejarlos sin tocar antes que adivinar un
                    diagnóstico clínico. Solo se reemplaza cuando el valor
                    actual sigue siendo el placeholder 'NORMAL' (no se pisa
                    un diagnóstico ya editado a mano desde la Fase G).
    OBSERVACION  -> observaciones (texto libre)

num_control y observaciones se actualizan con COALESCE (solo si están NULL).
"""

from __future__ import annotations

import argparse
import re
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
from src.fase_j_common import ORIGINAL_EXCEL_PATH, limpiar_dni, limpiar_texto

HOJA = "CRED MAYOR 5 "
HEADER = 3

_DX_MAP = {"OB": "OBESO", "SP": "SOBREPESO"}


def resolver_num_control(valor: object) -> int | None:
    if valor is None or (isinstance(valor, float) and pd.isna(valor)):
        return None
    match = re.match(r"^(\d+)", str(valor).strip())
    if not match:
        return None
    numero = int(match.group(1))
    return numero if 1 <= numero <= 9 else None


def resolver_dx(valor: object) -> str | None:
    if valor is None or (isinstance(valor, float) and pd.isna(valor)):
        return None
    return _DX_MAP.get(str(valor).strip().upper())


def construir_actualizacion(fila) -> dict | None:
    dni = limpiar_dni(fila["DNI"])
    if dni is None:
        return None

    return {
        "dni": dni,
        "num_control": resolver_num_control(fila["CTRL"]),
        "dx": resolver_dx(fila["DX"]),
        "observaciones": limpiar_texto(fila["OBSERVACION"]),
    }


def main() -> int:
    parser = argparse.ArgumentParser(description="Fase J5: completa CTRL, DX y OBSERVACION de cred_mayor5")
    parser.add_argument("--dry-run", action="store_true", help="Solo reporta, no escribe en la BD")
    args = parser.parse_args()

    if not ORIGINAL_EXCEL_PATH.exists():
        print(f"ERROR: no se encontró el Excel original en: {ORIGINAL_EXCEL_PATH}")
        return 1

    print(f"Excel original: {ORIGINAL_EXCEL_PATH}")
    df = pd.read_excel(ORIGINAL_EXCEL_PATH, sheet_name=HOJA, header=HEADER)
    for col in ("DNI", "CTRL", "DX", "OBSERVACION"):
        if col not in df.columns:
            print(f"ERROR: no se encontró la columna '{col}' en la hoja '{HOJA}'")
            return 1
    print(f"Filas leídas de '{HOJA}': {len(df)}")

    config = cargar_config()
    engine = crear_engine(config)

    actualizados = 0
    sin_paciente = 0
    sin_registro_cred = 0
    con_dato_nuevo = 0
    con_dx_real = 0
    pendientes: list[dict] = []

    def _volcar_lote(lote: list[dict]) -> None:
        nonlocal actualizados, sin_paciente, sin_registro_cred
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
                    text("SELECT id FROM cred_mayor5 WHERE paciente_id = :pid LIMIT 1"),
                    {"pid": paciente[0]},
                ).fetchone()
                if registro is None:
                    sin_registro_cred += 1
                    continue

                if not args.dry_run:
                    conn.execute(
                        text(
                            """
                            UPDATE cred_mayor5 SET
                                num_control    = COALESCE(num_control, :num_control),
                                observaciones  = COALESCE(observaciones, :observaciones),
                                dx_nutricional = CASE
                                    WHEN :dx IS NOT NULL AND dx_nutricional = 'NORMAL' THEN :dx
                                    ELSE dx_nutricional
                                END
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

        tiene_algo = any(v is not None for k, v in datos.items() if k != "dni")
        if not tiene_algo:
            continue
        con_dato_nuevo += 1
        if datos["dx"] is not None:
            con_dx_real += 1
        pendientes.append(datos)

        if len(pendientes) >= 100:
            _volcar_lote(pendientes)
            pendientes = []

    _volcar_lote(pendientes)

    print(f"\nFilas con al menos un dato nuevo en el Excel: {con_dato_nuevo}")
    print(f"  ...de esas, con diagnóstico nutricional inambiguo: {con_dx_real}")
    print(f"Sin paciente en BD (DNI no encontrado):        {sin_paciente}")
    print(f"Sin registro previo en cred_mayor5:             {sin_registro_cred}")
    print(f"{'Se actualizarían' if args.dry_run else 'Actualizados'}: {actualizados}")

    if not args.dry_run:
        with engine.connect() as conn:
            n_ctrl = conn.execute(text("SELECT COUNT(*) FROM cred_mayor5 WHERE num_control IS NOT NULL")).scalar_one()
            n_obs = conn.execute(text("SELECT COUNT(*) FROM cred_mayor5 WHERE observaciones IS NOT NULL")).scalar_one()
            n_dx = conn.execute(text("SELECT COUNT(*) FROM cred_mayor5 WHERE dx_nutricional <> 'NORMAL'")).scalar_one()
        print(f"Verificación: num_control no-NULL = {n_ctrl}, observaciones no-NULL = {n_obs}, dx_nutricional <> NORMAL = {n_dx}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
