import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ApiError, createApiClient } from '@adapters/api/ApiClient';
import { useAppLogout } from '@app/useAppLogout';
import { useToast } from '@app/ToastProvider';
import { useNavigation } from '@app/NavigationProvider';
import { useSession } from '@app/SessionProvider';
import type { Group } from '@domain/box/boxTypes';
import { formatGroupMemberPreview } from '@domain/box/formatGroupMemberPreview';
import { CreateGroupUseCase, ListGroupsUseCase } from '@domain/box/boxUseCases';
import { useI18n } from '../../i18n/I18nContext';
import { Button } from '../components/Button';
import { NavButton } from '../components/NavButton';
import { ScreenHeader } from '../components/ScreenHeader';
import { SessionModeChrome } from '../components/SessionModeChrome';
import { getGroupAccent } from '../components/groupVisuals';
import { CreateGroupDialog } from './CreateGroupDialog';
import styles from './GroupSelectionPage.module.css';

export function GroupSelectionPage() {
  const { t } = useI18n();
  const { session } = useSession();
  const { showToast } = useToast();
  const logout = useAppLogout();
  const navigate = useNavigate();
  const { setNavigation } = useNavigation();
  const api = useMemo(() => createApiClient(), []);
  const listGroups = useMemo(() => new ListGroupsUseCase(api), [api]);
  const createGroup = useMemo(() => new CreateGroupUseCase(api), [api]);

  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

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

  const confirmCreate = async () => {
    if (!session?.token) {
      return;
    }

    setCreating(true);
    setCreateError(null);

    try {
      const created = await createGroup.execute(session.token);
      setGroups((current) => [created, ...current.filter((item) => item.id !== created.id)]);
      setCreateOpen(false);
      showToast(t('groups.createSuccess'));
    } catch (err) {
      setCreateError(err instanceof ApiError ? err.message : t('common.error'));
    } finally {
      setCreating(false);
    }
  };

  return (
    <main className={styles.page}>
      <ScreenHeader
        trailing={<NavButton action="logout" onClick={() => void logout()} />}
      >
        <SessionModeChrome
          mode="EXPERIENCES"
          title={t('groups.title')}
          participantDisplayName={session?.displayName}
        />
      </ScreenHeader>

      {!loading && !error && (
        <div className={styles.toolbar}>
          <Button onClick={() => {
            setCreateError(null);
            setCreateOpen(true);
          }}>
            {t('groups.create')}
          </Button>
        </div>
      )}

      {loading && <p className={styles.message}>{t('common.loading')}</p>}

      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}

      {!loading && !error && groups.length === 0 && (
        <section className={styles.empty}>
          <p>{t('groups.empty')}</p>
          <p className={styles.emptyHint}>{t('groups.emptyHint')}</p>
        </section>
      )}

      {!loading && !error && groups.length > 0 && (
        <ul className={styles.list}>
          {groups.map((group) => {
            const accent = getGroupAccent(group.id);
            const memberPreview = formatGroupMemberPreview(
              group.members.map((member) => member.displayName),
              t,
            );

            return (
              <li key={group.id} className={styles.item}>
                <button
                  type="button"
                  className={styles.row}
                  data-accent={accent}
                  onClick={() => {
                    void setNavigation({ groupId: group.id }).then(() => {
                      navigate(`/groups/${group.id}/boxes`);
                    });
                  }}
                >
                  <span className={styles.rowTitle}>{memberPreview}</span>
                  <span className={styles.rowMeta}>
                    {t('groups.memberCount', { count: group.memberCount })}
                    {' · '}
                    {t('groups.openBoxes')}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}

      <CreateGroupDialog
        open={createOpen}
        creating={creating}
        error={createError}
        onConfirm={() => void confirmCreate()}
        onCancel={() => {
          if (!creating) {
            setCreateOpen(false);
            setCreateError(null);
          }
        }}
      />
    </main>
  );
}
