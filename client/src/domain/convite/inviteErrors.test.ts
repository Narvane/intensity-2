import { describe, expect, it } from 'vitest';
import { ApiError } from '@adapters/api/ApiClient';
import { resolveInviteError } from '@domain/convite/inviteErrors';

describe('resolveInviteError', () => {
  const t = (key: string) => key;

  it('maps invite gone to localized copy', () => {
    expect(resolveInviteError(new ApiError(410, 'INVITE_GONE', 'gone'), t)).toBe(
      'invite.errors.gone',
    );
  });

  it('maps already member conflict', () => {
    expect(resolveInviteError(new ApiError(409, 'ALREADY_GROUP_MEMBER', 'conflict'), t)).toBe(
      'invite.errors.alreadyMember',
    );
  });
});
