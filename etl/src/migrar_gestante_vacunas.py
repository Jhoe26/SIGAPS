"""Fase J2 — completa las 8 fechas de vacuna de `gestante`, leyendo el Excel
ORIGINAL (`BD ENF CAPIIIM 1.xlsx`, hoja 'GTE'): el limpio de la Fase G no
traía ninguna columna de vacuna, así que estos 8 campos quedaron NULL.

Mapeo de columnas (verificado contra datos reales, header_rows=3):
    2  DNI
    9  INFLUENZA (fecha dosis única)     -> influenza_fecha
    10 DIFTERIA TETANO 1ra dosis fecha   -> dt_1_fecha
    11 DIFTERIA TETANO 2da dosis fecha   -> dt_2_fecha
    12 DIFTERIA TETANO 3ra dosis fecha   -> dt_3_fecha
    13 HEPATITIS B 1ra dosis fecha       -> hepb_1_fecha
    14 HEPATITIS B 2da dosis fecha       -> hepb_2_fecha
    15 HEPATITIS B 3ra dosis fecha       -> hepb_3_fecha
    16 TDPacelular fecha                 -> tdpa_fecha
    17 OBSERVACIONES                     -> observaciones

Todas las columnas se actualizan con COALESCE: nunca se pisa un valor que
ya exista en BD, solo se rellenan los que están NULL.
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

from sqlalchemy import text

from src.config import cargar_config
from src.db import crear_engine
from src.excel_reader import leer_hoja_aplanada
from src.fase_j_common import ORIGINAL_EXCEL_PATH, limpiar_dni, limpiar_fecha, limpiar_texto

HOJA = "GTE"
HEADER_ROWS = 3


def construir_actualizacion(fila) -> dict | None:
    dni = limpiar_dni(fila.iloc[2])
    if dni is None:
        return None

    return {
        "dni": dni,
        "influenza_fecha": limpiar_fecha(fila.iloc[9]),
        "dt_1_fecha": limpiar_fecha(fila.iloc[10]),
        "dt_2_fecha": limpiar_fecha(fila.iloc[11]),
        "dt_3_fecha": limpiar_fecha(fila.iloc[12]),
        "hepb_1_fecha": limpiar_fecha(fila.iloc[13]),
        "hepb_2_fecha": limpiar_fecha(fila.iloc[14]),
        "hepb_3_fecha": limpiar_fecha(fila.iloc[15]),
        "tdpa_fecha": limpiar_fecha(fila.iloc[16]),
        "observaciones": limpiar_texto(fila.iloc[17]),
    }


def main() -> int:
    parser = argparse.ArgumentParser(description="Fase J2: completa fechas de vacuna de gestante")
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
    sin_registro_gestante = 0
    con_dato_nuevo = 0

    with engine.begin() as conn:
        for _, fila in df.iterrows():
            datos = construir_actualizacion(fila)
            if datos is None:
                continue

            tiene_algo = any(v is not None for k, v in datos.items() if k != "dni")
            if not tiene_algo:
                continue
            con_dato_nuevo += 1

            paciente = conn.execute(text("SELECT id FROM paciente WHERE dni = :dni"), {"dni": datos["dni"]}).fetchone()
            if paciente is None:
                sin_paciente += 1
                continue

            registro = conn.execute(
                text("SELECT id FROM gestante WHERE paciente_id = :pid LIMIT 1"),
                {"pid": paciente[0]},
            ).fetchone()
            if registro is None:
                sin_registro_gestante += 1
                continue

            if not args.dry_run:
                conn.execute(
                    text(
                        """
                        UPDATE gestante SET
                            influenza_fecha = COALESCE(influenza_fecha, :influenza_fecha),
                            dt_1_fecha      = COALESCE(dt_1_fecha, :dt_1_fecha),
                            dt_2_fecha      = COALESCE(dt_2_fecha, :dt_2_fecha),
                            dt_3_fecha      = COALESCE(dt_3_fecha, :dt_3_fecha),
                            hepb_1_fecha    = COALESCE(hepb_1_fecha, :hepb_1_fecha),
                            hepb_2_fecha    = COALESCE(hepb_2_fecha, :hepb_2_fecha),
                            hepb_3_fecha    = COALESCE(hepb_3_fecha, :hepb_3_fecha),
                            tdpa_fecha      = COALESCE(tdpa_fecha, :tdpa_fecha),
                            observaciones   = COALESCE(observaciones, :observaciones)
                        WHERE id = :id
                        """
                    ),
                    {**datos, "id": registro[0]},
                )
            actualizados += 1

    print(f"\nFilas con al menos un dato nuevo en el Excel: {con_dato_nuevo}")
    print(f"Sin paciente en BD (DNI no encontrado):        {sin_paciente}")
    print(f"Sin registro previo en gestante:                {sin_registro_gestante}")
    print(f"{'Se actualizarían' if args.dry_run else 'Actualizados'}: {actualizados}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
