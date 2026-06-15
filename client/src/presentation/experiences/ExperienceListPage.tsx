import { useNavigate, useParams } from 'react-router-dom';
import { useAppLogout } from '@app/useAppLogout';
import { useNavigation } from '@app/NavigationProvider';
import { useI18n } from '../../i18n/I18nContext';
import { Button } from '../components/Button';
import styles from './ExperienceListPage.module.css';

export function ExperienceListPage() {
  const { groupId = '' } = useParams();
  const { t } = useI18n();
  const { navigation } = useNavigation();
  const logout = useAppLogout();
  const navigate = useNavigate();
  const boxName = navigation.boxName ?? t('experiences.defaultBoxName');

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

      <section className={styles.empty} aria-live="polite">
        <h2>{t('experiences.title')}</h2>
        <p>{t('experiences.empty')}</p>
        <p className={styles.note}>{t('experiences.comingNext')}</p>
      </section>
    </main>
  );
}
