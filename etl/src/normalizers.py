"""Normalización y validación de valores crudos del Excel.

Cada función devuelve un resultado explícito (no lanza excepciones para
datos sucios): las llamadoras deciden si eso implica descartar la fila,
marcarla para revisión manual, o simplemente dejar el campo en None.
"""

from __future__ import annotations

import datetime as dt
import re
import unicodedata
from dataclasses import dataclass
from typing import Optional

from src.config import ANIO_MAX, ANIO_MIN, HB_CORRECCION_AYACUCHO

_EXCEL_EPOCH = dt.date(1899, 12, 30)  # openpyxl ya convierte casi todo, esto es solo fallback


@dataclass
class ResultadoDni:
    dni: Optional[str]
    estado: str  # "OK" | "PADDED" | "REVISAR" | "VACIO"
    motivo: Optional[str] = None


def normalizar_dni(valor: object) -> ResultadoDni:
    if valor is None:
        return ResultadoDni(None, "VACIO", "DNI vacío")
    texto = str(valor).strip()
    if texto.endswith(".0"):  # pandas/openpyxl a veces trae DNIs como float
        texto = texto[:-2]
    solo_digitos = re.sub(r"\D", "", texto)
    if not solo_digitos:
        return ResultadoDni(None, "VACIO", f"DNI no numérico: '{valor}'")
    if len(solo_digitos) > 8:
        return ResultadoDni(solo_digitos, "REVISAR", f"DNI con más de 8 dígitos: '{valor}'")
    if len(solo_digitos) < 8:
        return ResultadoDni(solo_digitos.zfill(8), "PADDED")
    return ResultadoDni(solo_digitos, "OK")


def normalizar_texto(valor: object) -> Optional[str]:
    if valor is None:
        return None
    texto = re.sub(r"\s+", " ", str(valor).strip())
    return texto or None


def _quitar_tildes(texto: str) -> str:
    nfkd = unicodedata.normalize("NFKD", texto)
    return "".join(c for c in nfkd if not unicodedata.combining(c))


def normalizar_sexo(valor: object) -> Optional[str]:
    texto = normalizar_texto(valor)
    if not texto:
        return None
    letra = _quitar_tildes(texto).strip().upper()[:1]
    if letra in ("M", "F"):
        return letra
    if letra == "H":  # "Hombre"
        return "M"
    return None


@dataclass
class NombreSeparado:
    ap_paterno: str
    ap_materno: str
    nombres: str


def separar_nombre_completo(valor: object) -> Optional[NombreSeparado]:
    """Heurística pedida: las primeras 2 palabras del nombre completo son los
    apellidos (paterno, materno); el resto son nombres. No hay forma de
    distinguir apellidos compuestos sin un campo separado en el Excel, por
    eso es una heurística y no una regla exacta (documentado en README)."""
    texto = normalizar_texto(valor)
    if not texto:
        return None
    palabras = texto.split(" ")
    if len(palabras) == 1:
        return NombreSeparado(ap_paterno=palabras[0], ap_materno="", nombres="")
    if len(palabras) == 2:
        return NombreSeparado(ap_paterno=palabras[0], ap_materno=palabras[1], nombres="")
    return NombreSeparado(ap_paterno=palabras[0], ap_materno=palabras[1], nombres=" ".join(palabras[2:]))


def _desde_serial_excel(numero: float) -> dt.date:
    return _EXCEL_EPOCH + dt.timedelta(days=numero)


_FORMATOS_FECHA = ("%d/%m/%Y", "%Y-%m-%d", "%d-%m-%Y", "%d/%m/%y", "%m/%d/%Y")


@dataclass
class ResultadoFecha:
    fecha: Optional[dt.date]
    motivo: Optional[str] = None


