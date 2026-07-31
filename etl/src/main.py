"""Orquestador de la Fase F: ETL Excel BD_ENF_CAPIIIM_1.xlsx -> MySQL sigaps_db.

Uso (ver README.md para la guía completa paso a paso):

    python src/main.py --dry-run      # valida todo, no escribe en la BD
    python src/main.py                # migración real
    python src/main.py --only tamizaje,anemia   # solo esas hojas (debug)
"""

from __future__ import annotations

import argparse
import sys
import time
from dataclasses import replace
from pathlib import Path

# Permite ejecutar tanto `python src/main.py` como `python -m src.main` desde etl/.
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

# La consola de Windows por default no es UTF-8: sin esto, los acentos/eñes
# de los mensajes salen como mojibake (no afecta a los reportes, que siempre
# se escriben en UTF-8 independientemente de la consola).
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except (AttributeError, ValueError):
        pass

from sqlalchemy import bindparam, text

from src.config import FUENTE_ORIGEN, FUENTE_PADRON, PADRON_TOTAL_ESPERADO, cargar_config
from src.db import (
    contar_filas_migradas,
    contar_poblacion_acreditada,
    crear_engine,
    obtener_acreditados_por_dni,
    obtener_vacunas_catalogo,
    transaccion,
)
from src.dedup import PacienteRegistry
from src.extractors import (
    extract_anemia,
    extract_cred_mayor5,
    extract_cred_menor5,
    extract_gestante,
    extract_pai_12m_5a,
    extract_pai_7a_15a,
    extract_pai_menor12m,
    extract_pai_mayor5a,
    extract_tamizaje,
)
from src.loaders.clinical_loader import cargar_tabla_clinica
from src.loaders.paciente_loader import cargar_pacientes
from src.reports.migration_report import ReporteMigracion, ResumenHoja
from src.transformers import anemia_transformer, cred_transformer, gestante_transformer, pai_transformer, tamizaje_transformer
from src.transformers.paciente_transformer import construir_filas_paciente

HOJAS = [
    "tamizaje",
    "anemia",
    "cred_menor5",
    "cred_mayor5",
    "pai_menor12m",
    "pai_12m_5a",
    "pai_mayor5a",
    "pai_7a_15a",
    "gestante",
]

TABLA_POR_HOJA = {
    "tamizaje": "tamizaje_hb",
    "anemia": "anemia_seguimiento",
    "cred_menor5": "cred_menor5",
    "cred_mayor5": "cred_mayor5",
    "pai_menor12m": "pai_menor12m",
    "pai_12m_5a": "pai_12m_5a",
    "pai_mayor5a": "pai_mayor5a",
    "pai_7a_15a": "pai_7a_15a",
    "gestante": "gestante",
}

GRUPOS_EDAD_PAI = {
    "pai_menor12m": "MENOR_12M",
    "pai_12m_5a": "12M_5A",
    "pai_mayor5a": "MAYOR_5A",
    "pai_7a_15a": "7A_15A",
}

EXTRACTORES = {
    "tamizaje": extract_tamizaje.extraer,
    "anemia": extract_anemia.extraer,
    "cred_menor5": extract_cred_menor5.extraer,
    "cred_mayor5": extract_cred_mayor5.extraer,
    "pai_menor12m": extract_pai_menor12m.extraer,
    "pai_12m_5a": extract_pai_12m_5a.extraer,
    "pai_mayor5a": extract_pai_mayor5a.extraer,
    "pai_7a_15a": extract_pai_7a_15a.extraer,
    "gestante": extract_gestante.extraer,
}


def _total_migrado_previamente(conn) -> int:
    total = 0
    for tabla in ["paciente", *TABLA_POR_HOJA.values()]:
        for fuente in (FUENTE_ORIGEN, FUENTE_PADRON):
            total += contar_filas_migradas(conn, tabla, fuente)
    return total


