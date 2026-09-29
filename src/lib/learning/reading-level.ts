// §24 adaptive difficulty — step up/down based on the last 3 attempts.
export type Level = 'B1' | 'B2' | 'C1';
const ORDER: Level[] = ['B1', 'B2', 'C1'];

export function nextReadingLevel(current: Level, last3: number[]): Level {
  if (last3.length < 3) return current;
  const i = ORDER.indexOf(current);
  if (last3.filter((s) => s >= 80).length >= 2 && i < 2) return ORDER[i + 1]!;
  if (last3.filter((s) => s < 50).length >= 2 && i > 0) return ORDER[i - 1]!;
  return current;
}
