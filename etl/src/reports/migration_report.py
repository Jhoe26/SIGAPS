"""Reporte final de la migración: migration_report.json + 2 CSV (filas
descartadas por validación, y notas que requieren revisión manual humana)."""

from __future__ import annotations

import csv
import datetime as dt
import json
import time
from dataclasses import dataclass, field
from pathlib import Path
from typing import Optional

from src.dedup import NotaRevisionManual
from src.transformers.common import FilaDescartada


@dataclass
class ResumenHoja:
    hoja: str
    tabla: str
    hoja_excel: Optional[str]
    extraidos: int
    migrados: int
    descartados: int
    omitido_por_idempotencia: bool
    filas_ya_existentes: int
    sin_paciente_resuelto: int
    advertencias: list[str]
    tiempo_segundos: float


class ReporteMigracion:
    def __init__(self, dry_run: bool) -> None:
        self.dry_run = dry_run
        self.inicio = time.monotonic()
        self.fecha_migracion = dt.datetime.now().isoformat(timespec="seconds")
        self.resumenes: list[ResumenHoja] = []
        self.descartadas: list[FilaDescartada] = []
        self.notas_revision_manual: list[NotaRevisionManual] = []
        self.pacientes_insertados = 0
        self.pacientes_reutilizados = 0
        self.total_acreditados_cargados = 0
        self.pacientes_cruzados_padron = 0
        self.pacientes_no_cruzados = 0

    def agregar_hoja(self, resumen: ResumenHoja, descartadas: list[FilaDescartada]) -> None:
        self.resumenes.append(resumen)
        self.descartadas.extend(descartadas)

    def agregar_notas_manuales(self, notas: list[NotaRevisionManual]) -> None:
        self.notas_revision_manual.extend(notas)

    def registrar_pacientes(self, insertados: int, total_dnis: int) -> None:
        self.pacientes_insertados += insertados
        self.pacientes_reutilizados += max(total_dnis - insertados, 0)

    def registrar_padron(self, total_acreditados_cargados: int, cruzados: int, no_cruzados: int) -> None:
        self.total_acreditados_cargados = total_acreditados_cargados
        self.pacientes_cruzados_padron = cruzados
        self.pacientes_no_cruzados = no_cruzados

    def _duracion_total(self) -> float:
        return round(time.monotonic() - self.inicio, 2)

    def _a_dict(self) -> dict:
        total_pacientes_unicos = self.pacientes_cruzados_padron + self.pacientes_no_cruzados
        porcentaje_cruce = (
            round(100 * self.pacientes_cruzados_padron / total_pacientes_unicos, 1) if total_pacientes_unicos else 0.0
        )
        registros_clinicos = {r.tabla: r.migrados for r in self.resumenes}
        registros_clinicos["total"] = sum(r.migrados for r in self.resumenes)

        return {
            "fecha_migracion": self.fecha_migracion,
            "modo": "dry-run (sin escribir en BD)" if self.dry_run else "migracion real",
            "duracion_segundos": self._duracion_total(),
            "padron_acreditados": {"total_cargados": self.total_acreditados_cargados},
            "pacientes": {
                "total_unicos": total_pacientes_unicos,
                "cruzados_con_padron": self.pacientes_cruzados_padron,
                "no_cruzados": self.pacientes_no_cruzados,
                "porcentaje_cruce": porcentaje_cruce,
                "insertados": self.pacientes_insertados,
                "reutilizados_existentes": self.pacientes_reutilizados,
                "requieren_revision_manual": len(self.notas_revision_manual),
            },
            "registros_clinicos": registros_clinicos,
            "hojas": [
                {
                    "hoja": r.hoja,
                    "tabla": r.tabla,
                    "hoja_excel": r.hoja_excel,
                    "extraidos": r.extraidos,
                    "migrados": r.migrados,
                    "descartados": r.descartados,
                    "omitido_por_idempotencia": r.omitido_por_idempotencia,
                    "filas_ya_existentes_en_bd": r.filas_ya_existentes,
                    "descartados_sin_paciente_resuelto": r.sin_paciente_resuelto,
                    "advertencias": r.advertencias,
                    "tiempo_segundos": r.tiempo_segundos,
                }
                for r in self.resumenes
            ],
            "totales": {
                "extraidos": sum(r.extraidos for r in self.resumenes),
                "migrados": sum(r.migrados for r in self.resumenes),
                "descartados": sum(r.descartados for r in self.resumenes),
            },
            "descartados": [
                {"hoja": d.hoja, "fila_excel": d.fila_excel, "dni": d.dni, "motivo": d.motivo}
                for d in self.descartadas
            ],
            "requiere_revision_manual": [
                {
                    "dni": n.dni,
                    "hoja": n.hoja,
                    "fila_excel": n.fila_excel,
                    "motivo": n.motivo,
                    "bloquea_migracion": n.bloquea_migracion,
                }
                for n in self.notas_revision_manual
            ],
        }

    def escribir(self, directorio_salida: Path) -> None:
        directorio_salida.mkdir(parents=True, exist_ok=True)

        timestamp = dt.datetime.now().strftime("%Y%m%d_%H%M")
        reporte_path = directorio_salida / f"migration_report_{timestamp}.json"
        reporte_path.write_text(json.dumps(self._a_dict(), ensure_ascii=False, indent=2, default=str), encoding="utf-8")

        descartados_path = directorio_salida / "descartados.csv"
        with descartados_path.open("w", newline="", encoding="utf-8-sig") as f:
            escritor = csv.writer(f)
            escritor.writerow(["hoja", "fila_excel", "dni", "motivo"])
            for d in self.descartadas:
                escritor.writerow([d.hoja, d.fila_excel, d.dni or "", d.motivo])

        revision_path = directorio_salida / "revision_manual.csv"
        with revision_path.open("w", newline="", encoding="utf-8-sig") as f:
            escritor = csv.writer(f)
            escritor.writerow(["dni", "hoja", "fila_excel", "motivo", "bloquea_migracion"])
            for n in self.notas_revision_manual:
                escritor.writerow([n.dni, n.hoja, n.fila_excel or "", n.motivo, n.bloquea_migracion])

        self._imprimir_resumen(reporte_path, descartados_path, revision_path)

    def _imprimir_resumen(self, reporte_path: Path, descartados_path: Path, revision_path: Path) -> None:
        print("\n" + "=" * 60)
        print(f"RESUMEN DE MIGRACIÓN {'(DRY-RUN)' if self.dry_run else ''}")
        print("=" * 60)
        for r in self.resumenes:
            estado = " [OMITIDO: ya migrado]" if r.omitido_por_idempotencia else ""
            print(
                f"  {r.hoja:16s} extraidos={r.extraidos:6d}  migrados={r.migrados:6d}  "
                f"descartados={r.descartados:6d}  ({r.tiempo_segundos:.2f}s){estado}"
            )
        print("-" * 60)
        print(f"  Pacientes insertados:            {self.pacientes_insertados}")
        print(f"  Pacientes ya existentes/reutilizados: {self.pacientes_reutilizados}")
        print(f"  Requieren revisión manual:       {len(self.notas_revision_manual)}")
        print(f"  Duración total:                  {self._duracion_total()}s")
        print("-" * 60)
        print(f"  Reporte JSON:      {reporte_path}")
        print(f"  Descartados CSV:   {descartados_path}")
        print(f"  Revisión manual:   {revision_path}")
        print("=" * 60)
