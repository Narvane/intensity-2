import { FlipHorizontal2, Pencil, Trash2 } from 'lucide-react';
import type { Experience } from '@domain/experience/experienceTypes';
import {
  canManageExperience,
  hasRevealableAuthorContent,
} from '@domain/experience/experienceVisibility';
import { useI18n } from '../../i18n/I18nContext';
import { ExperienceContentBlock } from '../components/ExperienceContentBlock';
import { ExperienceSummaryMeta } from '../components/ExperienceSummaryMeta';
import styles from './ExperienceCard.module.css';

interface ExperienceCardProps {
  experience: Experience;
  participantId?: string;
  flipped?: boolean;
  onFlipToggle?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function ExperienceCard({
  experience,
  participantId,
  flipped = false,
  onFlipToggle,
  onEdit,
  onDelete,
}: ExperienceCardProps) {
  const { t } = useI18n();
  const isAuthor = canManageExperience(experience, participantId);
  const canFlip = isAuthor && hasRevealableAuthorContent(experience);

  if (canFlip) {
    return (
      <article className={styles.card}>
        <button
          type="button"
          className={styles.flipButton}
          aria-pressed={flipped}
          aria-label={flipped ? t('experiences.unflipCard') : t('experiences.flipCard')}
          onClick={onFlipToggle}
        >
          <FlipHorizontal2 size={20} strokeWidth={2.25} aria-hidden />
        </button>

        <div className={styles.flipShell}>
          <div className={styles.flipInner} data-flipped={flipped ? 'true' : 'false'}>
            <div className={styles.front}>
              <ExperienceSummaryMeta experience={experience} variant="experienceList" />
              <div className={styles.actions}>
                <button type="button" className={styles.actionButton} onClick={onEdit}>
                  <Pencil size={18} strokeWidth={2.25} aria-hidden />
                  <span>{t('experiences.edit')}</span>
                </button>
                <button type="button" className={styles.actionButton} onClick={onDelete}>
                  <Trash2 size={18} strokeWidth={2.25} aria-hidden />
                  <span>{t('experiences.delete')}</span>
                </button>
              </div>
            </div>

            <div className={styles.back}>
              <ExperienceContentBlock experience={experience} />
            </div>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className={styles.card}>
      <div className={styles.staticBody}>
        <ExperienceSummaryMeta experience={experience} variant="experienceList" />

        {!isAuthor && experience.summaryOnly && (
          <p className={styles.summary}>
            {t('experiences.otherSummary', {
              author: experience.authorDisplayName ?? t('experiences.anonymous'),
            })}
          </p>
        )}

        {isAuthor && (
          <div className={styles.actions}>
            <button type="button" className={styles.actionButton} onClick={onEdit}>
              <Pencil size={18} strokeWidth={2.25} aria-hidden />
              <span>{t('experiences.edit')}</span>
            </button>
            <button type="button" className={styles.actionButton} onClick={onDelete}>
              <Trash2 size={18} strokeWidth={2.25} aria-hidden />
              <span>{t('experiences.delete')}</span>
            </button>
          </div>
        )}
      </div>
    </article>
  );
}
