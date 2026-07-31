"""Fase J — orquestador: migra los datos faltantes del Excel original que la
Fase G no pudo cargar (porque el Excel "limpio" no traía esas columnas).

Uso:
    python src/migrar_datos_faltantes.py --dry-run   # solo reporta
    python src/migrar_datos_faltantes.py              # migración real
"""

from __future__ import annotations

import argparse
import subprocess
import sys
import time
from pathlib import Path

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except (AttributeError, ValueError):
        pass

SCRIPTS_DIR = Path(__file__).resolve().parent

SCRIPTS = [
    ("Anemia — dx_inicial, controles 1/2/3, fechas médicas, observaciones", "migrar_anemia_controles.py"),
    ("Gestante — fechas de vacunas", "migrar_gestante_vacunas.py"),
    ("CRED Menor 5 — PC, CTRL, dx_nutricional, LME", "migrar_cred_campos.py"),
    ("CRED Mayor 5 — CTRL, DX, OBSERVACION", "migrar_cred_mayor5_campos.py"),
    ("PAI <12M — fechas por dosis (diagnóstico, sin cambios)", "migrar_pai_fechas.py"),
]


def _resumen_conteos() -> None:
    sys.path.insert(0, str(SCRIPTS_DIR.parent))
    from sqlalchemy import text

    from src.config import cargar_config
    from src.db import crear_engine

    consultas = {
        "anemia_seguimiento": "SELECT COUNT(*) FROM anemia_seguimiento WHERE dx_inicial IS NOT NULL AND (fecha1_enf IS NOT NULL OR observaciones IS NOT NULL OR fecha2_enf IS NOT NULL OR hb2_obs IS NOT NULL OR hb2_corr IS NOT NULL OR fecha3_enf IS NOT NULL OR hb3_obs IS NOT NULL)",
        "cred_menor5": "SELECT COUNT(*) FROM cred_menor5 WHERE perimetro_cefalico IS NOT NULL OR num_control IS NOT NULL OR dx_nutricional <> 'NORMAL'",
        "cred_mayor5": "SELECT COUNT(*) FROM cred_mayor5 WHERE num_control IS NOT NULL OR observaciones IS NOT NULL OR dx_nutricional <> 'NORMAL'",
        "gestante": "SELECT COUNT(*) FROM gestante WHERE influenza_fecha IS NOT NULL OR dt_1_fecha IS NOT NULL OR dt_2_fecha IS NOT NULL OR dt_3_fecha IS NOT NULL OR hepb_1_fecha IS NOT NULL OR hepb_2_fecha IS NOT NULL OR hepb_3_fecha IS NOT NULL OR tdpa_fecha IS NOT NULL",
    }

    print("\n" + "=" * 60)
    print("RESUMEN — registros con al menos un campo migrado, por tabla")
    print("=" * 60)
    config = cargar_config()
    engine = crear_engine(config)
    with engine.connect() as conn:
        for tabla, consulta in consultas.items():
            total = conn.execute(text(consulta)).scalar_one()
            print(f"  {tabla:<20} {total}")


def main() -> int:
    parser = argparse.ArgumentParser(description="Fase J: migra datos faltantes del Excel original")
    parser.add_argument("--dry-run", action="store_true", help="Solo reporta, no escribe en la BD")
    args = parser.parse_args()

    print("=" * 60)
    print("FASE J — DATOS FALTANTES DEL EXCEL ORIGINAL — SIGAPS")
    print("=" * 60)

    errores = 0
    for nombre, script in SCRIPTS:
        print(f"\n▶ {nombre}...")
        comando = [sys.executable, str(SCRIPTS_DIR / script)]
        if args.dry_run:
            comando.append("--dry-run")

        inicio = time.monotonic()
        resultado = subprocess.run(comando, capture_output=True, text=True, encoding="utf-8")
        duracion = time.monotonic() - inicio

        print(resultado.stdout)
        if resultado.returncode == 0:
            print(f"  Completado en {duracion:.1f}s")
        else:
            print(f"  ERROR (código {resultado.returncode}):\n{resultado.stderr}")
            errores += 1

    print("\n" + "=" * 60)
    print(f"RESUMEN: {len(SCRIPTS) - errores}/{len(SCRIPTS)} scripts sin errores")
    if errores:
        print(f"{errores} script(s) con errores -- revisar arriba")
    print("=" * 60)

    if not args.dry_run and errores == 0:
        _resumen_conteos()

    return 1 if errores else 0


if __name__ == "__main__":
    sys.exit(main())
