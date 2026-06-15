import { useEffect, useRef } from 'react';
import type { Box } from '@domain/box/boxTypes';
import { useI18n } from '../../i18n/I18nContext';
import { Button } from '../components/Button';
import styles from './DeleteBoxDialog.module.css';

interface DeleteBoxDialogProps {
  box: Box | null;
  deleting: boolean;
  error: string | null;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeleteBoxDialog({
  box,
  deleting,
  error,
  onConfirm,
  onCancel,
}: DeleteBoxDialogProps) {
  const { t } = useI18n();
  const cancelButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!box) {
      return;
    }

    cancelButtonRef.current?.focus();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !deleting) {
        onCancel();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [box, deleting, onCancel]);

  if (!box) {
    return null;
  }

  return (
    <div className={styles.backdrop} role="presentation" onClick={deleting ? undefined : onCancel}>
      <section
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-box-title"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id="delete-box-title">{t('boxHome.deleteDialog.title', { name: box.name })}</h2>
        <p className={styles.message}>
          {t('boxHome.deleteDialog.message', {
            count: String(box.experienceCount),
          })}
        </p>

        {error && (
          <p className={styles.error} role="alert">
            {error}
          </p>
        )}

        <div className={styles.actions}>
          <Button ref={cancelButtonRef} variant="secondary" fullWidth disabled={deleting} onClick={onCancel}>
            {t('boxHome.deleteDialog.cancel')}
          </Button>
          <Button fullWidth disabled={deleting} className={styles.danger} onClick={onConfirm}>
            {deleting ? t('common.loading') : t('boxHome.deleteDialog.confirm')}
          </Button>
        </div>
      </section>
    </div>
  );
}
