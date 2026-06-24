import { describe, expect, it } from 'vitest';
import { InMemoryPendingInviteAdapter } from '@adapters/invite/PendingInvitePreferencesAdapter';
import {
  clearPendingInvite,
  getMemoryPendingReturnPath,
  hydratePendingInvite,
  isInviteJoinPath,
  rememberPendingInvite,
  resolvePostAuthDestination,
  setMemoryPendingReturnPath,
} from '@domain/invite/pendingInvite';

describe('pendingInvite', () => {
  it('detects invite join paths', () => {
    expect(isInviteJoinPath('/join?code=AB23CD')).toBe(true);
    expect(isInviteJoinPath('/join?t=token')).toBe(true);
    expect(isInviteJoinPath('/join')).toBe(false);
    expect(isInviteJoinPath('/groups')).toBe(false);
  });

  it('resolves post-auth destination with invite return path', () => {
    expect(resolvePostAuthDestination('/join?code=AB23CD', null)).toBe('/join?code=AB23CD');
    expect(resolvePostAuthDestination(null, '/join?t=abc')).toBe('/join?t=abc');
    expect(resolvePostAuthDestination(null, null)).toBe('/groups');
  });

  it('persists and hydrates pending invite state', async () => {
    const port = new InMemoryPendingInviteAdapter();
    setMemoryPendingReturnPath(null);

    await rememberPendingInvite(port, '/join?code=AB23CD', true);
    expect(getMemoryPendingReturnPath()).toBe('/join?code=AB23CD');

    const hydrated = await hydratePendingInvite(port);
    expect(hydrated).toEqual({
      returnPath: '/join?code=AB23CD',
      awaitingAccept: true,
    });

    await clearPendingInvite(port);
    expect(getMemoryPendingReturnPath()).toBeNull();
    expect(await port.load()).toBeNull();
  });
});
