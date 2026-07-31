"""Configuración central del ETL: variables de entorno y constantes de negocio.

Todas las reglas "mágicas" de la Fase F (usuario de migración, fuente de
origen, rango válido de fechas, tamaño de lote) viven aquí para que el resto
del código no tenga números ni strings sueltos.
"""

from __future__ import annotations

import os
from dataclasses import dataclass
from pathlib import Path

from dotenv import load_dotenv

ETL_DIR = Path(__file__).resolve().parent.parent
load_dotenv(ETL_DIR / ".env")

# --- Identidad de la migración (fijo, ver db/schema.sql) ---
USUARIO_MIGRACION_ID = 1
FUENTE_ORIGEN = "EXCEL_ENFERMERIA_2024_2025"
FUENTE_PADRON = "PADRON_ESSALUD_2026"
ES_HISTORICO = True
PADRON_TOTAL_ESPERADO = 50175

# --- Validación de fechas ---
ANIO_MIN = 1900
ANIO_MAX = 2030

# --- Corrección de hemoglobina por altitud (Ayacucho); ver parametro_sistema.HB_CORRECCION_AYACUCHO ---
HB_CORRECCION_AYACUCHO = 1.8

# --- Umbral de "hoja corrupta" para PAI >5A ---
PAI_MAYOR5A_FILAS_BASURA_UMBRAL = 100_000


def _int_env(nombre: str, default: int) -> int:
    valor = os.getenv(nombre)
    if not valor:
        return default
    try:
        return int(valor)
    except ValueError:
        return default


@dataclass(frozen=True)
class Config:
    db_url: str
    excel_path: Path
    batch_size: int

    @property
    def db_url_oculta(self) -> str:
        """Versión de db_url sin password, solo para logging seguro."""
        if "@" not in self.db_url:
            return self.db_url
        esquema, resto = self.db_url.split("://", 1)
        credenciales, host = resto.split("@", 1)
        usuario = credenciales.split(":", 1)[0]
        return f"{esquema}://{usuario}:***@{host}"


def cargar_config() -> Config:
    db_url = os.getenv("DB_URL")
    if not db_url:
        host = os.getenv("DB_HOST", "localhost")
        port = os.getenv("DB_PORT", "3306")
        name = os.getenv("DB_NAME", "sigaps_db")
        user = os.getenv("DB_USER", "sigaps_user")
        password = os.getenv("DB_PASS", "")
        db_url = f"mysql+pymysql://{user}:{password}@{host}:{port}/{name}?charset=utf8mb4"

    excel_path_raw = os.getenv("EXCEL_PATH", "../db/BD_ENF_CAPIIIM_LIMPIO.xlsx")
    excel_path = Path(excel_path_raw)
    if not excel_path.is_absolute():
        excel_path = (ETL_DIR / excel_path).resolve()

    batch_size = _int_env("BATCH_SIZE", 500)

    return Config(db_url=db_url, excel_path=excel_path, batch_size=batch_size)
