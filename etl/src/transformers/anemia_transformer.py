from __future__ import annotations

from typing import Optional

from src.dedup import PacienteRegistry
from src.extractors.base import ExtraccionHoja, valor
from src.normalizers import calcular_hb_corregido, normalizar_decimal, normalizar_fecha, normalizar_texto
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

_DX_MAP = {"leve": "LEVE", "moder": "MODERADA", "sever": "SEVERA"}
_HIERRO_MAP = {"sulfato": "SULFATO_FERROSO", "polimalt": "HIERRO_POLIMALTOSADO"}
_ESTADO_MAP = {"recuper": "RECUPERADO", "abandon": "ABANDONO", "traslad": "TRASLADADO"}


def _mapear(texto: Optional[str], mapa: dict[str, str], default: Optional[str] = None) -> Optional[str]:
    if not texto:
        return default
    minuscula = texto.lower()
    for clave, valor_mapeado in mapa.items():
        if clave in minuscula:
            return valor_mapeado
    return default


def _fecha_opcional(fila, columnas, campo) -> Optional[object]:
    resultado = normalizar_fecha(valor(fila, columnas, campo))
    return resultado.fecha


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

        fecha_inicio, error = resolver_fecha_o_descartar(
            HOJA_LOGICA, fila_excel, dni, valor(fila, columnas, "fecha_inicio"), "fecha_inicio"
        )
        if error:
            resultado.descartadas.append(error)
            continue

        dx_inicial = _mapear(normalizar_texto(valor(fila, columnas, "dx_inicial")), _DX_MAP)
        if dx_inicial is None:
            resultado.descartadas.append(
                FilaDescartada(HOJA_LOGICA, fila_excel, dni, "dx_inicial no reconocido (esperado leve/moderada/severa)")
            )
            continue

        hb_inicial_obs = normalizar_decimal(valor(fila, columnas, "hb_inicial_obs"))

        registrar_paciente(registry, fila, columnas, HOJA_LOGICA, fila_excel, dni, fecha_referencia=fecha_inicio)

        hb1_obs = normalizar_decimal(valor(fila, columnas, "c1_hb_obs"))
        hb2_obs = normalizar_decimal(valor(fila, columnas, "c2_hb_obs"))
        hb3_obs = normalizar_decimal(valor(fila, columnas, "c3_hb_obs"))

        resultado.filas_validas.append(
            {
                "_dni": dni,
                "fecha_inicio": fecha_inicio,
                "hb_inicial_obs": hb_inicial_obs,
                "hb_inicial_corr": calcular_hb_corregido(hb_inicial_obs),
                "dx_inicial": dx_inicial,
                "tipo_hierro": _mapear(normalizar_texto(valor(fila, columnas, "tipo_hierro")), _HIERRO_MAP, "OTRO"),
                "dosis_indicada": normalizar_texto(valor(fila, columnas, "dosis_indicada")),
                "reg1_enf_id": None,
                "fecha1_enf": _fecha_opcional(fila, columnas, "c1_enf_fecha"),
                "hb1_obs": hb1_obs,
                "hb1_corr": calcular_hb_corregido(hb1_obs),
                "reg1_med_id": None,
                "fecha1_med": _fecha_opcional(fila, columnas, "c1_med_fecha"),
                "obs1_med": normalizar_texto(valor(fila, columnas, "c1_med_obs")),
                "reg2_enf_id": None,
                "fecha2_enf": _fecha_opcional(fila, columnas, "c2_enf_fecha"),
                "hb2_obs": hb2_obs,
                "hb2_corr": calcular_hb_corregido(hb2_obs),
                "reg2_med_id": None,
                "fecha2_med": _fecha_opcional(fila, columnas, "c2_med_fecha"),
                "obs2_med": normalizar_texto(valor(fila, columnas, "c2_med_obs")),
                "reg3_enf_id": None,
                "fecha3_enf": _fecha_opcional(fila, columnas, "c3_enf_fecha"),
                "hb3_obs": hb3_obs,
                "hb3_corr": calcular_hb_corregido(hb3_obs),
                "estado": _mapear(normalizar_texto(valor(fila, columnas, "estado")), _ESTADO_MAP, "EN_TRATAMIENTO"),
                "observaciones": normalizar_texto(valor(fila, columnas, "observaciones")),
                **campos_fijos_migracion(),
            }
        )

    return resultado
