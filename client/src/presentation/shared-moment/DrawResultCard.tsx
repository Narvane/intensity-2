import type { Experience } from '@domain/experience/experienceTypes';
import { useI18n } from '../../i18n/I18nContext';
import { ExperienceContentBlock } from '../components/ExperienceContentBlock';
import { ExperienceSummaryMeta } from '../components/ExperienceSummaryMeta';
import styles from './DrawResultCard.module.css';

interface DrawResultCardProps {
  experience: Experience;
  revealed: boolean;
}

export function DrawResultCard({ experience, revealed }: DrawResultCardProps) {
  const { t } = useI18n();

  return (
    <div className={styles.wrapper}>
      <div className={`${styles.card} ${revealed ? styles.revealed : ''}`}>
        <div className={styles.inner}>
          <div className={styles.cover} data-intensity={experience.intensity}>
            <p className={styles.coverLabel}>{t('sharedMoment.coverLabel')}</p>
            <ExperienceSummaryMeta experience={experience} compact />
          </div>

          <div className={styles.face}>
            <ExperienceContentBlock experience={experience} />
          </div>
        </div>
      </div>
    </div>
  );
}
