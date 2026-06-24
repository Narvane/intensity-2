import type { Experience } from '@domain/experience/experienceTypes';
import styles from './ExperienceContentBlock.module.css';

interface ExperienceContentBlockProps {
  experience: Experience;
}

export function ExperienceContentBlock({ experience }: ExperienceContentBlockProps) {
  return (
    <div className={styles.block}>
      {experience.description && <p className={styles.description}>{experience.description}</p>}
      {experience.reflection && <p className={styles.reflection}>{experience.reflection}</p>}
    </div>
  );
}
