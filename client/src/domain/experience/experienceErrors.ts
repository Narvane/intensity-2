import { ApiError } from '@adapters/api/ApiClient';

export function resolveExperienceError(
  err: unknown,
  t: (key: string) => string,
): string {
  if (err instanceof ApiError) {
    if (err.code === 'NOT_AUTHOR' || err.status === 403) {
      return t('experiences.notAuthor');
    }
    return err.message;
  }

  return t('common.error');
}
