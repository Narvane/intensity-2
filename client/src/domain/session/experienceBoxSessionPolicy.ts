export const EXPERIENCE_BOX_MAX_DRAWS = 5;

export interface ExperienceBoxSessionMeta {
  drawCount: number;
  sessionStartedAt: string;
}

export function createExperienceBoxSessionMeta(
  startedAt = new Date().toISOString(),
): ExperienceBoxSessionMeta {
  return {
    drawCount: 0,
    sessionStartedAt: startedAt,
  };
}

export function remainingDraws(drawCount: number): number {
  return Math.max(0, EXPERIENCE_BOX_MAX_DRAWS - drawCount);
}

export function isDrawLimitReached(drawCount: number): boolean {
  return drawCount >= EXPERIENCE_BOX_MAX_DRAWS;
}

export function canPerformDraw(drawCount: number): boolean {
  return drawCount < EXPERIENCE_BOX_MAX_DRAWS;
}

export function recordSuccessfulDraw(drawCount: number): number {
  return drawCount + 1;
}
