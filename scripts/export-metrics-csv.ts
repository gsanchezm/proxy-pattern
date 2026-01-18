import fs from 'node:fs';
import path from 'node:path';

type E = {
  runId?: string;
  timestamp?: string;

  architecture?: string;
  platform?: string;
  viewport?: string;
  driver?: string;

  feature?: string;
  scenario?: string;
  step?: string;

  eventType?: string;
  result?: string;
  durationMs?: number;

  errorMessage?: string;
};

const LOG_DIR = process.env.LOG_DIR ?? 'logs';
const OUT_DIR = process.env.OUT_DIR ?? 'metrics';

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function listJsonlFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.jsonl'))
    .map((f) => path.join(dir, f));
}

function readJsonl(filePath: string): E[] {
  const raw = fs.readFileSync(filePath, 'utf-8');
  const lines = raw.split(/\r?\n/).filter(Boolean);
  const out: E[] = [];
  for (const line of lines) {
    try {
      out.push(JSON.parse(line));
    } catch {
      // ignore malformed line
    }
  }
  return out;
}

function csvEscape(v: unknown): string {
  const s = String(v ?? '');
  if (/[,"\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function writeCsv(filePath: string, header: string[], rows: Array<Record<string, unknown>>) {
  const lines: string[] = [];
  lines.push(header.join(','));
  for (const r of rows) {
    lines.push(header.map((h) => csvEscape(r[h])).join(','));
  }
  fs.writeFileSync(filePath, lines.join('\n'), 'utf-8');
}

function normalizeError(msg: string): string {
  return msg
    .split('\n')[0]
    .trim()
    .replace(/\s+/g, ' ')
    .slice(0, 180);
}

function scenarioKey(e: E): string {
  return [
    e.architecture ?? 'unknown',
    e.platform ?? 'unknown',
    e.viewport ?? 'na',
    e.driver ?? 'unknown',
    e.feature ?? 'unknown-feature',
    e.scenario ?? 'unknown-scenario'
  ].join('|');
}

function main() {
  ensureDir(OUT_DIR);

  const files = listJsonlFiles(LOG_DIR);
  const events = files.flatMap(readJsonl);

  // Step durations
  const stepRows = events
    .filter((e) => e.eventType === 'STEP_END' && typeof e.durationMs === 'number')
    .map((e) => ({
      runId: e.runId,
      timestamp: e.timestamp,
      architecture: e.architecture,
      platform: e.platform,
      viewport: e.viewport,
      driver: e.driver,
      feature: e.feature,
      scenario: e.scenario,
      step: e.step,
      result: e.result,
      durationMs: e.durationMs
    }));

  writeCsv(
    path.join(OUT_DIR, 'step_durations.csv'),
    [
      'runId',
      'timestamp',
      'architecture',
      'platform',
      'viewport',
      'driver',
      'feature',
      'scenario',
      'step',
      'result',
      'durationMs'
    ],
    stepRows
  );

  // Scenario outcomes per runId
  const stepEnds = events.filter((e) => e.eventType === 'STEP_END' && e.runId);

  const outcomeByScenarioRun = new Map<string, 'PASS' | 'FAIL'>();

  for (const e of stepEnds) {
    const key = `${scenarioKey(e)}|${e.runId}`;
    const isFail = String(e.result).toUpperCase() === 'FAILED';

    const prev = outcomeByScenarioRun.get(key);
    if (prev === 'FAIL') continue;
    outcomeByScenarioRun.set(key, isFail ? 'FAIL' : 'PASS');
  }

  const scenarioRows = [...outcomeByScenarioRun.entries()].map(([k, outcome]) => {
    const [sKey, runId] = k.split('|');
    const parts = sKey.split('|');

    return {
      architecture: parts[0],
      platform: parts[1],
      viewport: parts[2],
      driver: parts[3],
      feature: parts[4],
      scenario: parts[5],
      runId,
      outcome
    };
  });

  writeCsv(
    path.join(OUT_DIR, 'scenario_outcomes.csv'),
    ['architecture', 'platform', 'viewport', 'driver', 'feature', 'scenario', 'runId', 'outcome'],
    scenarioRows
  );

  // Failure buckets (group by first-line error)
  const failedSteps = events.filter(
    (e) => e.eventType === 'STEP_END' && String(e.result).toUpperCase() === 'FAILED'
  );

  const bucketCounts = failedSteps.reduce<Record<string, number>>((acc, e) => {
    const bucket = normalizeError(String(e.errorMessage ?? 'UNKNOWN_ERROR'));
    const key = [
      e.architecture ?? 'unknown',
      e.platform ?? 'unknown',
      e.viewport ?? 'na',
      bucket
    ].join('|');

    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});

  const bucketRows = Object.entries(bucketCounts)
    .map(([k, count]) => {
      const [architecture, platform, viewport, bucket] = k.split('|');
      return { architecture, platform, viewport, bucket, count };
    })
    .sort((a, b) => Number(b.count) - Number(a.count));

  writeCsv(
    path.join(OUT_DIR, 'failure_buckets.csv'),
    ['architecture', 'platform', 'viewport', 'bucket', 'count'],
    bucketRows
  );

  console.log({
    logDir: LOG_DIR,
    outDir: OUT_DIR,
    files,
    totalEvents: events.length,
    stepRows: stepRows.length,
    scenarioRows: scenarioRows.length,
    failedSteps: failedSteps.length,
    topFailureBuckets: bucketRows.slice(0, 10)
  });
}

main();
