# ETL Excel → MySQL — Fase F (SIGAPS)

Migra `BD_ENF_CAPIIIM_1.xlsx` (9 hojas, ~33,700 registros históricos) hacia
`sigaps_db`, bajo `usuario_id=1` (MIGRACION_HISTORICA), `es_historico=TRUE`,
`fuente_origen='EXCEL_2024_2025'`.

## Antes de correr

Este ETL **no incluye el Excel origen** (no se versiona en el repo por su
tamaño/datos sensibles). Coloca el archivo en:

```
db/BD_ENF_CAPIIIM_1.xlsx
```

(ruta relativa a la raíz del repo; `etl/.env.example` ya apunta ahí por
default con `EXCEL_PATH=../db/BD_ENF_CAPIIIM_1.xlsx`). Si está en otra
ubicación, usa `--file <ruta>` o edita `EXCEL_PATH` en `.env`.

## Instalación

```bash
cd etl
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
# editar .env con las credenciales reales de MySQL
```

## Ejecución

```bash
# 1. Validar sin escribir en la BD (extrae, transforma, valida contra
#    pacientes/catálogos ya existentes, pero NO inserta nada)
python src/main.py --dry-run

# 2. Revisar los reportes generados en etl/output/:
#    - migration_report.json  (totales por hoja, duración, revisión manual)
#    - descartados.csv        (filas inválidas: DNI/fecha/enum no reconocido)
#    - revision_manual.csv    (pacientes con datos incompletos/estimados)

# 3. Si los números tienen sentido, ejecutar la migración real
python src/main.py

# Solo algunas hojas (para iterar sobre los alias de columnas, ver abajo)
python src/main.py --dry-run --only tamizaje,anemia
```

El script es **idempotente**: antes de insertar en cada tabla clínica,
cuenta cuántas filas ya tienen `fuente_origen='EXCEL_2024_2025'`; si ya hay
alguna, omite esa tabla por completo (no duplica). Los pacientes se
deduplican por DNI contra los ya existentes en la BD.

## Si el `--dry-run` reporta muchas filas descartadas o en revisión manual

Este ETL se escribió **sin tener acceso al Excel real** (no estaba presente
en el repo al momento de generarlo). Los nombres de columna en
`src/aliases.py` son el mejor esfuerzo según convenciones típicas de
planillas de enfermería peruanas — es muy probable que necesiten ajuste:

1. Abre `descartados.csv` y `revision_manual.csv`, agrupa por `motivo`.
2. Si el motivo es "Columna no encontrada para 'X'" (se imprime en consola
   durante `--dry-run`, no en el CSV), abre el Excel, mira el encabezado
   real de esa columna y agrega ese texto (o un fragmento reconocible) a la
   lista de candidatos correspondiente en `src/aliases.py`. La búsqueda es
   por sub-string, sin tildes ni mayúsculas — no hace falta el texto exacto.
3. Vuelve a correr `--dry-run --only <hoja>` hasta que el número de
   descartados baje a lo esperable (errores reales de captura del Excel
   original, no fallas de mapeo).

## Reglas de negocio implementadas

- **DNI**: 8 dígitos exactos. Con menos, se rellena con ceros a la
  izquierda. Con más, se descarta la fila (no se adivina cuáles dígitos
  sobran: podría enlazar el registro clínico al paciente equivocado).
- **Fechas**: fuera de `[1900, 2030]` → fila descartada, con motivo.
- **Nombres**: si la hoja no trae `ap_paterno`/`ap_materno`/`nombres` por
  separado, se separan desde "nombre completo" con la heurística pedida
  (primeras 2 palabras = apellidos). Asume el orden peruano típico
  "ApellidoPaterno ApellidoMaterno Nombres"; si el Excel real usa otro
  orden, ajustar `src/normalizers.py:separar_nombre_completo`.
- **Dedup de pacientes**: un DNI que aparece en varias hojas se fusiona en
  un solo `paciente` (`src/dedup.py`), completando campos que falten en una
  hoja con los que sí trae otra.
- **`paciente.sexo`** (NOT NULL, sin valor neutro posible): si no aparece en
  NINGUNA hoja para ese DNI, ese paciente y todos sus registros clínicos NO
  se migran; queda listado en `revision_manual.csv` con
  `bloquea_migracion=True` para completarlo a mano y volver a correr.
