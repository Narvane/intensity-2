import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createApiClient } from '@adapters/api/ApiClient';
import { useAppLogout } from '@app/useAppLogout';
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
import { ExperienceCard } from './ExperienceCard';
import styles from './ExperienceListPage.module.css';

export function ExperienceListPage() {
  const { groupId = '', boxId = '' } = useParams();
  const { t } = useI18n();
  const { session } = useSession();
  const { navigation } = useNavigation();
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

  const handleDelete = async (experience: Experience) => {
    if (!session?.token) {
      return;
    }

    try {
      await deleteExperience.execute(experience.id, session.token);
      setExperiences((current) => current.filter((item) => item.id !== experience.id));
    } catch (err) {
      setError(resolveExperienceError(err, t));
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
              onDelete={() => void handleDelete(experience)}
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
    </main>
  );
}
