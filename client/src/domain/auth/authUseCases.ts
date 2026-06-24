import type { ApiClient } from '@adapters/api/ApiClient';
import type { SessionPort, SessionState } from '@domain/session/SessionPort';
import { createExperienceBoxSessionMeta } from '@domain/session/experienceBoxSessionPolicy';

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  displayName: string;
  email: string;
  password: string;
}

interface AuthSessionResponse {
  token: string;
  participantId: string;
  displayName: string;
  accessMode: 'EXPERIENCES';
}

interface RegisterResponse {
  id: string;
  displayName: string;
  email: string;
  token: string;
}

interface GroupMemberResponse {
  participantId: string;
  displayName: string;
}

interface JointAuthSessionResponse {
  token: string;
  groupId: string;
  members: GroupMemberResponse[];
  accessMode: 'EXPERIENCE_BOX';
}

export class RegisterParticipantUseCase {
  constructor(
    private readonly api: ApiClient,
    private readonly sessionPort: SessionPort,
  ) {}

  async execute(input: RegisterInput): Promise<SessionState> {
    const response = await this.api.post<RegisterResponse>('/v1/participants', input);
    const session: SessionState = {
      token: response.token,
      accessMode: 'EXPERIENCES',
      participantId: response.id,
      displayName: response.displayName,
    };
    await this.sessionPort.save(session);
    return session;
  }
}

export class LoginExperiencesUseCase {
  constructor(
    private readonly api: ApiClient,
    private readonly sessionPort: SessionPort,
  ) {}

  async execute(input: LoginInput): Promise<SessionState> {
    const response = await this.api.post<AuthSessionResponse>('/v1/auth/login', input);
    const session: SessionState = {
      token: response.token,
      accessMode: 'EXPERIENCES',
      participantId: response.participantId,
      displayName: response.displayName,
    };
    await this.sessionPort.save(session);
    return session;
  }
}

export class LoginExperienceBoxUseCase {
  constructor(
    private readonly api: ApiClient,
    private readonly sessionPort: SessionPort,
  ) {}

  async execute(credentials: LoginInput[]): Promise<SessionState> {
    const response = await this.api.post<JointAuthSessionResponse>('/v1/auth/group', {
      credentials,
    });
    const session: SessionState = {
      token: response.token,
      accessMode: 'EXPERIENCE_BOX',
      groupId: response.groupId,
      members: response.members,
      displayName: response.members.map((member) => member.displayName).join(', '),
      experienceBox: createExperienceBoxSessionMeta(),
    };
    await this.sessionPort.save(session);
    return session;
  }
}

export class LogoutUseCase {
  constructor(private readonly sessionPort: SessionPort) {}

  async execute(): Promise<void> {
    await this.sessionPort.clear();
  }
}

export class ValidateInviteCodeFormatUseCase {
  execute(code: string): boolean {
    return /^[A-HJ-NP-Z2-9]{6}$/i.test(code.trim());
  }
}
