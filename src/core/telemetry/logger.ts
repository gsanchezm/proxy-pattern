import fs from 'node:fs';
import path from 'node:path';
import pino from 'pino';

function createDestination() {
  const logFile = process.env.LOG_FILE; // e.g. logs/web-desktop.jsonl
  if (!logFile) return undefined; // stdout

  const abs = path.isAbsolute(logFile) ? logFile : path.resolve(process.cwd(), logFile);
  fs.mkdirSync(path.dirname(abs), { recursive: true });

  // async destination (non-blocking)
  return pino.destination({ dest: abs, sync: false });
}

export const logger = pino(
  {
    level: process.env.LOG_LEVEL || 'info',
    timestamp: () => `,"timestamp":"${new Date().toISOString()}"`
  },
  createDestination()
);