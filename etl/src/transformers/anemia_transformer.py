"""ANEMIA (Fase G): hoja real solo trae FECHA, HB_OBSERVADO, HB_CORREGIDO y
CLASIFICACION -- no tiene fecha_inicio separada, tipo_hierro, dosis_indicada
ni controles 1/2/3 (esos campos de `anemia_seguimiento` quedan NULL).

CLASIFICACION hace doble función:
- LEVE/MODERADA/SEVERA -> dx_inicial directo, estado='EN_TRATAMIENTO'.
- NORMAL/RECUPERADO -> estado='RECUPERADO'; como dx_inicial es NOT NULL y el
  Excel no registra la severidad con la que se abrió el caso, se usa 'LEVE'
  como default seguro documentado (no se inventa una severidad) y se deja
  nota en observaciones para revisión.
"""

from __future__ import annotations

from typing import Optional

from src.dedup import PacienteRegistry
from src.extractors.base import ExtraccionHoja, valor
from src.normalizers import normalizar_decimal, normalizar_texto
from src.transformers.common import (
    FilaDescartada,
    ResultadoTransformacion,
    campos_fijos_migracion,
    hoja_vacia,
    registrar_paciente,
    resolver_dni_o_descartar,
    resolver_fecha_o_descartar,
)

HOJA_LOGICA = "anemia"

_SEVERIDAD = {"leve": "LEVE", "moderada": "MODERADA", "severa": "SEVERA"}
_RECUPERADO = {"normal", "recuperado"}


def _mapear_clasificacion(texto: Optional[str]) -> Optional[tuple[str, str, Optional[str]]]:
    """Devuelve (dx_inicial, estado, nota) o None si no se reconoce."""
    if not texto:
        return None
    minuscula = texto.lower()
    for clave, severidad in _SEVERIDAD.items():
        if clave in minuscula:
            return severidad, "EN_TRATAMIENTO", None
    if any(clave in minuscula for clave in _RECUPERADO):
        nota = f"CLASIFICACION Excel: '{texto}' (recuperado/normal); dx_inicial asumido LEVE por defecto, severidad original no registrada."
        return "LEVE", "RECUPERADO", nota
    return None


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

        clasificacion_texto = normalizar_texto(valor(fila, columnas, "clasificacion"))
        mapeo = _mapear_clasificacion(clasificacion_texto)
        if mapeo is None:
            resultado.descartadas.append(
                FilaDescartada(
                    HOJA_LOGICA, fila_excel, dni,
                    f"CLASIFICACION no reconocida (esperado leve/moderada/severa/normal/recuperado): '{clasificacion_texto}'",
                )
            )
            continue
        dx_inicial, estado, nota = mapeo

        registrar_paciente(registry, fila, columnas, HOJA_LOGICA, fila_excel, dni, fecha_referencia=fecha)

        hb_obs = normalizar_decimal(valor(fila, columnas, "hb_observado"))
        hb_corr = normalizar_decimal(valor(fila, columnas, "hb_corregido"))

        observaciones = normalizar_texto(valor(fila, columnas, "observaciones"))
        if nota:
            observaciones = f"{observaciones} | {nota}" if observaciones else nota

        resultado.filas_validas.append(
            {
                "_dni": dni,
                "fecha_inicio": fecha,
                "hb_inicial_obs": hb_obs,
                "hb_inicial_corr": hb_corr,
                "dx_inicial": dx_inicial,
                "tipo_hierro": None,
                "dosis_indicada": None,
                "reg1_enf_id": None,
                "fecha1_enf": None,
                "hb1_obs": None,
                "hb1_corr": None,
                "reg1_med_id": None,
                "fecha1_med": None,
                "obs1_med": None,
                "reg2_enf_id": None,
                "fecha2_enf": None,
                "hb2_obs": None,
                "hb2_corr": None,
                "reg2_med_id": None,
                "fecha2_med": None,
                "obs2_med": None,
                "reg3_enf_id": None,
                "fecha3_enf": None,
                "hb3_obs": None,
                "hb3_corr": None,
                "estado": estado,
                "observaciones": observaciones,
                **campos_fijos_migracion(),
            }
        )

    return resultado
