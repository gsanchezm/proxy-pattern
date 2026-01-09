import { events } from './collect-metrics';

const failures = events.filter(e => e.eventType === 'ERROR');

const grouped = failures.reduce((acc, f) => {
  const key = `${f.feature}-${f.scenario}`;
  acc[key] = acc[key] || 0;
  acc[key]++;
  return acc;
}, {} as Record<string, number>);

const flakyScenarios = (Object.entries(grouped) as [string, number][])
  .filter(([, v]) => v > 1);

console.log({ flakyScenarios });