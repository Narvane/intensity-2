import type { AccessMode } from '@domain/session/SessionPort';
import { useI18n } from '../../i18n/I18nContext';
import { getSessionModeVisual } from './sessionModeVisuals';
import styles from './AuthModeIntro.module.css';

interface AuthModeIntroProps {
  mode: Extract<AccessMode, 'EXPERIENCES' | 'EXPERIENCE_BOX'>;
}

export function AuthModeIntro({ mode }: AuthModeIntroProps) {
  const { t } = useI18n();
  const visual = getSessionModeVisual(mode);
  const ModeIcon = visual.icon;
  const copyKey = mode === 'EXPERIENCES' ? 'experiences' : 'experienceBox';

  return (
    <div className={styles.intro} data-accent={visual.accent}>
      <div className={styles.iconBadge} aria-hidden="true">
        <ModeIcon />
      </div>
      <div className={styles.copy}>
        <p className={styles.kicker}>{t(`auth.${copyKey}.title`)}</p>
        <h1 className={styles.product}>{t(`auth.${copyKey}.product`)}</h1>
        <p className={styles.subtitle}>{t(`auth.${copyKey}.subtitle`)}</p>
      </div>
    </div>
  );
}
