import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ApiError, createApiClient } from '@adapters/api/ApiClient';
import { useAppLogout } from '@app/useAppLogout';
import { useToast } from '@app/ToastProvider';
import { useNavigation } from '@app/NavigationProvider';
import { useSession } from '@app/SessionProvider';
import type { Box } from '@domain/box/boxTypes';
import { DeleteBoxUseCase, LeaveGroupUseCase, ListBoxesUseCase, ListGroupsUseCase } from '@domain/box/boxUseCases';
import { useI18n } from '../../i18n/I18nContext';
import { ShareInviteSheet } from '../invite/ShareInviteSheet';
import { LeaveGroupDialog } from '../groups/LeaveGroupDialog';
import { BoxCard } from '../components/BoxCard';
import { Button } from '../components/Button';
import { NavButton } from '../components/NavButton';
import { ScreenHeader } from '../components/ScreenHeader';
import { SessionModeChrome } from '../components/SessionModeChrome';
import { DeleteBoxDialog } from './DeleteBoxDialog';
import styles from './BoxHomePage.module.css';

export function BoxHomePage() {
  const { t } = useI18n();
  const { session } = useSession();
  const { navigation, setNavigation, clearNavigation } = useNavigation();
  const { showToast } = useToast();
  const logout = useAppLogout();
  const navigate = useNavigate();
  const api = useMemo(() => createApiClient(), []);
  const listBoxes = useMemo(() => new ListBoxesUseCase(api), [api]);
  const listGroups = useMemo(() => new ListGroupsUseCase(api), [api]);
  const deleteBox = useMemo(() => new DeleteBoxUseCase(api), [api]);
  const leaveGroup = useMemo(() => new LeaveGroupUseCase(api), [api]);

  const [boxes, setBoxes] = useState<Box[]>([]);
  const [groupMemberCount, setGroupMemberCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [shareOpen, setShareOpen] = useState(false);
  const [leaveOpen, setLeaveOpen] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [leaveError, setLeaveError] = useState<string | null>(null);
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
      const [items, groups] = await Promise.all([
        listBoxes.execute(session.groupId, session.token),
        listGroups.execute(session.token),
      ]);
      setBoxes(items);
      setGroupMemberCount(groups.find((group) => group.id === session.groupId)?.memberCount ?? 0);
    } catch (err: unknown) {
      setError(err instanceof ApiError ? err.message : t('common.error'));
    } finally {
      setLoading(false);
    }
  }, [listBoxes, listGroups, session?.groupId, session?.token, t]);

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
      showToast(t('boxHome.deleteSuccess', { name: boxToDelete.name }));
    } catch (err) {
      setDeleteError(err instanceof ApiError ? err.message : t('common.error'));
    } finally {
      setDeleting(false);
    }
  };

  const confirmLeave = async () => {
    if (!session?.token || !session.groupId) {
      return;
    }

    setLeaving(true);
    setLeaveError(null);

    try {
      await leaveGroup.execute(session.groupId, session.token);
      await clearNavigation();
      setLeaveOpen(false);
      await logout();
      navigate('/auth', { replace: true });
    } catch (err) {
      setLeaveError(err instanceof ApiError ? err.message : t('common.error'));
    } finally {
      setLeaving(false);
    }
  };

  const leavingCount = session?.members?.length ?? 1;

  return (
    <main className={styles.page}>
      <ScreenHeader
        trailing={<NavButton action="logout" onClick={() => void logout()} />}
      >
        <SessionModeChrome
          mode="EXPERIENCE_BOX"
          title={t('boxHome.title')}
          members={session?.members}
        />
      </ScreenHeader>

      <div className={styles.toolbar}>
        <Button onClick={() => navigate('/box-home/create')}>{t('boxHome.create')}</Button>
        {session?.groupId && session.token && (
          <Button variant="secondary" onClick={() => setShareOpen(true)}>
            {t('invite.share.action')}
          </Button>
        )}
        {session?.groupId && session.token && (
          <NavButton
            action="leave"
            onClick={() => {
              setLeaveError(null);
              setLeaveOpen(true);
            }}
          />
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

      <LeaveGroupDialog
        open={leaveOpen}
        memberCount={groupMemberCount}
        leavingCount={leavingCount}
        leaving={leaving}
        error={leaveError}
        onConfirm={() => void confirmLeave()}
        onCancel={() => {
          if (!leaving) {
            setLeaveOpen(false);
            setLeaveError(null);
          }
        }}
      />
    </main>
  );
}
