import styles from './RatingScale.module.css';

interface RatingScaleProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  tone?: 'default' | 'intensity' | 'effort' | 'openness' | 'novelty';
}

export function RatingScale({ label, value, onChange, tone = 'default' }: RatingScaleProps) {
  return (
    <div className={styles.field}>
      <span className={styles.label}>{label}</span>
      <div className={styles.scale} role="group" aria-label={label}>
        {[1, 2, 3, 4, 5].map((level) => (
          <button
            key={level}
            type="button"
            data-intensity={tone === 'intensity' ? level : undefined}
            className={[
              level === value ? styles.active : styles.inactive,
              tone === 'intensity' ? styles.intensityButton : '',
              tone === 'effort' ? styles.paramEffort : '',
              tone === 'openness' ? styles.paramOpenness : '',
              tone === 'novelty' ? styles.paramNovelty : '',
            ]
              .filter(Boolean)
              .join(' ')}
            aria-pressed={level === value}
            onClick={() => onChange(level)}
          >
            {level}
          </button>
        ))}
      </div>
    </div>
  );
}
