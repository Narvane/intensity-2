import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ApiError } from '@adapters/api/ApiClient';
import { createApiClient } from '@adapters/api/ApiClient';
import { useAppLogout } from '@app/useAppLogout';
import { useNavigation } from '@app/NavigationProvider';
import { useSession } from '@app/SessionProvider';
import type { Group } from '@domain/box/boxTypes';
import { ListGroupsUseCase } from '@domain/box/boxUseCases';
import { useI18n } from '../../i18n/I18nContext';
import { ShareInviteSheet } from '../invite/ShareInviteSheet';
import { Button } from '../components/Button';
import styles from './GroupSelectionPage.module.css';

export function GroupSelectionPage() {
  const { t } = useI18n();
  const { session } = useSession();
  const logout = useAppLogout();
  const navigate = useNavigate();
  const { setNavigation } = useNavigation();
  const api = useMemo(() => createApiClient(), []);
  const listGroups = useMemo(() => new ListGroupsUseCase(api), [api]);

  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [shareGroupId, setShareGroupId] = useState<string | null>(null);

  useEffect(() => {
    if (!session?.token) {
      return;
    }

    setLoading(true);
    listGroups
      .execute(session.token)
      .then(setGroups)
      .catch((err: unknown) => {
        setError(err instanceof ApiError ? err.message : t('common.error'));
      })
      .finally(() => setLoading(false));
  }, [listGroups, session?.token, t]);

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
              <Button variant="secondary" onClick={() => setShareGroupId(group.id)}>
                {t('groups.invite')}
              </Button>
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
    </main>
  );
}
