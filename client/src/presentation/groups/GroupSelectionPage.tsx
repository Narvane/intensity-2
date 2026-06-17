import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ApiError, createApiClient } from '@adapters/api/ApiClient';
import { useAppLogout } from '@app/useAppLogout';
import { useToast } from '@app/ToastProvider';
import { useNavigation } from '@app/NavigationProvider';
import { useSession } from '@app/SessionProvider';
import type { Group } from '@domain/box/boxTypes';
import { LeaveGroupUseCase, ListGroupsUseCase } from '@domain/box/boxUseCases';
import { useI18n } from '../../i18n/I18nContext';
import { ShareInviteSheet } from '../invite/ShareInviteSheet';
import { Button } from '../components/Button';
import { LeaveGroupDialog } from './LeaveGroupDialog';
import styles from './GroupSelectionPage.module.css';

export function GroupSelectionPage() {
  const { t } = useI18n();
  const { session } = useSession();
  const { showToast } = useToast();
  const logout = useAppLogout();
  const navigate = useNavigate();
  const { navigation, setNavigation, clearNavigation } = useNavigation();
  const api = useMemo(() => createApiClient(), []);
  const listGroups = useMemo(() => new ListGroupsUseCase(api), [api]);
  const leaveGroup = useMemo(() => new LeaveGroupUseCase(api), [api]);

  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [shareGroupId, setShareGroupId] = useState<string | null>(null);
  const [groupToLeave, setGroupToLeave] = useState<Group | null>(null);
  const [leaving, setLeaving] = useState(false);
  const [leaveError, setLeaveError] = useState<string | null>(null);

  const loadGroups = useCallback(async () => {
    if (!session?.token) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const items = await listGroups.execute(session.token);
      setGroups(items);
    } catch (err: unknown) {
      setError(err instanceof ApiError ? err.message : t('common.error'));
    } finally {
      setLoading(false);
    }
  }, [listGroups, session?.token, t]);

  useEffect(() => {
    void loadGroups();
  }, [loadGroups]);

  const confirmLeave = async () => {
    if (!groupToLeave || !session?.token) {
      return;
    }

    setLeaving(true);
    setLeaveError(null);

    try {
      await leaveGroup.execute(groupToLeave.id, session.token);
      setGroups((current) => current.filter((item) => item.id !== groupToLeave.id));

      if (navigation.groupId === groupToLeave.id) {
        await clearNavigation();
      }

      setGroupToLeave(null);
      showToast(t('groups.leaveSuccess'));
    } catch (err) {
      setLeaveError(err instanceof ApiError ? err.message : t('common.error'));
    } finally {
      setLeaving(false);
    }
  };

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div>
          <p className={styles.mode}>{t('session.experiencesMode')}</p>
          <h1>{t('groups.title')}</h1>
        </div>
        <Button variant="ghost" onClick={() => void logout()}>
          {t('session.logout')}
        </Button>
      </header>

      {loading && <p className={styles.message}>{t('common.loading')}</p>}

      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}

      {!loading && !error && groups.length === 0 && (
        <section className={styles.empty}>
          <p>{t('groups.empty')}</p>
        </section>
      )}

      {!loading && !error && groups.length > 0 && (
        <ul className={styles.list}>
          {groups.map((group) => (
            <li key={group.id} className={styles.item}>
              <button
                type="button"
                className={styles.row}
                onClick={() => {
                  void setNavigation({ groupId: group.id }).then(() => {
                    navigate(`/groups/${group.id}/boxes`);
                  });
                }}
              >
                <span className={styles.rowTitle}>
                  {t('groups.memberCount', { count: group.memberCount })}
                </span>
                <span className={styles.rowMeta}>{t('groups.openBoxes')}</span>
              </button>
              <div className={styles.actions}>
                <Button variant="secondary" onClick={() => setShareGroupId(group.id)}>
                  {t('groups.invite')}
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setLeaveError(null);
                    setGroupToLeave(group);
                  }}
                >
                  {t('groups.leave')}
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {session?.token && shareGroupId && (
        <ShareInviteSheet
          open={Boolean(shareGroupId)}
          groupId={shareGroupId}
          token={session.token}
          onClose={() => setShareGroupId(null)}
        />
      )}

      <LeaveGroupDialog
        open={Boolean(groupToLeave)}
        memberCount={groupToLeave?.memberCount ?? 0}
        leavingCount={1}
        leaving={leaving}
        error={leaveError}
        onConfirm={() => void confirmLeave()}
        onCancel={() => {
          if (!leaving) {
            setGroupToLeave(null);
            setLeaveError(null);
          }
        }}
      />
    </main>
  );
}
