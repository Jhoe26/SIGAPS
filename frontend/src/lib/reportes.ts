export interface ReporteItem {
  nombre: string;
}

export interface SeccionReportes {
  titulo: string;
  items: ReporteItem[];
}

export const SECCIONES_REPORTES: SeccionReportes[] = [
  {
    titulo: "Reportes Mensuales",
    items: [
      { nombre: "Reporte Mensual CRED" },
      { nombre: "Cobertura Vacunal Mensual" },
      { nombre: "Anemia Resumen Mensual" },
      { nombre: "Gestantes Reporte Mensual" },
    ],
  },
  {
    titulo: "Reportes por Programa",
    items: [
      { nombre: "CRED Evaluación Nutricional" },
      { nombre: "PAI Cobertura Vacunal" },
      { nombre: "Tamizaje Resultados" },
      { nombre: "Anemia Evolución Hemoglobina" },
    ],
  },
  {
    titulo: "Reportes Ejecutivos",
    items: [
      { nombre: "Dashboard Ejecutivo" },
      { nombre: "Indicadores Sanitarios" },
      { nombre: "Comparativo Semestral" },
      { nombre: "Tendencias Anuales" },
    ],
  },
  {
    titulo: "Reportes Estadísticos",
    items: [
      { nombre: "Análisis Cobertura por Distrito" },
      { nombre: "Distribución Demográfica" },
      { nombre: "Morbilidad por Programa" },
      { nombre: "Impacto de Intervenciones" },
    ],
  },
];
