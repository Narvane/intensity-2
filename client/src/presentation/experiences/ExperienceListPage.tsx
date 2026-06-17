import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createApiClient } from '@adapters/api/ApiClient';
import { useAppLogout } from '@app/useAppLogout';
import { useToast } from '@app/ToastProvider';
import { useNavigation } from '@app/NavigationProvider';
import { useSession } from '@app/SessionProvider';
import { DEFAULT_BOX_TYPE } from '@domain/box/boxTypes';
import type { Experience } from '@domain/experience/experienceTypes';
import { resolveExperienceError } from '@domain/experience/experienceErrors';
import {
  DeleteExperienceUseCase,
  ListExperiencesUseCase,
} from '@domain/experience/experienceUseCases';
import { useI18n } from '../../i18n/I18nContext';
import { Button } from '../components/Button';
import { CreationAssistant } from './CreationAssistant';
import { DeleteExperienceDialog } from './DeleteExperienceDialog';
import { ExperienceCard } from './ExperienceCard';
import styles from './ExperienceListPage.module.css';

export function ExperienceListPage() {
  const { groupId = '', boxId = '' } = useParams();
  const { t } = useI18n();
  const { session } = useSession();
  const { navigation } = useNavigation();
  const { showToast } = useToast();
  const logout = useAppLogout();
  const navigate = useNavigate();
  const api = useMemo(() => createApiClient(), []);
  const listExperiences = useMemo(() => new ListExperiencesUseCase(api), [api]);
  const deleteExperience = useMemo(() => new DeleteExperienceUseCase(api), [api]);

  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [editing, setEditing] = useState<Experience | null>(null);
  const [experienceToDelete, setExperienceToDelete] = useState<Experience | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const boxName = navigation.boxName ?? t('experiences.defaultBoxName');
  const boxType = navigation.boxType ?? DEFAULT_BOX_TYPE;

  const loadExperiences = useCallback(async () => {
    if (!session?.token || !boxId) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const items = await listExperiences.execute(boxId, session.token);
      setExperiences(items);
    } catch (err) {
      setError(resolveExperienceError(err, t));
    } finally {
      setLoading(false);
    }
  }, [boxId, listExperiences, session?.token, t]);

  useEffect(() => {
    void loadExperiences();
  }, [loadExperiences]);

  const handleDelete = async () => {
    if (!experienceToDelete || !session?.token) {
      return;
    }

    setDeleting(true);
    setDeleteError(null);

    try {
      await deleteExperience.execute(experienceToDelete.id, session.token);
      setExperiences((current) => current.filter((item) => item.id !== experienceToDelete.id));
      setExperienceToDelete(null);
      showToast(t('experiences.deleteSuccess'));
    } catch (err) {
      setDeleteError(resolveExperienceError(err, t));
    } finally {
      setDeleting(false);
    }
  };

  const openCreateAssistant = () => {
    setEditing(null);
    setAssistantOpen(true);
  };

  const openEditAssistant = (experience: Experience) => {
    setEditing(experience);
    setAssistantOpen(true);
  };

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div>
          <p className={styles.mode}>{t('session.experiencesMode')}</p>
          <h1>{boxName}</h1>
        </div>
        <div className={styles.headerActions}>
          <Button variant="ghost" onClick={() => navigate(`/groups/${groupId}/boxes`)}>
            {t('common.back')}
          </Button>
          <Button variant="ghost" onClick={() => void logout()}>
            {t('session.logout')}
          </Button>
        </div>
      </header>

      <p className={styles.transparency}>{t('experiences.transparency')}</p>

      <div className={styles.toolbar}>
        <Button onClick={openCreateAssistant}>{t('experiences.create')}</Button>
      </div>

      {loading && <p className={styles.message}>{t('common.loading')}</p>}
      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}

      {!loading && !error && experiences.length === 0 && (
        <section className={styles.empty} aria-live="polite">
          <h2>{t('experiences.title')}</h2>
          <p>{t('experiences.empty')}</p>
          <Button onClick={openCreateAssistant}>{t('experiences.createFirst')}</Button>
        </section>
      )}

      {!loading && !error && experiences.length > 0 && (
        <div className={styles.list}>
          {experiences.map((experience) => (
            <ExperienceCard
              key={experience.id}
              experience={experience}
              participantId={session?.participantId}
              onEdit={() => openEditAssistant(experience)}
              onDelete={() => {
                setDeleteError(null);
                setExperienceToDelete(experience);
              }}
            />
          ))}
        </div>
      )}

      {session?.token && (
        <CreationAssistant
          open={assistantOpen}
          boxId={boxId}
          boxType={boxType}
          token={session.token}
          editing={editing}
          onClose={() => {
            setAssistantOpen(false);
            setEditing(null);
          }}
          onSaved={(saved, createAnother) => {
            setExperiences((current) => {
              const withoutSaved = current.filter((item) => item.id !== saved.id);
              return createAnother ? [saved, ...withoutSaved] : [saved, ...withoutSaved];
            });
            if (!createAnother) {
              setEditing(null);
            }
          }}
        />
      )}

      <DeleteExperienceDialog
        experience={experienceToDelete}
        deleting={deleting}
        error={deleteError}
        onConfirm={() => void handleDelete()}
        onCancel={() => {
          if (!deleting) {
            setExperienceToDelete(null);
            setDeleteError(null);
          }
        }}
      />
    </main>
  );
}
