import { describe, it, expect } from 'vitest';
import { netWorthLevel } from '../src/tiles.js';

describe('netWorthLevel', () => {
  it('is "low" (red) below $100K', () => {
    expect(netWorthLevel(44140.8)).toBe('low');
    expect(netWorthLevel(99999.99)).toBe('low');
  });

  it('is "medium" (orange) from $100K to $200K inclusive', () => {
    expect(netWorthLevel(100000)).toBe('medium');
    expect(netWorthLevel(150000)).toBe('medium');
    expect(netWorthLevel(200000)).toBe('medium');
  });

  it('is "high" (green) above $200K', () => {
    expect(netWorthLevel(200000.01)).toBe('high');
    expect(netWorthLevel(369652.8)).toBe('high');
  });
});
