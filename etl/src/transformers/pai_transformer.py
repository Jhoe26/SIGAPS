"""Transformer compartido por las 4 hojas PAI (una fila = una dosis).

La resolución de vacuna_id se hace contra el catálogo real ya sembrado en
`vacuna_catalogo` (ver db/schema.sql), filtrado por `grupo_edad` para evitar
ambigüedad entre códigos parecidos (p.ej. DPT_REF vs DPT_BAR). Si el nombre
de vacuna del Excel no matchea ningún código conocido de ESE grupo etario,
la fila se descarta (no se inventa una vacuna) y queda en el CSV de
revisión manual junto al texto original para que alguien la mapee a mano.
"""

from __future__ import annotations

from typing import Optional

from src.aliases import VACUNA_ALIASES
from src.dedup import PacienteRegistry
from src.extractors.base import ExtraccionHoja, valor
from src.normalizers import normalizar_entero, normalizar_texto
from src.transformers.common import (
    FilaDescartada,
    ResultadoTransformacion,
    campos_fijos_migracion,
    hoja_vacia,
    registrar_paciente,
    resolver_dni_o_descartar,
    resolver_fecha_o_descartar,
)


def _resolver_vacuna_id(texto_vacuna: Optional[str], catalogo_grupo: list[dict]) -> Optional[int]:
    if not texto_vacuna:
        return None
    minuscula = texto_vacuna.lower()
    for fila in catalogo_grupo:
        codigo = fila["codigo"]
        aliases = VACUNA_ALIASES.get(codigo, [])
        if any(alias in minuscula for alias in aliases):
            return fila["id"]
        if codigo.lower() in minuscula or fila["nombre"].lower() in minuscula:
            return fila["id"]
    return None


def _vacuna_sin_clasificar_id(vacunas_catalogo: list[dict]) -> Optional[int]:
    for fila in vacunas_catalogo:
        if fila["codigo"] == "SIN_CLAS":
            return fila["id"]
    return None


def _resolver_tipo_aplicacion(texto: Optional[str], default: str) -> str:
    if texto and "barrido" in texto.lower():
        return "BARRIDO"
    if texto and "regular" in texto.lower():
        return "REGULAR"
    return default


def transformar_pai(
    extraccion: Optional[ExtraccionHoja],
    registry: PacienteRegistry,
    hoja_logica: str,
    grupo_edad: str,
    vacunas_catalogo: list[dict],
    default_tipo_aplicacion: str = "REGULAR",
) -> ResultadoTransformacion:
    if extraccion is None:
        return hoja_vacia(extraccion, hoja_logica)

    catalogo_grupo = [v for v in vacunas_catalogo if v["grupo_edad"] == grupo_edad]
    resultado = ResultadoTransformacion(hoja=hoja_logica)
    columnas = extraccion.columnas_resueltas

    for _, fila in extraccion.df.iterrows():
        fila_excel = int(fila["_excel_row"])

        dni, error = resolver_dni_o_descartar(hoja_logica, fila_excel, valor(fila, columnas, "dni"))
        if error:
            resultado.descartadas.append(error)
            continue

        fecha, error = resolver_fecha_o_descartar(
            hoja_logica, fila_excel, dni, valor(fila, columnas, "fecha_aplicacion"), "fecha_aplicacion"
        )
        if error:
            resultado.descartadas.append(error)
            continue

        texto_vacuna = normalizar_texto(valor(fila, columnas, "vacuna"))
        vacuna_id = _resolver_vacuna_id(texto_vacuna, catalogo_grupo)
        observaciones = normalizar_texto(valor(fila, columnas, "observaciones"))
        if vacuna_id is None:
            vacuna_id = _vacuna_sin_clasificar_id(vacunas_catalogo)
            if vacuna_id is None:
                resultado.descartadas.append(
                    FilaDescartada(
                        hoja_logica, fila_excel, dni,
                        "Vacuna no reconocida y la vacuna SIN_CLAS no existe en el catálogo (aplicar migración V5)",
                    )
                )
                continue
            if texto_vacuna:
                nota = f"Vacuna original del Excel (no clasificada): '{texto_vacuna}'"
                observaciones = f"{observaciones} | {nota}" if observaciones else nota

        registrar_paciente(registry, fila, columnas, hoja_logica, fila_excel, dni, fecha_referencia=fecha)

        resultado.filas_validas.append(
            {
                "_dni": dni,
                "vacuna_id": vacuna_id,
                "num_dosis": normalizar_entero(valor(fila, columnas, "num_dosis")) or 1,
                "fecha_aplicacion": fecha,
                "lote": normalizar_texto(valor(fila, columnas, "lote")),
                "tipo_aplicacion": _resolver_tipo_aplicacion(
                    normalizar_texto(valor(fila, columnas, "tipo_aplicacion")), default_tipo_aplicacion
                ),
                "observaciones": observaciones,
                **campos_fijos_migracion(),
            }
        )

    return resultado
