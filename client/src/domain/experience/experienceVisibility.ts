import type { Experience } from '@domain/experience/experienceTypes';

export type ExperienceViewContext = 'EXPERIENCES_LIST' | 'DRAW_COVER' | 'DRAW_FACE';

export function hasFullContent(experience: Experience): boolean {
  return !experience.summaryOnly;
}

export function shouldShowDescription(
  experience: Experience,
  context: ExperienceViewContext,
): boolean {
  if (context === 'DRAW_COVER') {
    return false;
  }

  if (context === 'DRAW_FACE') {
    return Boolean(experience.description);
  }

  if (experience.summaryOnly) {
    return false;
  }

  return false;
}

export function shouldShowReflection(
  experience: Experience,
  context: ExperienceViewContext,
): boolean {
  if (context === 'DRAW_COVER') {
    return false;
  }

  if (context === 'DRAW_FACE') {
    return Boolean(experience.reflection);
  }

  if (experience.summaryOnly) {
    return false;
  }

  return false;
}

export function isSummaryOnlyView(
  experience: Experience,
  context: ExperienceViewContext,
): boolean {
  if (context === 'DRAW_COVER') {
    return true;
  }

  if (context === 'DRAW_FACE') {
    return false;
  }

  return experience.summaryOnly;
}

export function canManageExperience(
  experience: Experience,
  participantId?: string,
): boolean {
  return Boolean(participantId && experience.authorId === participantId);
}

export function hasRevealableAuthorContent(experience: Experience): boolean {
  return Boolean(experience.description?.trim() || experience.reflection?.trim());
}
