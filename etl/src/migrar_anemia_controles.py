"""Fase J1 — completa los controles de seguimiento 2 y 3 de anemia (fecha +
Hb observada + Hb corregida), la fecha de los controles médicos 1 y 2, el
profesional del 1er control, el diagnóstico inicial textual, la fecha del
1er control de enfermería y las observaciones, leyendo el Excel ORIGINAL
(`BD ENF CAPIIIM 1.xlsx`, encabezados multi-fila) que sí trae esos datos --
el limpio de la Fase G no los tenía.

Mapeo de columnas (verificado contra datos reales con pandas header=4 sobre
la hoja 'ANEMIA'; iloc de este archivo = columna real + 1 porque
`leer_hoja_aplanada` antepone la columna auxiliar `_excel_row`):
    3  DNI
    10 HGB O inicial (ya migrado)
    11 HGB C inicial (ya migrado)
    12 diagnóstico textual ("ANEMIA LEVE"/MODERADA/SEVERA) -> dx_inicial
    15 OBSERVACIONES                     -> anemia_seguimiento.observaciones
    16 1er control médico/enfermería FECHA -> fecha1_med y fecha1_enf
       (misma fecha física en el Excel; el esquema tiene columnas separadas
       para enfermería y médico, así que se copia al par de campos)
    17 1er control médico NOMBRES/rol    -> obs1_med (ej. "LIC ENFERMERIA")
    18 2do control enfermería FECHA.1    -> fecha2_enf
    19 2do control enfermería HGB O.1    -> hb2_obs (además de los límites de
       limpiar_hb, se descarta explícitamente si > 20 por pedido de negocio)
    20 2do control enfermería HGB C.1    -> hb2_corr
    21 2do control médico FECHA.2        -> fecha2_med
    23 3er control enfermería FECHA.3    -> fecha3_enf
    24 3er control enfermería HGB O.2    -> hb3_obs
    25 3er control enfermería HGB C.2    -> hb3_corr

No se toca `estado`: la Fase G ya lo calculó y no hay dato nuevo en el Excel
para recalcularlo. `dx_inicial` SÍ se reescribe (no es NULL-only) porque la
columna 12 es la fuente de verdad del diagnóstico inicial y así se garantiza
que quede sincronizada con el texto real del Excel.
No se asignan reg1_enf_id/reg1_med_id/reg2_enf_id/reg2_med_id/reg3_enf_id:
son FK a `usuario` y el Excel solo trae nombres de pila o roles genéricos
("LIC ENFERMERIA") que no calzan con ninguna cuenta real -- misma regla que
la Fase G. El texto de esa columna sí se guarda en `obs1_med` (campo TEXT
libre, sin FK) porque ahí no se pierde información y no hay riesgo de
asignar un caso a un profesional equivocado.
El resto de columnas se actualiza con COALESCE: nunca se pisa un valor que
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
from src.fase_j_common import ORIGINAL_EXCEL_PATH, limpiar_dni, limpiar_fecha, limpiar_hb, limpiar_texto

HOJA = "ANEMIA"
HEADER_ROWS = 5

_DX_INICIAL = ("SEVERA", "MODERADA", "LEVE")


def resolver_dx_inicial(valor: object) -> str | None:
    texto = limpiar_texto(valor)
    if texto is None:
        return None
    texto = texto.upper()
    for dx in _DX_INICIAL:
        if dx in texto:
            return dx
    return None


def resolver_hb2_obs(valor: object) -> float | None:
    hb = limpiar_hb(valor)
    if hb is None or hb > 20:
        return None
    return hb


def construir_actualizacion(fila) -> dict | None:
    dni = limpiar_dni(fila.iloc[3])
    if dni is None:
        return None

    fecha1 = limpiar_fecha(fila.iloc[16])

    return {
        "dni": dni,
        "dx_inicial": resolver_dx_inicial(fila.iloc[12]),
        "observaciones": limpiar_texto(fila.iloc[15]),
        "fecha1_med": fecha1,
        "fecha1_enf": fecha1,
        "obs1_med": limpiar_texto(fila.iloc[17]),
        "fecha2_enf": limpiar_fecha(fila.iloc[18]),
        "hb2_obs": resolver_hb2_obs(fila.iloc[19]),
        "hb2_corr": limpiar_hb(fila.iloc[20]),
        "fecha2_med": limpiar_fecha(fila.iloc[21]),
        "fecha3_enf": limpiar_fecha(fila.iloc[23]),
        "hb3_obs": limpiar_hb(fila.iloc[24]),
        "hb3_corr": limpiar_hb(fila.iloc[25]),
    }


def main() -> int:
    parser = argparse.ArgumentParser(description="Fase J1: completa controles 2/3 de anemia_seguimiento")
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
    sin_registro_anemia = 0
    con_dato_nuevo = 0
    pendientes: list[dict] = []

    def _volcar_lote(lote: list[dict]) -> None:
        nonlocal actualizados, sin_paciente, sin_registro_anemia
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
                    text("SELECT id FROM anemia_seguimiento WHERE paciente_id = :pid LIMIT 1"),
                    {"pid": paciente[0]},
                ).fetchone()
                if registro is None:
                    sin_registro_anemia += 1
                    continue

                if not args.dry_run:
                    conn.execute(
                        text(
                            """
                            UPDATE anemia_seguimiento SET
                                dx_inicial    = COALESCE(:dx_inicial, dx_inicial),
                                observaciones = COALESCE(observaciones, :observaciones),
                                fecha1_med    = COALESCE(fecha1_med, :fecha1_med),
                                fecha1_enf    = COALESCE(fecha1_enf, :fecha1_enf),
                                obs1_med      = COALESCE(obs1_med, :obs1_med),
                                fecha2_enf    = COALESCE(fecha2_enf, :fecha2_enf),
                                hb2_obs       = COALESCE(hb2_obs, :hb2_obs),
                                hb2_corr      = COALESCE(hb2_corr, :hb2_corr),
                                fecha2_med    = COALESCE(fecha2_med, :fecha2_med),
                                fecha3_enf    = COALESCE(fecha3_enf, :fecha3_enf),
                                hb3_obs       = COALESCE(hb3_obs, :hb3_obs),
                                hb3_corr      = COALESCE(hb3_corr, :hb3_corr)
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
        pendientes.append(datos)

        if len(pendientes) >= 200:
            _volcar_lote(pendientes)
            pendientes = []

    _volcar_lote(pendientes)

    print(f"\nFilas con al menos un dato nuevo en el Excel: {con_dato_nuevo}")
    print(f"Sin paciente en BD (DNI no encontrado):        {sin_paciente}")
    print(f"Sin registro previo en anemia_seguimiento:      {sin_registro_anemia}")
    print(f"{'Se actualizarían' if args.dry_run else 'Actualizados'}: {actualizados}")

    if not args.dry_run:
        with engine.connect() as conn:
            verif = conn.execute(text("SELECT COUNT(*) FROM anemia_seguimiento WHERE obs1_med IS NOT NULL")).scalar_one()
        print(f"Verificación: anemia_seguimiento.obs1_med no-NULL = {verif}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
