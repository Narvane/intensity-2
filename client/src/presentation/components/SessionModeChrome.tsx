import type { SessionMember } from '@domain/session/SessionPort';
import type { AccessMode } from '@domain/session/SessionPort';
import { useI18n } from '../../i18n/I18nContext';
import { getSessionModeVisual } from './sessionModeVisuals';
import styles from './SessionModeChrome.module.css';

interface SessionModeChromeProps {
  mode: AccessMode;
  title: string;
  participantDisplayName?: string;
  members?: SessionMember[];
}

export function SessionModeChrome({
  mode,
  title,
  participantDisplayName,
  members,
}: SessionModeChromeProps) {
  const { t } = useI18n();
  const visual = getSessionModeVisual(mode);
  const ModeIcon = visual.icon;
  const isExperiences = mode === 'EXPERIENCES';
  const modeLabel = t(isExperiences ? 'session.experiencesMode' : 'session.experienceBoxMode');
  const modeSubtitle = t(
    isExperiences ? 'session.experiencesSubtitle' : 'session.experienceBoxSubtitle',
  );

  return (
    <div className={styles.chrome} data-accent={visual.accent}>
      <div className={styles.modeRow}>
        <div className={styles.iconBadge} aria-hidden="true">
          <ModeIcon />
        </div>
        <div className={styles.modeCopy}>
          <p className={styles.modeLabel}>{modeLabel}</p>
          <p className={styles.modeSubtitle}>{modeSubtitle}</p>
        </div>
      </div>

      {isExperiences && participantDisplayName && (
        <p className={styles.greeting}>{t('session.greeting', { name: participantDisplayName })}</p>
      )}

      {!isExperiences && members && members.length > 0 && (
        <div className={styles.roomContext}>
          <p className={styles.roomLabel}>{t('session.roomLabel')}</p>
          <ul className={styles.memberList} aria-label={t('session.roomLabel')}>
            {members.map((member) => (
              <li key={member.participantId} className={styles.memberChip}>
                {member.displayName}
              </li>
            ))}
          </ul>
        </div>
      )}

      <h1 className={styles.title}>{title}</h1>
    </div>
  );
}
