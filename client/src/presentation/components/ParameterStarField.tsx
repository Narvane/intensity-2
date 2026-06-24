import type { ExperienceParameters } from '@domain/experience/experienceTypes';
import { useI18n } from '../../i18n/I18nContext';
import { getParameterVisual, type ParameterKey } from './parameterVisuals';
import { StarRating } from './StarRating';
import styles from './ParameterStarField.module.css';

interface ParameterStarFieldProps {
  parameterKey: ParameterKey;
  value: number;
  onChange?: (value: number) => void;
  showHint?: boolean;
  layout?: 'picker' | 'cover' | 'inline' | 'list' | 'listCompact' | 'drawCover' | 'wizard';
}

export function ParameterStarField({
  parameterKey,
  value,
  onChange,
  showHint = false,
  layout = 'picker',
}: ParameterStarFieldProps) {
  const { t } = useI18n();
  const visual = getParameterVisual(parameterKey);
  const ParameterIcon = visual.Icon;
  const label = t(`assistant.fields.${parameterKey}`);
  const hint = showHint ? t(`parameters.${parameterKey}.hints.${value}`) : null;
  const readOnly = !onChange;
  const starRating = (
    <StarRating
      parameterKey={parameterKey}
      value={value}
      label={label}
      readOnly={readOnly}
      onChange={onChange}
      size={
        layout === 'drawCover' || layout === 'listCompact'
          ? 'xs'
          : layout === 'cover' || layout === 'inline' || layout === 'list' || layout === 'wizard'
            ? 'sm'
            : 'md'
      }
    />
  );

  return (
    <div
      className={`${styles.field} ${styles[layout]}`}
      data-param={parameterKey}
    >
      <div className={styles.icon} aria-hidden="true">
        <ParameterIcon />
      </div>
      <p className={styles.label}>{label}</p>
      {layout === 'wizard' ? (
        <div className={styles.ratingSlot}>{starRating}</div>
      ) : (
        starRating
      )}
      {hint && (
        <p className={styles.hint} aria-live="polite">
          {hint}
        </p>
      )}
    </div>
  );
}

interface ParameterStarsGroupProps {
  parameters: ExperienceParameters;
  layout?: 'inline' | 'cover' | 'list' | 'listCompact' | 'drawCover';
}

export function ParameterStarsGroup({ parameters, layout = 'inline' }: ParameterStarsGroupProps) {
  const { t } = useI18n();
  const groupClass =
    layout === 'drawCover'
      ? styles.drawCoverGroup
      : layout === 'cover'
        ? styles.coverGroup
        : layout === 'listCompact'
          ? styles.listCompactGroup
          : layout === 'list'
            ? styles.listGroup
            : styles.inlineGroup;
  const itemLayout =
    layout === 'drawCover'
      ? 'drawCover'
      : layout === 'cover'
        ? 'cover'
        : layout === 'listCompact'
          ? 'listCompact'
          : layout === 'list'
            ? 'list'
            : 'inline';

  return (
    <div className={groupClass} aria-label={t('intensity.parametersLabel')}>
      {(['effort', 'openness', 'novelty'] as ParameterKey[]).map((key) => (
        <ParameterStarField
          key={key}
          parameterKey={key}
          value={parameters[key]}
          layout={itemLayout}
        />
      ))}
    </div>
  );
}
