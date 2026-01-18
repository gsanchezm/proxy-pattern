import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

type Platform = 'web' | 'android' | 'ios';
type Viewport = 'desktop' | 'responsive';
type Architecture = 'proxy' | 'pom';

type Args = {
  platform: Platform;
  viewport?: Viewport;        // web only
  driver: 'playwright' | 'appium';
  capProfile?: string;        // mobile only
  runs: number;
  warmup: number;
  alternating: boolean;
  archOrder: Architecture[];
  features: string[];
  webWorkers?: number;        // optional: Playwright parallelism
  logDir: string;
};

function getArg(name: string): string | undefined {
  const idx = process.argv.indexOf(`--${name}`);
  if (idx === -1) return undefined;
  return process.argv[idx + 1];
}

function hasFlag(name: string): boolean {
  return process.argv.includes(`--${name}`);
}

function parseArgs(): Args {
  const platform = (getArg('platform') ?? 'web') as Platform;

  const driver: Args['driver'] =
    platform === 'web' ? 'playwright' : 'appium';

  const viewport = (getArg('viewport') ?? 'desktop') as Viewport;

  const capProfile = getArg('capProfile');

  const runs = Number(getArg('runs') ?? 20);
  const warmup = Number(getArg('warmup') ?? 2);

  const alternating = !hasFlag('no-alternating');

  const archOrderRaw = getArg('archOrder') ?? 'proxy,pom';
  const archOrder = archOrderRaw.split(',').map((x) => x.trim()) as Architecture[];

  const featuresRaw =
    getArg('features') ??
    'src/features/auth/auth-sign-in.feature,src/features/inventory/inventory.feature';
  const features = featuresRaw.split(',').map((x) => x.trim()).filter(Boolean);

  const webWorkers = getArg('webWorkers') ? Number(getArg('webWorkers')) : undefined;

  const logDir = getArg('logDir') ?? 'logs';

  return {
    platform,
    viewport: platform === 'web' ? viewport : undefined,
    driver,
    capProfile,
    runs,
    warmup,
    alternating,
    archOrder,
    features,
    webWorkers,
    logDir
  };
}

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function logFileName(a: Architecture, args: Args): string {
  if (args.platform === 'web') {
    return `${a}-web-${args.viewport}.jsonl`;
  }
  return `${a}-${args.platform}-${args.capProfile ?? 'default'}.jsonl`;
}

function runOne(args: Args, architecture: Architecture, iteration: number) {
  const env: NodeJS.ProcessEnv = { ...process.env };

  env.ARCHITECTURE = architecture;
  env.PLATFORM = args.platform;
  env.DRIVER = args.driver;

  if (args.platform === 'web') {
    env.VIEWPORT = args.viewport!;
    // optional but recommended for your 4-core i7
    if (args.webWorkers) env.PLAYWRIGHT_WORKERS = String(args.webWorkers);
  } else {
    if (args.capProfile) env.CAP_PROFILE = args.capProfile;
  }

  ensureDir(args.logDir);
  env.LOG_FILE = path.join(args.logDir, logFileName(architecture, args));

  const cmd = 'pnpm';
  const cmdArgs = ['test', '--', ...args.features];

  console.log(
    `\n=== RUN ${iteration} | ARCH=${architecture} | PLATFORM=${args.platform}` +
      (args.viewport ? ` | VIEWPORT=${args.viewport}` : '') +
      (args.capProfile ? ` | CAP_PROFILE=${args.capProfile}` : '') +
      ` | LOG_FILE=${env.LOG_FILE} ===\n`
  );

  const r = spawnSync(cmd, cmdArgs, {
    env,
    stdio: 'inherit',
    shell: process.platform === 'win32'
  });

  // Don’t stop the experiment on failures; those failures are data.
  if (r.error) {
    console.error(`[runner] spawn error:`, r.error);
  }
}

function pickArchitecture(args: Args, i: number): Architecture {
  if (!args.alternating) return args.archOrder[i % args.archOrder.length];

  // Alternating between first two arch values: proxy/pom/proxy/pom...
  const a0 = args.archOrder[0] ?? 'proxy';
  const a1 = args.archOrder[1] ?? 'pom';
  return i % 2 === 0 ? a0 : a1;
}

function main() {
  const args = parseArgs();

  console.log({
    mode: 'local-experiment',
    platform: args.platform,
    viewport: args.viewport,
    capProfile: args.capProfile,
    runs: args.runs,
    warmup: args.warmup,
    alternating: args.alternating,
    archOrder: args.archOrder,
    features: args.features,
    webWorkers: args.webWorkers,
    logDir: args.logDir
  });

  const total = args.warmup + args.runs;
  for (let i = 1; i <= total; i++) {
    const arch = pickArchitecture(args, i - 1);
    runOne(args, arch, i);
  }

  console.log(
    `\n[runner] Done. Logs in "${args.logDir}/". Tip: discard first ${args.warmup} runs in analysis.\n`
  );
}

main();