import { useNavigate } from 'react-router-dom';
import { useSession } from '@app/SessionProvider';
import { useI18n } from '../../i18n/I18nContext';
import { Button } from '../components/Button';
import { SessionModeChrome } from '../components/SessionModeChrome';
import { CreateBoxForm } from '../boxes/CreateBoxForm';
import styles from './CreateBoxPage.module.css';

export function CreateBoxPage() {
  const { t } = useI18n();
  const { session } = useSession();
  const navigate = useNavigate();

  if (!session?.token || !session.groupId) {
    return null;
  }

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <SessionModeChrome
          mode="EXPERIENCE_BOX"
          title={t('createBox.title')}
          members={session.members}
        />
        <Button variant="ghost" onClick={() => navigate('/box-home')}>
          {t('common.back')}
        </Button>
      </header>

      <p className={styles.intro}>{t('createBox.intro')}</p>

      <CreateBoxForm
        groupId={session.groupId}
        token={session.token}
        variant="experienceBox"
        onSuccess={() => navigate('/box-home')}
      />
    </main>
  );
}
