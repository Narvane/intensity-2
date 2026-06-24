import type { PendingInviteState } from './pendingInvite';

export interface PendingInvitePort {
  load(): Promise<PendingInviteState | null>;
  save(state: PendingInviteState): Promise<void>;
  clear(): Promise<void>;
}
