// §73 — structured JSON logging; never log audio bytes or full transcripts.
type Level = 'info' | 'warn' | 'error';

export function log(level: Level, event: string, fields: Record<string, unknown> = {}) {
  const line = JSON.stringify({ level, event, ...fields, ts: new Date().toISOString() });
  if (level === 'error') console.error(line);
  else if (level === 'warn') console.warn(line);
  else console.info(line);
}
