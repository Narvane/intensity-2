import { useI18n } from '../../i18n/I18nContext';
import { BadgeCheck } from 'lucide-react';
import styles from './IntegritySeal.module.css';

interface IntegritySealProps {
  seal: string;
  compact?: boolean;
}

export function IntegritySeal({ seal, compact = false }: IntegritySealProps) {
  const { t } = useI18n();

  return (
    <div
      className={compact ? styles.compact : styles.seal}
      title={t('seal.hint')}
      aria-label={`${t('seal.label')}: ${seal}`}
    >
      <BadgeCheck className={styles.icon} aria-hidden="true" />
      <span className={styles.label}>{t('seal.label')}</span>
      <span className={styles.value}>{seal}</span>
    </div>
  );
}
