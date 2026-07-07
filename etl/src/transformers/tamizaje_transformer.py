from __future__ import annotations

from typing import Optional

from src.dedup import PacienteRegistry
from src.extractors.base import ExtraccionHoja, valor
from src.normalizers import (
    calcular_edad,
    calcular_hb_corregido,
    derivar_grupo_etario_tamizaje,
    normalizar_decimal,
    normalizar_fecha,
    normalizar_texto,
)
from src.transformers.common import (
    FilaDescartada,
    ResultadoTransformacion,
    campos_fijos_migracion,
    hoja_vacia,
    registrar_paciente,
    resolver_dni_o_descartar,
    resolver_fecha_o_descartar,
)

HOJA_LOGICA = "tamizaje"


def _resolver_edad(fila, columnas, fecha) -> Optional[tuple[int, int, int]]:
    anios_raw = valor(fila, columnas, "edad_anios")
    if anios_raw is not None:
        try:
            anios = int(float(anios_raw))
            meses = int(float(valor(fila, columnas, "edad_meses") or 0))
            dias = int(float(valor(fila, columnas, "edad_dias") or 0))
            return anios, meses, dias
        except (ValueError, TypeError):
            pass

    fecha_nac = normalizar_fecha(valor(fila, columnas, "fecha_nacimiento")).fecha
    if fecha_nac is not None and fecha is not None:
        edad = calcular_edad(fecha_nac, fecha)
        if edad is not None:
            return edad.anios, edad.meses, edad.dias
    return None


def _resolver_tipo_dosaje(fila, columnas, hb_observado: Optional[float]) -> str:
    texto = normalizar_texto(valor(fila, columnas, "tipo_dosaje"))
    if texto:
        return "SIN_DOSAJE" if "sin" in texto.lower() else "DOSAJE"
    return "DOSAJE" if hb_observado is not None else "SIN_DOSAJE"


def transformar(extraccion: Optional[ExtraccionHoja], registry: PacienteRegistry) -> ResultadoTransformacion:
    if extraccion is None:
        return hoja_vacia(extraccion, HOJA_LOGICA)

    resultado = ResultadoTransformacion(hoja=HOJA_LOGICA)
    columnas = extraccion.columnas_resueltas

    for _, fila in extraccion.df.iterrows():
        fila_excel = int(fila["_excel_row"])

        dni, error = resolver_dni_o_descartar(HOJA_LOGICA, fila_excel, valor(fila, columnas, "dni"))
        if error:
            resultado.descartadas.append(error)
            continue

        fecha, error = resolver_fecha_o_descartar(HOJA_LOGICA, fila_excel, dni, valor(fila, columnas, "fecha"), "fecha")
        if error:
            resultado.descartadas.append(error)
            continue

        edad = _resolver_edad(fila, columnas, fecha)
        if edad is None:
            resultado.descartadas.append(
                FilaDescartada(HOJA_LOGICA, fila_excel, dni, "No se pudo determinar la edad (ni columna edad ni fecha de nacimiento)")
            )
            continue
        anios, meses, dias = edad

        hb_observado = normalizar_decimal(valor(fila, columnas, "hb_observado"))

        registrar_paciente(registry, fila, columnas, HOJA_LOGICA, fila_excel, dni, fecha_referencia=fecha)

        resultado.filas_validas.append(
            {
                "_dni": dni,
                "fecha": fecha,
                "edad_anios": anios,
                "edad_meses": meses,
                "edad_dias": dias,
                "grupo_etario": derivar_grupo_etario_tamizaje(anios, anios * 12 + meses),
                "tipo_dosaje": _resolver_tipo_dosaje(fila, columnas, hb_observado),
                "hb_observado": hb_observado,
                "hb_corregido": calcular_hb_corregido(hb_observado),
                "observaciones": normalizar_texto(valor(fila, columnas, "observaciones")),
                **campos_fijos_migracion(),
            }
        )

    return resultado
