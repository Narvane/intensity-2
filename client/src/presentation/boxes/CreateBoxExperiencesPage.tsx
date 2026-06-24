import { useNavigate, useParams } from 'react-router-dom';
import { useSession } from '@app/SessionProvider';
import { useI18n } from '../../i18n/I18nContext';
import { CreateBoxForm } from './CreateBoxForm';
import { NavButton } from '../components/NavButton';
import { ScreenHeader } from '../components/ScreenHeader';
import { SessionModeChrome } from '../components/SessionModeChrome';
import styles from './CreateBoxExperiencesPage.module.css';

export function CreateBoxExperiencesPage() {
  const { groupId = '' } = useParams();
  const { t } = useI18n();
  const { session } = useSession();
  const navigate = useNavigate();

  if (!session?.token || !groupId) {
    return null;
  }

  const boxesPath = `/groups/${groupId}/boxes`;

  return (
    <main className={styles.page}>
      <ScreenHeader
        leading={<NavButton action="back" onClick={() => navigate(boxesPath)} />}
      >
        <SessionModeChrome
          mode="EXPERIENCES"
          title={t('createBox.title')}
          participantDisplayName={session.displayName}
        />
      </ScreenHeader>

      <p className={styles.intro}>{t('boxes.createIntro')}</p>

      <CreateBoxForm
        groupId={groupId}
        token={session.token}
        variant="experiences"
        cancelPath={boxesPath}
        onSuccess={(box, meta) => {
          navigate(boxesPath, {
            replace: true,
            state: {
              openInvite: true,
              createdBoxName: box.name,
              partialFillFailures: meta?.partialFillFailures,
            },
          });
        }}
      />
    </main>
  );
}
