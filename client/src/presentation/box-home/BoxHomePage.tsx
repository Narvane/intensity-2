import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ApiError, createApiClient } from '@adapters/api/ApiClient';
import { useAppLogout } from '@app/useAppLogout';
import { useNavigation } from '@app/NavigationProvider';
import { useSession } from '@app/SessionProvider';
import type { Box } from '@domain/box/boxTypes';
import { DeleteBoxUseCase, ListBoxesUseCase } from '@domain/box/boxUseCases';
import { useI18n } from '../../i18n/I18nContext';
import { ShareInviteSheet } from '../invite/ShareInviteSheet';
import { BoxCard } from '../components/BoxCard';
import { Button } from '../components/Button';
import { DeleteBoxDialog } from './DeleteBoxDialog';
import styles from './BoxHomePage.module.css';

export function BoxHomePage() {
  const { t } = useI18n();
  const { session } = useSession();
  const { navigation, setNavigation } = useNavigation();
  const logout = useAppLogout();
  const navigate = useNavigate();
  const api = useMemo(() => createApiClient(), []);
  const listBoxes = useMemo(() => new ListBoxesUseCase(api), [api]);
  const deleteBox = useMemo(() => new DeleteBoxUseCase(api), [api]);

  const [boxes, setBoxes] = useState<Box[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [shareOpen, setShareOpen] = useState(false);
  const [boxToDelete, setBoxToDelete] = useState<Box | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const loadBoxes = useCallback(async () => {
    if (!session?.token || !session.groupId) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const items = await listBoxes.execute(session.groupId, session.token);
      setBoxes(items);
    } catch (err: unknown) {
      setError(err instanceof ApiError ? err.message : t('common.error'));
    } finally {
      setLoading(false);
    }
  }, [listBoxes, session?.groupId, session?.token, t]);

  useEffect(() => {
    void loadBoxes();
  }, [loadBoxes]);

  const openBox = (box: Box) => {
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
  };

  const confirmDelete = async () => {
    if (!boxToDelete || !session?.token) {
      return;
    }

    setDeleting(true);
    setDeleteError(null);

    try {
      await deleteBox.execute(boxToDelete.id, session.token);
      setBoxes((current) => current.filter((item) => item.id !== boxToDelete.id));

      if (navigation.boxId === boxToDelete.id && session.groupId) {
        await setNavigation({ groupId: session.groupId });
      }

      setBoxToDelete(null);
      setSuccess(t('boxHome.deleteSuccess', { name: boxToDelete.name }));
    } catch (err) {
      setDeleteError(err instanceof ApiError ? err.message : t('common.error'));
    } finally {
      setDeleting(false);
    }
  };

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
      {success && (
        <p className={styles.success} role="status">
          {success}
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
              openLabel={t('boxHome.open')}
              deleteLabel={t('boxHome.delete')}
              menuLabel={t('boxHome.menuLabel')}
              onOpen={() => openBox(box)}
              onDelete={() => {
                setDeleteError(null);
                setBoxToDelete(box);
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

      <DeleteBoxDialog
        box={boxToDelete}
        deleting={deleting}
        error={deleteError}
        onConfirm={() => void confirmDelete()}
        onCancel={() => {
          if (!deleting) {
            setBoxToDelete(null);
            setDeleteError(null);
          }
        }}
      />
    </main>
  );
}
