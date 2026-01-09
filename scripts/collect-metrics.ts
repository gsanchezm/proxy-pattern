import fs from 'fs';
import path from 'path';

const logDir = 'logs';

const files = fs.readdirSync(logDir).filter(f => f.endsWith('.jsonl'));

const events = files.flatMap(file =>
  fs.readFileSync(path.join(logDir, file), 'utf-8')
    .split('\n')
    .filter(Boolean)
    .map(line => JSON.parse(line))
);

export { events };