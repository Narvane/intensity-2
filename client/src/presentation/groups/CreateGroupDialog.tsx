import { useModalDialog } from '@presentation/hooks/useModalDialog';
import { useI18n } from '../../i18n/I18nContext';
import { Button } from '../components/Button';
import styles from '../components/DestructiveConfirmDialog.module.css';

interface CreateGroupDialogProps {
  open: boolean;
  creating: boolean;
  error: string | null;
  onConfirm: () => void;
  onCancel: () => void;
}

export function CreateGroupDialog({
  open,
  creating,
  error,
  onConfirm,
  onCancel,
}: CreateGroupDialogProps) {
  const { t } = useI18n();
  const { dialogRef, cancelRef } = useModalDialog(open, onCancel, creating);

  if (!open) {
    return null;
  }

  return (
    <div
      className={styles.backdrop}
      role="presentation"
      onClick={creating ? undefined : onCancel}
    >
      <section
        ref={dialogRef}
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-group-title"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id="create-group-title">{t('groups.createDialog.title')}</h2>
        <p className={styles.message}>{t('groups.createDialog.message')}</p>

        {error && (
          <p className={styles.error} role="alert">
            {error}
          </p>
        )}

        <div className={styles.actions}>
          <Button ref={cancelRef} variant="secondary" fullWidth disabled={creating} onClick={onCancel}>
            {t('groups.createDialog.cancel')}
          </Button>
          <Button fullWidth disabled={creating} onClick={onConfirm}>
            {creating ? t('common.loading') : t('groups.createDialog.confirm')}
          </Button>
        </div>
      </section>
    </div>
  );
}
