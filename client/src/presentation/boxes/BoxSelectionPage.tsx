import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ApiError, createApiClient } from '@adapters/api/ApiClient';
import { useAppLogout } from '@app/useAppLogout';
import { useNavigation } from '@app/NavigationProvider';
import { useSession } from '@app/SessionProvider';
import type { Box } from '@domain/box/boxTypes';
import { ListBoxesUseCase } from '@domain/box/boxUseCases';
import { useI18n } from '../../i18n/I18nContext';
import { BoxCard } from '../components/BoxCard';
import { Button } from '../components/Button';
import styles from './BoxSelectionPage.module.css';

export function BoxSelectionPage() {
  const { groupId = '' } = useParams();
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

  useEffect(() => {
    if (!session?.token || !groupId) {
      return;
    }

    setLoading(true);
    listBoxes
      .execute(groupId, session.token)
      .then(setBoxes)
      .catch((err: unknown) => {
        setError(err instanceof ApiError ? err.message : t('common.error'));
      })
      .finally(() => setLoading(false));
  }, [groupId, listBoxes, session?.token, t]);

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div>
          <p className={styles.mode}>{t('session.experiencesMode')}</p>
          <h1>{t('boxes.title')}</h1>
        </div>
        <div className={styles.headerActions}>
          <Button variant="ghost" onClick={() => navigate('/groups')}>
            {t('common.back')}
          </Button>
          <Button variant="ghost" onClick={() => void logout()}>
            {t('session.logout')}
          </Button>
        </div>
      </header>

      {loading && <p className={styles.message}>{t('common.loading')}</p>}
      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}

      {!loading && !error && boxes.length === 0 && (
        <section className={styles.empty}>
          <p>{t('boxes.empty')}</p>
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
              onOpen={() => {
                void setNavigation({
                  groupId,
                  boxId: box.id,
                  boxName: box.name,
                  boxType: box.type,
                }).then(() => {
                  navigate(`/groups/${groupId}/boxes/${box.id}/experiences`);
                });
              }}
            />
          ))}
        </div>
      )}
    </main>
  );
}
