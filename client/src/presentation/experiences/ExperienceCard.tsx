import { useState } from 'react';
import { Eye, EyeOff, Pencil, Trash2 } from 'lucide-react';
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
  onEdit?: () => void;
  onDelete?: () => void;
}

export function ExperienceCard({
  experience,
  participantId,
  onEdit,
  onDelete,
}: ExperienceCardProps) {
  const { t } = useI18n();
  const isAuthor = canManageExperience(experience, participantId);
  const [contentRevealed, setContentRevealed] = useState(false);
  const canReveal = isAuthor && hasRevealableAuthorContent(experience);

  return (
    <article className={styles.card}>
      <div className={styles.metaRow}>
        <ExperienceSummaryMeta experience={experience} />
        {canReveal && (
          <button
            type="button"
            className={styles.revealButton}
            aria-pressed={contentRevealed}
            aria-label={
              contentRevealed
                ? t('experiences.hideDescription')
                : t('experiences.revealDescription')
            }
            onClick={() => setContentRevealed((current) => !current)}
          >
            {contentRevealed ? (
              <EyeOff size={20} strokeWidth={2.25} aria-hidden />
            ) : (
              <Eye size={20} strokeWidth={2.25} aria-hidden />
            )}
          </button>
        )}
      </div>

      {!isAuthor && experience.summaryOnly && (
        <p className={styles.summary}>
          {t('experiences.otherSummary', {
            author: experience.authorDisplayName ?? t('experiences.anonymous'),
          })}
        </p>
      )}

      {contentRevealed && canReveal && (
        <div className={styles.revealedContent}>
          <ExperienceContentBlock experience={experience} />
        </div>
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
    </article>
  );
}
