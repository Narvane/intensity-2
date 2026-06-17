import type { Experience } from '@domain/experience/experienceTypes';
import { useI18n } from '../../i18n/I18nContext';
import { useOnlineStatus } from '@presentation/hooks/useOnlineStatus';
import { DestructiveConfirmDialog } from '../components/DestructiveConfirmDialog';

interface DeleteExperienceDialogProps {
  experience: Experience | null;
  deleting: boolean;
  error: string | null;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeleteExperienceDialog({
  experience,
  deleting,
  error,
  onConfirm,
  onCancel,
}: DeleteExperienceDialogProps) {
  const { t } = useI18n();
  const online = useOnlineStatus();

  return (
    <DestructiveConfirmDialog
      open={Boolean(experience)}
      titleId="delete-experience-title"
      title={t('experiences.deleteDialog.title')}
      message={t('experiences.deleteDialog.message')}
      confirmLabel={t('experiences.deleteDialog.confirm')}
      cancelLabel={t('experiences.deleteDialog.cancel')}
      confirming={deleting}
      error={error}
      offlineBlocked={!online}
      offlineMessage={t('common.offlineDestructiveBlocked')}
      onConfirm={onConfirm}
      onCancel={onCancel}
    />
  );
}
