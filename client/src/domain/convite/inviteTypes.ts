export type InviteStatus = 'ACTIVE' | 'ACCEPTED' | 'REVOKED' | 'EXPIRED';

export interface GroupMember {
  participantId: string;
  displayName: string;
}

export interface Invite {
  id: string;
  groupId: string;
  code: string;
  linkToken: string;
  expiresAt: string;
  status: InviteStatus;
  createdAt: string;
}

export interface InvitePreview {
  inviteId: string;
  groupId: string;
  members: GroupMember[];
  expiresAt: string;
  status: InviteStatus;
}

export interface AcceptInviteResult {
  groupId: string;
  membershipConfirmed: boolean;
}
