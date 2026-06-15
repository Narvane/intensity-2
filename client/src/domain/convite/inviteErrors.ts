import { ApiError } from '@adapters/api/ApiClient';

export function resolveInviteError(err: unknown, t: (key: string) => string): string {
  if (err instanceof ApiError) {
    if (err.code === 'INVITE_GONE' || err.status === 410) {
      return t('invite.errors.gone');
    }
    if (err.code === 'INVITE_NOT_FOUND' || err.status === 404) {
      return t('invite.errors.notFound');
    }
    if (err.code === 'ALREADY_GROUP_MEMBER' || err.status === 409) {
      return t('invite.errors.alreadyMember');
    }
    if (err.code === 'VALIDATION_ERROR' || err.status === 422) {
      return t('invite.errors.invalidCode');
    }
    return err.message;
  }

  return t('common.error');
}
