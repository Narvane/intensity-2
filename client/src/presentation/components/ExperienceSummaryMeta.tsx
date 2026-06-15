import type { Experience } from '@domain/experience/experienceTypes';
import { IntensityBadge } from './IntensityBadge';
import { ParameterRow } from './ParameterRow';
import styles from './ExperienceSummaryMeta.module.css';

interface ExperienceSummaryMetaProps {
  experience: Experience;
  compact?: boolean;
}

export function ExperienceSummaryMeta({ experience, compact = false }: ExperienceSummaryMetaProps) {
  return (
    <div className={compact ? styles.compact : styles.meta}>
      <IntensityBadge level={experience.intensity} />
      <ParameterRow parameters={experience.parameters} />
      <span className={styles.seal}>{experience.seal}</span>
    </div>
  );
}
