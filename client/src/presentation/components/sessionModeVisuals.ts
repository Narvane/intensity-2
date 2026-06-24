import type { LucideIcon } from 'lucide-react';
import { UserRound, UsersRound } from 'lucide-react';
import type { AccessMode } from '@domain/session/SessionPort';

export interface SessionModeVisual {
  icon: LucideIcon;
  accent: 'experiences' | 'experienceBox';
}

const SESSION_MODE_VISUALS: Record<AccessMode, SessionModeVisual> = {
  EXPERIENCES: {
    icon: UserRound,
    accent: 'experiences',
  },
  EXPERIENCE_BOX: {
    icon: UsersRound,
    accent: 'experienceBox',
  },
};

export function getSessionModeVisual(mode: AccessMode): SessionModeVisual {
  return SESSION_MODE_VISUALS[mode];
}
