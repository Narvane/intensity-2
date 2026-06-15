import type { ExperienceParameters } from '@domain/experience/experienceTypes';
import { useI18n } from '../../i18n/I18nContext';
import styles from './ParameterRow.module.css';

interface ParameterRowProps {
  parameters: ExperienceParameters;
}

export function ParameterRow({ parameters }: ParameterRowProps) {
  const { t } = useI18n();

  return (
    <div className={styles.row} aria-label={t('intensity.parametersLabel')}>
      <span className={styles.item} data-param="effort">
        <span className={styles.dot} aria-hidden="true" />
        {t('assistant.fields.effort')} {parameters.effort}
      </span>
      <span className={styles.item} data-param="openness">
        <span className={styles.dot} aria-hidden="true" />
        {t('assistant.fields.openness')} {parameters.openness}
      </span>
      <span className={styles.item} data-param="novelty">
        <span className={styles.dot} aria-hidden="true" />
        {t('assistant.fields.novelty')} {parameters.novelty}
      </span>
    </div>
  );
}
