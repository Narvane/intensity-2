import { Preferences } from '@capacitor/preferences';
import type { NavigationPort, NavigationState } from '@domain/navigation/NavigationPort';

const NAVIGATION_KEY = 'navigation';

export class NavigationPreferencesAdapter implements NavigationPort {
  async load(): Promise<NavigationState> {
    const { value } = await Preferences.get({ key: NAVIGATION_KEY });
    if (!value) {
      return {};
    }

    try {
      return JSON.parse(value) as NavigationState;
    } catch {
      return {};
    }
  }

  async save(state: NavigationState): Promise<void> {
    await Preferences.set({ key: NAVIGATION_KEY, value: JSON.stringify(state) });
  }

  async clear(): Promise<void> {
    await Preferences.remove({ key: NAVIGATION_KEY });
  }
}

export function createDefaultNavigationAdapter(): NavigationPort {
  return new NavigationPreferencesAdapter();
}
