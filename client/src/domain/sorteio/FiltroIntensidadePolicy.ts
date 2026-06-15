import type { Experience } from '@domain/experience/experienceTypes';

export type IntensityFilterMode = 'ANY' | 'EXACT' | 'UP_TO';

export interface IntensityFilter {
  mode: IntensityFilterMode;
  level: number;
}

export const DEFAULT_INTENSITY_FILTER: IntensityFilter = {
  mode: 'ANY',
  level: 3,
};

export function filterExperiencesByIntensity(
  experiences: Experience[],
  filter: IntensityFilter,
): Experience[] {
  if (filter.mode === 'ANY') {
    return experiences;
  }

  if (filter.mode === 'EXACT') {
    return experiences.filter((experience) => experience.intensity === filter.level);
  }

  return experiences.filter((experience) => experience.intensity <= filter.level);
}
