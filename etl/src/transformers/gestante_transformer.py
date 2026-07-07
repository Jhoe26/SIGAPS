from __future__ import annotations

from typing import Optional

from src.dedup import PacienteRegistry
from src.extractors.base import ExtraccionHoja, valor
from src.normalizers import normalizar_fecha, normalizar_telefono, normalizar_texto
from src.transformers.common import (
    ResultadoTransformacion,
    campos_fijos_migracion,
    hoja_vacia,
    registrar_paciente,
    resolver_dni_o_descartar,
)

HOJA_LOGICA = "gestante"

_CAMPOS_FECHA = [
    "influenza_fecha",
    "dt_1_fecha",
    "dt_2_fecha",
    "dt_3_fecha",
    "hepb_1_fecha",
    "hepb_2_fecha",
    "hepb_3_fecha",
    "tdpa_fecha",
]


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

        fechas = {campo: normalizar_fecha(valor(fila, columnas, campo)).fecha for campo in _CAMPOS_FECHA}
        fecha_referencia = next((f for f in fechas.values() if f is not None), None)

        registrar_paciente(registry, fila, columnas, HOJA_LOGICA, fila_excel, dni, fecha_referencia=fecha_referencia)

        resultado.filas_validas.append(
            {
                "_dni": dni,
                "telefono": normalizar_telefono(valor(fila, columnas, "telefono")),
                **fechas,
                "observaciones": normalizar_texto(valor(fila, columnas, "observaciones")),
                **campos_fijos_migracion(),
            }
        )

    return resultado
