import { useNavigate } from 'react-router-dom';
import { setExperienceBoxSessionEndReason } from '@domain/session/experienceBoxSessionEnd';
import type { ExperienceBoxSessionEndReason } from '@domain/session/experienceBoxSessionEnd';
import { useNavigation } from './NavigationProvider';
import { useSession } from './SessionProvider';

export function useExperienceBoxSessionEnd() {
  const { logout } = useSession();
  const { clearNavigation } = useNavigation();
  const navigate = useNavigate();

  return async (reason: ExperienceBoxSessionEndReason) => {
    setExperienceBoxSessionEndReason(reason);
    await logout();
    await clearNavigation();
    navigate('/auth', { replace: true, state: { panel: 'experienceBox' } });
  };
}
