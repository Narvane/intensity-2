import { Preferences } from '@capacitor/preferences';
import type { PendingInvitePort } from '@domain/invite/PendingInvitePort';
import type { PendingInviteState } from '@domain/invite/pendingInvite';
import { isInviteJoinPath } from '@domain/invite/pendingInvite';

const PENDING_INVITE_KEY = 'pendingInvite';

export class PendingInvitePreferencesAdapter implements PendingInvitePort {
  async load(): Promise<PendingInviteState | null> {
    const { value } = await Preferences.get({ key: PENDING_INVITE_KEY });
    if (!value) {
      return null;
    }

    try {
      const parsed = JSON.parse(value) as PendingInviteState;
      if (!parsed.returnPath || !isInviteJoinPath(parsed.returnPath)) {
        return null;
      }
      return {
        returnPath: parsed.returnPath,
        awaitingAccept: Boolean(parsed.awaitingAccept),
      };
    } catch {
      return null;
    }
  }

  async save(state: PendingInviteState): Promise<void> {
    if (!isInviteJoinPath(state.returnPath)) {
      return;
    }
    await Preferences.set({ key: PENDING_INVITE_KEY, value: JSON.stringify(state) });
  }

  async clear(): Promise<void> {
    await Preferences.remove({ key: PENDING_INVITE_KEY });
  }
}

export class InMemoryPendingInviteAdapter implements PendingInvitePort {
  private state: PendingInviteState | null = null;

  async load(): Promise<PendingInviteState | null> {
    return this.state;
  }

  async save(state: PendingInviteState): Promise<void> {
    this.state = state;
  }

  async clear(): Promise<void> {
    this.state = null;
  }
}

export function createDefaultPendingInviteAdapter(): PendingInvitePort {
  return new PendingInvitePreferencesAdapter();
}
