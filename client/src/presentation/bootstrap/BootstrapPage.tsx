import { useI18n } from '../../i18n/I18nContext';
import { BrandMark } from '../components/BrandMark';
import { Button } from '../components/Button';
import { useBootstrapFlow } from '@app/useBootstrapFlow';
import styles from './BootstrapPage.module.css';

export function BootstrapPage() {
  const { t } = useI18n();
  const { state, retry } = useBootstrapFlow();

  return (
    <main className={styles.page} aria-live="polite">
      <BrandMark variant="icon" size="lg" />
      <h1 className="srOnly">{t('app.name')}</h1>

      {state.status === 'loading' && (
        <p className={styles.message} aria-busy="true">
          {t('bootstrap.loading')}
        </p>
      )}

      {state.status === 'error' && (
        <div className={styles.errorBlock}>
          <p className={styles.message} role="alert">
            {t(state.errorMessage ?? 'bootstrap.error')}
          </p>
          <Button onClick={() => void retry()}>{t('bootstrap.retry')}</Button>
        </div>
      )}
    </main>
  );
}
