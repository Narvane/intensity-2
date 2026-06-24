const JOIN_PATH = '/join';

import type { PendingInvitePort } from './PendingInvitePort';

export interface PendingInviteState {
  returnPath: string;
  awaitingAccept: boolean;
}

let memoryReturnPath: string | null = null;

export function isInviteJoinPath(path: string): boolean {
  if (!path.startsWith(JOIN_PATH)) {
    return false;
  }

  try {
    const parsed = new URL(path, 'https://app.local');
    const hasCode = Boolean(parsed.searchParams.get('code')?.trim());
    const hasToken = Boolean(parsed.searchParams.get('t')?.trim());
    return hasCode || hasToken;
  } catch {
    return false;
  }
}

export function normalizeInviteReturnPath(pathname: string, search: string): string {
  return `${pathname}${search}`;
}

export function setMemoryPendingReturnPath(path: string | null): void {
  memoryReturnPath = path && isInviteJoinPath(path) ? path : null;
}

export function getMemoryPendingReturnPath(): string | null {
  return memoryReturnPath;
}

export function resolvePostAuthDestination(
  returnTo?: string | null,
  pendingReturnPath?: string | null,
): string {
  const candidate = returnTo ?? pendingReturnPath ?? null;
  if (candidate && isInviteJoinPath(candidate)) {
    return candidate;
  }
  return '/groups';
}

export async function rememberPendingInvite(
  port: PendingInvitePort,
  returnPath: string,
  awaitingAccept: boolean,
): Promise<void> {
  if (!isInviteJoinPath(returnPath)) {
    return;
  }
  setMemoryPendingReturnPath(returnPath);
  await port.save({ returnPath, awaitingAccept });
}

export async function clearPendingInvite(port: PendingInvitePort): Promise<void> {
  setMemoryPendingReturnPath(null);
  await port.clear();
}

export async function hydratePendingInvite(
  port: PendingInvitePort,
): Promise<PendingInviteState | null> {
  const state = await port.load();
  if (state?.returnPath) {
    setMemoryPendingReturnPath(state.returnPath);
  }
  return state;
}
