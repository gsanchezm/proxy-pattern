import fs from 'node:fs';
import path from 'node:path';

export type TelemetryEvent = {
  eventType?: string;
  timestamp?: string;
  runId?: string;
  architecture?: string;
  platform?: string;
  viewport?: string;
  driver?: string;
  feature?: string;
  scenario?: string;
  step?: string;
  result?: string;
  durationMs?: number;
  // allow extra fields
  [key: string]: any;
};

function readJsonLines(filePath: string): TelemetryEvent[] {
  if (!fs.existsSync(filePath)) return [];

  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split(/\r?\n/).filter(Boolean);

  const out: TelemetryEvent[] = [];
  for (const line of lines) {
    try {
      out.push(JSON.parse(line));
    } catch {
      // ignore malformed lines
    }
  }
  return out;
}

function listLogFiles(): string[] {
  const files = new Set<string>();

  // 1) LOG_FILE explicit
  if (process.env.LOG_FILE) {
    files.add(path.isAbsolute(process.env.LOG_FILE)
      ? process.env.LOG_FILE
      : path.resolve(process.cwd(), process.env.LOG_FILE));
  }

  // 2) logs directory
  const logsDir = path.resolve(process.cwd(), 'logs');
  if (fs.existsSync(logsDir)) {
    for (const f of fs.readdirSync(logsDir)) {
      if (f.endsWith('.jsonl')) files.add(path.join(logsDir, f));
    }
  }

  return [...files];
}

export const events: TelemetryEvent[] = listLogFiles().flatMap(readJsonLines);

// If run directly, print a tiny summary
if (import.meta.url === `file://${process.argv[1]}`) {
  const byDriver = events.reduce<Record<string, number>>((acc, e) => {
    const k = e.driver ?? 'unknown';
    acc[k] = (acc[k] ?? 0) + 1;
    return acc;
  }, {});

  const byPlatform = events.reduce<Record<string, number>>((acc, e) => {
    const k = e.platform ?? 'unknown';
    acc[k] = (acc[k] ?? 0) + 1;
    return acc;
  }, {});

  console.log({
    files: listLogFiles(),
    totalEvents: events.length,
    byDriver,
    byPlatform
  });
}