export function formatEjeY(valor: number): string {
  return valor >= 1000 ? `${Math.round(valor / 100) / 10}k` : `${valor}`;
}
