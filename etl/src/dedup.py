"""Deduplicación y cross-referencia de pacientes entre las 9 hojas.

Regla del negocio: "mismo DNI en múltiples hojas = 1 paciente, N registros
clínicos". Cada hoja aporta un `CandidatoPaciente` (lo que esa fila conoce
del paciente); este módulo fusiona todos los candidatos de un mismo DNI en
un único registro para `paciente`, completando campos que falten en una
hoja con los que sí trae otra (p.ej. CRED trae sexo, TAMIZAJE no).

`paciente.fecha_nacimiento` y `paciente.sexo` son NOT NULL en el schema:
- fecha_nacimiento: si no se puede resolver (ni explícita ni estimada por
  edad+fecha de registro en ninguna hoja), se usa la fecha centinela
  1900-01-01 (mismo criterio ya usado en `v_anemia_pendiente` del schema)
  y se marca para revisión manual. No bloquea la migración: es un dato
  secundario, corregible después.
- sexo: no tiene un valor neutro seguro para inventar. Si no aparece en
  NINGUNA hoja para ese DNI, ese paciente (y todos sus registros clínicos)
  se excluye de la migración y se reporta en requiere_revision_manual para
  que el personal lo complete antes de reintentar.
"""

from __future__ import annotations

import datetime as dt
from collections import defaultdict
from dataclasses import dataclass, field
from typing import Optional

from src.config import FUENTE_ORIGEN, FUENTE_PADRON

FECHA_CENTINELA = dt.date(1900, 1, 1)
SEXO_DEFECTO_SIN_PADRON = "F"  # spec Fase G: sin cruce con el padrón, no hay forma de saber el sexo desde el Excel


@dataclass
class CandidatoPaciente:
    dni: str
    ap_paterno: str
    ap_materno: str
    nombres: str
    hoja_origen: str
    fila_excel: int
    fecha_nacimiento: Optional[dt.date] = None
    fecha_nacimiento_estimada: bool = False
    sexo: Optional[str] = None
    telefono: Optional[str] = None
    direccion: Optional[str] = None
    distrito: Optional[str] = None


@dataclass
class PacienteResuelto:
    dni: str
    ap_paterno: str
    ap_materno: str
    nombres: str
    fecha_nacimiento: dt.date
    fecha_nacimiento_estimada: bool
    sexo: str
    telefono: Optional[str]
    direccion: Optional[str]
    distrito: Optional[str]
    hojas_origen: list[str]
    tipo_seguro: str
    fuente_origen: str
    cruza_padron: bool


@dataclass
class NotaRevisionManual:
    dni: str
    hoja: str
    fila_excel: Optional[int]
    motivo: str
    bloquea_migracion: bool = False


def _mas_completo(a: str, b: str) -> str:
    if not a:
        return b
    if not b:
        return a
    return a if len(a) >= len(b) else b


