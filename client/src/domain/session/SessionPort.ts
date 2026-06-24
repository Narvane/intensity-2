export type AccessMode = 'EXPERIENCES' | 'EXPERIENCE_BOX';

export interface SessionMember {
  participantId: string;
  displayName: string;
}

export interface SessionState {
  token: string;
  accessMode: AccessMode;
  participantId?: string;
  displayName?: string;
  groupId?: string;
  members?: SessionMember[];
  experienceBox?: {
    drawCount: number;
    sessionStartedAt: string;
  };
}

export interface SessionPort {
  load(): Promise<SessionState | null>;
  save(session: SessionState): Promise<void>;
  clear(): Promise<void>;
}
