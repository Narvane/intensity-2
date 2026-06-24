import type { SessionState } from '@domain/session/SessionPort';
import { resolvePostAuthDestination } from '@domain/invite/pendingInvite';

export function resolveGuestRouteRedirect(
  session: SessionState | null,
  options?: { returnTo?: string | null; pendingReturnPath?: string | null },
): string | null {
  if (!session) {
    return null;
  }

  if (session.accessMode === 'EXPERIENCES') {
    return resolvePostAuthDestination(options?.returnTo, options?.pendingReturnPath);
  }

  if (session.accessMode === 'EXPERIENCE_BOX') {
    return '/box-home';
  }

  return null;
}
