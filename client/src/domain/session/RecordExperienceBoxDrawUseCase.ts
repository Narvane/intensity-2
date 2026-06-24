import type { SessionPort, SessionState } from './SessionPort';
import {
  createExperienceBoxSessionMeta,
  isDrawLimitReached,
  recordSuccessfulDraw,
} from './experienceBoxSessionPolicy';

export class RecordExperienceBoxDrawUseCase {
  constructor(private readonly sessionPort: SessionPort) {}

  async execute(
    session: SessionState,
  ): Promise<{ session: SessionState; limitReached: boolean }> {
    if (session.accessMode !== 'EXPERIENCE_BOX') {
      return { session, limitReached: false };
    }

    const meta = session.experienceBox ?? createExperienceBoxSessionMeta();
    const drawCount = recordSuccessfulDraw(meta.drawCount);
    const updated: SessionState = {
      ...session,
      experienceBox: {
        ...meta,
        drawCount,
      },
    };

    await this.sessionPort.save(updated);
    return { session: updated, limitReached: isDrawLimitReached(drawCount) };
  }
}
