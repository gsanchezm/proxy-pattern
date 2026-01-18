import fs from 'fs';
import path from 'path';
import { AOL } from '../src/ai/AOL';
import { createProvider } from '../src/ai/providers/ProviderFactory';

const ROOT_LOG_DIR =
  process.argv.find(a => a.startsWith('--logDir='))?.split('=')[1] ??
  'analysis/logs';

const OUT_DIR =
  process.argv.find(a => a.startsWith('--outDir='))?.split('=')[1] ??
  'analysis/ai';

const providerName =
  process.argv.find(a => a.startsWith('--provider='))?.split('=')[1] ??
  process.env.AOL_PROVIDER ??
  'ollama';

fs.mkdirSync(OUT_DIR, { recursive: true });

function loadLogsFromDir(dir: string) {
  return fs
    .readdirSync(dir)
    .filter(f => f.endsWith('.jsonl'))
    .flatMap(file =>
      fs
        .readFileSync(path.join(dir, file), 'utf8')
        .trim()
        .split('\n')
        .map(line => JSON.parse(line))
    );
}

// 1️⃣ Discover log directories
const stat = fs.statSync(ROOT_LOG_DIR);
const logDirs = stat.isDirectory()
  ? fs.readdirSync(ROOT_LOG_DIR)
      .map(d => path.join(ROOT_LOG_DIR, d))
      .filter(d => fs.statSync(d).isDirectory())
  : [ROOT_LOG_DIR];

// 2️⃣ Load all telemetry
const logs = logDirs.flatMap(dir => loadLogsFromDir(dir));

// 3️⃣ Filter failures
const failures = logs.filter(e => e.result === 'fail');

// 4️⃣ Run AOL
const provider = createProvider(providerName);
const aol = new AOL(provider);

(async () => {
  const classifications = await aol.analyzeFailures(failures);
  fs.writeFileSync(
    path.join(OUT_DIR, 'failure-classification.json'),
    JSON.stringify(classifications, null, 2)
  );

  const flakiness = await aol.analyzeFlakiness(logs);
  fs.writeFileSync(
    path.join(OUT_DIR, 'flakiness-analysis.json'),
    JSON.stringify(flakiness, null, 2)
  );

  const narratives = await aol.generateNarratives(failures);
  fs.writeFileSync(
    path.join(OUT_DIR, 'narratives.md'),
    narratives.join('\n\n---\n\n')
  );

  console.log(`AOL analysis complete using provider: ${providerName}`);
})();