import { events } from './collect-metrics';

const stepDurations = events.filter(e => e.durationMs);

const avgDuration =
  stepDurations.reduce((a, b) => a + b.durationMs, 0) /
  stepDurations.length;

console.log({
  avgStepDurationMs: avgDuration,
  totalSteps: stepDurations.length
});