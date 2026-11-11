import { describe, it, expect } from 'vitest';
import { tableLayout, sphereLayout, helixLayout, gridLayout } from '../src/layouts.js';

const COUNT = 200;
const round = (n) => Math.round(n);
const distinct = (targets, pick) => new Set(targets.map((t) => round(pick(t.position)))).size;
const key = ({ position: p }) => [round(p.x), round(p.y), round(p.z)].join(',');

describe.each([
  ['table', tableLayout],
  ['sphere', sphereLayout],
  ['helix', helixLayout],
  ['grid', gridLayout],
])('%s layout', (_, layout) => {
  it('returns one target per tile, with no two tiles in the same spot', () => {
    const targets = layout(COUNT);
    expect(targets).toHaveLength(COUNT);
    expect(new Set(targets.map(key)).size).toBe(COUNT);
  });
});

describe('tableLayout', () => {
  it('arranges 200 tiles as 20 columns × 10 rows', () => {
    const targets = tableLayout(COUNT);
    expect(distinct(targets, (p) => p.x)).toBe(20);
    expect(distinct(targets, (p) => p.y)).toBe(10);
  });

  it('is centred on the origin', () => {
    const xs = tableLayout(COUNT).map((t) => t.position.x);
    expect(Math.min(...xs)).toBeCloseTo(-Math.max(...xs));
  });
});

describe('helixLayout', () => {
  const targets = helixLayout(COUNT);
  const angle = ({ position: p }) => Math.atan2(p.x, p.z);

  it('puts each pair of tiles on opposite strands at the same height (double helix)', () => {
    for (let i = 0; i < COUNT; i += 2) {
      const [a, b] = [targets[i], targets[i + 1]];
      expect(a.position.y).toBeCloseTo(b.position.y);

      const diff = Math.abs(angle(a) - angle(b));
      expect(Math.min(diff, 2 * Math.PI - diff)).toBeCloseTo(Math.PI);
    }
  });
});

describe('gridLayout', () => {
  it('arranges 200 tiles as 10 across × 4 down × 5 deep', () => {
    const targets = gridLayout(COUNT);
    expect(distinct(targets, (p) => p.x)).toBe(10);
    expect(distinct(targets, (p) => p.y)).toBe(4);
    expect(distinct(targets, (p) => p.z)).toBe(5);
  });

  it('keeps every layer in front of the camera (z = 3000)', () => {
    const zs = gridLayout(COUNT).map((t) => t.position.z);
    expect(Math.max(...zs)).toBeLessThan(3000 - 500);
  });
});
