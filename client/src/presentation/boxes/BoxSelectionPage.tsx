import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
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
import { NavButton } from '../components/NavButton';
import { ScreenHeader } from '../components/ScreenHeader';
import { SessionModeChrome } from '../components/SessionModeChrome';
import styles from './BoxSelectionPage.module.css';

interface BoxSelectionLocationState {
  openInvite?: boolean;
  createdBoxName?: string;
  partialFillFailures?: number;
}

export function BoxSelectionPage() {
  const { groupId = '' } = useParams();
  const { t } = useI18n();
  const { session } = useSession();
  const { setNavigation } = useNavigation();
  const logout = useAppLogout();
  const navigate = useNavigate();
  const location = useLocation();
  const api = useMemo(() => createApiClient(), []);
  const listBoxes = useMemo(() => new ListBoxesUseCase(api), [api]);

  const [boxes, setBoxes] = useState<Box[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [shareOpen, setShareOpen] = useState(false);
  const [createdBanner, setCreatedBanner] = useState<string | null>(null);
  const [warningBanner, setWarningBanner] = useState<string | null>(null);

  const loadBoxes = useCallback(async () => {
    if (!session?.token || !groupId) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const items = await listBoxes.execute(groupId, session.token);
      setBoxes(items);
    } catch (err: unknown) {
      setError(err instanceof ApiError ? err.message : t('common.error'));
    } finally {
      setLoading(false);
    }
  }, [groupId, listBoxes, session?.token, t]);

  useEffect(() => {
    void loadBoxes();
  }, [loadBoxes]);

  useEffect(() => {
    const state = location.state as BoxSelectionLocationState | null;
    if (!state?.openInvite) {
      return;
    }

    if (state.createdBoxName) {
      setCreatedBanner(t('boxes.createdSuccess', { name: state.createdBoxName }));
    }

    if (state.partialFillFailures && state.partialFillFailures > 0) {
      setWarningBanner(
        t('createBox.partialFillError', { count: state.partialFillFailures }),
      );
    }

    setShareOpen(true);
    void loadBoxes();
    navigate(location.pathname, { replace: true, state: null });
  }, [location.pathname, location.state, loadBoxes, navigate, t]);

  const openCreate = () => {
    navigate(`/groups/${groupId}/boxes/create`);
  };

  return (
    <main className={styles.page}>
      <ScreenHeader
        leading={
          <NavButton action="back" onClick={() => navigate('/groups')} />
        }
        trailing={<NavButton action="logout" onClick={() => void logout()} />}
      >
        <SessionModeChrome
          mode="EXPERIENCES"
          title={t('boxes.title')}
          participantDisplayName={session?.displayName}
        />
      </ScreenHeader>

      <div className={styles.toolbar}>
        <Button onClick={openCreate}>{t('boxes.create')}</Button>
        {session?.token && (
          <Button variant="secondary" onClick={() => setShareOpen(true)}>
            {t('invite.share.action')}
          </Button>
        )}
      </div>

      {createdBanner && (
        <p className={styles.successBanner} role="status">
          {createdBanner}
        </p>
      )}

      {warningBanner && (
        <p className={styles.warningBanner} role="status">
          {warningBanner}
        </p>
      )}

      {loading && <p className={styles.message}>{t('common.loading')}</p>}
      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}

      {!loading && !error && boxes.length === 0 && (
        <section className={styles.empty}>
          <h2 className={styles.emptyTitle}>{t('boxes.emptyTitle')}</h2>
          <p>{t('boxes.empty')}</p>
          <Button onClick={openCreate}>{t('boxes.createFirst')}</Button>
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

      {session?.token && (
        <ShareInviteSheet
          open={shareOpen}
          groupId={groupId}
          token={session.token}
          onClose={() => setShareOpen(false)}
        />
      )}
    </main>
  );
}
