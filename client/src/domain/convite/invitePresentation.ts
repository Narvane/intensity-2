import type { Invite } from '@domain/convite/inviteTypes';

const DEFAULT_INVITE_BASE_URL = 'https://app.intensity.example/join';

export function buildInviteLink(linkToken: string, baseUrl = import.meta.env.VITE_INVITE_BASE_URL): string {
  const resolvedBase = (baseUrl || DEFAULT_INVITE_BASE_URL).replace(/\/$/, '');
  return `${resolvedBase}?t=${linkToken}`;
}

export function buildInviteShareMessage(
  invite: Pick<Invite, 'code' | 'linkToken'>,
  t: (key: string, params?: Record<string, string>) => string,
): string {
  const link = buildInviteLink(invite.linkToken);
  return t('invite.share.message', { link, code: invite.code });
}

export function formatInviteExpiry(isoDate: string, locale: string): string {
  return new Intl.DateTimeFormat(locale, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(isoDate));
}
