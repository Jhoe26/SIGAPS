from __future__ import annotations

from typing import Optional

from src.dedup import PacienteRegistry
from src.extractors.base import ExtraccionHoja, valor
from src.normalizers import normalizar_decimal, normalizar_entero, normalizar_talla_metros, normalizar_texto
from src.transformers.common import (
    ResultadoTransformacion,
    campos_fijos_migracion,
    hoja_vacia,
    registrar_paciente,
    resolver_dni_o_descartar,
    resolver_fecha_o_descartar,
)

DX_NUTRICIONAL_DEFAULT = "NORMAL"  # el Excel no trae esta columna; default seguro documentado (spec Fase G)

HOJA_LOGICA_MENOR5 = "cred_menor5"
HOJA_LOGICA_MAYOR5 = "cred_mayor5"

_DX_MENOR5_MAP = {
    "ganancia": "GANANCIA_INADECUADA",
    "recuper": "RECUPERADO",
    "sobrepeso": "SOBREPESO",
    "aguda": "DESNUTRICION_AGUDA",
    "cronica": "DESNUTRICION_CRONICA",
    "normal": "NORMAL",
}
_DX_MAYOR5_MAP = {
    "cronica": "DESNUTRICION_CRONICA",
    "sobrepeso": "SOBREPESO",
    "obeso": "OBESO",
    "normal": "NORMAL",
    "recuper": "RECUPERADO",
}
_RIESGO_MAP = {"bajo": "BAJO", "medio": "MEDIO", "alto": "ALTO"}
_SI_TEXTOS = {"si", "sí", "s", "x", "1", "true", "verdadero"}
_NO_TEXTOS = {"no", "n", "0", "false", "falso"}


def _mapear(texto: Optional[str], mapa: dict[str, str]) -> Optional[str]:
    if not texto:
        return None
    minuscula = texto.lower()
    for clave, valor_mapeado in mapa.items():
        if clave in minuscula:
            return valor_mapeado
    return None


def _normalizar_booleano(texto: Optional[str]) -> Optional[bool]:
    if not texto:
        return None
    minuscula = texto.strip().lower()
    if minuscula in _SI_TEXTOS:
        return True
    if minuscula in _NO_TEXTOS:
        return False
    return None


def transformar_menor5(extraccion: Optional[ExtraccionHoja], registry: PacienteRegistry) -> ResultadoTransformacion:
    if extraccion is None:
        return hoja_vacia(extraccion, HOJA_LOGICA_MENOR5)

    resultado = ResultadoTransformacion(hoja=HOJA_LOGICA_MENOR5)
    columnas = extraccion.columnas_resueltas

    for _, fila in extraccion.df.iterrows():
        fila_excel = int(fila["_excel_row"])

        dni, error = resolver_dni_o_descartar(HOJA_LOGICA_MENOR5, fila_excel, valor(fila, columnas, "dni"))
        if error:
            resultado.descartadas.append(error)
            continue

        fecha, error = resolver_fecha_o_descartar(HOJA_LOGICA_MENOR5, fila_excel, dni, valor(fila, columnas, "fecha"), "fecha")
        if error:
            resultado.descartadas.append(error)
            continue

        dx = _mapear(normalizar_texto(valor(fila, columnas, "dx_nutricional")), _DX_MENOR5_MAP) or DX_NUTRICIONAL_DEFAULT

        registrar_paciente(registry, fila, columnas, HOJA_LOGICA_MENOR5, fila_excel, dni, fecha_referencia=fecha)

        resultado.filas_validas.append(
            {
                "_dni": dni,
                "fecha": fecha,
                "edad_puntual": normalizar_texto(valor(fila, columnas, "edad_puntual")),
                "num_control": normalizar_entero(valor(fila, columnas, "num_control")),
                "peso": normalizar_decimal(valor(fila, columnas, "peso")),
                "talla": normalizar_decimal(valor(fila, columnas, "talla")),
                "perimetro_cefalico": normalizar_decimal(valor(fila, columnas, "perimetro_cefalico")),
                "dx_nutricional": dx,
                "lactancia_hasta_6m": _normalizar_booleano(normalizar_texto(valor(fila, columnas, "lactancia_hasta_6m"))),
                "grado_riesgo": normalizar_texto(valor(fila, columnas, "grado_riesgo")),
                "observaciones": normalizar_texto(valor(fila, columnas, "observaciones")),
                **campos_fijos_migracion(),
            }
        )

    return resultado


def transformar_mayor5(extraccion: Optional[ExtraccionHoja], registry: PacienteRegistry) -> ResultadoTransformacion:
    if extraccion is None:
        return hoja_vacia(extraccion, HOJA_LOGICA_MAYOR5)

    resultado = ResultadoTransformacion(hoja=HOJA_LOGICA_MAYOR5)
    columnas = extraccion.columnas_resueltas

    for _, fila in extraccion.df.iterrows():
        fila_excel = int(fila["_excel_row"])

        dni, error = resolver_dni_o_descartar(HOJA_LOGICA_MAYOR5, fila_excel, valor(fila, columnas, "dni"))
        if error:
            resultado.descartadas.append(error)
            continue

        fecha, error = resolver_fecha_o_descartar(HOJA_LOGICA_MAYOR5, fila_excel, dni, valor(fila, columnas, "fecha"), "fecha")
        if error:
            resultado.descartadas.append(error)
            continue

        dx = _mapear(normalizar_texto(valor(fila, columnas, "dx_nutricional")), _DX_MAYOR5_MAP) or DX_NUTRICIONAL_DEFAULT

        registrar_paciente(registry, fila, columnas, HOJA_LOGICA_MAYOR5, fila_excel, dni, fecha_referencia=fecha)

        peso = normalizar_decimal(valor(fila, columnas, "peso"))
        talla_m = normalizar_talla_metros(valor(fila, columnas, "talla"))

        resultado.filas_validas.append(
            {
                "_dni": dni,
                "fecha": fecha,
                "edad_puntual": normalizar_texto(valor(fila, columnas, "edad_puntual")),
                "num_control": normalizar_entero(valor(fila, columnas, "num_control")),
                "peso": peso,
                "talla": talla_m,
                "imc": normalizar_decimal(valor(fila, columnas, "imc")),
                "riesgo_nutricional": _mapear(normalizar_texto(valor(fila, columnas, "riesgo_nutricional")), _RIESGO_MAP),
                "dx_nutricional": dx,
                "observaciones": normalizar_texto(valor(fila, columnas, "observaciones")),
                **campos_fijos_migracion(),
            }
        )

    return resultado
