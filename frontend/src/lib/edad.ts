export function edadTexto(fechaNacimientoIso: string): string {
  const nacimiento = new Date(fechaNacimientoIso);
  const hoy = new Date();

  let anios = hoy.getFullYear() - nacimiento.getFullYear();
  let meses = hoy.getMonth() - nacimiento.getMonth();
  if (hoy.getDate() < nacimiento.getDate()) {
    meses -= 1;
  }
  if (meses < 0) {
    anios -= 1;
    meses += 12;
  }

  return `${anios}a ${meses}m`;
}

export function iniciales(nombreCompleto: string): string {
  const sinTitulo = nombreCompleto.replace(/^(Lic|Dr|Dra|Mg|Ing|Sr|Sra)\.?\s+/i, "");
  const partes = sinTitulo.trim().split(/\s+/);
  return ((partes[0]?.[0] ?? "") + (partes[1]?.[0] ?? "")).toUpperCase();
}
