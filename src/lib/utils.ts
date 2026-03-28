export function toOrdinal(num: number): string {
  const suffixes = ['th', 'st', 'nd', 'rd'];
  const v = num % 100;
  return num + (suffixes[(v - 20) % 10] || suffixes[v] || suffixes[0]);
}

export function toEdition(num: number): string {
  return `${toOrdinal(num)} Edition`;
}
