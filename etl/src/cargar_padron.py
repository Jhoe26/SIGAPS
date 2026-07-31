"""Carga del padrón oficial EsSalud (poblacion_acreditada) -> MySQL sigaps_db.

La tabla es de solo lectura desde la aplicación y se refresca por reemplazo
total: cada ejecución hace TRUNCATE + INSERT completo del CSV.

Uso:
    cd etl
    venv\\Scripts\\activate
    python src/cargar_padron.py               # carga (o salta si ya está completo)
    python src/cargar_padron.py --force        # recarga aunque ya esté completo
"""

from __future__ import annotations

import argparse
import sys
import time
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

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

BATCH_SIZE = 1000
LOG_CADA = 5000

COLUMNAS_CSV_A_BD = {
    "DNI": "dni",
    "AP_PATERNO": "ap_paterno",
    "AP_MATERNO": "ap_materno",
    "NOMBRES": "nombres",
    "FECHA_NAC": "fecha_nacimiento",
    "SEXO": "sexo",
    "DIRECCION": "direccion",
    "DISTRITO": "distrito",
    "PARENTESCO": "parentesco",
    "DNI_TITULAR": "dni_titular",
    "CODIGO_CAS": "codigo_cas",
    "NOMBRE_CAS": "nombre_cas",
}

COLUMNAS_BD = list(COLUMNAS_CSV_A_BD.values())

INSERT_SQL = text(
    f"""
    INSERT INTO poblacion_acreditada ({', '.join(COLUMNAS_BD)})
    VALUES ({', '.join(':' + c for c in COLUMNAS_BD)})
    """
)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Carga el padrón EsSalud en poblacion_acreditada")
    parser.add_argument("--csv", type=str, default=None, help="Ruta al CSV (default: ../db/BD_ACREDITADOS_LIMPIO.csv)")
    parser.add_argument("--force", action="store_true", help="Recarga aunque la tabla ya tenga todas las filas")
    return parser.parse_args()


def leer_padron(csv_path: Path) -> pd.DataFrame:
    df = pd.read_csv(csv_path, dtype=str, encoding="utf-8", keep_default_na=False, na_values=[""])
    df = df.rename(columns=COLUMNAS_CSV_A_BD)
    faltantes = set(COLUMNAS_BD) - set(df.columns)
    if faltantes:
        raise ValueError(f"Columnas faltantes en el CSV: {sorted(faltantes)}")
    df = df[COLUMNAS_BD]

    df["dni"] = df["dni"].str.strip().str.zfill(8)
    df["dni_titular"] = df["dni_titular"].where(df["dni_titular"].isna(), df["dni_titular"].str.strip().str.zfill(8))
    df["fecha_nacimiento"] = pd.to_datetime(df["fecha_nacimiento"], format="%Y-%m-%d", errors="coerce").dt.date
    df["sexo"] = df["sexo"].str.strip().str.upper().str[:1]

    df = df.where(pd.notna(df), None)
    return df


def main() -> int:
    args = parse_args()
    config = cargar_config()

    csv_path = Path(args.csv).resolve() if args.csv else (Path(__file__).resolve().parent.parent.parent / "db" / "BD_ACREDITADOS_LIMPIO.csv")
    if not csv_path.exists():
        print(f"ERROR: no se encontró el CSV en: {csv_path}")
        return 1

    print(f"CSV: {csv_path}")
    print(f"BD:  {config.db_url_oculta}")

    engine = crear_engine(config)

    try:
        with engine.connect() as conn:
            total_actual = conn.execute(text("SELECT COUNT(*) FROM poblacion_acreditada")).scalar_one()
    except Exception as exc:  # noqa: BLE001
        print(f"ERROR: no se pudo conectar a la BD ({config.db_url_oculta}): {exc}")
        return 1

    inicio = time.monotonic()

    print("Leyendo CSV...")
    df = leer_padron(csv_path)
    total_csv = len(df)
    print(f"  {total_csv} filas leídas del CSV")

    if not args.force and total_actual == total_csv:
        print(f"OMITIDO: poblacion_acreditada ya tiene {total_actual} registros (igual al CSV). Usa --force para recargar.")
        return 0

    filas = df.to_dict(orient="records")

    with engine.begin() as conn:
        print("TRUNCATE poblacion_acreditada...")
        conn.execute(text("TRUNCATE TABLE poblacion_acreditada"))

        for inicio_lote in range(0, len(filas), BATCH_SIZE):
            lote = filas[inicio_lote:inicio_lote + BATCH_SIZE]
            conn.execute(INSERT_SQL, lote)
            cargados = inicio_lote + len(lote)
            if cargados % LOG_CADA == 0 or cargados == total_csv:
                print(f"  {cargados}/{total_csv} filas cargadas...")

    duracion = time.monotonic() - inicio

    with engine.connect() as conn:
        total_final = conn.execute(text("SELECT COUNT(*) FROM poblacion_acreditada")).scalar_one()

    print("\n--- Reporte final ---")
    print(f"Filas cargadas:   {total_final}")
    print(f"Tiempo total:     {duracion:.2f}s")

    if total_final != total_csv:
        print(f"ADVERTENCIA: se esperaban {total_csv} filas y quedaron {total_final} en la tabla")
        return 1

    return 0


if __name__ == "__main__":
    sys.exit(main())
