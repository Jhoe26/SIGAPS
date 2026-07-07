"""Convierte los PacienteResuelto (ya deduplicados y fusionados por DNI en
src/dedup.py) en filas listas para INSERT en la tabla `paciente`."""

from __future__ import annotations

from src.config import ES_HISTORICO, FUENTE_ORIGEN
from src.dedup import PacienteResuelto


def construir_filas_paciente(pacientes_listos: dict[str, PacienteResuelto]) -> list[dict]:
    filas = []
    for dni, paciente in pacientes_listos.items():
        filas.append(
            {
                "dni": dni,
                "ap_paterno": paciente.ap_paterno[:60],
                "ap_materno": paciente.ap_materno[:60],
                "nombres": paciente.nombres[:80],
                "fecha_nacimiento": paciente.fecha_nacimiento,
                "sexo": paciente.sexo,
                "telefono": paciente.telefono,
                "direccion": paciente.direccion,
                "distrito": paciente.distrito,
                "tipo_seguro": "NINGUNO",
                "es_historico": ES_HISTORICO,
                "fuente_origen": FUENTE_ORIGEN,
                "activo": True,
            }
        )
    return filas
