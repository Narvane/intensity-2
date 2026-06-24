import { describe, expect, it } from 'vitest';
import {
  canPerformDraw,
  createExperienceBoxSessionMeta,
  EXPERIENCE_BOX_MAX_DRAWS,
  isDrawLimitReached,
  recordSuccessfulDraw,
  remainingDraws,
} from './experienceBoxSessionPolicy';

describe('experienceBoxSessionPolicy', () => {
  it('starts a new session with zero draws', () => {
    const meta = createExperienceBoxSessionMeta('2026-01-01T00:00:00.000Z');
    expect(meta.drawCount).toBe(0);
    expect(meta.sessionStartedAt).toBe('2026-01-01T00:00:00.000Z');
    expect(remainingDraws(meta.drawCount)).toBe(EXPERIENCE_BOX_MAX_DRAWS);
  });

  it('tracks remaining draws until the limit', () => {
    let drawCount = 0;
    for (let index = 0; index < EXPERIENCE_BOX_MAX_DRAWS; index += 1) {
      expect(canPerformDraw(drawCount)).toBe(true);
      drawCount = recordSuccessfulDraw(drawCount);
      expect(remainingDraws(drawCount)).toBe(EXPERIENCE_BOX_MAX_DRAWS - drawCount);
    }

    expect(isDrawLimitReached(drawCount)).toBe(true);
    expect(canPerformDraw(drawCount)).toBe(false);
    expect(remainingDraws(drawCount)).toBe(0);
  });
});
