export const INTENSITY_MIN = 1;
export const INTENSITY_MAX = 5;

export const INTENSITY_COLORS: Record<number, string> = {
  1: '#22c55e',
  2: '#3b82f6',
  3: '#eab308',
  4: '#f97316',
  5: '#ef4444',
};

export const PARAMETER_KEYS = ['effort', 'openness', 'novelty'] as const;

export type ParameterKey = (typeof PARAMETER_KEYS)[number];

export const PARAMETER_COLORS: Record<ParameterKey, string> = {
  effort: '#14b8a6',
  openness: '#84cc16',
  novelty: '#ec4899',
};

export function isValidIntensity(value: number): boolean {
  return Number.isInteger(value) && value >= INTENSITY_MIN && value <= INTENSITY_MAX;
}

export function isValidParameterValue(value: number): boolean {
  return isValidIntensity(value);
}

export function clampIntensity(value: number): number {
  return Math.min(INTENSITY_MAX, Math.max(INTENSITY_MIN, Math.round(value)));
}

export interface ExperienceParametersInput {
  effort: number;
  openness: number;
  novelty: number;
}

export function validateExperienceParameters(
  parameters: ExperienceParametersInput,
): string | null {
  for (const key of PARAMETER_KEYS) {
    if (!isValidParameterValue(parameters[key])) {
      return key;
    }
  }

  return null;
}
