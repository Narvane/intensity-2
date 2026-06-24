import { useEffect, useRef } from 'react';
import { useI18n } from '../../i18n/I18nContext';
import { NavButton } from '../components/NavButton';
import styles from './QuickGuideOverlay.module.css';

interface QuickGuideOverlayProps {
  open: boolean;
  onClose: () => void;
}

const SECTION_KEYS = ['rhythm', 'modes', 'draw', 'transparency'] as const;

export function QuickGuideOverlay({ open, onClose }: QuickGuideOverlayProps) {
  const { t } = useI18n();
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    closeButtonRef.current?.focus();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  return (
    <div className={styles.backdrop} role="presentation" onClick={onClose}>
      <section
        className={styles.panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby="quick-guide-title"
        onClick={(event) => event.stopPropagation()}
      >
        <header className={styles.header}>
          <h2 id="quick-guide-title">{t('quickGuide.title')}</h2>
          <NavButton ref={closeButtonRef} action="close" onClick={onClose} />
        </header>

        <div className={styles.content}>
          {SECTION_KEYS.map((key) => (
            <article key={key} className={styles.section}>
              <h3>{t(`quickGuide.sections.${key}.title`)}</h3>
              {key === 'modes' ? (
                <ul>
                  <li>{t('quickGuide.sections.modes.experiences')}</li>
                  <li>{t('quickGuide.sections.modes.experienceBox')}</li>
                </ul>
              ) : (
                <p>{t(`quickGuide.sections.${key}.body`)}</p>
              )}
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
