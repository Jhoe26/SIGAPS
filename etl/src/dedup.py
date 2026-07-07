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

FECHA_CENTINELA = dt.date(1900, 1, 1)


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

    def resolver(self) -> tuple[dict[str, PacienteResuelto], list[NotaRevisionManual]]:
        listos: dict[str, PacienteResuelto] = {}
        notas: list[NotaRevisionManual] = []

        for dni, candidatos in self._candidatos.items():
            ap_paterno = ap_materno = nombres = ""
            telefono = direccion = distrito = None
            fecha_nacimiento: Optional[dt.date] = None
            fecha_estimada = False
            sexo: Optional[str] = None
            hojas_origen: list[str] = []

            for candidato in candidatos:
                if candidato.hoja_origen not in hojas_origen:
                    hojas_origen.append(candidato.hoja_origen)
                ap_paterno = _mas_completo(ap_paterno, candidato.ap_paterno)
                ap_materno = _mas_completo(ap_materno, candidato.ap_materno)
                nombres = _mas_completo(nombres, candidato.nombres)
                telefono = telefono or candidato.telefono
                direccion = direccion or candidato.direccion
                distrito = distrito or candidato.distrito

                if candidato.sexo and not sexo:
                    sexo = candidato.sexo

                if candidato.fecha_nacimiento and (fecha_nacimiento is None or fecha_estimada):
                    # Preferir una fecha explícita (no estimada) si aparece después.
                    if fecha_nacimiento is None or (fecha_estimada and not candidato.fecha_nacimiento_estimada):
                        fecha_nacimiento = candidato.fecha_nacimiento
                        fecha_estimada = candidato.fecha_nacimiento_estimada

            if sexo is None:
                notas.append(
                    NotaRevisionManual(
                        dni=dni,
                        hoja="/".join(hojas_origen),
                        fila_excel=None,
                        motivo=(
                            f"Paciente DNI {dni}: sexo no determinable en ninguna de sus "
                            f"{len(candidatos)} filas de origen ({', '.join(hojas_origen)}). "
                            "No se migra hasta completar manualmente."
                        ),
                        bloquea_migracion=True,
                    )
                )
                continue

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

            listos[dni] = PacienteResuelto(
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
            )

        return listos, notas
