import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react';
import { createApiClient } from '@adapters/api/ApiClient';
import { createDefaultSessionAdapter } from '@adapters/session/SessionPreferencesAdapter';
import { LogoutUseCase } from '@domain/auth/authUseCases';
import { setExperienceBoxSessionEndReason } from '@domain/session/experienceBoxSessionEnd';
import { isDrawLimitReached } from '@domain/session/experienceBoxSessionPolicy';
import type { SessionPort, SessionState } from '@domain/session/SessionPort';

interface SessionContextValue {
  session: SessionState | null;
  loading: boolean;
  invalid: boolean;
  refresh: () => Promise<void>;
  saveSession: (session: SessionState) => Promise<void>;
  logout: () => Promise<void>;
}

const SessionContext = createContext<SessionContextValue | null>(null);

interface SessionProviderProps extends PropsWithChildren {
  sessionPort?: SessionPort;
}

export function SessionProvider({ children, sessionPort }: SessionProviderProps) {
  const port = useMemo(() => sessionPort ?? createDefaultSessionAdapter(), [sessionPort]);
  const logoutUseCase = useMemo(() => new LogoutUseCase(port), [port]);
  const [session, setSession] = useState<SessionState | null>(null);
  const [loading, setLoading] = useState(true);
  const [invalid, setInvalid] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const stored = await port.load();
      if (!stored?.token || !stored.accessMode) {
        setSession(null);
        setInvalid(Boolean(stored));
        return;
      }

      if (
        stored.accessMode === 'EXPERIENCE_BOX' &&
        isDrawLimitReached(stored.experienceBox?.drawCount ?? 0)
      ) {
        setExperienceBoxSessionEndReason('draw_limit');
        await port.clear();
        setSession(null);
        setInvalid(false);
        return;
      }

      setSession(stored);
      setInvalid(false);
    } catch {
      setSession(null);
      setInvalid(true);
    } finally {
      setLoading(false);
    }
  }, [port]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const saveSession = useCallback(
    async (next: SessionState) => {
      await port.save(next);
      setSession(next);
      setInvalid(false);
    },
    [port],
  );

  const logout = useCallback(async () => {
    await logoutUseCase.execute();
    setSession(null);
    setInvalid(false);
  }, [logoutUseCase]);

  const value = useMemo(
    () => ({ session, loading, invalid, refresh, saveSession, logout }),
    [session, loading, invalid, refresh, saveSession, logout],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionContextValue {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession must be used within SessionProvider');
  }
  return context;
}

export { createApiClient, createDefaultSessionAdapter };
