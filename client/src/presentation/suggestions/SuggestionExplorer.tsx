import { useEffect, useState } from 'react';
import { ChevronRight } from 'lucide-react';
import type { BoxType } from '@domain/box/boxTypes';
import {
  pickRandomSuggestion,
  type ExperienceSuggestion,
  type SuggestionIntensity,
} from '../../content/suggestion-packs';
import { useI18n } from '../../i18n/I18nContext';
import styles from './SuggestionExplorer.module.css';

interface SuggestionExplorerProps {
  boxType: BoxType;
  onAccept: (suggestion: ExperienceSuggestion) => void;
}

const INTENSITY_LEVELS: SuggestionIntensity[] = [1, 2, 3, 4, 5];

export function SuggestionExplorer({ boxType, onAccept }: SuggestionExplorerProps) {
  const { t, locale } = useI18n();
  const [filterIntensity, setFilterIntensity] = useState<SuggestionIntensity>(1);
  const [current, setCurrent] = useState<ExperienceSuggestion | null>(null);

  useEffect(() => {
    setCurrent(pickRandomSuggestion(locale, boxType, filterIntensity));
  }, [boxType, filterIntensity, locale]);

  const showAnother = () => {
    setCurrent(pickRandomSuggestion(locale, boxType, filterIntensity, current?.id));
  };

  if (!current) {
    return null;
  }

  return (
    <aside className={styles.explorer} aria-label={t('assistant.steps.suggestion.title')}>
      <div className={styles.toolbar}>
        <span className={styles.toolbarLabel}>{t('suggestions.explorer.auxLabel')}</span>
        <div className={styles.chips} role="group" aria-label={t('suggestions.explorer.filterLabel')}>
          {INTENSITY_LEVELS.map((level) => (
            <button
              key={level}
              type="button"
              className={level === filterIntensity ? styles.chipActive : styles.chip}
              aria-pressed={level === filterIntensity}
              onClick={() => setFilterIntensity(level)}
            >
              {level}
            </button>
          ))}
        </div>
      </div>

      <blockquote className={styles.quote} aria-live="polite">
        {current.description}
      </blockquote>

      <div className={styles.actions}>
        <button type="button" className={styles.skipButton} onClick={showAnother}>
          <ChevronRight size={15} aria-hidden />
          {t('suggestions.explorer.another')}
        </button>
        <button type="button" className={styles.pickButton} onClick={() => onAccept(current)}>
          {t('suggestions.explorer.use')}
        </button>
      </div>
    </aside>
  );
}
