import { BOX_TYPES, type BoxType } from '@domain/box/boxTypes';
import { useI18n } from '../../i18n/I18nContext';
import { getBoxVisual } from '../components/boxVisuals';
import styles from './BoxTypePicker.module.css';

interface BoxTypePickerProps {
  value: BoxType;
  onChange: (type: BoxType) => void;
}

export function BoxTypePicker({ value, onChange }: BoxTypePickerProps) {
  const { t } = useI18n();

  return (
    <div className={styles.grid} role="radiogroup" aria-label={t('createBox.typeLabel')}>
      {BOX_TYPES.map((boxType) => {
        const { family, Icon } = getBoxVisual(boxType);
        const selected = value === boxType;

        return (
          <button
            key={boxType}
            type="button"
            role="radio"
            aria-checked={selected}
            className={styles.card}
            data-family={family}
            data-selected={selected ? 'true' : 'false'}
            onClick={() => onChange(boxType)}
          >
            <span className={styles.familyBadge}>{t(`boxTypes.families.${family}`)}</span>
            <span className={styles.iconWrap} aria-hidden="true">
              <Icon />
            </span>
            <strong className={styles.title}>{t(`boxTypes.${boxType}.title`)}</strong>
            <span className={styles.hint}>{t(`boxTypes.${boxType}.hint`)}</span>
          </button>
        );
      })}
    </div>
  );
}
