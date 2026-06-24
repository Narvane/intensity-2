const SESSION_END_REASON_KEY = 'experienceBoxSessionEndReason';

export type ExperienceBoxSessionEndReason = 'draw_limit';

export function setExperienceBoxSessionEndReason(reason: ExperienceBoxSessionEndReason): void {
  if (typeof sessionStorage === 'undefined') {
    return;
  }
  sessionStorage.setItem(SESSION_END_REASON_KEY, reason);
}

export function consumeExperienceBoxSessionEndReason(): ExperienceBoxSessionEndReason | null {
  if (typeof sessionStorage === 'undefined') {
    return null;
  }

  const value = sessionStorage.getItem(SESSION_END_REASON_KEY);
  if (value === 'draw_limit') {
    sessionStorage.removeItem(SESSION_END_REASON_KEY);
    return 'draw_limit';
  }

  return null;
}
