import type { DrawResult } from '@domain/sorteio/ExecutarSorteioUseCase';

export type DrawPhase = 'idle' | 'drawn' | 'revealed';

export interface DrawSession {
  phase: DrawPhase;
  result: DrawResult | null;
}

export class RevelacaoOrchestrator {
  createIdleSession(): DrawSession {
    return { phase: 'idle', result: null };
  }

  applyDraw(_session: DrawSession, result: DrawResult): DrawSession {
    return { phase: 'drawn', result };
  }

  reveal(session: DrawSession): DrawSession {
    if (!session.result || session.phase !== 'drawn') {
      return session;
    }

    return { phase: 'revealed', result: session.result };
  }

  backToDraw(): DrawSession {
    return this.createIdleSession();
  }
}
