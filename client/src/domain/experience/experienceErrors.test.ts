import { describe, expect, it } from 'vitest';
import { ApiError } from '@adapters/api/ApiClient';
import { resolveExperienceError } from '@domain/experience/experienceErrors';

describe('resolveExperienceError', () => {
  const t = (key: string) => key;

  it('maps NOT_AUTHOR to localized copy', () => {
    const message = resolveExperienceError(
      new ApiError(403, 'NOT_AUTHOR', 'Only the author can change this experience.'),
      t,
    );

    expect(message).toBe('experiences.notAuthor');
  });

  it('falls back to API message for other errors', () => {
    const message = resolveExperienceError(
      new ApiError(422, 'VALIDATION_ERROR', 'Invalid intensity.'),
      t,
    );

    expect(message).toBe('Invalid intensity.');
  });
});
