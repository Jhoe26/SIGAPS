"""Piezas compartidas por todos los transformers: descarte de filas inválidas,
construcción del candidato de paciente y los campos fijos de migración."""

from __future__ import annotations

import datetime as dt
from dataclasses import dataclass, field
from typing import Optional

import pandas as pd

from src.config import ES_HISTORICO, FUENTE_ORIGEN, USUARIO_MIGRACION_ID
from src.dedup import CandidatoPaciente, PacienteRegistry
from src.extractors.base import ExtraccionHoja, valor
from src.normalizers import (
    calcular_edad,
    normalizar_dni,
    normalizar_fecha,
    normalizar_sexo,
    normalizar_telefono,
    normalizar_texto,
    separar_nombre_completo,
)


@dataclass
class FilaDescartada:
    hoja: str
    fila_excel: int
    dni: Optional[str]
    motivo: str


@dataclass
class ResultadoTransformacion:
    hoja: str
    filas_validas: list[dict] = field(default_factory=list)
    descartadas: list[FilaDescartada] = field(default_factory=list)

    @property
    def extraidos(self) -> int:
        return len(self.filas_validas) + len(self.descartadas)


def campos_fijos_migracion() -> dict:
    return {
        "registrado_por_id": USUARIO_MIGRACION_ID,
        "profesional_id": None,
        "es_historico": ES_HISTORICO,
        "fuente_origen": FUENTE_ORIGEN,
    }


def resolver_dni_o_descartar(hoja: str, fila_excel: int, valor_dni: object) -> tuple[Optional[str], Optional[FilaDescartada]]:
    resultado = normalizar_dni(valor_dni)
    if resultado.estado in ("VACIO", "REVISAR"):
        return None, FilaDescartada(hoja, fila_excel, resultado.dni, resultado.motivo or "DNI inválido")
    return resultado.dni, None


def resolver_fecha_o_descartar(
    hoja: str, fila_excel: int, dni: Optional[str], valor_fecha: object, nombre_campo: str
) -> tuple[Optional[dt.date], Optional[FilaDescartada]]:
    resultado = normalizar_fecha(valor_fecha)
    if resultado.fecha is None:
        return None, FilaDescartada(hoja, fila_excel, dni, f"{nombre_campo}: {resultado.motivo}")
    return resultado.fecha, None


def construir_candidato_paciente(
    fila: pd.Series,
    columnas: dict[str, Optional[str]],
    hoja: str,
    fila_excel: int,
    dni: str,
    fecha_referencia: Optional[dt.date] = None,
) -> CandidatoPaciente:
    """Arma lo que esta fila sabe del paciente. Soporta tanto hojas con
    'nombre completo' en una sola celda como hojas con columnas separadas
    ap_paterno/ap_materno/nombres.

    Los alias de 'nombres' (p.ej. "nombres") a veces matchean por sub-string
    la MISMA columna que 'nombre_completo' (p.ej. "Nombres y Apellidos"), ya
    que encontrar_columna no exige match exacto. Si el campo separado
    resuelve a la misma columna física que nombre_completo, se lo descarta
    como señal de "columnas separadas" y se usa la heurística de split.
    """
    columna_completo = columnas.get("nombre_completo")

    def _columna_separada_valida(campo: str) -> bool:
        columna = columnas.get(campo)
        return columna is not None and columna != columna_completo

    nombre_completo = valor(fila, columnas, "nombre_completo")
    ap_paterno_col = valor(fila, columnas, "ap_paterno") if _columna_separada_valida("ap_paterno") else None
    ap_materno_col = valor(fila, columnas, "ap_materno") if _columna_separada_valida("ap_materno") else None
    nombres_col = valor(fila, columnas, "nombres") if _columna_separada_valida("nombres") else None

    if ap_paterno_col or ap_materno_col or nombres_col:
        ap_paterno = normalizar_texto(ap_paterno_col) or ""
        ap_materno = normalizar_texto(ap_materno_col) or ""
        nombres = normalizar_texto(nombres_col) or ""
    else:
        separado = separar_nombre_completo(nombre_completo)
        ap_paterno = separado.ap_paterno if separado else ""
        ap_materno = separado.ap_materno if separado else ""
        nombres = separado.nombres if separado else ""

    fecha_nac_resultado = normalizar_fecha(valor(fila, columnas, "fecha_nacimiento"))
    fecha_nacimiento = fecha_nac_resultado.fecha
    fecha_estimada = False

    edad_col = valor(fila, columnas, "edad_anios")
    if fecha_nacimiento is None and edad_col is not None and fecha_referencia is not None:
        try:
            anios = int(float(edad_col))
            fecha_nacimiento = dt.date(fecha_referencia.year - anios, fecha_referencia.month, fecha_referencia.day)
            fecha_estimada = True
        except (ValueError, TypeError):
            pass

    return CandidatoPaciente(
        dni=dni,
        ap_paterno=ap_paterno,
        ap_materno=ap_materno,
        nombres=nombres,
        hoja_origen=hoja,
        fila_excel=fila_excel,
        fecha_nacimiento=fecha_nacimiento,
        fecha_nacimiento_estimada=fecha_estimada,
        sexo=normalizar_sexo(valor(fila, columnas, "sexo")),
        telefono=normalizar_telefono(valor(fila, columnas, "telefono")),
        direccion=normalizar_texto(valor(fila, columnas, "direccion")),
        distrito=normalizar_texto(valor(fila, columnas, "distrito")),
    )


def registrar_paciente(
    registry: PacienteRegistry,
    fila: pd.Series,
    columnas: dict[str, Optional[str]],
    hoja: str,
    fila_excel: int,
    dni: str,
    fecha_referencia: Optional[dt.date] = None,
) -> None:
    registry.registrar(construir_candidato_paciente(fila, columnas, hoja, fila_excel, dni, fecha_referencia))


def hoja_vacia(extraccion: Optional[ExtraccionHoja], hoja_logica: str) -> ResultadoTransformacion:
    return ResultadoTransformacion(hoja=hoja_logica)
