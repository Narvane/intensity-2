import type { Experience } from '@domain/experience/experienceTypes';
import {
  filterExperiencesByIntensity,
  type IntensityFilter,
} from '@domain/sorteio/FiltroIntensidadePolicy';

export interface DrawResult {
  experience: Experience;
  filter: IntensityFilter;
  drawnAt: number;
}

export class ExecutarSorteioUseCase {
  execute(pool: Experience[], filter: IntensityFilter): DrawResult | null {
    const eligible = filterExperiencesByIntensity(pool, filter);
    if (eligible.length === 0) {
      return null;
    }

    const index = Math.floor(Math.random() * eligible.length);
    return {
      experience: eligible[index],
      filter,
      drawnAt: Date.now(),
    };
  }
}
