import { useI18n } from '../../i18n/I18nContext';
import { useOnlineStatus } from '@presentation/hooks/useOnlineStatus';
import { DestructiveConfirmDialog } from '../components/DestructiveConfirmDialog';

interface LeaveGroupDialogProps {
  open: boolean;
  memberCount: number;
  leavingCount: number;
  leaving: boolean;
  error: string | null;
  onConfirm: () => void;
  onCancel: () => void;
}

export function LeaveGroupDialog({
  open,
  memberCount,
  leavingCount,
  leaving,
  error,
  onConfirm,
  onCancel,
}: LeaveGroupDialogProps) {
  const { t } = useI18n();
  const online = useOnlineStatus();
  const deletesGroup = memberCount <= leavingCount;

  const messageKey = deletesGroup
    ? 'groups.leaveDialog.lastMemberMessage'
    : leavingCount > 1
      ? 'groups.leaveDialog.sessionMessage'
      : 'groups.leaveDialog.message';

  return (
    <DestructiveConfirmDialog
      open={open}
      titleId="leave-group-title"
      title={t('groups.leaveDialog.title')}
      message={t(messageKey)}
      confirmLabel={t('groups.leaveDialog.confirm')}
      cancelLabel={t('groups.leaveDialog.cancel')}
      confirming={leaving}
      error={error}
      offlineBlocked={!online}
      offlineMessage={t('common.offlineDestructiveBlocked')}
      onConfirm={onConfirm}
      onCancel={onCancel}
    />
  );
}
