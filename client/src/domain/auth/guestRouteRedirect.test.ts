import { describe, expect, it } from 'vitest';
import { resolveGuestRouteRedirect } from '@domain/auth/guestRouteRedirect';
import type { SessionState } from '@domain/session/SessionPort';

const experiencesSession: SessionState = {
  token: 'token',
  accessMode: 'EXPERIENCES',
  participantId: 'p1',
  displayName: 'Alice',
};

const boxSession: SessionState = {
  token: 'token',
  accessMode: 'EXPERIENCE_BOX',
  groupId: 'g1',
  members: [],
};

describe('resolveGuestRouteRedirect', () => {
  it('returns null when there is no session', () => {
    expect(resolveGuestRouteRedirect(null)).toBeNull();
  });

  it('redirects experiences session to groups by default', () => {
    expect(resolveGuestRouteRedirect(experiencesSession)).toBe('/groups');
  });

  it('honors returnTo for invite join paths', () => {
    expect(
      resolveGuestRouteRedirect(experiencesSession, {
        returnTo: '/join?code=AB23CD',
      }),
    ).toBe('/join?code=AB23CD');
  });

  it('honors pending return path when router state is missing', () => {
    expect(
      resolveGuestRouteRedirect(experiencesSession, {
        pendingReturnPath: '/join?t=abc',
      }),
    ).toBe('/join?t=abc');
  });

  it('ignores invalid returnTo values', () => {
    expect(
      resolveGuestRouteRedirect(experiencesSession, {
        returnTo: '/groups/secret',
      }),
    ).toBe('/groups');
  });

  it('redirects experience box session to box home', () => {
    expect(resolveGuestRouteRedirect(boxSession)).toBe('/box-home');
  });
});
