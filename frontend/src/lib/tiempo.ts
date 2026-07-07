export function tiempoRelativo(iso: string): string {
  // El backend serializa LocalDateTime sin zona (ya en hora local del servidor,
  // America/Lima), igual que el resto de fechas de la app: se parsea tal cual,
  // asumiendo que el navegador corre en la misma zona horaria.
  const fecha = new Date(iso);
  const diffMs = Date.now() - fecha.getTime();
  const minutos = Math.floor(diffMs / 60_000);

  if (minutos < 1) return "hace un momento";
  if (minutos < 60) return `hace ${minutos} min`;

  const horas = Math.floor(minutos / 60);
  if (horas < 24) return `hace ${horas} h`;

  const dias = Math.floor(horas / 24);
  if (dias < 30) return `hace ${dias} d`;

  return fecha.toLocaleDateString("es-PE");
}