class PacienteRegistry:
    def __init__(self) -> None:
        self._candidatos: dict[str, list[CandidatoPaciente]] = defaultdict(list)

    def registrar(self, candidato: CandidatoPaciente) -> None:
        self._candidatos[candidato.dni].append(candidato)

    def dnis(self) -> list[str]:
        return list(self._candidatos.keys())

    def resolver(
        self, acreditados: Optional[dict[str, dict]] = None
    ) -> tuple[dict[str, PacienteResuelto], list[NotaRevisionManual]]:
        acreditados = acreditados or {}
        listos: dict[str, PacienteResuelto] = {}
        notas: list[NotaRevisionManual] = []

        for dni, candidatos in self._candidatos.items():
            hojas_origen: list[str] = []
            telefono: Optional[str] = None
            for candidato in candidatos:
                if candidato.hoja_origen not in hojas_origen:
                    hojas_origen.append(candidato.hoja_origen)
                telefono = telefono or candidato.telefono

            acreditado = acreditados.get(dni)
            if acreditado is not None:
                listos[dni] = PacienteResuelto(
                    dni=dni,
                    ap_paterno=acreditado["ap_paterno"] or "SIN",
                    ap_materno=acreditado["ap_materno"] or "APELLIDO",
                    nombres=acreditado["nombres"] or "SIN NOMBRE",
                    fecha_nacimiento=acreditado["fecha_nacimiento"] or FECHA_CENTINELA,
                    fecha_nacimiento_estimada=acreditado["fecha_nacimiento"] is None,
                    sexo=acreditado["sexo"] or SEXO_DEFECTO_SIN_PADRON,
                    telefono=telefono,
                    direccion=acreditado["direccion"],
                    distrito=acreditado["distrito"],
                    hojas_origen=hojas_origen,
                    tipo_seguro="ESSALUD",
                    fuente_origen=FUENTE_PADRON,
                    cruza_padron=True,
                )
                continue

            listos[dni] = self._resolver_desde_excel(dni, candidatos, hojas_origen, telefono, notas)

        return listos, notas

    def _resolver_desde_excel(
        self,
        dni: str,
        candidatos: list[CandidatoPaciente],
        hojas_origen: list[str],
        telefono: Optional[str],
        notas: list[NotaRevisionManual],
    ) -> PacienteResuelto:
        ap_paterno = ap_materno = nombres = ""
        direccion = distrito = None
        fecha_nacimiento: Optional[dt.date] = None
        fecha_estimada = False
        sexo: Optional[str] = None

        for candidato in candidatos:
            ap_paterno = _mas_completo(ap_paterno, candidato.ap_paterno)
            ap_materno = _mas_completo(ap_materno, candidato.ap_materno)
            nombres = _mas_completo(nombres, candidato.nombres)
            direccion = direccion or candidato.direccion
            distrito = distrito or candidato.distrito

            if candidato.sexo and not sexo:
                sexo = candidato.sexo

            if candidato.fecha_nacimiento and (fecha_nacimiento is None or fecha_estimada):
                if fecha_nacimiento is None or (fecha_estimada and not candidato.fecha_nacimiento_estimada):
                    fecha_nacimiento = candidato.fecha_nacimiento
                    fecha_estimada = candidato.fecha_nacimiento_estimada

        if sexo is None:
            # A diferencia de Fase F, en Fase G el sexo normalmente viene del
            # padrón EsSalud; el Excel de enfermería no tiene columna sexo.
            # Sin cruce, no bloquea la migración (spec Fase G): se usa un
            # default documentado y se marca para revisión manual.
            sexo = SEXO_DEFECTO_SIN_PADRON
            notas.append(
                NotaRevisionManual(
                    dni=dni,
                    hoja="/".join(hojas_origen),
                    fila_excel=None,
                    motivo=(
                        f"Paciente DNI {dni}: no cruza con el padrón EsSalud y el Excel no trae "
                        f"columna sexo. Se usó '{SEXO_DEFECTO_SIN_PADRON}' por defecto. Corregir manualmente."
                    ),
                    bloquea_migracion=False,
                )
            )

        if fecha_nacimiento is None:
            fecha_nacimiento = FECHA_CENTINELA
            fecha_estimada = True
            notas.append(
                NotaRevisionManual(
                    dni=dni,
                    hoja="/".join(hojas_origen),
                    fila_excel=None,
                    motivo=(
                        f"Paciente DNI {dni}: fecha_nacimiento no determinable, se usó "
                        f"fecha centinela {FECHA_CENTINELA.isoformat()}. Corregir manualmente."
                    ),
                    bloquea_migracion=False,
                )
            )

        if not ap_paterno:
            ap_paterno = "SIN"
            notas.append(
                NotaRevisionManual(
                    dni=dni,
                    hoja="/".join(hojas_origen),
                    fila_excel=None,
                    motivo=f"Paciente DNI {dni}: sin apellido paterno legible, se usó placeholder 'SIN'.",
                    bloquea_migracion=False,
                )
            )
        if not ap_materno:
            ap_materno = "APELLIDO"

        return PacienteResuelto(
            dni=dni,
            ap_paterno=ap_paterno,
            ap_materno=ap_materno,
            nombres=nombres or "SIN NOMBRE",
            fecha_nacimiento=fecha_nacimiento,
            fecha_nacimiento_estimada=fecha_estimada,
            sexo=sexo,
            telefono=telefono,
            direccion=direccion,
            distrito=distrito,
            hojas_origen=hojas_origen,
            tipo_seguro="NINGUNO",
            fuente_origen=FUENTE_ORIGEN,
            cruza_padron=False,
        )
