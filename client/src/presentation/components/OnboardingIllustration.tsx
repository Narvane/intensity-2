import styles from './OnboardingIllustration.module.css';
import { Coffee, HeartHandshake, MapPinned, Sparkles } from 'lucide-react';

const STEP_THEMES = [
  styles.step1,
  styles.step2,
  styles.step3,
  styles.step4,
] as const;

interface OnboardingIllustrationProps {
  step: number;
}

export function OnboardingIllustration({ step }: OnboardingIllustrationProps) {
  const theme = STEP_THEMES[step - 1] ?? STEP_THEMES[0];
  const Icon = [Coffee, HeartHandshake, MapPinned, Sparkles][step - 1] ?? Coffee;

  return (
    <div className={`${styles.frame} ${theme}`} aria-hidden="true">
      <div className={styles.sun} />
      <div className={styles.card}>
        <Icon />
      </div>
      <div className={styles.friendA} />
      <div className={styles.friendB} />
    </div>
  );
}
