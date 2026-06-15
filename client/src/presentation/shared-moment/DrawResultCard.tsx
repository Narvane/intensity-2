import type { Experience } from '@domain/experience/experienceTypes';
import { useI18n } from '../../i18n/I18nContext';
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
            <p className={styles.intensity}>
              {t('experiences.intensityLabel', { level: experience.intensity })}
            </p>
            <p className={styles.params}>
              {t('experiences.paramsSummary', {
                effort: experience.parameters.effort,
                openness: experience.parameters.openness,
                novelty: experience.parameters.novelty,
              })}
            </p>
            <p className={styles.seal}>
              {t('experiences.sealLabel')}: {experience.seal}
            </p>
          </div>

          <div className={styles.face}>
            <p className={styles.author}>
              {t('sharedMoment.byAuthor', {
                author: experience.authorDisplayName ?? t('experiences.anonymous'),
              })}
            </p>
            <p className={styles.description}>{experience.description}</p>
            {experience.reflection && (
              <p className={styles.reflection}>{experience.reflection}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
