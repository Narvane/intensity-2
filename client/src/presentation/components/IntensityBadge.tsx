import { useI18n } from '../../i18n/I18nContext';
import styles from './IntensityBadge.module.css';

interface IntensityBadgeProps {
  level: number;
  showLevelNumber?: boolean;
}

export function IntensityBadge({ level, showLevelNumber = true }: IntensityBadgeProps) {
  const { t } = useI18n();
  const name = t(`intensity.levels.${level}`);

  return (
    <span className={styles.badge} data-intensity={level}>
      {showLevelNumber
        ? t('intensity.levelNamed', { level, name })
        : name}
    </span>
  );
}