def normalizar_fecha(valor: object) -> ResultadoFecha:
    if valor is None or (isinstance(valor, str) and not valor.strip()):
        return ResultadoFecha(None, "Fecha vacía")

    fecha: Optional[dt.date] = None
    if isinstance(valor, dt.datetime):
        fecha = valor.date()
    elif isinstance(valor, dt.date):
        fecha = valor
    elif isinstance(valor, (int, float)):
        try:
            fecha = _desde_serial_excel(float(valor))
        except (OverflowError, ValueError):
            return ResultadoFecha(None, f"Fecha numérica inválida: '{valor}'")
    else:
        texto = str(valor).strip()
        for formato in _FORMATOS_FECHA:
            try:
                fecha = dt.datetime.strptime(texto, formato).date()
                break
            except ValueError:
                continue
        if fecha is None:
            return ResultadoFecha(None, f"Fecha con formato no reconocido: '{valor}'")

    if not (ANIO_MIN <= fecha.year <= ANIO_MAX):
        return ResultadoFecha(None, f"Fecha fuera de rango [{ANIO_MIN}-{ANIO_MAX}]: {fecha.isoformat()}")
    return ResultadoFecha(fecha)


def normalizar_decimal(valor: object) -> Optional[float]:
    if valor is None or (isinstance(valor, str) and not valor.strip()):
        return None
    try:
        texto = str(valor).strip().replace(",", ".")
        return round(float(texto), 2)
    except ValueError:
        return None


def normalizar_entero(valor: object) -> Optional[int]:
    decimal = normalizar_decimal(valor)
    return int(decimal) if decimal is not None else None


def normalizar_talla_metros(valor: object) -> Optional[float]:
    """cred_mayor5.talla se guarda en METROS (comentario del schema). Si el
    Excel trae la talla en cm (típico, >3), se convierte; si ya viene en
    metros (<=3), se deja igual."""
    decimal = normalizar_decimal(valor)
    if decimal is None:
        return None
    return round(decimal / 100, 2) if decimal > 3 else decimal


def calcular_hb_corregido(hb_observado: Optional[float]) -> Optional[float]:
    if hb_observado is None:
        return None
    return round(hb_observado - HB_CORRECCION_AYACUCHO, 2)


def calcular_imc(peso_kg: Optional[float], talla_m: Optional[float]) -> Optional[float]:
    if not peso_kg or not talla_m:
        return None
    try:
        return round(peso_kg / (talla_m * talla_m), 2)
    except ZeroDivisionError:
        return None


@dataclass
class Edad:
    anios: int
    meses: int
    dias: int


def calcular_edad(fecha_nacimiento: dt.date, fecha_referencia: dt.date) -> Optional[Edad]:
    """Equivalente a las 3 fórmulas DATEDIF(Y/YM/MD) del Excel original."""
    if fecha_referencia < fecha_nacimiento:
        return None
    anios = fecha_referencia.year - fecha_nacimiento.year
    meses = fecha_referencia.month - fecha_nacimiento.month
    dias = fecha_referencia.day - fecha_nacimiento.day
    if dias < 0:
        meses -= 1
        mes_anterior = fecha_referencia.month - 1 or 12
        anio_mes_anterior = fecha_referencia.year if fecha_referencia.month > 1 else fecha_referencia.year - 1
        ultimo_dia_mes_anterior = (
            dt.date(anio_mes_anterior, mes_anterior % 12 + 1, 1) - dt.timedelta(days=1)
        ).day
        dias += ultimo_dia_mes_anterior
    if meses < 0:
        anios -= 1
        meses += 12
    return Edad(anios=anios, meses=meses, dias=dias)


_GRUPOS_TAMIZAJE = (
    (0, 5, "MENOR_6M"),
    (6, 11, "6_11M"),
    (12, 23, "12M_23M"),
)


def derivar_grupo_etario_tamizaje(edad_anios: int, edad_meses_totales: int) -> str:
    """Mapea la edad al ENUM grupo_etario de tamizaje_hb."""
    if edad_anios == 0:
        for desde, hasta, etiqueta in _GRUPOS_TAMIZAJE:
            if desde <= edad_meses_totales <= hasta:
                return etiqueta
        return "12M_23M"
    if edad_anios == 1:
        return "12M_23M"
    if edad_anios == 2:
        return "2A"
    if edad_anios == 3:
        return "3A"
    if edad_anios == 4:
        return "4A"
    return "5A_MAS"


def normalizar_telefono(valor: object) -> Optional[str]:
    texto = normalizar_texto(valor)
    if not texto:
        return None
    solo_digitos = re.sub(r"\D", "", texto)
    return solo_digitos[:15] if solo_digitos else None
