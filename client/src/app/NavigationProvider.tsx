import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react';
import { createDefaultNavigationAdapter } from '@adapters/navigation/NavigationPreferencesAdapter';
import type { NavigationPort, NavigationState } from '@domain/navigation/NavigationPort';

interface NavigationContextValue {
  navigation: NavigationState;
  loading: boolean;
  setNavigation: (state: NavigationState) => Promise<void>;
  clearNavigation: () => Promise<void>;
}

const NavigationContext = createContext<NavigationContextValue | null>(null);

interface NavigationProviderProps extends PropsWithChildren {
  navigationPort?: NavigationPort;
}

export function NavigationProvider({ children, navigationPort }: NavigationProviderProps) {
  const port = useMemo(() => navigationPort ?? createDefaultNavigationAdapter(), [navigationPort]);
  const [navigation, setNavigationState] = useState<NavigationState>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    port
      .load()
      .then((state) => setNavigationState(state))
      .finally(() => setLoading(false));
  }, [port]);

  const setNavigation = useCallback(
    async (state: NavigationState) => {
      await port.save(state);
      setNavigationState(state);
    },
    [port],
  );

  const clearNavigation = useCallback(async () => {
    await port.clear();
    setNavigationState({});
  }, [port]);

  const value = useMemo(
    () => ({ navigation, loading, setNavigation, clearNavigation }),
    [navigation, loading, setNavigation, clearNavigation],
  );

  return <NavigationContext.Provider value={value}>{children}</NavigationContext.Provider>;
}

export function useNavigation(): NavigationContextValue {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within NavigationProvider');
  }
  return context;
}
