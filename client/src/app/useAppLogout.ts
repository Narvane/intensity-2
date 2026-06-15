import { useNavigate } from 'react-router-dom';
import { useNavigation } from './NavigationProvider';
import { useSession } from './SessionProvider';

export function useAppLogout() {
  const { logout } = useSession();
  const { clearNavigation } = useNavigation();
  const navigate = useNavigate();

  return async () => {
    await logout();
    await clearNavigation();
    navigate('/auth', { replace: true });
  };
}
