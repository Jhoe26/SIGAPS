export interface VacunaCatalogo {
  id: number;
  codigo: string;
  nombre: string;
  grupoEdad: string;
  numDosisEsquema: number;
  descripcion: string | null;
  activa: boolean;
  vigenteDesde: string | null;
  vigenteHasta: string | null;
}
