import type { GroupMember } from '@domain/box/boxTypes';
import styles from './GroupMemberPills.module.css';

interface GroupMemberPillsProps {
  members: GroupMember[];
  currentParticipantId?: string;
  ariaLabel: string;
}

export function GroupMemberPills({
  members,
  currentParticipantId,
  ariaLabel,
}: GroupMemberPillsProps) {
  if (members.length === 0) {
    return null;
  }

  return (
    <div className={styles.strip} aria-label={ariaLabel}>
      <ul className={styles.list}>
        {members.map((member) => {
          const isCurrent = member.participantId === currentParticipantId;

          return (
            <li
              key={member.participantId}
              className={`${styles.pill} ${isCurrent ? styles.pillCurrent : ''}`}
            >
              {member.displayName}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