def _confirmar_reemplazo_si_corresponde(engine) -> bool:
    """Idempotencia global: si ya hay data de una corrida anterior, pregunta si
    reemplazar todo. NO toca poblacion_acreditada (tabla de solo lectura que se
    gestiona aparte, vía cargar_padron.py) para no arriesgar el padrón vigente."""
    with engine.connect() as conn:
        total = _total_migrado_previamente(conn)
    if total == 0:
        return True

    respuesta = input(
        f"Ya hay {total} filas migradas previamente (fuente_origen en "
        f"'{FUENTE_ORIGEN}'/'{FUENTE_PADRON}'). ¿Reemplazar todo? [s/N]: "
    ).strip().lower()
    if respuesta != "s":
        print("Cancelado por el usuario: no se modificó la BD.")
        return False

    with engine.begin() as conn:
        for tabla in TABLA_POR_HOJA.values():
            conn.execute(
                text(f"DELETE FROM {tabla} WHERE fuente_origen IN :fuentes").bindparams(
                    bindparam("fuentes", expanding=True)
                ),
                {"fuentes": [FUENTE_ORIGEN, FUENTE_PADRON]},
            )
        conn.execute(
            text("DELETE FROM paciente WHERE fuente_origen IN :fuentes").bindparams(
                bindparam("fuentes", expanding=True)
            ),
            {"fuentes": [FUENTE_ORIGEN, FUENTE_PADRON]},
        )
    print("Datos previos eliminados. Continuando con la migración desde cero.")
    return True


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="ETL Excel BD_ENF_CAPIIIM_1.xlsx -> MySQL sigaps_db (Fase F)")
    parser.add_argument("--dry-run", action="store_true", help="Extrae y transforma pero NO escribe en la BD")
    parser.add_argument("--file", type=str, default=None, help="Ruta al Excel (default: EXCEL_PATH del .env)")
    parser.add_argument(
        "--only", type=str, default=None, help="Lista separada por comas de hojas a procesar, ej: tamizaje,anemia"
    )
    parser.add_argument("--batch-size", type=int, default=None, help="Filas por lote de INSERT (default: .env BATCH_SIZE)")
    parser.add_argument("--output-dir", type=str, default=None, help="Carpeta de reportes (default: etl/output)")
    return parser.parse_args()


def _transformar_hoja(hoja: str, extraccion, registry: PacienteRegistry, vacunas_catalogo: list[dict]):
    if hoja == "tamizaje":
        return tamizaje_transformer.transformar(extraccion, registry)
    if hoja == "anemia":
        return anemia_transformer.transformar(extraccion, registry)
    if hoja == "cred_menor5":
        return cred_transformer.transformar_menor5(extraccion, registry)
    if hoja == "cred_mayor5":
        return cred_transformer.transformar_mayor5(extraccion, registry)
    if hoja in GRUPOS_EDAD_PAI:
        default_tipo = "BARRIDO" if hoja == "pai_7a_15a" else "REGULAR"
        return pai_transformer.transformar_pai(
            extraccion, registry, hoja, GRUPOS_EDAD_PAI[hoja], vacunas_catalogo, default_tipo
        )
    if hoja == "gestante":
        return gestante_transformer.transformar(extraccion, registry)
    raise AssertionError(f"Hoja no manejada: {hoja}")


