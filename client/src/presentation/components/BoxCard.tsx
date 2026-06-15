import type { BoxType } from '@domain/box/boxTypes';
import styles from './BoxCard.module.css';

interface BoxCardProps {
  name: string;
  type: BoxType;
  typeLabel: string;
  typeHint: string;
  experienceCount?: number;
  onClick?: () => void;
}

export function BoxCard({
  name,
  type,
  typeLabel,
  typeHint,
  experienceCount,
  onClick,
}: BoxCardProps) {
  return (
    <button type="button" className={styles.card} data-type={type} onClick={onClick}>
      <span className={styles.seal} aria-hidden="true">
        {typeLabel.slice(0, 1)}
      </span>
      <strong className={styles.name}>{name}</strong>
      <span className={styles.type}>{typeLabel}</span>
      <span className={styles.hint}>{typeHint}</span>
      {experienceCount !== undefined && (
        <span className={styles.count}>{experienceCount}</span>
      )}
    </button>
  );
}
