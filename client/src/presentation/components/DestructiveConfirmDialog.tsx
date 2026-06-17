import { useModalDialog } from '@presentation/hooks/useModalDialog';
import { useI18n } from '../../i18n/I18nContext';
import { Button } from './Button';
import styles from './DestructiveConfirmDialog.module.css';

interface DestructiveConfirmDialogProps {
  open: boolean;
  titleId: string;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel: string;
  confirming: boolean;
  error: string | null;
  offlineBlocked?: boolean;
  offlineMessage?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DestructiveConfirmDialog({
  open,
  titleId,
  title,
  message,
  confirmLabel,
  cancelLabel,
  confirming,
  error,
  offlineBlocked = false,
  offlineMessage,
  onConfirm,
  onCancel,
}: DestructiveConfirmDialogProps) {
  const { t } = useI18n();
  const { dialogRef, cancelRef } = useModalDialog(open, onCancel, confirming);

  if (!open) {
    return null;
  }

  return (
    <div
      className={styles.backdrop}
      role="presentation"
      onClick={confirming ? undefined : onCancel}
    >
      <section
        ref={dialogRef}
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id={titleId}>{title}</h2>
        <p className={styles.message}>{message}</p>

        {offlineBlocked && offlineMessage && (
          <p className={styles.offlineHint} role="status">
            {offlineMessage}
          </p>
        )}

        {error && (
          <p className={styles.error} role="alert">
            {error}
          </p>
        )}

        <div className={styles.actions}>
          <Button ref={cancelRef} variant="secondary" fullWidth disabled={confirming} onClick={onCancel}>
            {cancelLabel}
          </Button>
          <Button
            variant="danger"
            fullWidth
            disabled={confirming || offlineBlocked}
            onClick={onConfirm}
          >
            {confirming ? t('common.loading') : confirmLabel}
          </Button>
        </div>
      </section>
    </div>
  );
}
