import { describe, expect, it } from 'vitest';
import {
  INTENSITY_COLORS,
  clampIntensity,
  isValidIntensity,
  validateExperienceParameters,
} from '@domain/experience/intensityTokens';

describe('intensityTokens', () => {
  it('defines five intensity colors', () => {
    expect(Object.keys(INTENSITY_COLORS)).toHaveLength(5);
    expect(INTENSITY_COLORS[2]).toBe('#5BC8B0');
  });

  it('validates intensity range', () => {
    expect(isValidIntensity(3)).toBe(true);
    expect(isValidIntensity(0)).toBe(false);
    expect(isValidIntensity(6)).toBe(false);
  });

  it('clamps out-of-range values', () => {
    expect(clampIntensity(0)).toBe(1);
    expect(clampIntensity(6)).toBe(5);
  });

  it('validates parameters', () => {
    expect(
      validateExperienceParameters({ effort: 2, openness: 3, novelty: 4 }),
    ).toBeNull();
    expect(
      validateExperienceParameters({ effort: 6, openness: 3, novelty: 4 }),
    ).toBe('effort');
  });
});
