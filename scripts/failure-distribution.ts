import { events } from './collect-metrics';

const failures = events.filter(e => e.eventType === 'ERROR');

const byPlatform = failures.reduce((acc, f) => {
  acc[f.platform] = acc[f.platform] || 0;
  acc[f.platform]++;
  return acc;
}, {} as Record<string, number>);

console.log({ failuresByPlatform: byPlatform });