def main() -> int:
    args = parse_args()
    config = cargar_config()
    if args.file:
        config = replace(config, excel_path=Path(args.file).resolve())
    if args.batch_size:
        config = replace(config, batch_size=args.batch_size)

    if not config.excel_path.exists():
        print(f"ERROR: no se encontró el archivo Excel en: {config.excel_path}")
        print("Coloca BD_ENF_CAPIIIM_1.xlsx ahí, pasa --file <ruta>, o define EXCEL_PATH en etl/.env")
        return 1

    hojas_a_procesar = HOJAS
    if args.only:
        pedidas = {h.strip() for h in args.only.split(",") if h.strip()}
        desconocidas = pedidas - set(HOJAS)
        if desconocidas:
            print(f"ERROR: hojas desconocidas en --only: {sorted(desconocidas)}. Válidas: {HOJAS}")
            return 1
        hojas_a_procesar = [h for h in HOJAS if h in pedidas]

    output_dir = Path(args.output_dir).resolve() if args.output_dir else (Path(__file__).resolve().parent.parent / "reports")

    print(f"Excel:      {config.excel_path}")
    print(f"BD:         {config.db_url_oculta}")
    print(f"Batch size: {config.batch_size}")
    print(f"Modo:       {'DRY-RUN (sin escribir en BD)' if args.dry_run else 'MIGRACIÓN REAL'}")
    print(f"Hojas:      {', '.join(hojas_a_procesar)}")

    engine = crear_engine(config)
    reporte = ReporteMigracion(dry_run=args.dry_run)
    registry = PacienteRegistry()

    try:
        with engine.connect() as conn_lectura:
            vacunas_catalogo = obtener_vacunas_catalogo(conn_lectura)
            total_acreditados = contar_poblacion_acreditada(conn_lectura)
    except Exception as exc:  # noqa: BLE001 - queremos un mensaje claro, no un traceback crudo
        print(f"ERROR: no se pudo conectar a la BD ({config.db_url_oculta}): {exc}")
        return 1

    if total_acreditados != PADRON_TOTAL_ESPERADO:
        print(
            f"ERROR: poblacion_acreditada tiene {total_acreditados} registros, se esperaban "
            f"{PADRON_TOTAL_ESPERADO}. Ejecuta primero 'python src/cargar_padron.py' para cargar "
            "el padrón EsSalud antes de migrar el Excel de enfermería."
        )
        return 1
    print(f"Padrón:     {total_acreditados} acreditados en poblacion_acreditada (OK)")

    if not args.dry_run and not _confirmar_reemplazo_si_corresponde(engine):
        return 1

    # --- Fase 1: extraer + transformar TODAS las hojas primero. Necesitamos ver
    # todos los candidatos de paciente antes de resolver el registry, porque un
    # mismo DNI puede completarse con datos de una hoja distinta (cross-referencia). ---
    resultados_por_hoja: dict[str, object] = {}
    metadata_hoja: dict[str, dict] = {}

    for hoja in hojas_a_procesar:
        inicio_hoja = time.monotonic()
        print(f"\n>> Extrayendo hoja lógica '{hoja}'...")
        extraccion = EXTRACTORES[hoja](config.excel_path)

        if extraccion is None:
            print(f"   AVISO: no se encontró esta hoja en el Excel (revisar alias en src/aliases.py:NOMBRES_HOJA)")
        else:
            print(f"   Hoja real: '{extraccion.hoja_excel}'  ({len(extraccion.df)} filas de datos)")
            for advertencia in extraccion.advertencias:
                print(f"   ADVERTENCIA: {advertencia}")

        resultado = _transformar_hoja(hoja, extraccion, registry, vacunas_catalogo)
        resultados_por_hoja[hoja] = resultado
        metadata_hoja[hoja] = {
            "hoja_excel": extraccion.hoja_excel if extraccion else None,
            "advertencias": extraccion.advertencias if extraccion else (["Hoja no encontrada en el Excel"]),
            "tiempo_extraccion_transformacion": time.monotonic() - inicio_hoja,
        }
        print(f"   -> {len(resultado.filas_validas)} filas válidas, {len(resultado.descartadas)} descartadas")

    # --- Fase 2: cruzar contra el padrón EsSalud, luego resolver pacientes
    # (dedup + cross-referencia entre hojas + reglas sexo/fecha para los que no cruzan) ---
    dnis_excel = registry.dnis()
    print(f"\n>> Cruzando {len(dnis_excel)} DNIs únicos del Excel contra poblacion_acreditada...")
    with engine.connect() as conn_lectura:
        acreditados = obtener_acreditados_por_dni(conn_lectura, dnis_excel)
    print(f"   {len(acreditados)}/{len(dnis_excel)} DNIs cruzan con el padrón EsSalud")

    print(">> Resolviendo pacientes (dedup por DNI, cross-referencia entre hojas)...")
    pacientes_listos, notas_paciente = registry.resolver(acreditados)
    reporte.agregar_notas_manuales(notas_paciente)
    filas_paciente = construir_filas_paciente(pacientes_listos)
    cruzados = sum(1 for p in pacientes_listos.values() if p.cruza_padron)
    no_cruzados = len(pacientes_listos) - cruzados
    reporte.registrar_padron(total_acreditados, cruzados, no_cruzados)
    print(
        f"   {len(filas_paciente)} pacientes únicos listos para migrar "
        f"(cruzan padrón: {cruzados}, sin cruce/Excel: {no_cruzados})"
    )

    # --- Fase 3: cargar pacientes (una sola transacción para toda la tabla paciente) ---
    mapa_dni_a_id: dict[str, int] = {}
    try:
        with transaccion(engine) as conn:
            insertados, mapa_dni_a_id = cargar_pacientes(conn, filas_paciente, config.batch_size, args.dry_run)
        reporte.registrar_pacientes(insertados, len(filas_paciente))
        print(f"   Pacientes insertados: {insertados} / {len(filas_paciente)} (resto ya existían en BD)")
    except Exception as exc:  # noqa: BLE001
        print(f"ERROR cargando pacientes, se aborta la migración: {exc}")
        return 1

    # --- Fase 4: cargar cada tabla clínica, una transacción por hoja ---
    for hoja in hojas_a_procesar:
        resultado = resultados_por_hoja[hoja]
        meta = metadata_hoja[hoja]
        tabla = TABLA_POR_HOJA[hoja]
        print(f"\n>> Cargando tabla '{tabla}' (hoja '{hoja}')...")

        inicio_carga = time.monotonic()
        advertencias = list(meta["advertencias"])
        try:
            with transaccion(engine) as conn:
                carga = cargar_tabla_clinica(
                    conn, tabla, resultado.filas_validas, mapa_dni_a_id, config.batch_size, args.dry_run
                )
            if carga.omitido_por_idempotencia:
                print(f"   OMITIDO: ya existen {carga.filas_ya_existentes} filas de fuente {FUENTE_ORIGEN} en {tabla}")
            else:
                print(f"   Migrados: {carga.migrados}  (sin paciente resuelto: {carga.sin_paciente_resuelto})")
                if carga.sin_paciente_resuelto:
                    advertencias.append(
                        f"{carga.sin_paciente_resuelto} filas no se migraron: su paciente quedó bloqueado "
                        "(ver revision_manual.csv, columna bloquea_migracion=True)"
                    )
        except Exception as exc:  # noqa: BLE001
            print(f"   ERROR cargando {tabla}: {exc}")
            advertencias.append(f"ERROR durante la carga: {exc}")
            carga = None

        tiempo_total = meta["tiempo_extraccion_transformacion"] + (time.monotonic() - inicio_carga)
        resumen = ResumenHoja(
            hoja=hoja,
            tabla=tabla,
            hoja_excel=meta["hoja_excel"],
            extraidos=resultado.extraidos,
            migrados=carga.migrados if carga else 0,
            descartados=len(resultado.descartadas),
            omitido_por_idempotencia=carga.omitido_por_idempotencia if carga else False,
            filas_ya_existentes=carga.filas_ya_existentes if carga else 0,
            sin_paciente_resuelto=carga.sin_paciente_resuelto if carga else 0,
            advertencias=advertencias,
            tiempo_segundos=round(tiempo_total, 2),
        )
        reporte.agregar_hoja(resumen, resultado.descartadas)

    reporte.escribir(output_dir)
    return 0


if __name__ == "__main__":
    sys.exit(main())
