import { useOnlineStatus } from '@presentation/hooks/useOnlineStatus';
import { useI18n } from '../../i18n/I18nContext';
import styles from './OfflineBanner.module.css';

export function OfflineBanner() {
  const { t } = useI18n();
  const online = useOnlineStatus();

  if (online) {
    return null;
  }

  return (
    <div className={styles.banner} role="status">
      {t('common.offlineBanner')}
    </div>
  );
}
