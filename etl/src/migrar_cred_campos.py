"""Fase J3 — completa perímetro cefálico, número de control, diagnóstico
nutricional real y lactancia materna exclusiva de `cred_menor5`, leyendo el
Excel ORIGINAL (`BD ENF CAPIIIM 1.xlsx`, hoja 'CREDMENOR  5'): el limpio de
la Fase G no traía ninguna de estas columnas.

Mapeo de columnas (verificado contra datos reales, header_rows=5):
    3  DNI
    12 PC (perímetro cefálico, cm)         -> perimetro_cefalico
    13 CTRL ("2°", "5°"...)                -> num_control
    14/15 GI (Ganancia Inadecuada, flag=1)      -> dx_nutricional=GANANCIA_INADECUADA
    16/17 Recuperado (flag=1)                   -> dx_nutricional=RECUPERADO
    18/19 Sobrepeso (flag=1)                    -> dx_nutricional=SOBREPESO
    20/21 Desnutrición aguda (flag=1)           -> dx_nutricional=DESNUTRICION_AGUDA
    22/23 Desnutrición crónica (flag=1)         -> dx_nutricional=DESNUTRICION_CRONICA
    24/25 Obeso (flag=1)                        -> dx_nutricional=SOBREPESO
          (el ENUM de cred_menor5 no tiene un valor "OBESO" -- solo lo tiene
          cred_mayor5 -- así que se usa SOBREPESO como la categoría real más
          cercana disponible; se documenta acá, no se inventa un valor nuevo)
    26 LME 6M (lactancia materna exclusiva)      -> lactancia_hasta_6m
    27 DX.1 (código numérico 1.0/2.0)            -> dx_nutricional
          1.0 -> GANANCIA_INADECUADA, 2.0 -> NORMAL. Esta columna es una
          fuente más directa/confiable que las banderas de arriba, así que
          cuando trae un valor tiene prioridad sobre el resultado de
          `resolver_dx_nutricional`.

perimetro_cefalico / num_control / lactancia_hasta_6m se actualizan con
COALESCE (solo si están NULL). dx_nutricional NO puede usar COALESCE porque
la Fase G ya le puso 'NORMAL' como default documentado (la columna es
NOT NULL y el limpio no traía este dato); acá se reemplaza ese 'NORMAL'
placeholder por el diagnóstico real SOLO cuando el Excel original trae una
bandera de diagnóstico explícita, y solo si el valor actual sigue siendo
el default 'NORMAL' (para no pisar un valor que ya haya sido editado
manualmente desde que corrió la Fase G).
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

from sqlalchemy import text

from src.config import cargar_config
from src.db import crear_engine
from src.excel_reader import leer_hoja_aplanada
from src.fase_j_common import ORIGINAL_EXCEL_PATH, limpiar_dni

HOJA = "CREDMENOR  5"
HEADER_ROWS = 5

_FLAGS_DX = [
    ((14, 15), "GANANCIA_INADECUADA"),
    ((16, 17), "RECUPERADO"),
    ((18, 19), "SOBREPESO"),
    ((20, 21), "DESNUTRICION_AGUDA"),
    ((22, 23), "DESNUTRICION_CRONICA"),
    ((24, 25), "SOBREPESO"),  # "Obeso" en el Excel; sin equivalente exacto en el ENUM de menor5
]


def _flag_presente(fila, idx: int) -> bool:
    if idx >= len(fila):
        return False
    valor = fila.iloc[idx]
    if valor is None:
        return False
    try:
        return float(valor) != 0
    except (ValueError, TypeError):
        return str(valor).strip() != ""


def resolver_dx_nutricional(fila) -> str | None:
    for (a, b), dx in _FLAGS_DX:
        if _flag_presente(fila, a) or _flag_presente(fila, b):
            return dx
    return None


_DX1_MAP = {1.0: "GANANCIA_INADECUADA", 2.0: "NORMAL"}


def resolver_dx1(fila) -> str | None:
    if len(fila) <= 27 or fila.iloc[27] is None:
        return None
    try:
        codigo = float(fila.iloc[27])
    except (ValueError, TypeError):
        return None
    return _DX1_MAP.get(codigo)


def resolver_pc(fila) -> float | None:
    if len(fila) <= 12 or fila.iloc[12] is None:
        return None
    try:
        pc = float(fila.iloc[12])
    except (ValueError, TypeError):
        return None
    return round(pc, 2) if 10 < pc < 100 else None


def resolver_ctrl(fila) -> int | None:
    if len(fila) <= 13 or fila.iloc[13] is None:
        return None
    solo_digitos = re.sub(r"\D", "", str(fila.iloc[13]))
    return int(solo_digitos) if solo_digitos else None


def resolver_lme(fila) -> bool | None:
    if len(fila) <= 26 or fila.iloc[26] is None:
        return None
    return True


def main() -> int:
    parser = argparse.ArgumentParser(description="Fase J3: completa PC, CTRL, dx_nutricional y LME de cred_menor5")
    parser.add_argument("--dry-run", action="store_true", help="Solo reporta, no escribe en la BD")
    args = parser.parse_args()

    if not ORIGINAL_EXCEL_PATH.exists():
        print(f"ERROR: no se encontró el Excel original en: {ORIGINAL_EXCEL_PATH}")
        return 1

    print(f"Excel original: {ORIGINAL_EXCEL_PATH}")
    df = leer_hoja_aplanada(ORIGINAL_EXCEL_PATH, HOJA, header_rows=HEADER_ROWS)
    print(f"Filas leídas de '{HOJA}': {len(df)}")

    config = cargar_config()
    engine = crear_engine(config)

    actualizados = 0
    sin_paciente = 0
    sin_registro_cred = 0
    con_dato_nuevo = 0
    con_dx_real = 0

    with engine.begin() as conn:
        for _, fila in df.iterrows():
            dni = limpiar_dni(fila.iloc[3])
            if dni is None:
                continue

            pc = resolver_pc(fila)
            ctrl = resolver_ctrl(fila)
            dx = resolver_dx1(fila) or resolver_dx_nutricional(fila)
            lme = resolver_lme(fila)

            if pc is None and ctrl is None and dx is None and lme is None:
                continue
            con_dato_nuevo += 1
            if dx is not None:
                con_dx_real += 1

            paciente = conn.execute(text("SELECT id FROM paciente WHERE dni = :dni"), {"dni": dni}).fetchone()
            if paciente is None:
                sin_paciente += 1
                continue

            registro = conn.execute(
                text("SELECT id FROM cred_menor5 WHERE paciente_id = :pid LIMIT 1"),
                {"pid": paciente[0]},
            ).fetchone()
            if registro is None:
                sin_registro_cred += 1
                continue

            if not args.dry_run:
                conn.execute(
                    text(
                        """
                        UPDATE cred_menor5 SET
                            perimetro_cefalico = COALESCE(perimetro_cefalico, :pc),
                            num_control        = COALESCE(num_control, :ctrl),
                            lactancia_hasta_6m = COALESCE(lactancia_hasta_6m, :lme),
                            dx_nutricional     = CASE
                                WHEN :dx IS NOT NULL AND dx_nutricional = 'NORMAL' THEN :dx
                                ELSE dx_nutricional
                            END
                        WHERE id = :id
                        """
                    ),
                    {"pc": pc, "ctrl": ctrl, "lme": lme, "dx": dx, "id": registro[0]},
                )
            actualizados += 1

    print(f"\nFilas con al menos un dato nuevo en el Excel: {con_dato_nuevo}")
    print(f"  ...de esas, con diagnóstico nutricional real:  {con_dx_real}")
    print(f"Sin paciente en BD (DNI no encontrado):        {sin_paciente}")
    print(f"Sin registro previo en cred_menor5:             {sin_registro_cred}")
    print(f"{'Se actualizarían' if args.dry_run else 'Actualizados'}: {actualizados}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
