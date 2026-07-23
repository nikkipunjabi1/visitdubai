import { describe, it, expect } from 'vitest';
import { haversineKm } from './geo';

describe('haversineKm', () => {
  it('is ~0 for identical points', () => {
    expect(haversineKm(25.1972, 55.2744, 25.1972, 55.2744)).toBeCloseTo(0, 5);
  });

  it('matches a known distance (Burj Khalifa → Dubai Marina ≈ 18–19 km)', () => {
    const km = haversineKm(25.1972, 55.2744, 25.0805, 55.1403);
    expect(km).toBeGreaterThan(16);
    expect(km).toBeLessThan(21);
  });

  it('is symmetric', () => {
    const ab = haversineKm(25.1972, 55.2744, 25.0805, 55.1403);
    const ba = haversineKm(25.0805, 55.1403, 25.1972, 55.2744);
    expect(ab).toBeCloseTo(ba, 9);
  });
});