- **`paciente.fecha_nacimiento`** (NOT NULL): se intenta resolver de forma
  explícita o estimarla desde edad+fecha de registro en cualquier hoja; si
  ninguna hoja la trae, se usa la fecha centinela `1900-01-01` (mismo
  criterio que ya usa `v_anemia_pendiente` en `db/schema.sql`) y se marca en
  revisión manual, pero SÍ se migra (no bloquea): es un dato secundario y
  corregible después, y no vale la pena perder el historial clínico por eso.
- **Hb**: se guarda `hb_observado` tal cual el Excel; `hb_corregido =
  hb_observado - 1.8` (`HB_CORRECCION_AYACUCHO`, mismo valor que
  `parametro_sistema` en el backend).
- **IMC** (`cred_mayor5`): se calcula si hay peso y talla. `talla` se
  normaliza a metros (si el valor es > 3, se asume que vino en cm y se
  divide entre 100), porque así lo guarda la columna según `db/schema.sql`.
- **Vacunas** (hojas PAI): el texto de vacuna del Excel se resuelve contra
  `vacuna_catalogo` ya sembrado en la BD, filtrado por `grupo_edad` de esa
  hoja (evita ambigüedad DPT_REF vs DPT_BAR, etc. — ver
  `src/aliases.py:VACUNA_ALIASES`). Si no matchea ningún código conocido, la
  fila se descarta (no se inventa una vacuna nueva ni se toca el catálogo).
- **PAI >5A (hoja "corrupta")**: si trae más de 100,000 filas, se filtra a
  solo las que tengan un DNI con pinta válida; si tras filtrar queda vacía,
  se omite la hoja completa y se deja constancia en el reporte.
- **Profesional**: el Excel solo trae el primer nombre de quien atendió, no
  alcanza para vincular con un `profesional` real del sistema (y esta fase
  no crea profesionales nuevos). Todos los registros históricos quedan con
  `profesional_id = NULL`; solo `registrado_por_id = 1` (MIGRACION_HISTORICA)
  identifica el origen. Lo mismo aplica a los 5 FKs de `usuario` dentro de
  `anemia_seguimiento` (`reg1_enf_id`, `reg1_med_id`, etc.): quedan NULL.
- **Batching**: cada hoja se procesa en **una única transacción** (todo o
  nada por hoja); dentro de esa transacción, los INSERT se mandan al driver
  en lotes de 500 filas (`BATCH_SIZE` en `.env`) por eficiencia.

## Estructura

```
etl/
├── requirements.txt
├── .env.example
├── src/
│   ├── config.py           # env vars + constantes de negocio
│   ├── db.py                # engine SQLAlchemy, helpers de idempotencia
│   ├── excel_reader.py      # aplana encabezados multinivel (3 filas fusionadas)
│   ├── normalizers.py       # DNI, fechas, nombres, sexo, Hb, IMC, edad
│   ├── dedup.py              # PacienteRegistry: cross-referencia por DNI
│   ├── aliases.py            # candidatos de nombre de columna/hoja/vacuna
│   ├── extractors/           # uno por hoja (lee + resuelve columnas)
│   ├── transformers/         # normaliza + aplica reglas de negocio por hoja
│   ├── loaders/               # batch insert + chequeo de idempotencia
│   ├── reports/               # migration_report.json + CSVs
│   └── main.py                # orquestador / CLI
└── output/                    # generado al correr (gitignored)
    ├── migration_report.json
    ├── descartados.csv
    └── revision_manual.csv
```

## Notas de verificación

Este código se probó de punta a punta (`--dry-run`, sin escribir en BD) con
un Excel sintético de prueba que reproduce la misma forma de encabezados
multinivel y los mismos nombres de hoja "sucios" (`PAI >5A (corrupta)`,
`PAI>7A-<15A (2)`, etc.) descritos en la Fase F, contra la BD `sigaps_db`
real del entorno de desarrollo (dry-run = solo lecturas). No se ejecutó
ninguna migración real todavía porque el Excel real (`BD_ENF_CAPIIIM_1.xlsx`)
no está presente en el repo.
