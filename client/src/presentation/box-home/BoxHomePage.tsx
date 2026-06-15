import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ApiError, createApiClient } from '@adapters/api/ApiClient';
import { useAppLogout } from '@app/useAppLogout';
import { useNavigation } from '@app/NavigationProvider';
import { useSession } from '@app/SessionProvider';
import type { Box } from '@domain/box/boxTypes';
import { ListBoxesUseCase } from '@domain/box/boxUseCases';
import { useI18n } from '../../i18n/I18nContext';
import { ShareInviteSheet } from '../invite/ShareInviteSheet';
import { BoxCard } from '../components/BoxCard';
import { Button } from '../components/Button';
import styles from './BoxHomePage.module.css';

export function BoxHomePage() {
  const { t } = useI18n();
  const { session } = useSession();
  const { setNavigation } = useNavigation();
  const logout = useAppLogout();
  const navigate = useNavigate();
  const api = useMemo(() => createApiClient(), []);
  const listBoxes = useMemo(() => new ListBoxesUseCase(api), [api]);

  const [boxes, setBoxes] = useState<Box[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [shareOpen, setShareOpen] = useState(false);

  useEffect(() => {
    if (!session?.token || !session.groupId) {
      return;
    }

    setLoading(true);
    listBoxes
      .execute(session.groupId, session.token)
      .then(setBoxes)
      .catch((err: unknown) => {
        setError(err instanceof ApiError ? err.message : t('common.error'));
      })
      .finally(() => setLoading(false));
  }, [listBoxes, session?.groupId, session?.token, t]);

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div>
          <p className={styles.mode}>{t('session.experienceBoxMode')}</p>
          <h1>{t('boxHome.title')}</h1>
        </div>
        <Button variant="ghost" onClick={() => void logout()}>
          {t('session.logout')}
        </Button>
      </header>

      <div className={styles.toolbar}>
        <Button onClick={() => navigate('/box-home/create')}>{t('boxHome.create')}</Button>
        {session?.groupId && session.token && (
          <Button variant="secondary" onClick={() => setShareOpen(true)}>
            {t('invite.share.action')}
          </Button>
        )}
      </div>

      {loading && <p className={styles.message}>{t('common.loading')}</p>}
      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}

      {!loading && !error && boxes.length === 0 && (
        <section className={styles.empty}>
          <p>{t('boxHome.empty')}</p>
          <Button onClick={() => navigate('/box-home/create')}>{t('boxHome.createFirst')}</Button>
        </section>
      )}

      {!loading && !error && boxes.length > 0 && (
        <div className={styles.grid}>
          {boxes.map((box) => (
            <BoxCard
              key={box.id}
              name={box.name}
              type={box.type}
              typeLabel={t(`boxTypes.${box.type}.title`)}
              typeHint={t(`boxTypes.${box.type}.hint`)}
              experienceCount={box.experienceCount}
              onClick={() => {
                if (!session?.groupId) {
                  return;
                }

                void setNavigation({
                  groupId: session.groupId,
                  boxId: box.id,
                  boxName: box.name,
                  boxType: box.type,
                }).then(() => {
                  navigate(`/box-home/${box.id}/moment`);
                });
              }}
            />
          ))}
        </div>
      )}

      {session?.groupId && session.token && (
        <ShareInviteSheet
          open={shareOpen}
          groupId={session.groupId}
          token={session.token}
          onClose={() => setShareOpen(false)}
        />
      )}
    </main>
  );
}
