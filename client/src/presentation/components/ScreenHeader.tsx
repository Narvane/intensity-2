import type { ReactNode } from 'react';
import styles from './ScreenHeader.module.css';

interface ScreenHeaderProps {
  leading?: ReactNode;
  trailing?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function ScreenHeader({ leading, trailing, children, className }: ScreenHeaderProps) {
  return (
    <header className={[styles.header, className ?? ''].filter(Boolean).join(' ')}>
      <div className={styles.leading}>{leading}</div>
      <div className={styles.body}>{children}</div>
      <div className={styles.trailing}>{trailing}</div>
    </header>
  );
}
